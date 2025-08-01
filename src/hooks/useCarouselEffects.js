import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getDeviceType, isLowEndDevice, prefersReducedMotion } from '../utils/deviceDetection';

// Hook for advanced carousel loading states and content management
export const useCarouselLoadingStates = (items = [], options = {}) => {
  const {
    preloadBuffer = 2,
    skeletonDuration = 800,
    staggerDelay = 200,
    enableSkeleton = true
  } = options;

  const [loadingStates, setLoadingStates] = useState(new Map());
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [globalLoading, setGlobalLoading] = useState(true);
  const [skeletonVisible, setSkeletonVisible] = useState(enableSkeleton);

  const preloadPromises = useRef(new Map());
  const deviceInfo = useMemo(() => ({
    isLowEnd: isLowEndDevice(),
    reducedMotion: prefersReducedMotion()
  }), []);

  // Initialize loading states
  useEffect(() => {
    const initialStates = new Map();
    items.forEach((item, index) => {
      initialStates.set(index, {
        content: 'pending',
        image: 'pending',
        skeleton: enableSkeleton,
        delay: deviceInfo.reducedMotion ? 0 : index * staggerDelay
      });
    });
    setLoadingStates(initialStates);
  }, [items, enableSkeleton, staggerDelay, deviceInfo.reducedMotion]);

  // Preload images for specific indices
  const preloadImages = useCallback((indices) => {
    indices.forEach(index => {
      const item = items[index];
      if (!item?.image || loadedImages.has(item.image)) return;

      if (!preloadPromises.current.has(item.image)) {
        const promise = new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            setLoadedImages(prev => new Set([...prev, item.image]));
            setLoadingStates(prev => {
              const newStates = new Map(prev);
              const state = newStates.get(index) || {};
              newStates.set(index, { ...state, image: 'loaded' });
              return newStates;
            });
            resolve(img);
          };
          img.onerror = () => {
            setLoadingStates(prev => {
              const newStates = new Map(prev);
              const state = newStates.get(index) || {};
              newStates.set(index, { ...state, image: 'error' });
              return newStates;
            });
            reject(new Error(`Failed to load image: ${item.image}`));
          };
          img.src = item.image;
        });

        preloadPromises.current.set(item.image, promise);
      }
    });
  }, [items, loadedImages]);

  // Preload content around current index
  const preloadAroundIndex = useCallback((currentIndex) => {
    const indicesToPreload = [];
    
    for (let i = -preloadBuffer; i <= preloadBuffer; i++) {
      const index = currentIndex + i;
      if (index >= 0 && index < items.length) {
        indicesToPreload.push(index);
      }
    }
    
    preloadImages(indicesToPreload);
  }, [preloadBuffer, items.length, preloadImages]);

  // Mark content as loaded
  const markContentLoaded = useCallback((index) => {
    setLoadingStates(prev => {
      const newStates = new Map(prev);
      const state = newStates.get(index) || {};
      newStates.set(index, { ...state, content: 'loaded' });
      return newStates;
    });
  }, []);

  // Hide skeleton after duration
  useEffect(() => {
    if (!enableSkeleton || deviceInfo.reducedMotion) {
      setSkeletonVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setSkeletonVisible(false);
      setGlobalLoading(false);
    }, skeletonDuration);

    return () => clearTimeout(timer);
  }, [enableSkeleton, skeletonDuration, deviceInfo.reducedMotion]);

  // Check if all content is loaded
  useEffect(() => {
    const allLoaded = Array.from(loadingStates.values()).every(
      state => state.content === 'loaded' && state.image !== 'pending'
    );
    
    if (allLoaded && globalLoading) {
      setTimeout(() => setGlobalLoading(false), 300);
    }
  }, [loadingStates, globalLoading]);

  // Get loading state for specific index
  const getLoadingState = useCallback((index) => {
    return loadingStates.get(index) || {
      content: 'pending',
      image: 'pending',
      skeleton: false,
      delay: 0
    };
  }, [loadingStates]);

  // Get skeleton classes
  const getSkeletonClasses = useCallback((index) => {
    const state = getLoadingState(index);
    const classes = ['testimonial-skeleton'];
    
    if (state.skeleton && skeletonVisible) {
      classes.push('testimonial-skeleton--visible');
    }
    
    if (state.content === 'loaded') {
      classes.push('testimonial-skeleton--loaded');
    }
    
    return classes.join(' ');
  }, [getLoadingState, skeletonVisible]);

  return {
    loadingStates,
    globalLoading,
    skeletonVisible,
    preloadAroundIndex,
    markContentLoaded,
    getLoadingState,
    getSkeletonClasses,
    isImageLoaded: (image) => loadedImages.has(image),
    deviceInfo
  };
};

