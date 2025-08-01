import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getDeviceInfo } from '../utils/deviceDetection';

// Hook for ultra-responsive carousel with adaptive navigation modes
export const useResponsiveCarousel = (items = [], options = {}) => {
  const {
    autoPlay = true,
    autoPlayDelay = 6000,
    infinite = true,
    enableSwipe = true,
    enableKeyboard = true,
    momentum = true,
    transitionDuration = 600,
    onSlideChange,
    onAutoPlayToggle
  } = options;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [velocity] = useState(0);
  const [navigationMode, setNavigationMode] = useState('dots');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const autoPlayRef = useRef(null);
  const animationRef = useRef(null);
  const goToSlideRef = useRef(null);
  const touchStateRef = useRef({
    startX: 0,
    startY: 0,
    currentX: 0,
    lastX: 0,
    startTime: 0,
    lastTime: 0,
    isDragging: false,
    velocityHistory: []
  });

  // Device capabilities - use cached info to prevent loops
  const deviceInfo = useMemo(() => getDeviceInfo(), []);

  // Determine navigation mode based on device and viewport
  const determineNavigationMode = useCallback(() => {
    if (!containerRef.current) return 'dots';
    
    const width = containerRef.current.offsetWidth;
    
    if (deviceInfo.isMobile) return 'dots';
    if (width < 768) return 'dots';
    if (width < 1024) return 'arrows';
    return 'continuous';
  }, [deviceInfo.isMobile]);

  // Update navigation mode on resize
  useEffect(() => {
    const updateNavigationMode = () => {
      const newMode = determineNavigationMode();
      setNavigationMode(newMode);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateNavigationMode();
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      updateNavigationMode();
    }

    return () => resizeObserver.disconnect();
  }, []); // Remove determineNavigationMode dependency to prevent loop

  // Calculate momentum velocity
  const calculateVelocity = useCallback(() => {
    const { velocityHistory } = touchStateRef.current;
    if (velocityHistory.length < 2) return 0;

    const recent = velocityHistory.slice(-3);
    const totalVelocity = recent.reduce((sum, v) => sum + v.velocity, 0);
    return totalVelocity / recent.length;
  }, []);

  // Smooth momentum animation
  const animateMomentum = useCallback((initialVelocity, startOffset) => {
    if (!momentum || Math.abs(initialVelocity) < 0.1) {
      setDragOffset(0);
      return;
    }

    let currentVelocity = initialVelocity;
    let currentOffset = startOffset;
    const friction = 0.95;
    const threshold = 0.1;

    const animate = () => {
      currentVelocity *= friction;
      currentOffset += currentVelocity;

      if (Math.abs(currentVelocity) > threshold) {
        setDragOffset(currentOffset);
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Snap to nearest slide
        const slideWidth = containerRef.current?.offsetWidth || 0;
        const targetIndex = Math.round(-currentOffset / slideWidth);
        const clampedIndex = Math.max(0, Math.min(targetIndex, items.length - 1));
        
        goToSlideRef.current?.(clampedIndex);
        setDragOffset(0);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [momentum, items.length]);

  // Navigation functions
  const goToSlide = useCallback((index, userInitiated = false) => {
    // Use refs to get current state without causing dependency updates
    const currentIdx = currentIndex;
    const isCurrentlyTransitioning = isTransitioning;
    
    if (isCurrentlyTransitioning && !userInitiated) return;
    
    let newIndex = index;
    
    if (infinite) {
      newIndex = ((index % items.length) + items.length) % items.length;
    } else {
      newIndex = Math.max(0, Math.min(index, items.length - 1));
    }
    
    if (newIndex !== currentIdx) {
      setIsTransitioning(true);
      setCurrentIndex(newIndex);
      onSlideChange && onSlideChange(newIndex, userInitiated);
      
      // Reset transition state
      setTimeout(() => {
        setIsTransitioning(false);
      }, transitionDuration);
    }
  }, [items.length, infinite, transitionDuration, onSlideChange]);

  // Update ref with current function
  goToSlideRef.current = goToSlide;

  const nextSlide = useCallback((userInitiated = true) => {
    goToSlideRef.current?.(currentIndex + 1, userInitiated);
  }, [currentIndex]);

  const prevSlide = useCallback((userInitiated = true) => {
    goToSlideRef.current?.(currentIndex - 1, userInitiated);
  }, [currentIndex]);

  // Auto-play functionality - use refs to avoid infinite loops
  const currentIndexRef = useRef(currentIndex);
  const isDraggingRef = useRef(isDragging);
  const isTransitioningRef = useRef(isTransitioning);
  
  currentIndexRef.current = currentIndex;
  isDraggingRef.current = isDragging;
  isTransitioningRef.current = isTransitioning;

  useEffect(() => {
    if (!isAutoPlaying || deviceInfo.reducedMotion || items.length <= 1) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
      return;
    }

    autoPlayRef.current = setInterval(() => {
      if (!isDraggingRef.current && !isTransitioningRef.current) {
        goToSlideRef.current?.(currentIndexRef.current + 1, false);
      }
    }, autoPlayDelay);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [
    isAutoPlaying, 
    deviceInfo.reducedMotion, 
    items.length, 
    autoPlayDelay
  ]);

  // Auto-play controls
  const pauseAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
    onAutoPlayToggle && onAutoPlayToggle(false);
  }, [onAutoPlayToggle]);

  const resumeAutoPlay = useCallback(() => {
    if (autoPlay && !deviceInfo.reducedMotion) {
      setIsAutoPlaying(true);
      onAutoPlayToggle && onAutoPlayToggle(true);
    }
  }, [autoPlay, deviceInfo.reducedMotion, onAutoPlayToggle]);

  const toggleAutoPlay = useCallback(() => {
    if (isAutoPlaying) {
      pauseAutoPlay();
    } else {
      resumeAutoPlay();
    }
  }, [isAutoPlaying, pauseAutoPlay, resumeAutoPlay]);

  // Touch event handlers
  const handleTouchStart = useCallback((event) => {
    if (!enableSwipe) return;

    const touch = event.touches[0];
    const now = performance.now();

    touchStateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      lastX: touch.clientX,
      startTime: now,
      lastTime: now,
      isDragging: true,
      velocityHistory: []
    };

    setIsDragging(true);
    pauseAutoPlay();

    // Cancel any ongoing momentum animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [enableSwipe, pauseAutoPlay]);

  const handleTouchMove = useCallback((event) => {
    if (!touchStateRef.current.isDragging) return;

    const touch = event.touches[0];
    const now = performance.now();
    const deltaX = touch.clientX - touchStateRef.current.startX;
    const deltaTime = now - touchStateRef.current.lastTime;

    // Calculate instantaneous velocity
    if (deltaTime > 0) {
      const instantVelocity = (touch.clientX - touchStateRef.current.lastX) / deltaTime;
      touchStateRef.current.velocityHistory.push({
        velocity: instantVelocity,
        time: now
      });

      // Keep only recent velocity data
      if (touchStateRef.current.velocityHistory.length > 5) {
        touchStateRef.current.velocityHistory.shift();
      }
    }

    touchStateRef.current.currentX = touch.clientX;
    touchStateRef.current.lastX = touch.clientX;
    touchStateRef.current.lastTime = now;

    // Apply drag offset with resistance at boundaries
    let offset = deltaX;
    
    if (!infinite) {
      const slideWidth = containerRef.current?.offsetWidth || 0;
      const isAtStart = currentIndex === 0 && deltaX > 0;
      const isAtEnd = currentIndex === items.length - 1 && deltaX < 0;
      
      if (isAtStart || isAtEnd) {
        offset = deltaX * 0.3; // Apply resistance
      }
    }

    setDragOffset(offset);

    // Prevent vertical scrolling during horizontal swipe
    if (Math.abs(deltaX) > Math.abs(touch.clientY - touchStateRef.current.startY)) {
      if (event.preventDefault) {
        event.preventDefault();
      }
    }
  }, [currentIndex, items.length, infinite]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStateRef.current.isDragging) return;

    const { startX, currentX, startTime } = touchStateRef.current;
    const deltaX = currentX - startX;
    const deltaTime = performance.now() - startTime;
    const slideWidth = containerRef.current?.offsetWidth || 0;

    touchStateRef.current.isDragging = false;
    setIsDragging(false);

    // Determine if this is a swipe or just a drag
    const isSwipe = Math.abs(deltaX) > slideWidth * 0.2 || Math.abs(deltaX / deltaTime) > 0.3;

    if (isSwipe) {
      if (deltaX > 0) {
        prevSlide(true);
      } else {
        nextSlide(true);
      }
      setDragOffset(0);
    } else if (momentum) {
      // Apply momentum scrolling
      const finalVelocity = calculateVelocity();
      animateMomentum(finalVelocity, dragOffset);
    } else {
      setDragOffset(0);
    }

    // Resume auto-play after a delay
    setTimeout(() => {
      if (autoPlay && !deviceInfo.reducedMotion) {
        resumeAutoPlay();
      }
    }, 3000);
  }, [
    dragOffset,
    prevSlide,
    nextSlide,
    momentum,
    calculateVelocity,
    animateMomentum,
    autoPlay,
    deviceInfo.reducedMotion,
    resumeAutoPlay
  ]);

  // Mouse event handlers for desktop
  const handleMouseDown = useCallback((event) => {
    if (deviceInfo.isMobile || !enableSwipe) return;

    const fakeTouch = {
      touches: [{ clientX: event.clientX, clientY: event.clientY }],
      preventDefault: () => event.preventDefault()
    };
    handleTouchStart(fakeTouch);
  }, [deviceInfo.isMobile, enableSwipe, handleTouchStart]);

  const handleMouseMove = useCallback((event) => {
    if (deviceInfo.isMobile || !touchStateRef.current.isDragging) return;

    const fakeTouch = {
      touches: [{ clientX: event.clientX, clientY: event.clientY }],
      preventDefault: () => event.preventDefault()
    };
    handleTouchMove(fakeTouch);
  }, [deviceInfo.isMobile, handleTouchMove]);

  const handleMouseUp = useCallback(() => {
    if (deviceInfo.isMobile || !touchStateRef.current.isDragging) return;
    handleTouchEnd();
  }, [deviceInfo.isMobile, handleTouchEnd]);

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboard) return;

    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          prevSlide(true);
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextSlide(true);
          break;
        case ' ':
          event.preventDefault();
          toggleAutoPlay();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboard, prevSlide, nextSlide, toggleAutoPlay]);

  // Setup event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    if (!deviceInfo.isMobile) {
      container.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);

      if (!deviceInfo.isMobile) {
        container.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []); // Remove all dependencies to prevent infinite loops

  // Get transform for current slide
  const getSlideTransform = useCallback(() => {
    const baseTransform = -currentIndex * 100;
    const dragTransform = isDragging ? (dragOffset / (dimensions.width || 1)) * 100 : 0;
    
    return `translateX(${baseTransform + dragTransform}%)`;
  }, [currentIndex, isDragging, dragOffset, dimensions.width]);

  // Get slide classes
  const getSlideClasses = useCallback((index) => {
    const classes = ['carousel-slide'];
    
    if (index === currentIndex) {
      classes.push('carousel-slide--active');
    } else if (index === currentIndex - 1 || (currentIndex === 0 && index === items.length - 1)) {
      classes.push('carousel-slide--prev');
    } else if (index === currentIndex + 1 || (currentIndex === items.length - 1 && index === 0)) {
      classes.push('carousel-slide--next');
    }
    
    if (isTransitioning) {
      classes.push('carousel-slide--transitioning');
    }
    
    return classes.join(' ');
  }, [currentIndex, items.length, isTransitioning]);

  // Get navigation classes
  const getNavClasses = useCallback(() => {
    const classes = ['carousel-nav'];
    classes.push(`carousel-nav--${navigationMode}`);
    
    if (deviceInfo.isMobile) {
      classes.push('carousel-nav--mobile');
    }
    
    return classes.join(' ');
  }, [navigationMode, deviceInfo.isMobile]);

  return {
    // State
    currentIndex,
    isAutoPlaying,
    isDragging,
    dragOffset,
    velocity,
    navigationMode,
    isTransitioning,
    dimensions,
    
    // Navigation
    goToSlide,
    nextSlide,
    prevSlide,
    
    // Auto-play controls
    pauseAutoPlay,
    resumeAutoPlay,
    toggleAutoPlay,
    
    // Transform and styling
    getSlideTransform,
    getSlideClasses,
    getNavClasses,
    
    // Refs
    containerRef,
    trackRef,
    
    // Device info
    deviceInfo,
    
    // Navigation helpers
    canGoPrev: infinite || currentIndex > 0,
    canGoNext: infinite || currentIndex < items.length - 1,
    
    // Progress
    progress: items.length > 0 ? (currentIndex + 1) / items.length : 0
  };
};

