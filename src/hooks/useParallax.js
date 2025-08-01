import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getDeviceType, isLowEndDevice, prefersReducedMotion } from '../utils/deviceDetection';

export const useParallax = (options = {}) => {
  const { factor = 0.5, disabled = false } = options;
  const [scrollY, setScrollY] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef(null);
  const requestRef = useRef(null);
  const lastScrollY = useRef(0);

  // Device capabilities detection (memoized to prevent re-renders)
  const deviceInfo = useMemo(() => {
    const type = getDeviceType();
    return {
      isMobile: type.isMobile,
      isTablet: type.isTablet,
      isDesktop: type.isDesktop,
      isLowEnd: isLowEndDevice(),
      reducedMotion: prefersReducedMotion()
    };
  }, []);

  // Optimized scroll handler with throttling
  const handleScroll = useCallback(() => {
    if (requestRef.current) return;

    requestRef.current = requestAnimationFrame(() => {
      const currentScrollY = window.pageYOffset;
      
      // Only update if scroll changed significantly (threshold for performance)
      if (Math.abs(currentScrollY - lastScrollY.current) > 1) {
        setScrollY(currentScrollY);
        lastScrollY.current = currentScrollY;
      }
      
      requestRef.current = null;
    });
  }, []);

  // Intersection Observer for performance optimization
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: '100px 0px' // Start observing before element enters viewport
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Scroll event listener management
  useEffect(() => {
    // Don't add scroll listener if reduced motion or element not in view
    if (deviceInfo.reducedMotion || !isInView) {
      return;
    }

    // Use passive listener for better performance
    const options = { passive: true };
    window.addEventListener('scroll', handleScroll, options);

    return () => {
      window.removeEventListener('scroll', handleScroll, options);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [handleScroll, deviceInfo.reducedMotion, isInView]);

  // Calculate parallax transform with device-specific optimizations
  const getTransform = useCallback(() => {
    if (deviceInfo.reducedMotion || !isInView) {
      return 'translate3d(0, 0, 0)';
    }

    // Reduce parallax intensity on mobile devices for performance
    const adjustedFactor = deviceInfo.isMobile || deviceInfo.isLowEnd 
      ? factor * 0.3 
      : factor;

    const yPos = scrollY * adjustedFactor;
    
    // Use translate3d for GPU acceleration
    return `translate3d(0, ${yPos}px, 0)`;
  }, [scrollY, factor, deviceInfo, isInView]);

  // Get optimized styles for the parallax element
  const getParallaxStyle = useCallback(() => {
    const baseStyle = {
      transform: getTransform(),
      willChange: isInView && !deviceInfo.reducedMotion ? 'transform' : 'auto'
    };

    // Additional optimizations for low-end devices
    if (deviceInfo.isLowEnd || deviceInfo.isMobile) {
      return {
        ...baseStyle,
        backfaceVisibility: 'hidden',
        perspective: 1000,
        translateZ: 0 // Force GPU layer
      };
    }

    return baseStyle;
  }, [getTransform, isInView, deviceInfo]);

  // Calculate parallax offset directly
  const parallaxOffset = deviceInfo.reducedMotion || disabled || !isInView 
    ? 0 
    : scrollY * (deviceInfo.isMobile || deviceInfo.isLowEnd ? factor * 0.3 : factor);

  return {
    elementRef,
    scrollY,
    isInView,
    parallaxOffset,
    getTransform,
    getParallaxStyle,
    shouldAnimate: !deviceInfo.reducedMotion && !disabled && isInView
  };
};