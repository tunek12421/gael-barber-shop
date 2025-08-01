import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getDeviceInfo, getViewportDimensions } from '../utils/deviceDetection';

// Hook for masonry layout with virtual scrolling and performance optimization
export const useMasonry = (items = [], options = {}) => {
  const {
    gap = 16,
    minColumnWidth = 300,
    maxColumns = 4,
    virtualScrolling = true,
    overscan = 3, // Number of items to render outside viewport
    onLayoutChange,
    debounceMs = 150
  } = options;

  const [layout, setLayout] = useState([]);
  const [columns, setColumns] = useState(1);
  const [visibleItems, setVisibleItems] = useState([]);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isLayoutCalculating, setIsLayoutCalculating] = useState(false);
  
  const containerRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const layoutCacheRef = useRef(new Map());
  const debounceTimeoutRef = useRef(null);
  const itemHeightsRef = useRef(new Map());

  // Device capabilities
  // Use cached device info to prevent object recreation
  const deviceInfo = useMemo(() => getDeviceInfo(), []);

  // Adjust settings for device performance
  const adjustedSettings = useMemo(() => ({
    gap: deviceInfo.isLowEnd ? gap * 0.75 : gap,
    minColumnWidth: deviceInfo.isMobile ? 
      Math.min(minColumnWidth, 280) : minColumnWidth,
    maxColumns: deviceInfo.isLowEnd ? 
      Math.min(maxColumns, 3) : maxColumns,
    virtualScrolling: deviceInfo.isLowEnd ? true : virtualScrolling,
    overscan: deviceInfo.isLowEnd ? Math.min(overscan, 2) : overscan
  }), [gap, minColumnWidth, maxColumns, virtualScrolling, overscan, deviceInfo]);

  // Calculate optimal number of columns
  const calculateColumns = useCallback((containerWidth) => {
    if (containerWidth <= 0) return 1;
    
    const availableWidth = containerWidth - adjustedSettings.gap;
    const columnCount = Math.floor(availableWidth / (adjustedSettings.minColumnWidth + adjustedSettings.gap));
    
    return Math.max(1, Math.min(columnCount, adjustedSettings.maxColumns));
  }, [adjustedSettings]);

  // Calculate item position in masonry layout
  const calculateItemPosition = useCallback((itemIndex, columnHeights, columnWidth) => {
    // Find column with minimum height
    const minHeight = Math.min(...columnHeights);
    const columnIndex = columnHeights.indexOf(minHeight);
    
    const x = columnIndex * (columnWidth + adjustedSettings.gap);
    const y = minHeight;
    
    return { x, y, columnIndex };
  }, [adjustedSettings.gap]);

  // Get cached or estimated item height
  const getItemHeight = useCallback((item, columnWidth) => {
    const cacheKey = `${item.id || item.url}-${columnWidth}`;
    
    if (itemHeightsRef.current.has(cacheKey)) {
      return itemHeightsRef.current.get(cacheKey);
    }
    
    // Estimate height based on image aspect ratio or default
    if (item.aspectRatio) {
      return columnWidth / item.aspectRatio;
    }
    
    // Default estimation for different content types
    if (item.featured) {
      return columnWidth * 1.2; // Featured items are taller
    }
    
    return columnWidth * 0.8; // Default ratio
  }, []);

  // Cache item height after measurement
  const cacheItemHeight = useCallback((item, columnWidth, height) => {
    const cacheKey = `${item.id || item.url}-${columnWidth}`;
    itemHeightsRef.current.set(cacheKey, height);
  }, []);

  // Calculate complete masonry layout
  const calculateLayout = useCallback((containerWidth, items) => {
    if (!containerWidth || !items.length) return [];

    const newColumns = calculateColumns(containerWidth);
    const columnWidth = (containerWidth - (newColumns - 1) * adjustedSettings.gap) / newColumns;
    const columnHeights = new Array(newColumns).fill(0);
    
    const newLayout = items.map((item, index) => {
      const itemHeight = getItemHeight(item, columnWidth);
      const position = calculateItemPosition(index, columnHeights, columnWidth);
      
      // Update column height
      columnHeights[position.columnIndex] += itemHeight + adjustedSettings.gap;
      
      return {
        item,
        index,
        x: position.x,
        y: position.y,
        width: columnWidth,
        height: itemHeight,
        column: position.columnIndex,
        visible: false // Will be calculated in virtual scrolling
      };
    });

    // Calculate total container height
    const maxColumnHeight = Math.max(...columnHeights) - adjustedSettings.gap;
    
    return {
      layout: newLayout,
      columns: newColumns,
      containerHeight: maxColumnHeight,
      columnWidth
    };
  }, [calculateColumns, adjustedSettings, getItemHeight, calculateItemPosition]);

  // Debounced layout calculation
  const debouncedCalculateLayout = useCallback((containerWidth, items) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setIsLayoutCalculating(true);
      
      const cacheKey = `${containerWidth}-${items.length}-${JSON.stringify(items.map(i => i.id || i.url))}`;
      
      // Check cache first
      if (layoutCacheRef.current.has(cacheKey)) {
        const cached = layoutCacheRef.current.get(cacheKey);
        setLayout(cached.layout);
        setColumns(cached.columns);
        setContainerHeight(cached.containerHeight);
        setIsLayoutCalculating(false);
        return;
      }

      // Calculate new layout
      const result = calculateLayout(containerWidth, items);
      
      // Cache result
      layoutCacheRef.current.set(cacheKey, result);
      
      // Limit cache size
      if (layoutCacheRef.current.size > 10) {
        const firstKey = layoutCacheRef.current.keys().next().value;
        layoutCacheRef.current.delete(firstKey);
      }

      setLayout(result.layout);
      setColumns(result.columns);
      setContainerHeight(result.containerHeight);
      
      onLayoutChange && onLayoutChange(result);
      setIsLayoutCalculating(false);
    }, debounceMs);
  }, [calculateLayout, debounceMs, onLayoutChange]);

  // Calculate visible items for virtual scrolling
  const calculateVisibleItems = useCallback(() => {
    if (!adjustedSettings.virtualScrolling || !containerRef.current) {
      return layout.map(item => ({ ...item, visible: true }));
    }

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const viewportTop = scrollTop;
    const viewportBottom = scrollTop + containerHeight;
    
    // Add overscan buffer
    const overscanHeight = containerHeight * (adjustedSettings.overscan / 10);
    const bufferedTop = Math.max(0, viewportTop - overscanHeight);
    const bufferedBottom = viewportBottom + overscanHeight;

    return layout.map(item => ({
      ...item,
      visible: (item.y + item.height >= bufferedTop) && (item.y <= bufferedBottom)
    }));
  }, [layout, adjustedSettings]);

  // Handle container resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      const containerWidth = container.clientWidth;
      if (containerWidth > 0) {
        debouncedCalculateLayout(containerWidth, items);
      }
    };

    // Use ResizeObserver for better performance
    if (window.ResizeObserver) {
      resizeObserverRef.current = new ResizeObserver(handleResize);
      resizeObserverRef.current.observe(container);
    } else {
      // Fallback to window resize
      window.addEventListener('resize', handleResize);
    }

    // Initial calculation
    handleResize();

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      } else {
        window.removeEventListener('resize', handleResize);
      }
      
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [items, debouncedCalculateLayout]);

  // Update visible items when layout or scroll changes
  useEffect(() => {
    const newVisibleItems = calculateVisibleItems();
    setVisibleItems(newVisibleItems);
  }, [calculateVisibleItems]);

  // Scroll event handler for virtual scrolling
  useEffect(() => {
    if (!adjustedSettings.virtualScrolling) return;

    const container = containerRef.current;
    if (!container) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const newVisibleItems = calculateVisibleItems();
          setVisibleItems(newVisibleItems);
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [adjustedSettings.virtualScrolling, calculateVisibleItems]);

  // Update item height after image load
  const updateItemHeight = useCallback((item, actualHeight) => {
    const layoutItem = layout.find(l => l.item.id === item.id || l.item.url === item.url);
    if (!layoutItem) return;

    const columnWidth = layoutItem.width;
    cacheItemHeight(item, columnWidth, actualHeight);
    
    // Recalculate layout if height difference is significant
    const heightDiff = Math.abs(actualHeight - layoutItem.height);
    if (heightDiff > 50) { // 50px threshold
      const containerWidth = containerRef.current?.clientWidth;
      if (containerWidth) {
        debouncedCalculateLayout(containerWidth, items);
      }
    }
  }, [layout, items, cacheItemHeight, debouncedCalculateLayout]);

  // Get style for positioned item
  const getItemStyle = useCallback((layoutItem) => {
    const baseStyle = {
      position: 'absolute',
      left: `${layoutItem.x}px`,
      top: `${layoutItem.y}px`,
      width: `${layoutItem.width}px`,
      height: `${layoutItem.height}px`,
      transition: deviceInfo.reducedMotion ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out'
    };

    if (!layoutItem.visible && adjustedSettings.virtualScrolling) {
      baseStyle.visibility = 'hidden';
      baseStyle.pointerEvents = 'none';
    }

    return baseStyle;
  }, [deviceInfo.reducedMotion, adjustedSettings.virtualScrolling]);

  // Get container style
  const getContainerStyle = useCallback(() => ({
    position: 'relative',
    height: `${containerHeight}px`,
    overflow: adjustedSettings.virtualScrolling ? 'auto' : 'visible'
  }), [containerHeight, adjustedSettings.virtualScrolling]);

  return {
    containerRef,
    layout: adjustedSettings.virtualScrolling ? visibleItems : layout,
    columns,
    containerHeight,
    isLayoutCalculating,
    updateItemHeight,
    getItemStyle,
    getContainerStyle,
    deviceInfo,
    stats: {
      totalItems: items.length,
      visibleItems: visibleItems.filter(item => item.visible).length,
      cacheSize: layoutCacheRef.current.size
    }
  };
};