// Hook for testimonial card typography scaling
export const useTestimonialScaling = (text = '', containerRef, options = {}) => {
  const {
    minFontSize = 16,
    maxFontSize = 32,
    maxLineCount = 6
  } = options;

  const [fontSize, setFontSize] = useState(maxFontSize);
  const [lineHeight, setLineHeight] = useState(1.4);
  const [isOverflowing, setIsOverflowing] = useState(false);


  const calculateOptimalSize = useCallback(() => {
    if (!containerRef.current || !text) return;

    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    // Create temporary element for measurement
    const measureElement = document.createElement('div');
    measureElement.style.position = 'absolute';
    measureElement.style.visibility = 'hidden';
    measureElement.style.width = `${containerWidth}px`;
    measureElement.style.fontFamily = getComputedStyle(container).fontFamily;
    measureElement.style.fontWeight = getComputedStyle(container).fontWeight;
    measureElement.textContent = text;

    document.body.appendChild(measureElement);

    let optimalSize = maxFontSize;
    let currentLineHeight = 1.4;

    // Binary search for optimal font size
    let low = minFontSize;
    let high = maxFontSize;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      measureElement.style.fontSize = `${mid}px`;
      measureElement.style.lineHeight = currentLineHeight;

      const textHeight = measureElement.offsetHeight;
      const lineCount = Math.ceil(textHeight / (mid * currentLineHeight));

      if (lineCount <= maxLineCount && textHeight <= containerHeight) {
        optimalSize = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    // Adjust line height based on font size
    if (optimalSize < 20) {
      currentLineHeight = 1.5;
    } else if (optimalSize > 28) {
      currentLineHeight = 1.3;
    }

    // Final check for overflow
    measureElement.style.fontSize = `${optimalSize}px`;
    measureElement.style.lineHeight = currentLineHeight;
    const finalHeight = measureElement.offsetHeight;
    const finalLineCount = Math.ceil(finalHeight / (optimalSize * currentLineHeight));

    document.body.removeChild(measureElement);

    setFontSize(optimalSize);
    setLineHeight(currentLineHeight);
    setIsOverflowing(finalLineCount > maxLineCount || finalHeight > containerHeight);
  }, [text, containerRef, minFontSize, maxFontSize, maxLineCount]);

  useEffect(() => {
    calculateOptimalSize();

    const resizeObserver = new ResizeObserver(calculateOptimalSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [calculateOptimalSize]);

  return {
    fontSize,
    lineHeight,
    isOverflowing,
    style: {
      fontSize: `${fontSize}px`,
      lineHeight
    }
  };
};

// Hook for rating stars responsive scaling
export const useRatingStars = (rating = 5, maxRating = 5, options = {}) => {
  const {
    starSize = 20,
    spacing = 4,
    fillColor = '#FFD700',
    emptyColor = '#E0E0E0',
    responsive = true
  } = options;

  const [scaledSize, setScaledSize] = useState(starSize);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!responsive) return;

    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const availableWidth = containerWidth - (spacing * (maxRating - 1));
        const maxStarSize = Math.floor(availableWidth / maxRating);
        
        setScaledSize(Math.min(Math.max(maxStarSize, 12), starSize * 1.5));
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [starSize, spacing, maxRating, responsive]);

  const getStarStyle = useCallback((index) => ({
    width: `${scaledSize}px`,
    height: `${scaledSize}px`,
    marginRight: index < maxRating - 1 ? `${spacing}px` : '0',
    color: index < rating ? fillColor : emptyColor,
    transition: 'all 0.3s ease'
  }), [scaledSize, spacing, maxRating, rating, fillColor, emptyColor]);

  return {
    containerRef,
    scaledSize,
    getStarStyle,
    containerStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start'
    }
  };
};