import React, { useEffect, useState, useMemo } from 'react';
import { 
  getDeviceType, 
  isLowEndDevice, 
  getScreenCategory, 
  prefersReducedMotion,
  hasNotch 
} from '../utils/deviceDetection';
import '../styles/loading-screen.css';

const LoadingScreen = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Memoize device detection to avoid repeated calculations
  const deviceInfo = useMemo(() => ({
    type: getDeviceType(),
    isLowEnd: isLowEndDevice(),
    screenCategory: getScreenCategory(),
    reducedMotion: prefersReducedMotion(),
    hasNotch: hasNotch()
  }), []);

  useEffect(() => {
    // Trigger entrance animation with appropriate delay based on device performance
    const delay = deviceInfo.isLowEnd ? 200 : 100;
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [deviceInfo.isLowEnd]);

  // Dynamic class names based on device capabilities
  const containerClasses = useMemo(() => {
    const baseClasses = 'loading-screen fixed inset-0 bg-black z-50';
    const transitionClasses = deviceInfo.isLowEnd 
      ? 'transition-opacity duration-700' 
      : 'transition-opacity duration-500';
    const visibilityClasses = isVisible ? 'opacity-100' : 'opacity-0';
    const notchClasses = deviceInfo.hasNotch ? 'pt-safe-top' : '';
    
    return `${baseClasses} ${transitionClasses} ${visibilityClasses} ${notchClasses}`.trim();
  }, [isVisible, deviceInfo.isLowEnd, deviceInfo.hasNotch]);

  // Conditional rendering for performance optimization
  const shouldRenderAnimations = !deviceInfo.reducedMotion && !deviceInfo.isLowEnd;
  const circleCount = deviceInfo.isLowEnd ? 1 : 3; // Reduce animations on low-end devices

  return (
    <div 
      className={containerClasses}
      role="status" 
      aria-label="Cargando aplicación"
      tabIndex={-1}
      data-device-type={deviceInfo.type.isMobile ? 'mobile' : deviceInfo.type.isTablet ? 'tablet' : 'desktop'}
      data-screen-category={deviceInfo.screenCategory}
    >
      <div className="loading-container">
        <div className="relative">
          {/* Logo container with conditionally rendered animated circles */}
          <div className="logo-container">
            {/* Render fewer circles on low-end devices for better performance */}
            {shouldRenderAnimations && Array.from({ length: circleCount }, (_, index) => (
              <div 
                key={index}
                className="animated-circle" 
                aria-hidden="true"
                style={{
                  animationDelay: `${index * 0.2}s`,
                  transform: `scale(${1 - (index * 0.15)})`
                }}
              />
            ))}
            
            {/* Logo text with responsive sizing */}
            <div className="logo-text">
              <div 
                className="logo-letters"
                style={{
                  // Additional inline optimization for ultra-small screens
                  fontSize: deviceInfo.screenCategory === 'xs-mobile' 
                    ? 'clamp(1.25rem, 5vw, 1.5rem)' 
                    : undefined
                }}
              >
                TGC
              </div>
              <div className="logo-divider" aria-hidden="true"></div>
            </div>
          </div>
          
          {/* Loading text with adaptive sizing */}
          <div className="loading-text-container">
            <p 
              className="loading-text"
              style={{
                // Shorter text for very small screens
                fontSize: deviceInfo.screenCategory === 'xs-mobile' 
                  ? 'clamp(0.65rem, 3vw, 0.75rem)' 
                  : undefined
              }}
            >
              {deviceInfo.screenCategory === 'xs-mobile' 
                ? 'CARGANDO...' 
                : 'PREPARANDO SU EXPERIENCIA'
              }
            </p>
          </div>
        </div>
      </div>
      
      {/* Accessibility announcement for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isVisible ? 'Aplicación cargando, por favor espere' : ''}
      </div>
    </div>
  );
};

export default LoadingScreen;