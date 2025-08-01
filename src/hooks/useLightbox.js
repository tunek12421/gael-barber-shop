import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getDeviceInfo } from '../utils/deviceDetection';

// Hook for advanced lightbox modal with touch gestures and keyboard navigation
export const useLightbox = (images = [], options = {}) => {
  const {
    closeOnEscape = true,
    closeOnBackdropClick = true,
    enableSwipeNavigation = true,
    enableZoom = true,
    enableFullscreen = true,
    preloadBuffer = 2, // Number of images to preload before/after current
    animationDuration = 300,
    zoomLevels = [1, 1.5, 2, 3],
    onOpen,
    onClose,
    onImageChange,
    onZoomChange
  } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const lightboxRef = useRef(null);
  const imageRef = useRef(null);
  const previousFocusRef = useRef(null);
  const touchStateRef = useRef({
    lastTap: 0,
    initialDistance: 0,
    initialZoom: 1,
    isPinching: false,
    isDragging: false,
    startPan: { x: 0, y: 0 }
  });

  // Device capabilities - use cached info with additional fullscreen detection
  const baseDeviceInfo = useMemo(() => getDeviceInfo(), []);
  const deviceInfo = useMemo(() => ({
    ...baseDeviceInfo,
    supportsFullscreen: !!(document.fullscreenEnabled || 
      document.webkitFullscreenEnabled || 
      document.mozFullScreenEnabled || 
      document.msFullscreenEnabled)
  }), [baseDeviceInfo]);

  // Adjusted settings for device performance
  const adjustedSettings = useMemo(() => ({
    enableZoom: deviceInfo.isLowEnd ? false : enableZoom,
    preloadBuffer: deviceInfo.isLowEnd ? 1 : preloadBuffer,
    animationDuration: deviceInfo.reducedMotion ? 0 : 
      (deviceInfo.isLowEnd ? animationDuration * 1.5 : animationDuration),
    zoomLevels: deviceInfo.isLowEnd ? [1, 2] : zoomLevels
  }), [enableZoom, preloadBuffer, animationDuration, zoomLevels, deviceInfo]);

  // Get current image
  const currentImage = useMemo(() => {
    return images[currentIndex] || null;
  }, [images, currentIndex]);

  // Open lightbox at specific index
  const openLightbox = useCallback((index = 0) => {
    if (index < 0 || index >= images.length) return;
    
    // Store current focus
    previousFocusRef.current = document.activeElement;
    
    setCurrentIndex(index);
    setIsOpen(true);
    setIsAnimating(true);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    onOpen && onOpen(index, images[index]);
    
    // Handle animation
    if (!deviceInfo.reducedMotion) {
      setTimeout(() => setIsAnimating(false), adjustedSettings.animationDuration);
    } else {
      setIsAnimating(false);
    }
  }, [images, deviceInfo.reducedMotion, adjustedSettings.animationDuration, onOpen]);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }, []);

  // Close lightbox
  const closeLightbox = useCallback(() => {
    setIsAnimating(true);
    
    const finishClose = () => {
      setIsOpen(false);
      setCurrentIndex(0);
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
      setIsAnimating(false);
      
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Restore focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
      
      // Exit fullscreen if active
      if (isFullscreen) {
        exitFullscreen();
      }
      
      onClose && onClose();
    };
    
    if (!deviceInfo.reducedMotion) {
      setTimeout(finishClose, adjustedSettings.animationDuration);
    } else {
      finishClose();
    }
  }, [deviceInfo.reducedMotion, adjustedSettings.animationDuration, isFullscreen, onClose, exitFullscreen]);

  // Navigate to specific image
  const goToImage = useCallback((index) => {
    if (index < 0 || index >= images.length || index === currentIndex) return;
    
    setCurrentIndex(index);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    
    onImageChange && onImageChange(index, images[index]);
  }, [images, currentIndex, onImageChange]);

  // Navigate to next image
  const nextImage = useCallback(() => {
    const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    goToImage(nextIndex);
  }, [currentIndex, images.length, goToImage]);

  // Navigate to previous image
  const prevImage = useCallback(() => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    goToImage(prevIndex);
  }, [currentIndex, images.length, goToImage]);

  // Zoom functionality
  const zoomIn = useCallback(() => {
    if (!adjustedSettings.enableZoom) return;
    
    const currentLevelIndex = adjustedSettings.zoomLevels.indexOf(zoomLevel);
    const nextLevel = adjustedSettings.zoomLevels[currentLevelIndex + 1];
    
    if (nextLevel) {
      setZoomLevel(nextLevel);
      onZoomChange && onZoomChange(nextLevel);
    }
  }, [zoomLevel, adjustedSettings, onZoomChange]);

  const zoomOut = useCallback(() => {
    if (!adjustedSettings.enableZoom) return;
    
    const currentLevelIndex = adjustedSettings.zoomLevels.indexOf(zoomLevel);
    const prevLevel = adjustedSettings.zoomLevels[currentLevelIndex - 1];
    
    if (prevLevel) {
      setZoomLevel(prevLevel);
      onZoomChange && onZoomChange(prevLevel);
      
      // Reset pan if zooming out to 1x
      if (prevLevel === 1) {
        setPanOffset({ x: 0, y: 0 });
      }
    }
  }, [zoomLevel, adjustedSettings, onZoomChange]);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    onZoomChange && onZoomChange(1);
  }, [onZoomChange]);

  // Fullscreen functionality
  const enterFullscreen = useCallback(() => {
    if (!deviceInfo.supportsFullscreen || !lightboxRef.current) return;
    
    const element = lightboxRef.current;
    
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }, [deviceInfo.supportsFullscreen]);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  // Touch gesture handlers
  const handleTouchStart = useCallback((event) => {
    if (!enableSwipeNavigation && !adjustedSettings.enableZoom) return;
    
    const touches = event.touches;
    const now = Date.now();
    
    if (touches.length === 1) {
      const touch = touches[0];
      
      // Check for double tap
      if (now - touchStateRef.current.lastTap < 300) {
        event.preventDefault();
        if (adjustedSettings.enableZoom) {
          if (zoomLevel === 1) {
            zoomIn();
          } else {
            resetZoom();
          }
        }
      }
      
      touchStateRef.current.lastTap = now;
      touchStateRef.current.startPan = {
        x: touch.clientX - panOffset.x,
        y: touch.clientY - panOffset.y
      };
      touchStateRef.current.isDragging = true;
    } else if (touches.length === 2 && adjustedSettings.enableZoom) {
      // Pinch to zoom
      const touch1 = touches[0];
      const touch2 = touches[1];
      const distance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      
      touchStateRef.current.initialDistance = distance;
      touchStateRef.current.initialZoom = zoomLevel;
      touchStateRef.current.isPinching = true;
    }
  }, [enableSwipeNavigation, adjustedSettings, zoomLevel, panOffset, zoomIn, resetZoom]);

  const handleTouchMove = useCallback((event) => {
    event.preventDefault();
    
    const touches = event.touches;
    
    if (touches.length === 1 && touchStateRef.current.isDragging) {
      const touch = touches[0];
      
      if (zoomLevel > 1) {
        // Pan when zoomed
        setPanOffset({
          x: touch.clientX - touchStateRef.current.startPan.x,
          y: touch.clientY - touchStateRef.current.startPan.y
        });
      }
    } else if (touches.length === 2 && touchStateRef.current.isPinching) {
      // Pinch zoom
      const touch1 = touches[0];
      const touch2 = touches[1];
      const distance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      
      const scale = distance / touchStateRef.current.initialDistance;
      const newZoom = Math.max(1, Math.min(
        Math.max(...adjustedSettings.zoomLevels),
        touchStateRef.current.initialZoom * scale
      ));
      
      setZoomLevel(newZoom);
    }
  }, [zoomLevel, adjustedSettings]);

  const handleTouchEnd = useCallback((event) => {
    touchStateRef.current.isDragging = false;
    touchStateRef.current.isPinching = false;
    
    // Snap zoom to nearest level
    if (adjustedSettings.enableZoom && zoomLevel !== 1) {
      const nearestLevel = adjustedSettings.zoomLevels.reduce((prev, curr) => 
        Math.abs(curr - zoomLevel) < Math.abs(prev - zoomLevel) ? curr : prev
      );
      
      if (nearestLevel !== zoomLevel) {
        setZoomLevel(nearestLevel);
        onZoomChange && onZoomChange(nearestLevel);
      }
    }
  }, [zoomLevel, adjustedSettings, onZoomChange]);

  // Keyboard event handler
  const handleKeyDown = useCallback((event) => {
    if (!isOpen) return;
    
    switch (event.key) {
      case 'Escape':
        if (closeOnEscape) {
          event.preventDefault();
          closeLightbox();
        }
        break;
      
      case 'ArrowLeft':
        event.preventDefault();
        prevImage();
        break;
      
      case 'ArrowRight':
        event.preventDefault();
        nextImage();
        break;
      
      case '+':
      case '=':
        if (adjustedSettings.enableZoom) {
          event.preventDefault();
          zoomIn();
        }
        break;
      
      case '-':
        if (adjustedSettings.enableZoom) {
          event.preventDefault();
          zoomOut();
        }
        break;
      
      case '0':
        if (adjustedSettings.enableZoom) {
          event.preventDefault();
          resetZoom();
        }
        break;
      
      case 'f':
      case 'F':
        if (enableFullscreen && deviceInfo.supportsFullscreen) {
          event.preventDefault();
          toggleFullscreen();
        }
        break;
      
      default:
        // No action for other keys
        break;
    }
  }, [
    isOpen, 
    closeOnEscape, 
    closeLightbox, 
    prevImage, 
    nextImage, 
    adjustedSettings, 
    zoomIn, 
    zoomOut, 
    resetZoom,
    enableFullscreen,
    deviceInfo.supportsFullscreen,
    toggleFullscreen
  ]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((event) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      closeLightbox();
    }
  }, [closeOnBackdropClick, closeLightbox]);

  // Preload adjacent images
  useEffect(() => {
    if (!isOpen || currentIndex < 0 || currentIndex >= images.length) return;
    
    const preloadPromises = [];
    
    for (let offset = 1; offset <= adjustedSettings.preloadBuffer; offset++) {
      // Preload next images
      const nextIndex = (currentIndex + offset) % images.length;
      if (nextIndex !== currentIndex) {
        const img = new Image();
        img.src = images[nextIndex].url;
        preloadPromises.push(
          new Promise(resolve => {
            img.onload = img.onerror = resolve;
          })
        );
      }
      
      // Preload previous images
      const prevIndex = (currentIndex - offset + images.length) % images.length;
      if (prevIndex !== currentIndex) {
        const img = new Image();
        img.src = images[prevIndex].url;
        preloadPromises.push(
          new Promise(resolve => {
            img.onload = img.onerror = resolve;
          })
        );
      }
    }
    
    Promise.all(preloadPromises);
  }, [currentIndex, images, isOpen, adjustedSettings.preloadBuffer]);

  // Setup event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      
      // Touch events - capture element reference to avoid stale closure
      const lightboxElement = lightboxRef.current;
      if (lightboxElement) {
        lightboxElement.addEventListener('touchstart', handleTouchStart, { passive: false });
        lightboxElement.addEventListener('touchmove', handleTouchMove, { passive: false });
        lightboxElement.addEventListener('touchend', handleTouchEnd, { passive: true });
      }
      
      // Fullscreen change events
      const handleFullscreenChange = () => {
        setIsFullscreen(!!(
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement
        ));
      };
      
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        
        if (lightboxElement) {
          lightboxElement.removeEventListener('touchstart', handleTouchStart);
          lightboxElement.removeEventListener('touchmove', handleTouchMove);
          lightboxElement.removeEventListener('touchend', handleTouchEnd);
        }
      };
    }
  }, [
    isOpen, 
    handleKeyDown, 
    handleTouchStart, 
    handleTouchMove, 
    handleTouchEnd
  ]);

  // Get image transform style
  const getImageTransform = useCallback(() => {
    const transforms = [];
    
    if (zoomLevel !== 1) {
      transforms.push(`scale(${zoomLevel})`);
    }
    
    if (panOffset.x !== 0 || panOffset.y !== 0) {
      transforms.push(`translate(${panOffset.x}px, ${panOffset.y}px)`);
    }
    
    return transforms.length > 0 ? transforms.join(' ') : 'none';
  }, [zoomLevel, panOffset]);

  // Get lightbox classes
  const getLightboxClasses = useCallback(() => {
    const classes = ['lightbox'];
    
    if (isOpen) classes.push('lightbox--open');
    if (isAnimating) classes.push('lightbox--animating');
    if (isFullscreen) classes.push('lightbox--fullscreen');
    if (deviceInfo.isMobile) classes.push('lightbox--mobile');
    if (deviceInfo.reducedMotion) classes.push('lightbox--no-animation');
    
    return classes.join(' ');
  }, [isOpen, isAnimating, isFullscreen, deviceInfo]);

  return {
    // State
    isOpen,
    currentIndex,
    currentImage,
    isAnimating,
    zoomLevel,
    panOffset,
    isFullscreen,
    
    // Actions
    openLightbox,
    closeLightbox,
    nextImage,
    prevImage,
    goToImage,
    zoomIn,
    zoomOut,
    resetZoom,
    toggleFullscreen,
    
    // Event handlers
    handleBackdropClick,
    
    // Styling
    getImageTransform,
    getLightboxClasses,
    
    // Refs
    lightboxRef,
    imageRef,
    
    // Device info
    deviceInfo,
    adjustedSettings,
    
    // Navigation helpers
    canGoPrev: currentIndex > 0 || images.length > 1,
    canGoNext: currentIndex < images.length - 1 || images.length > 1,
    canZoomIn: adjustedSettings.enableZoom && zoomLevel < Math.max(...adjustedSettings.zoomLevels),
    canZoomOut: adjustedSettings.enableZoom && zoomLevel > 1
  };
};