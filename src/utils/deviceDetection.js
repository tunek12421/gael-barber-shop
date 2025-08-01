// Device detection utilities for performance optimization

// Cache device type to prevent object recreation on every call
let cachedDeviceType = null;

export const getDeviceType = () => {
  if (cachedDeviceType) {
    return cachedDeviceType;
  }
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
  const isDesktop = !isMobile && !isTablet;
  
  cachedDeviceType = { isMobile, isTablet, isDesktop };
  return cachedDeviceType;
};

// Cache complete device info to prevent useMemo recreation
let cachedDeviceInfo = null;

export const getDeviceInfo = () => {
  if (cachedDeviceInfo) {
    return cachedDeviceInfo;
  }
  
  const type = getDeviceType();
  cachedDeviceInfo = {
    isMobile: type.isMobile,
    isTablet: type.isTablet,
    isDesktop: type.isDesktop,
    isLowEnd: isLowEndDevice(),
    reducedMotion: prefersReducedMotion()
  };
  
  return cachedDeviceInfo;
};

// Cache low-end device detection
let cachedIsLowEnd = null;

export const isLowEndDevice = () => {
  if (cachedIsLowEnd !== null) {
    return cachedIsLowEnd;
  }
  
  // Check for performance indicators
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const cores = navigator.hardwareConcurrency || 2;
  const memory = navigator.deviceMemory || 2;
  
  // Consider it low-end if:
  // - Less than 4 CPU cores
  // - Less than 2GB RAM
  // - Slow connection
  const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
  const isLowRAM = memory < 2;
  const isLowCPU = cores < 4;
  
  cachedIsLowEnd = isSlowConnection || isLowRAM || isLowCPU;
  return cachedIsLowEnd;
};

// Cache advanced features detection
let cachedAdvancedFeatures = null;

export const supportsAdvancedFeatures = () => {
  if (cachedAdvancedFeatures) {
    return cachedAdvancedFeatures;
  }
  
  // Check for modern CSS and JS features
  const supportsGrid = CSS.supports('display', 'grid');
  const supportsContainerQueries = CSS.supports('container-type', 'inline-size');
  const supportsClamp = CSS.supports('width', 'clamp(1rem, 5vw, 2rem)');
  const supportsDynamicViewport = CSS.supports('height', '100dvh');
  
  cachedAdvancedFeatures = {
    grid: supportsGrid,
    containerQueries: supportsContainerQueries,
    clamp: supportsClamp,
    dynamicViewport: supportsDynamicViewport
  };
  
  return cachedAdvancedFeatures;
};

export const getScreenCategory = () => {
  const width = window.innerWidth;
  
  if (width <= 320) return 'xs-mobile'; // iPhone SE
  if (width <= 480) return 'mobile';
  if (width <= 768) return 'tablet-portrait';
  if (width <= 1024) return 'tablet-landscape';
  if (width <= 1920) return 'desktop';
  if (width <= 2560) return 'large-desktop';
  return 'ultra-wide'; // 4K and beyond
};

// Cache notch detection (static for device)
let cachedHasNotch = null;

export const hasNotch = () => {
  if (cachedHasNotch !== null) {
    return cachedHasNotch;
  }
  
  // Check for iPhone X+ notch
  const safeAreaTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)')) || 0;
  cachedHasNotch = safeAreaTop > 20; // Standard status bar is ~20px
  return cachedHasNotch;
};

// Cache viewport dimensions to prevent loops
let cachedViewportDimensions = null;

export const getViewportDimensions = () => {
  if (typeof window === 'undefined') {
    return { width: 1920, height: 1080, ratio: 1 };
  }
  
  if (cachedViewportDimensions) {
    return cachedViewportDimensions;
  }
  
  cachedViewportDimensions = {
    width: window.innerWidth,
    height: window.innerHeight,
    ratio: window.devicePixelRatio || 1
  };
  
  return cachedViewportDimensions;
};

// Reset cache on window resize
export const resetViewportCache = () => {
  cachedViewportDimensions = null;
};

// Cache motion preference (can change but rarely does)
let cachedPrefersReducedMotion = null;

export const prefersReducedMotion = () => {
  if (cachedPrefersReducedMotion !== null) {
    return cachedPrefersReducedMotion;
  }
  
  cachedPrefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return cachedPrefersReducedMotion;
};

// Cache hover capability (static for device)
let cachedCanHover = null;

export const canHover = () => {
  if (typeof window === 'undefined') return true;
  
  if (cachedCanHover !== null) {
    return cachedCanHover;
  }
  
  cachedCanHover = window.matchMedia('(hover: hover)').matches;
  return cachedCanHover;
};

// Cache pointer capability (static for device)
let cachedHasPointerFine = null;

export const hasPointerFine = () => {
  if (typeof window === 'undefined') return true;
  
  if (cachedHasPointerFine !== null) {
    return cachedHasPointerFine;
  }
  
  cachedHasPointerFine = window.matchMedia('(pointer: fine)').matches;
  return cachedHasPointerFine;
};