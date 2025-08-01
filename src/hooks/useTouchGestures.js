import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getDeviceInfo } from '../utils/deviceDetection';

export const useTouchGestures = (options = {}) => {
  const {
    threshold = 50, // Minimum swipe distance
    timeThreshold = 300, // Maximum swipe duration
    velocityThreshold = 0.3, // Minimum swipe velocity
    enableSwipe = true,
    enablePan = false,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPanStart,
    onPanMove,
    onPanEnd
  } = options;

  const [isActive, setIsActive] = useState(false);
  const [currentGesture, setCurrentGesture] = useState(null);
  const elementRef = useRef(null);
  const gestureState = useRef({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
    isTracking: false,
    direction: null
  });

  // Device capabilities - use cached info to prevent loops
  const deviceInfo = useMemo(() => getDeviceInfo(), []);

  // Calculate gesture metrics
  const calculateGesture = useCallback((endX, endY, endTime) => {
    const { startX, startY, startTime } = gestureState.current;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const deltaTime = endTime - startTime;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;

    return {
      deltaX,
      deltaY,
      distance,
      velocity,
      duration: deltaTime,
      angle: Math.atan2(deltaY, deltaX) * (180 / Math.PI)
    };
  }, []);

  // Determine swipe direction
  const getSwipeDirection = useCallback((deltaX, deltaY) => {
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > absDeltaY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }, []);

  // Touch start handler
  const handleTouchStart = useCallback((event) => {
    if (!enableSwipe && !enablePan) return;
    if (deviceInfo.reducedMotion) return;

    const touch = event.touches[0];
    gestureState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      startTime: Date.now(),
      isTracking: true,
      direction: null
    };

    setIsActive(true);
    setCurrentGesture('start');

    if (enablePan && onPanStart) {
      onPanStart({
        x: touch.clientX,
        y: touch.clientY,
        target: event.target
      });
    }
  }, [enableSwipe, enablePan, deviceInfo.reducedMotion, onPanStart]);

  // Touch move handler
  const handleTouchMove = useCallback((event) => {
    if (!gestureState.current.isTracking) return;

    const touch = event.touches[0];
    gestureState.current.currentX = touch.clientX;
    gestureState.current.currentY = touch.clientY;

    if (enablePan && onPanMove) {
      const { startX, startY } = gestureState.current;
      onPanMove({
        x: touch.clientX,
        y: touch.clientY,
        deltaX: touch.clientX - startX,
        deltaY: touch.clientY - startY,
        target: event.target
      });
    }

    setCurrentGesture('move');

    // Prevent scroll on mobile during horizontal swipes
    const deltaX = Math.abs(touch.clientX - gestureState.current.startX);
    const deltaY = Math.abs(touch.clientY - gestureState.current.startY);
    
    if (deltaX > deltaY && deltaX > 10) {
      event.preventDefault();
    }
  }, [enablePan, onPanMove]);

  // Touch end handler
  const handleTouchEnd = useCallback((event) => {
    if (!gestureState.current.isTracking) return;

    const touch = event.changedTouches[0];
    const endTime = Date.now();
    const gesture = calculateGesture(touch.clientX, touch.clientY, endTime);

    gestureState.current.isTracking = false;
    setIsActive(false);
    setCurrentGesture('end');

    // Check if gesture meets swipe criteria
    if (enableSwipe && 
        gesture.distance > threshold && 
        gesture.duration < timeThreshold && 
        gesture.velocity > velocityThreshold) {
      
      const direction = getSwipeDirection(gesture.deltaX, gesture.deltaY);
      gestureState.current.direction = direction;

      // Trigger appropriate swipe callback
      switch (direction) {
        case 'left':
          onSwipeLeft && onSwipeLeft(gesture);
          break;
        case 'right':
          onSwipeRight && onSwipeRight(gesture);
          break;
        case 'up':
          onSwipeUp && onSwipeUp(gesture);
          break;
        case 'down':
          onSwipeDown && onSwipeDown(gesture);
          break;
        default:
          // No action for unknown directions
          break;
      }
    }

    if (enablePan && onPanEnd) {
      onPanEnd({
        ...gesture,
        target: event.target,
        direction: gestureState.current.direction
      });
    }

    // Reset gesture state after a short delay
    setTimeout(() => {
      setCurrentGesture(null);
    }, 100);
  }, [
    enableSwipe, 
    enablePan, 
    threshold, 
    timeThreshold, 
    velocityThreshold,
    calculateGesture,
    getSwipeDirection,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPanEnd
  ]);

  // Mouse event handlers for desktop testing
  const handleMouseDown = useCallback((event) => {
    if (deviceInfo.isMobile) return;
    
    // Simulate touch start for mouse
    const fakeTouch = {
      touches: [{ clientX: event.clientX, clientY: event.clientY }]
    };
    handleTouchStart(fakeTouch);
  }, [deviceInfo.isMobile, handleTouchStart]);

  const handleMouseMove = useCallback((event) => {
    if (deviceInfo.isMobile || !gestureState.current.isTracking) return;
    
    const fakeTouch = {
      touches: [{ clientX: event.clientX, clientY: event.clientY }]
    };
    handleTouchMove(fakeTouch);
  }, [deviceInfo.isMobile, handleTouchMove]);

  const handleMouseUp = useCallback((event) => {
    if (deviceInfo.isMobile || !gestureState.current.isTracking) return;
    
    const fakeTouch = {
      changedTouches: [{ clientX: event.clientX, clientY: event.clientY }]
    };
    handleTouchEnd(fakeTouch);
  }, [deviceInfo.isMobile, handleTouchEnd]);

  // Setup event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Touch events for mobile
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Mouse events for desktop (development/testing)
    if (!deviceInfo.isMobile) {
      element.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      if (!deviceInfo.isMobile) {
        element.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, []); // Remove all dependencies to prevent loops

  // Get current gesture info
  const getGestureInfo = useCallback(() => {
    const { startX, startY, currentX, currentY, direction, isTracking } = gestureState.current;
    
    return {
      isActive: isTracking,
      direction,
      deltaX: currentX - startX,
      deltaY: currentY - startY,
      distance: Math.sqrt(
        Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2)
      )
    };
  }, []);

  return {
    elementRef,
    isActive,
    currentGesture,
    getGestureInfo,
    gestureState: gestureState.current,
    deviceInfo
  };
};