// Hook for smooth momentum physics
export const useMomentumPhysics = (options = {}) => {
  const {
    friction = 0.92,
    bounceStiffness = 0.8,
    bounceThreshold = 50,
    velocityThreshold = 0.1,
    maxBounce = 100
  } = options;

  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef(null);
  const momentumState = useRef({
    velocity: 0,
    position: 0,
    target: 0
  });

  const deviceInfo = useMemo(() => ({
    reducedMotion: prefersReducedMotion(),
    isLowEnd: isLowEndDevice()
  }), []);

  // Start momentum animation
  const startMomentum = useCallback((initialVelocity, currentPosition, boundaries = {}) => {
    if (deviceInfo.reducedMotion) return Promise.resolve(currentPosition);

    const { min = -Infinity, max = Infinity } = boundaries;
    
    momentumState.current = {
      velocity: initialVelocity,
      position: currentPosition,
      target: currentPosition
    };

    setIsAnimating(true);

    return new Promise((resolve) => {
      const animate = () => {
        const { velocity, position } = momentumState.current;
        
        // Apply friction
        momentumState.current.velocity *= friction;
        momentumState.current.position += velocity;

        // Handle boundaries with bounce
        if (momentumState.current.position < min) {
          const overflow = min - momentumState.current.position;
          momentumState.current.position = min - (overflow * bounceStiffness);
          momentumState.current.velocity *= -bounceStiffness;
          
          if (overflow > bounceThreshold) {
            momentumState.current.velocity = Math.min(momentumState.current.velocity, maxBounce);
          }
        } else if (momentumState.current.position > max) {
          const overflow = momentumState.current.position - max;
          momentumState.current.position = max + (overflow * bounceStiffness);
          momentumState.current.velocity *= -bounceStiffness;
          
          if (overflow > bounceThreshold) {
            momentumState.current.velocity = Math.max(momentumState.current.velocity, -maxBounce);
          }
        }

        // Continue animation or resolve
        if (Math.abs(momentumState.current.velocity) > velocityThreshold) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          resolve(momentumState.current.position);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    });
  }, [
    friction,
    bounceStiffness,
    bounceThreshold,
    velocityThreshold,
    maxBounce,
    deviceInfo.reducedMotion
  ]);

  // Stop momentum animation
  const stopMomentum = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      setIsAnimating(false);
    }
  }, []);

  // Get current momentum state
  const getCurrentState = useCallback(() => {
    return { ...momentumState.current };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    isAnimating,
    startMomentum,
    stopMomentum,
    getCurrentState,
    deviceInfo
  };
};

// Hook for scroll snap behavior
export const useScrollSnap = (containerRef, options = {}) => {
  const {
    snapType = 'x mandatory',
    snapAlign = 'start',
    snapStop = 'always',
    smoothScrolling = true,
    threshold = 0.5
  } = options;

  const [snapIndex, setSnapIndex] = useState(0);
  const [isSnapping, setIsSnapping] = useState(false);
  const snapTimeoutRef = useRef(null);

  const deviceInfo = useMemo(() => ({
    reducedMotion: prefersReducedMotion(),
    supportsScrollSnap: CSS.supports('scroll-snap-type', snapType)
  }), [snapType]);

  // Apply scroll snap styles
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !deviceInfo.supportsScrollSnap) return;

    container.style.scrollSnapType = snapType;
    container.style.scrollBehavior = smoothScrolling ? 'smooth' : 'auto';

    // Apply snap align to children
    const children = container.children;
    Array.from(children).forEach(child => {
      child.style.scrollSnapAlign = snapAlign;
      child.style.scrollSnapStop = snapStop;
    });

    return () => {
      container.style.scrollSnapType = '';
      container.style.scrollBehavior = '';
      
      Array.from(children).forEach(child => {
        child.style.scrollSnapAlign = '';
        child.style.scrollSnapStop = '';
      });
    };
  }, [containerRef, snapType, snapAlign, snapStop, smoothScrolling, deviceInfo.supportsScrollSnap]);

  // Monitor scroll position for snap detection
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsSnapping(true);
      
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
      }

      snapTimeoutRef.current = setTimeout(() => {
        setIsSnapping(false);
        
        // Calculate current snap index
        const scrollLeft = container.scrollLeft;
        const containerWidth = container.offsetWidth;
        const newIndex = Math.round(scrollLeft / containerWidth);
        
        setSnapIndex(newIndex);
      }, 150);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
      }
    };
  }, [containerRef]);

  // Programmatic snap to index
  const snapToIndex = useCallback((index) => {
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.offsetWidth;
    const targetScroll = index * containerWidth;

    container.scrollTo({
      left: targetScroll,
      behavior: smoothScrolling && !deviceInfo.reducedMotion ? 'smooth' : 'auto'
    });
  }, [containerRef, smoothScrolling, deviceInfo.reducedMotion]);

  return {
    snapIndex,
    isSnapping,
    snapToIndex,
    supportsScrollSnap: deviceInfo.supportsScrollSnap,
    deviceInfo
  };
};