// Hook for optimized image loading with progressive enhancement
export const useGalleryImageLoading = (images = [], options = {}) => {
  const {
    quality = 80,
    sizes = {
      mobile: 400,
      tablet: 600,
      desktop: 800,
      large: 1200
    },
    format = 'webp',
    blurDataURL,
    priority = false,
    onLoad,
    onError
  } = options;

  const [loadedImages, setLoadedImages] = useState(new Set());
  const [failedImages, setFailedImages] = useState(new Set());
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const imageCache = useRef(new Map());
  const loadPromises = useRef(new Map());
  const processedImagesRef = useRef(new Set());

  // Use cached device info with additional pixel ratio
  const baseDeviceInfo = useMemo(() => getDeviceInfo(), []);
  const imageDeviceInfo = useMemo(() => {
    const viewportData = getViewportDimensions();
    return {
      ...baseDeviceInfo,
      pixelRatio: viewportData.ratio
    };
  }, [baseDeviceInfo]);

  // Check WebP support
  const supportsWebP = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    return canvas.toDataURL('image/webp').indexOf('webp') !== -1;
  }, []);

  // Generate optimized source URL
  const getOptimizedSrc = useCallback((originalSrc, width) => {
    const url = new URL(originalSrc);
    
    // Adjust quality for device capabilities
    const adjustedQuality = imageDeviceInfo.isLowEnd ? Math.min(quality, 60) : quality;
    const adjustedWidth = Math.ceil(width * imageDeviceInfo.pixelRatio);
    
    // Update URL parameters for Unsplash optimization
    url.searchParams.set('w', adjustedWidth.toString());
    url.searchParams.set('q', adjustedQuality.toString());
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('auto', 'format');
    
    if (format === 'webp' && supportsWebP()) {
      url.searchParams.set('fm', 'webp');
    }
    
    return url.toString();
  }, [quality, format, imageDeviceInfo.isLowEnd, imageDeviceInfo.pixelRatio, supportsWebP]);

  // Preload image with promise caching
  const preloadImage = useCallback((src, width) => {
    const optimizedSrc = getOptimizedSrc(src, width);
    const cacheKey = `${src}-${width}`;
    
    // Return cached promise if exists
    if (loadPromises.current.has(cacheKey)) {
      return loadPromises.current.get(cacheKey);
    }
    
    // Return cached image if already loaded
    if (imageCache.current.has(optimizedSrc)) {
      return Promise.resolve(imageCache.current.get(optimizedSrc));
    }

    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        imageCache.current.set(optimizedSrc, img);
        setLoadedImages(prev => new Set([...prev, src]));
        onLoad && onLoad(src, img);
        resolve(img);
      };
      
      img.onerror = (error) => {
        setFailedImages(prev => new Set([...prev, src]));
        onError && onError(src, error);
        reject(error);
      };
      
      img.src = optimizedSrc;
    });
    
    loadPromises.current.set(cacheKey, promise);
    return promise;
  }, [getOptimizedSrc, onLoad, onError]);

  // Generate blur data URL for placeholder
  const generateBlurDataURL = useCallback((width = 40, height = 30) => {
    if (blurDataURL) return blurDataURL;
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(20, 20, 20, 0.8)');
    gradient.addColorStop(1, 'rgba(40, 40, 40, 0.6)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    return canvas.toDataURL('image/jpeg', 0.1);
  }, [blurDataURL]);

  // Get image state
  const getImageState = useCallback((src) => {
    return {
      isLoaded: loadedImages.has(src),
      hasFailed: failedImages.has(src),
      isLoading: !loadedImages.has(src) && !failedImages.has(src)
    };
  }, [loadedImages, failedImages]);

  // Memoize images to prevent unnecessary re-processing
  const stableImages = useMemo(() => images, [images]);

  // Load images with priority handling
  useEffect(() => {
    if (!stableImages.length) return;

    // Check if we've already processed these exact images
    const imageUrlsString = stableImages.map(img => img.url).sort().join('|');
    if (processedImagesRef.current.has(imageUrlsString)) {
      return; // Already processed this set of images
    }
    
    processedImagesRef.current.add(imageUrlsString);
    let isMounted = true;
    
    const getOptimizedSrcLocal = (originalSrc, width) => {
      const url = new URL(originalSrc);
      
      // Adjust quality for device capabilities
      const adjustedQuality = imageDeviceInfo.isLowEnd ? Math.min(quality, 60) : quality;
      const adjustedWidth = Math.ceil(width * imageDeviceInfo.pixelRatio);
      
      // Update URL parameters for Unsplash optimization
      url.searchParams.set('w', adjustedWidth.toString());
      url.searchParams.set('q', adjustedQuality.toString());
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('auto', 'format');
      
      if (format === 'webp' && supportsWebP()) {
        url.searchParams.set('fm', 'webp');
      }
      
      return url.toString();
    };
    
    const loadSingleImage = (img, isMountedRef) => {
      // Skip if already loaded or failed
      if (loadedImages.has(img.url) || failedImages.has(img.url)) {
        return Promise.resolve();
      }
      
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          if (isMountedRef) {
            setLoadedImages(prev => new Set([...prev, img.url]));
          }
          resolve(image);
        };
        image.onerror = () => {
          if (isMountedRef) {
            setFailedImages(prev => new Set([...prev, img.url]));
          }
          reject(new Error(`Failed to load: ${img.url}`));
        };
        image.src = getOptimizedSrcLocal(img.url, sizes?.desktop || 800);
      });
    };
    
    const loadImages = async () => {
      const priorityImages = priority ? stableImages.slice(0, 3) : [];
      const normalImages = priority ? stableImages.slice(3) : stableImages;
      
      // Load priority images first
      if (priorityImages.length > 0 && isMounted) {
        await Promise.allSettled(
          priorityImages.map(img => loadSingleImage(img, true))
        );
      }
      
      // Load remaining images
      const batchSize = imageDeviceInfo.isLowEnd ? 2 : 4;
      for (let i = 0; i < normalImages.length; i += batchSize) {
        if (!isMounted) break;
        
        const batch = normalImages.slice(i, i + batchSize);
        await Promise.allSettled(
          batch.map(img => loadSingleImage(img, true))
        );
        
        // Update progress
        if (isMounted) {
          setLoadingProgress(((i + batchSize) / stableImages.length) * 100);
        }
        
        // Small delay for low-end devices
        if (imageDeviceInfo.isLowEnd && isMounted) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      if (isMounted) {
        setLoadingProgress(100);
      }
    };

    loadImages();
    
    return () => {
      isMounted = false;
    };
  }, [stableImages, imageDeviceInfo.isLowEnd, imageDeviceInfo.pixelRatio, format, priority, quality, sizes?.desktop, supportsWebP]); // Remove loadedImages and failedImages to prevent loops

  return {
    loadedImages,
    failedImages,
    loadingProgress,
    preloadImage,
    getOptimizedSrc,
    generateBlurDataURL,
    getImageState,
    deviceInfo: imageDeviceInfo,
    stats: {
      total: images.length,
      loaded: loadedImages.size,
      failed: failedImages.size,
      cached: imageCache.current.size
    }
  };
};