// Hook for carousel with touch gestures
export const useCarouselGestures = (items = [], options = {}) => {
  const {
    autoPlay = false,
    autoPlayDelay = 5000,
    infinite = true,
    swipeThreshold = 50,
    dragThreshold = 0.2, // Percentage of container width
    onSlideChange
  } = options;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef(null);
  const autoPlayRef = useRef(null);

  const deviceInfo = useMemo(() => getDeviceInfo(), []);

  // Navigation functions
  const goToSlide = useCallback((index) => {
    const newIndex = infinite 
      ? ((index % items.length) + items.length) % items.length
      : Math.max(0, Math.min(index, items.length - 1));
    
    setCurrentIndex(newIndex);
    setDragOffset(0);
    
    onSlideChange && onSlideChange(newIndex);
  }, [items.length, infinite, onSlideChange]);

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || deviceInfo.reducedMotion || items.length <= 1) return;

    autoPlayRef.current = setInterval(nextSlide, autoPlayDelay);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, autoPlayDelay]); // Remove unstable dependencies

  // Pause auto-play on interaction
  const pauseAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  }, []);

  const resumeAutoPlay = useCallback(() => {
    if (autoPlay && !deviceInfo.reducedMotion) {
      setIsAutoPlaying(true);
    }
  }, [autoPlay, deviceInfo.reducedMotion]);

  // Touch gesture handlers
  const handleSwipeLeft = useCallback(() => {
    pauseAutoPlay();
    nextSlide();
  }, [pauseAutoPlay, nextSlide]);

  const handleSwipeRight = useCallback(() => {
    pauseAutoPlay();
    prevSlide();
  }, [pauseAutoPlay, prevSlide]);

  const handlePanStart = useCallback(() => {
    setIsDragging(true);
    pauseAutoPlay();
  }, [pauseAutoPlay]);

  const handlePanMove = useCallback((gesture) => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    const offset = (gesture.deltaX / containerWidth) * 100;
    setDragOffset(Math.max(-50, Math.min(50, offset)));
  }, []);

  const handlePanEnd = useCallback((gesture) => {
    setIsDragging(false);
    
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    const dragPercentage = Math.abs(gesture.deltaX) / containerWidth;
    
    if (dragPercentage > dragThreshold || Math.abs(gesture.velocity) > 0.5) {
      if (gesture.deltaX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    } else {
      setDragOffset(0);
    }
  }, [dragThreshold, prevSlide, nextSlide]);

  // Touch gestures hook
  const touchGestures = useTouchGestures({
    threshold: swipeThreshold,
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onPanStart: handlePanStart,
    onPanMove: handlePanMove,
    onPanEnd: handlePanEnd,
    enableSwipe: true,
    enablePan: true
  });

  // Get transform for current slide
  const getSlideTransform = useCallback(() => {
    const baseTransform = -currentIndex * 100;
    const dragTransform = isDragging ? dragOffset : 0;
    return `translateX(${baseTransform + dragTransform}%)`;
  }, [currentIndex, isDragging, dragOffset]);

  return {
    containerRef: touchGestures.elementRef,
    currentIndex,
    isAutoPlaying,
    isDragging,
    dragOffset,
    goToSlide,
    nextSlide,
    prevSlide,
    pauseAutoPlay,
    resumeAutoPlay,
    getSlideTransform,
    canGoPrev: infinite || currentIndex > 0,
    canGoNext: infinite || currentIndex < items.length - 1,
    touchGestures,
    deviceInfo
  };
};