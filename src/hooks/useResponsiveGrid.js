import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  getDeviceInfo,
  getScreenCategory,
  canHover,
  hasPointerFine,
  isLowEndDevice,
  prefersReducedMotion
} from '../utils/deviceDetection';

export const useResponsiveGrid = (items = [], options = {}) => {
  const {
    minItemWidth = 280,
    maxItemWidth = 400,
    gap = 24,
    aspectRatio = '1/1.2',
    enableInfiniteScroll = false,
    itemsPerPage = 8,
    scrollSnapType = 'x mandatory'
  } = options;

  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isInfiniteLoading, setIsInfiniteLoading] = useState(false);

  // Device capabilities - use cached info to prevent loops
  const baseDeviceInfo = getDeviceInfo();
  const deviceInfo = useMemo(() => ({
    ...baseDeviceInfo,
    screenCategory: getScreenCategory(),
    canHover: canHover(),
    hasPointerFine: hasPointerFine()
  }), [baseDeviceInfo]);

  // Calculate optimal grid configuration
  const gridConfig = useMemo(() => {
    if (!containerWidth) return { columns: 1, itemWidth: minItemWidth, gap };

    // Adjust parameters based on device
    const adjustedGap = deviceInfo.isMobile ? Math.max(gap * 0.7, 16) : gap;
    const adjustedMinWidth = deviceInfo.screenCategory === 'xs-mobile' 
      ? Math.max(minItemWidth * 0.8, 240) 
      : minItemWidth;

    // Calculate available width for items
    const availableWidth = containerWidth - (adjustedGap * 2); // Account for container padding

    // Determine number of columns based on screen category
    let targetColumns;
    switch (deviceInfo.screenCategory) {
      case 'xs-mobile':
      case 'small-mobile':
        targetColumns = 1;
        break;
      case 'medium-mobile':
      case 'large-mobile':
        targetColumns = Math.min(2, Math.floor(availableWidth / adjustedMinWidth));
        break;
      case 'small-tablet':
      case 'tablet':
        targetColumns = Math.min(3, Math.floor(availableWidth / adjustedMinWidth));
        break;
      case 'small-desktop':
      case 'desktop':
        targetColumns = Math.min(4, Math.floor(availableWidth / adjustedMinWidth));
        break;
      default:
        targetColumns = Math.min(4, Math.floor(availableWidth / adjustedMinWidth));
    }

    // Ensure at least 1 column
    const columns = Math.max(1, targetColumns);
    
    // Calculate item width
    const totalGapWidth = (columns - 1) * adjustedGap;
    const itemWidth = Math.min(
      (availableWidth - totalGapWidth) / columns,
      maxItemWidth
    );

    return {
      columns,
      itemWidth: Math.max(itemWidth, adjustedMinWidth),
      gap: adjustedGap,
      availableWidth,
      aspectRatio
    };
  }, [containerWidth, minItemWidth, maxItemWidth, gap, aspectRatio, deviceInfo]);

  // Container resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateContainerWidth = () => {
      const width = container.offsetWidth;
      setContainerWidth(width);
    };

    // Initial measurement
    updateContainerWidth();

    // Setup ResizeObserver for container
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        // Debounce resize for performance
        clearTimeout(resizeObserver.timeoutId);
        resizeObserver.timeoutId = setTimeout(updateContainerWidth, 100);
      });

      resizeObserver.observe(container);

      return () => {
        clearTimeout(resizeObserver.timeoutId);
        resizeObserver.disconnect();
      };
    } else {
      // Fallback for browsers without ResizeObserver
      window.addEventListener('resize', updateContainerWidth);
      return () => window.removeEventListener('resize', updateContainerWidth);
    }
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    if (!enableInfiniteScroll) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return items.slice(0, startIndex + itemsPerPage);
    }
    return items;
  }, [items, currentPage, itemsPerPage, enableInfiniteScroll]);

  // Infinite scroll handler
  const handleInfiniteScroll = useCallback(() => {
    if (!enableInfiniteScroll || isInfiniteLoading || currentPage >= totalPages) return;

    setIsInfiniteLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setCurrentPage(prev => prev + 1);
      setIsInfiniteLoading(false);
    }, deviceInfo.isLowEnd ? 800 : 400);
  }, [enableInfiniteScroll, isInfiniteLoading, currentPage, totalPages, deviceInfo.isLowEnd]);

  // Intersection observer for infinite scroll
  const infiniteScrollRef = useRef(null);
  useEffect(() => {
    if (!enableInfiniteScroll || !infiniteScrollRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          handleInfiniteScroll();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observer.observe(infiniteScrollRef.current);

    return () => observer.disconnect();
  }, [enableInfiniteScroll]); // Remove handleInfiniteScroll to prevent loops

  // Grid styles
  const getGridStyles = useCallback(() => {
    const baseStyles = {
      display: 'grid',
      gap: `${gridConfig.gap}px`,
      gridTemplateColumns: `repeat(${gridConfig.columns}, 1fr)`,
      containerType: 'inline-size', // Enable container queries
      width: '100%'
    };

    // Add scroll snap for mobile if enabled
    if (deviceInfo.isMobile && scrollSnapType && gridConfig.columns === 1) {
      return {
        ...baseStyles,
        scrollSnapType,
        overflowX: 'auto',
        scrollPadding: `0 ${gridConfig.gap}px`
      };
    }

    return baseStyles;
  }, [gridConfig, deviceInfo.isMobile, scrollSnapType]);

  // Item styles
  const getItemStyles = useCallback(() => {
    const aspectRatioParts = aspectRatio.split('/');
    const ratio = aspectRatioParts.length === 2 
      ? parseFloat(aspectRatioParts[1]) / parseFloat(aspectRatioParts[0])
      : 1.2;

    const baseStyles = {
      aspectRatio: deviceInfo.isMobile ? 'auto' : aspectRatio,
      minHeight: deviceInfo.isMobile ? `${gridConfig.itemWidth * ratio}px` : 'auto',
      width: '100%',
      scrollSnapAlign: deviceInfo.isMobile ? 'start' : 'unset'
    };

    return baseStyles;
  }, [aspectRatio, gridConfig.itemWidth, deviceInfo.isMobile]);

  // Load more handler for pagination
  const loadMore = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  // Reset pagination
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Touch interaction helpers
  const getTouchProps = useCallback(() => {
    if (!deviceInfo.isMobile) return {};

    return {
      style: {
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }
    };
  }, [deviceInfo.isMobile]);

  return {
    containerRef,
    infiniteScrollRef,
    gridConfig,
    paginatedItems,
    currentPage,
    totalPages,
    isInfiniteLoading,
    deviceInfo,
    
    // Handlers
    loadMore,
    resetPagination,
    handleInfiniteScroll,
    
    // Styles
    getGridStyles,
    getItemStyles,
    getTouchProps,
    
    // State
    hasMoreItems: currentPage < totalPages,
    canLoadMore: currentPage < totalPages && !isInfiniteLoading,
    progress: (currentPage / totalPages) * 100
  };
};