// Hook for carousel performance optimization
export const useCarouselOptimization = (itemCount, currentIndex, options = {}) => {
  const {
    renderBuffer = 2,
    virtualization = false,
    memoryThreshold = 50 // MB
  } = options;

  const [shouldRender, setShouldRender] = useState(new Set());
  const [memoryUsage, setMemoryUsage] = useState(0);
  const performanceRef = useRef({
    renderTimes: [],
    lastRenderTime: 0
  });

  const deviceInfo = useMemo(() => ({
    isLowEnd: isLowEndDevice(),
    reducedMotion: prefersReducedMotion()
  }), []);

  // Calculate which items should be rendered
  useEffect(() => {
    const newRenderSet = new Set();
    
    if (!virtualization || deviceInfo.isLowEnd === false) {
      // Render all items on high-end devices
      for (let i = 0; i < itemCount; i++) {
        newRenderSet.add(i);
      }
    } else {
      // Render only items in buffer range
      for (let i = Math.max(0, currentIndex - renderBuffer); 
           i <= Math.min(itemCount - 1, currentIndex + renderBuffer); 
           i++) {
        newRenderSet.add(i);
      }
    }
    
    setShouldRender(newRenderSet);
  }, [currentIndex, itemCount, renderBuffer, virtualization, deviceInfo.isLowEnd]);

  // Monitor memory usage
  useEffect(() => {
    if (!performance.memory) return;

    const updateMemoryUsage = () => {
      const usedMB = performance.memory.usedJSHeapSize / 1024 / 1024;
      setMemoryUsage(usedMB);
    };

    const interval = setInterval(updateMemoryUsage, 5000);
    updateMemoryUsage();

    return () => clearInterval(interval);
  }, []);

  // Track render performance
  const startRenderMeasurement = useCallback(() => {
    performanceRef.current.lastRenderTime = performance.now();
  }, []);

  const endRenderMeasurement = useCallback(() => {
    const renderTime = performance.now() - performanceRef.current.lastRenderTime;
    performanceRef.current.renderTimes.push(renderTime);
    
    // Keep only last 10 measurements
    if (performanceRef.current.renderTimes.length > 10) {
      performanceRef.current.renderTimes.shift();
    }
  }, []);

  // Get average render time
  const getAverageRenderTime = useCallback(() => {
    const times = performanceRef.current.renderTimes;
    if (times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }, []);

  // Check if item should be rendered
  const shouldRenderItem = useCallback((index) => {
    return shouldRender.has(index);
  }, [shouldRender]);

  // Get performance status
  const getPerformanceStatus = useCallback(() => {
    const avgRenderTime = getAverageRenderTime();
    const isMemoryHigh = memoryUsage > memoryThreshold;
    
    if (avgRenderTime > 16 || isMemoryHigh) return 'poor';
    if (avgRenderTime > 8) return 'fair';
    return 'good';
  }, [getAverageRenderTime, memoryUsage, memoryThreshold]);

  return {
    shouldRenderItem,
    memoryUsage,
    averageRenderTime: getAverageRenderTime(),
    performanceStatus: getPerformanceStatus(),
    startRenderMeasurement,
    endRenderMeasurement,
    deviceInfo,
    optimizationActive: virtualization && deviceInfo.isLowEnd
  };
};