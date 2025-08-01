import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getDeviceInfo } from '../utils/deviceDetection';

export const useLazyLoading = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
    fallbackDelay = 0
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const elementRef = useRef(null);
  const observerRef = useRef(null);

  // Device capabilities
  const deviceInfo = useMemo(() => getDeviceInfo(), []);
  const isLowEnd = deviceInfo.isLowEnd;
  const reducedMotion = deviceInfo.reducedMotion;

  // Clean up observer
  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  // Initialize intersection observer
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Fallback for browsers without intersection observer
    if (!window.IntersectionObserver) {
      const timer = setTimeout(() => {
        setIsIntersecting(true);
      }, fallbackDelay);
      
      return () => clearTimeout(timer);
    }

    // Reduce threshold for low-end devices for better performance
    const adjustedThreshold = isLowEnd ? Math.max(threshold * 0.5, 0.05) : threshold;
    const adjustedRootMargin = isLowEnd ? '20px' : rootMargin;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          
          if (triggerOnce) {
            cleanup();
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false);
        }
      },
      {
        threshold: adjustedThreshold,
        rootMargin: adjustedRootMargin
      }
    );

    observerRef.current.observe(element);

    return cleanup;
  }, [threshold, rootMargin, triggerOnce, fallbackDelay, isLowEnd, cleanup]);

  // Image loading handler
  const handleImageLoad = useCallback((src) => {
    if (!src) {
      setIsError(true);
      return Promise.reject(new Error('No source provided'));
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      const handleLoad = () => {
        setIsLoaded(true);
        setIsError(false);
        resolve(img);
      };

      const handleError = (error) => {
        setIsError(true);
        setIsLoaded(false);
        reject(error);
      };

      img.onload = handleLoad;
      img.onerror = handleError;
      
      // Add timeout for slow connections
      const timeout = setTimeout(() => {
        handleError(new Error('Image load timeout'));
      }, isLowEnd ? 10000 : 5000);

      img.onload = () => {
        clearTimeout(timeout);
        handleLoad();
      };
      
      img.src = src;
    });
  }, [isLowEnd]);

  // Preload image when intersecting
  useEffect(() => {
    if (isIntersecting && !isLoaded && !isError) {
      // Small delay for better perceived performance
      const delay = reducedMotion ? 0 : (isLowEnd ? 100 : 50);
      
      const timer = setTimeout(() => {
        // Custom load handler can be provided by consumer
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isIntersecting, isLoaded, isError, reducedMotion, isLowEnd]);

  return {
    elementRef,
    isIntersecting,
    isLoaded,
    isError,
    setIsLoaded,
    setIsError,
    handleImageLoad,
    shouldLoad: isIntersecting,
    isVisible: isIntersecting
  };
};

// Hook for managing multiple lazy loaded items (like a grid)
export const useLazyGrid = (items = [], options = {}) => {
  const {
    batchSize = 4,
    staggerDelay = 100
  } = options;

  const [loadedItems, setLoadedItems] = useState(new Set());
  const [currentBatch, setCurrentBatch] = useState(0);
  const deviceInfo = useMemo(() => getDeviceInfo(), []);
  const isLowEnd = deviceInfo.isLowEnd;
  const reducedMotion = deviceInfo.reducedMotion;

  // Adjust batch size based on device capabilities
  const adjustedBatchSize = isLowEnd ? Math.max(batchSize - 2, 1) : batchSize;
  const adjustedStaggerDelay = reducedMotion ? 0 : (isLowEnd ? staggerDelay * 2 : staggerDelay);

  // Load items in batches
  const loadNextBatch = useCallback(() => {
    const startIndex = currentBatch * adjustedBatchSize;
    const endIndex = Math.min(startIndex + adjustedBatchSize, items.length);
    
    for (let i = startIndex; i < endIndex; i++) {
      setTimeout(() => {
        setLoadedItems(prev => new Set([...prev, i]));
      }, (i - startIndex) * adjustedStaggerDelay);
    }
    
    setCurrentBatch(prev => prev + 1);
  }, [currentBatch, adjustedBatchSize, items.length, adjustedStaggerDelay]);

  // Check if item should be loaded
  const shouldLoadItem = useCallback((index) => {
    return loadedItems.has(index);
  }, [loadedItems]);

  // Load initial batch
  useEffect(() => {
    if (items.length > 0 && currentBatch === 0) {
      loadNextBatch();
    }
  }, [items.length, currentBatch, loadNextBatch]);

  // Check if more items are available
  const hasMoreItems = currentBatch * adjustedBatchSize < items.length;

  return {
    shouldLoadItem,
    loadNextBatch,
    hasMoreItems,
    loadedCount: loadedItems.size,
    totalCount: items.length,
    isLoading: loadedItems.size < items.length,
    progress: items.length > 0 ? (loadedItems.size / items.length) * 100 : 0
  };
};

// Hook for skeleton loading states
export const useSkeletonLoading = (isLoading, options = {}) => {
  const {
    minLoadingTime = 500,
    maxLoadingTime = 3000,
    showSkeleton = true
  } = options;

  const [shouldShowSkeleton, setShouldShowSkeleton] = useState(isLoading && showSkeleton);
  const [hasMinTimeElapsed, setHasMinTimeElapsed] = useState(false);
  const startTimeRef = useRef(Date.now());
  const deviceInfo = useMemo(() => getDeviceInfo(), []);
  const isLowEnd = deviceInfo.isLowEnd;

  // Adjust timing based on device capabilities
  const adjustedMinTime = isLowEnd ? Math.max(minLoadingTime * 1.5, 750) : minLoadingTime;
  const adjustedMaxTime = isLowEnd ? Math.max(maxLoadingTime * 1.2, 4000) : maxLoadingTime;

  useEffect(() => {
    if (isLoading) {
      startTimeRef.current = Date.now();
      setShouldShowSkeleton(showSkeleton);
      setHasMinTimeElapsed(false);

      // Minimum loading time
      const minTimer = setTimeout(() => {
        setHasMinTimeElapsed(true);
      }, adjustedMinTime);

      // Maximum loading time fallback
      const maxTimer = setTimeout(() => {
        setShouldShowSkeleton(false);
        setHasMinTimeElapsed(true);
      }, adjustedMaxTime);

      return () => {
        clearTimeout(minTimer);
        clearTimeout(maxTimer);
      };
    } else {
      // Content loaded - check if minimum time has elapsed
      const elapsedTime = Date.now() - startTimeRef.current;
      
      if (elapsedTime >= adjustedMinTime || hasMinTimeElapsed) {
        setShouldShowSkeleton(false);
      } else {
        // Wait for minimum time to elapse
        const remainingTime = adjustedMinTime - elapsedTime;
        const delayTimer = setTimeout(() => {
          setShouldShowSkeleton(false);
        }, remainingTime);
        
        return () => clearTimeout(delayTimer);
      }
    }
  }, [isLoading, showSkeleton, adjustedMinTime, adjustedMaxTime]);

  return {
    showSkeleton: shouldShowSkeleton,
    isLoading: isLoading || shouldShowSkeleton,
    progress: hasMinTimeElapsed ? 100 : Math.min((Date.now() - startTimeRef.current) / adjustedMinTime * 100, 90)
  };
};