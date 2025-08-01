import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getDeviceInfo } from '../utils/deviceDetection';

export const useModalStates = (options = {}) => {
  const {
    closeOnEscape = true,
    closeOnBackdropClick = true,
    preventBodyScroll = true,
    focusTrap = true,
    animationDuration = 300
  } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeModalId, setActiveModalId] = useState(null);
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const bodyScrollPositionRef = useRef(0);

  const deviceInfo = useMemo(() => getDeviceInfo(), []);

  // Adjusted animation duration for device capabilities
  const adjustedDuration = deviceInfo.reducedMotion ? 0 : 
    (deviceInfo.isLowEnd ? animationDuration * 1.5 : animationDuration);

  // Open modal
  const openModal = useCallback((modalId = 'default') => {
    // Store current focus for restoration
    previousFocusRef.current = document.activeElement;
    
    setActiveModalId(modalId);
    setIsAnimating(true);
    setIsOpen(true);

    if (preventBodyScroll) {
      bodyScrollPositionRef.current = window.pageYOffset;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${bodyScrollPositionRef.current}px`;
      document.body.style.width = '100%';
    }

    // Handle animation completion
    if (!deviceInfo.reducedMotion) {
      setTimeout(() => {
        setIsAnimating(false);
      }, adjustedDuration);
    } else {
      setIsAnimating(false);
    }
  }, [preventBodyScroll, deviceInfo.reducedMotion, adjustedDuration]);

  // Close modal
  const closeModal = useCallback(() => {
    setIsAnimating(true);

    const finishClose = () => {
      setIsOpen(false);
      setActiveModalId(null);
      setIsAnimating(false);

      // Restore body scroll
      if (preventBodyScroll) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, bodyScrollPositionRef.current);
      }

      // Restore focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    };

    if (!deviceInfo.reducedMotion) {
      setTimeout(finishClose, adjustedDuration);
    } else {
      finishClose();
    }
  }, [preventBodyScroll, deviceInfo.reducedMotion, adjustedDuration]);

  // Toggle modal
  const toggleModal = useCallback((modalId) => {
    if (isOpen) {
      closeModal();
    } else {
      openModal(modalId);
    }
  }, [isOpen, openModal, closeModal]);

  // Keyboard event handler
  const handleKeyDown = useCallback((event) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'Escape':
        if (closeOnEscape) {
          event.preventDefault();
          closeModal();
        }
        break;

      case 'Tab':
        if (focusTrap && modalRef.current) {
          event.preventDefault();
          const focusableElements = modalRef.current.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
            } else {
              const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
              if (currentIndex > 0) {
                focusableElements[currentIndex - 1].focus();
              } else {
                lastElement.focus();
              }
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
            } else {
              const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
              if (currentIndex < focusableElements.length - 1) {
                focusableElements[currentIndex + 1].focus();
              } else {
                firstElement.focus();
              }
            }
          }
        }
        break;
      default:
        // No action needed for other keys
        break;
    }
  }, [isOpen, closeOnEscape, focusTrap, closeModal]);

  // Click outside handler
  const handleBackdropClick = useCallback((event) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      closeModal();
    }
  }, [closeOnBackdropClick, closeModal]);

  // Setup event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      
      // Focus management
      if (modalRef.current && focusTrap) {
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
          // Small delay to ensure modal is rendered
          setTimeout(() => {
            focusableElements[0].focus();
          }, 50);
        }
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown, focusTrap]);

  // Get modal state for styling
  const getModalState = useCallback(() => {
    if (!isOpen) return 'closed';
    if (isAnimating) return 'animating';
    return 'open';
  }, [isOpen, isAnimating]);

  // Get modal classes
  const getModalClasses = useCallback((baseClass = 'modal') => {
    const state = getModalState();
    return [
      baseClass,
      `${baseClass}--${state}`,
      deviceInfo.isMobile ? `${baseClass}--mobile` : `${baseClass}--desktop`,
      deviceInfo.reducedMotion ? `${baseClass}--no-animation` : ''
    ].filter(Boolean).join(' ');
  }, [getModalState, deviceInfo]);

  return {
    modalRef,
    isOpen,
    isAnimating,
    activeModalId,
    openModal,
    closeModal,
    toggleModal,
    handleBackdropClick,
    getModalState,
    getModalClasses,
    deviceInfo
  };
};

// Hook for performance monitoring
export const usePerformanceMonitoring = (componentName = 'Component') => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    memoryUsage: 0
  });

  const renderStartTimeRef = useRef(0);
  const renderTimesRef = useRef([]);
  const deviceInfo = useMemo(() => getDeviceInfo(), []);

  // Start performance measurement
  const startMeasurement = useCallback(() => {
    renderStartTimeRef.current = performance.now();
  }, []);

  // End performance measurement
  const endMeasurement = useCallback(() => {
    const renderTime = performance.now() - renderStartTimeRef.current;
    
    renderTimesRef.current.push(renderTime);
    
    // Keep only last 10 measurements for average calculation
    if (renderTimesRef.current.length > 10) {
      renderTimesRef.current.shift();
    }

    const averageRenderTime = renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length;
    
    // Get memory usage if available
    let memoryUsage = 0;
    if (performance.memory) {
      memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
    }

    setMetrics(prev => ({
      renderTime,
      renderCount: prev.renderCount + 1,
      lastRenderTime: renderTime,
      averageRenderTime,
      memoryUsage
    }));

    // Log performance warnings for low-end devices
    if (deviceInfo.isLowEnd && renderTime > 16) {
      console.warn(`${componentName}: Slow render detected (${renderTime.toFixed(2)}ms) on low-end device`);
    }
  }, [componentName, deviceInfo.isLowEnd]);

  // Measure component lifecycle - disabled to prevent infinite loops
  useEffect(() => {
    // Performance monitoring temporarily disabled
    // startMeasurement();
    
    return () => {
      // endMeasurement();
    };
  }, []); // Empty dependency array to prevent loops

  // Get performance status
  const getPerformanceStatus = useCallback(() => {
    const { averageRenderTime } = metrics;
    
    if (averageRenderTime < 8) return 'excellent';
    if (averageRenderTime < 16) return 'good';
    if (averageRenderTime < 32) return 'fair';
    return 'poor';
  }, [metrics]);

  // Check if performance is acceptable
  const isPerformanceAcceptable = useCallback(() => {
    const status = getPerformanceStatus();
    return deviceInfo.isLowEnd ? 
      (status === 'excellent' || status === 'good') :
      (status !== 'poor');
  }, [getPerformanceStatus, deviceInfo.isLowEnd]);

  return {
    metrics,
    startMeasurement,
    endMeasurement,
    getPerformanceStatus,
    isPerformanceAcceptable,
    deviceInfo
  };
};

// Hook for intersection observer with performance monitoring
export const useIntersectionObserver = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = false,
    onIntersect,
    onExit
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef(null);
  const observerRef = useRef(null);

  const deviceInfo = useMemo(() => getDeviceInfo(), []);

  // Adjust threshold for low-end devices
  const adjustedThreshold = deviceInfo.isLowEnd ? Math.max(threshold * 0.5, 0.05) : threshold;
  const adjustedRootMargin = deviceInfo.isLowEnd ? '20px' : rootMargin;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Fallback for browsers without Intersection Observer
    if (!window.IntersectionObserver) {
      setIsIntersecting(true);
      setHasIntersected(true);
      onIntersect && onIntersect(element);
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isNowIntersecting = entry.isIntersecting;
        
        setIsIntersecting(isNowIntersecting);
        
        if (isNowIntersecting) {
          setHasIntersected(true);
          onIntersect && onIntersect(entry);
          
          if (triggerOnce) {
            observerRef.current?.unobserve(element);
          }
        } else if (!triggerOnce && hasIntersected) {
          onExit && onExit(entry);
        }
      },
      {
        threshold: adjustedThreshold,
        rootMargin: adjustedRootMargin
      }
    );

    observerRef.current.observe(element);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [
    adjustedThreshold,
    adjustedRootMargin,
    triggerOnce,
    onIntersect,
    onExit,
    hasIntersected
  ]);

  return {
    elementRef,
    isIntersecting,
    hasIntersected,
    deviceInfo
  };
};