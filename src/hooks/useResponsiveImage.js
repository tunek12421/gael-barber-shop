import { useState, useEffect, useMemo } from 'react';
import { getViewportDimensions } from '../utils/deviceDetection';

export const useResponsiveImage = (baseSrc, options = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');
  const [viewportData, setViewportData] = useState(() => getViewportDimensions());

  const {
    sizes = {
      mobile: 768,
      tablet: 1024,
      desktop: 1920,
      large: 2560,
      uhd: 3840
    },
    quality = 80,
    format = 'webp',
    fallbackFormat = 'jpg'
  } = options;

  // Update viewport dimensions on resize
  useEffect(() => {
    const updateViewport = () => {
      setViewportData(getViewportDimensions());
    };

    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  // Get device pixel ratio and viewport width from stable state
  const devicePixelRatio = viewportData.ratio;
  const viewportWidth = viewportData.width;

  // Determine optimal image size based on viewport and DPR
  const optimalSize = useMemo(() => {
    const effectiveWidth = viewportWidth * devicePixelRatio;
    
    if (effectiveWidth <= sizes.mobile) return sizes.mobile;
    if (effectiveWidth <= sizes.tablet) return sizes.tablet;
    if (effectiveWidth <= sizes.desktop) return sizes.desktop;
    if (effectiveWidth <= sizes.large) return sizes.large;
    return sizes.uhd;
  }, [viewportWidth, devicePixelRatio, sizes]);

  // Generate srcset for different densities
  const generateSrcSet = useMemo(() => {
    const srcSet = [];
    
    // Standard density
    srcSet.push(`${baseSrc}?w=${optimalSize}&q=${quality}&fm=${format} 1x`);
    
    // High density (2x) for retina displays
    if (devicePixelRatio >= 2) {
      srcSet.push(`${baseSrc}?w=${optimalSize * 2}&q=${quality}&fm=${format} 2x`);
    }
    
    // Ultra-high density (3x) for newest devices
    if (devicePixelRatio >= 3) {
      srcSet.push(`${baseSrc}?w=${optimalSize * 3}&q=${quality}&fm=${format} 3x`);
    }
    
    return srcSet.join(', ');
  }, [baseSrc, optimalSize, quality, format, devicePixelRatio]);

  // Generate fallback srcset for older browsers
  const generateFallbackSrcSet = useMemo(() => {
    const srcSet = [];
    
    srcSet.push(`${baseSrc}?w=${optimalSize}&q=${quality}&fm=${fallbackFormat} 1x`);
    
    if (devicePixelRatio >= 2) {
      srcSet.push(`${baseSrc}?w=${optimalSize * 2}&q=${quality}&fm=${fallbackFormat} 2x`);
    }
    
    return srcSet.join(', ');
  }, [baseSrc, optimalSize, quality, fallbackFormat, devicePixelRatio]);

  // Get the primary source URL
  const primarySrc = useMemo(() => {
    return `${baseSrc}?w=${optimalSize}&q=${quality}&fm=${format}`;
  }, [baseSrc, optimalSize, quality, format]);

  // Get fallback source URL
  const fallbackSrc = useMemo(() => {
    return `${baseSrc}?w=${optimalSize}&q=${quality}&fm=${fallbackFormat}`;
  }, [baseSrc, optimalSize, quality, fallbackFormat]);

  // Preload the image
  useEffect(() => {
    setIsLoaded(false);
    setIsError(false);

    const img = new Image();
    
    const handleLoad = () => {
      setIsLoaded(true);
      setCurrentSrc(img.src);
    };
    
    const handleError = () => {
      setIsError(true);
      // Try loading fallback format
      if (format !== fallbackFormat) {
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          setIsLoaded(true);
          setCurrentSrc(fallbackImg.src);
        };
        fallbackImg.onerror = () => setIsError(true);
        fallbackImg.src = fallbackSrc;
      }
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = primarySrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [primarySrc, fallbackSrc, format, fallbackFormat]);

  // Generate sizes attribute for responsive images
  const sizesAttribute = useMemo(() => {
    return [
      `(max-width: ${sizes.mobile}px) 100vw`,
      `(max-width: ${sizes.tablet}px) 100vw`,
      `(max-width: ${sizes.desktop}px) 100vw`,
      '100vw'
    ].join(', ');
  }, [sizes]);

  // Check if WebP is supported
  const supportsWebP = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }, []);

  // Get image props for picture element
  const getPictureProps = () => ({
    sources: [
      ...(supportsWebP ? [{
        srcSet: generateSrcSet,
        type: 'image/webp',
        sizes: sizesAttribute
      }] : []),
      {
        srcSet: generateFallbackSrcSet,
        type: `image/${fallbackFormat}`,
        sizes: sizesAttribute
      }
    ],
    img: {
      src: currentSrc || fallbackSrc,
      alt: '',
      loading: 'eager', // Hero images should load immediately
      decoding: 'async',
      sizes: sizesAttribute
    }
  });

  // Get optimized image props for img element
  const getImageProps = () => ({
    src: currentSrc || primarySrc,
    srcSet: supportsWebP ? generateSrcSet : generateFallbackSrcSet,
    sizes: sizesAttribute,
    loading: 'eager',
    decoding: 'async',
    onLoad: () => setIsLoaded(true),
    onError: () => setIsError(true)
  });

  return {
    isLoaded,
    isError,
    optimizedSrc: currentSrc || primarySrc,
    currentSrc,
    primarySrc,
    fallbackSrc,
    optimalSize,
    devicePixelRatio,
    supportsWebP,
    getPictureProps,
    getImageProps,
    generateSrcSet,
    generateFallbackSrcSet,
    sizesAttribute
  };
};