// Hook for grid item animations
export const useGridItemAnimation = (index, options = {}) => {
  const {
    delay = 100,
    staggerDelay = 50,
    animationType = 'fadeInUp'
  } = options;

  const [shouldAnimate, setShouldAnimate] = useState(false);
  const itemRef = useRef(null);
  const deviceInfo = useMemo(() => ({
    reducedMotion: prefersReducedMotion(),
    isLowEnd: isLowEndDevice()
  }), []);

  useEffect(() => {
    // Don't animate if reduced motion or low-end device
    if (deviceInfo.reducedMotion || deviceInfo.isLowEnd) {
      setShouldAnimate(true);
      return;
    }

    const timer = setTimeout(() => {
      setShouldAnimate(true);
    }, delay + (index * staggerDelay));

    return () => clearTimeout(timer);
  }, [index, delay, staggerDelay, deviceInfo]);

  const getAnimationStyles = useCallback(() => {
    if (deviceInfo.reducedMotion || deviceInfo.isLowEnd) {
      return { opacity: 1, transform: 'none' };
    }

    const animations = {
      fadeInUp: {
        opacity: shouldAnimate ? 1 : 0,
        transform: shouldAnimate ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
      },
      slideInLeft: {
        opacity: shouldAnimate ? 1 : 0,
        transform: shouldAnimate ? 'translateX(0)' : 'translateX(-20px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
      },
      scaleIn: {
        opacity: shouldAnimate ? 1 : 0,
        transform: shouldAnimate ? 'scale(1)' : 'scale(0.95)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
      }
    };

    return animations[animationType] || animations.fadeInUp;
  }, [shouldAnimate, animationType, deviceInfo]);

  return {
    itemRef,
    shouldAnimate,
    getAnimationStyles
  };
};