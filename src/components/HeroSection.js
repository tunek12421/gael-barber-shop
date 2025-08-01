import React, { useMemo, useRef } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { 
  getDeviceInfo,
  getScreenCategory,
  hasNotch,
  getViewportDimensions
} from '../utils/deviceDetection';
import { useParallax } from '../hooks/useParallax';
import { useResponsiveImage } from '../hooks/useResponsiveImage';
import '../styles/hero-section.css';

const HeroSection = ({ scrollY, setShowBookingModal, heroRef }) => {
  const containerRef = useRef(null);
  
  // Use cached device detection to avoid repeated calculations
  const baseDeviceInfo = useMemo(() => getDeviceInfo(), []);
  const deviceInfo = useMemo(() => ({
    type: baseDeviceInfo,
    screenCategory: getScreenCategory(),
    isLowEnd: baseDeviceInfo.isLowEnd,
    reducedMotion: baseDeviceInfo.reducedMotion,
    hasNotch: hasNotch(),
    viewport: getViewportDimensions()
  }), [baseDeviceInfo]);

  // Enhanced parallax with performance optimization
  const { parallaxOffset, isInView } = useParallax({
    factor: deviceInfo.isLowEnd ? 0.1 : 0.3,
    disabled: deviceInfo.reducedMotion || deviceInfo.type.isMobile
  });

  // Responsive image optimization
  const { optimizedSrc, isLoaded } = useResponsiveImage(
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70',
    {
      sizes: {
        mobile: 768,
        tablet: 1024, 
        desktop: 1920,
        large: 2560
      },
      quality: deviceInfo.isLowEnd ? 60 : 80,
      format: 'webp'
    }
  );

  // Dynamic class names based on device capabilities
  const containerClasses = useMemo(() => {
    const baseClasses = 'hero-section';
    const deviceClasses = [
      `hero-section--${deviceInfo.type.isMobile ? 'mobile' : deviceInfo.type.isTablet ? 'tablet' : 'desktop'}`,
      `hero-section--${deviceInfo.screenCategory}`,
      deviceInfo.hasNotch ? 'hero-section--notch' : '',
      deviceInfo.reducedMotion ? 'hero-section--reduced-motion' : '',
      deviceInfo.isLowEnd ? 'hero-section--low-end' : ''
    ].filter(Boolean);
    
    return [baseClasses, ...deviceClasses].join(' ');
  }, [deviceInfo]);

  // Conditional rendering for performance optimization
  const shouldRenderAnimations = !deviceInfo.reducedMotion && !deviceInfo.isLowEnd;
  const shouldRenderParallax = !deviceInfo.type.isMobile && !deviceInfo.isLowEnd;

  return (
    <section 
      id="inicio" 
      ref={heroRef}
      className={containerClasses}
      data-device-type={deviceInfo.type.isMobile ? 'mobile' : deviceInfo.type.isTablet ? 'tablet' : 'desktop'}
      data-screen-category={deviceInfo.screenCategory}
      style={{
        '--viewport-width': `${deviceInfo.viewport.width}px`,
        '--viewport-height': `${deviceInfo.viewport.height}px`,
        '--device-pixel-ratio': deviceInfo.viewport.ratio
      }}
    >
      {/* Background Layer with Optimized Image */}
      <div className="hero-background" ref={containerRef}>
        <div className="hero-background__image-container">
          <img 
            src={optimizedSrc}
            alt="Gael Barber Shop - Barbería de Calidad"
            className={`hero-background__image ${isLoaded ? 'loaded' : ''}`}
            style={{
              transform: shouldRenderParallax 
                ? `translate3d(0, ${parallaxOffset}px, 0) scale(1.1)` 
                : 'scale(1.05)',
              willChange: shouldRenderParallax ? 'transform' : 'auto'
            }}
            loading="eager"
            decoding="async"
          />
          
          {/* Progressive Enhancement Overlay */}
          <div className="hero-background__overlay"></div>
          
          {/* Optional Grid Pattern for Professional Feel */}
          {!deviceInfo.isLowEnd && (
            <div className="hero-background__pattern" aria-hidden="true">
              <svg className="hero-background__grid" preserveAspectRatio="none">
                <defs>
                  <pattern id="hero-grid" width="100" height="100" patternUnits="userSpaceOnUse">
                    <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hero-grid)" />
              </svg>
            </div>
          )}

          {/* Decorative Elements in Verde Oliva */}
          {shouldRenderAnimations && (
            <div className="hero-background__decoratives" aria-hidden="true">
              <div className="hero-decorative hero-decorative--top-left"></div>
              <div className="hero-decorative hero-decorative--bottom-right"></div>
              <div className="hero-decorative-line hero-decorative-line--vertical"></div>
              <div className="hero-decorative-line hero-decorative-line--horizontal"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Content Layer */}
      <div className="hero-content">
        {/* Decorative Line */}
        {shouldRenderAnimations && (
          <div className="hero-content__divider" aria-hidden="true"></div>
        )}
        
        {/* Main Heading with Ultra-Responsive Typography */}
        <h1 className="hero-content__title">
          <div className="hero-content__title-line">
            <div className="hero-content__title-text hero-content__title-text--brand">
              HERNAN CARLOS GAEL
            </div>
          </div>
        </h1>
        
        {/* Establishment Badge */}
        <div className="hero-content__badge">
          <div className="hero-content__badge-line" aria-hidden="true"></div>
          <p className="hero-content__badge-text">EST. 1995</p>
          <div className="hero-content__badge-line" aria-hidden="true"></div>
        </div>
        
        {/* Call-to-Action Buttons */}
        <div className="hero-content__actions">
          <button 
            onClick={() => setShowBookingModal(true)}
            className="hero-cta hero-cta--primary"
            aria-label="Reservar experiencia"
          >
            <span className="hero-cta__text">
              {deviceInfo.screenCategory === 'xs-mobile' ? 'RESERVAR' : 'RESERVAR EXPERIENCIA'}
              <ArrowRight className="hero-cta__icon" aria-hidden="true" />
            </span>
            <div className="hero-cta__overlay" aria-hidden="true"></div>
            <span className="hero-cta__text-hover">
              {deviceInfo.screenCategory === 'xs-mobile' ? 'RESERVAR' : 'RESERVAR EXPERIENCIA'}
              <ArrowRight className="hero-cta__icon" aria-hidden="true" />
            </span>
          </button>
          
          <a 
            href="#servicios"
            className="hero-cta hero-cta--secondary"
            aria-label="Descubrir más sobre nuestros servicios"
          >
            DESCUBRIR MÁS
          </a>
        </div>
        
        {/* Scroll Indicator */}
        {shouldRenderAnimations && (
          <div className="hero-content__scroll-indicator" aria-hidden="true">
            <ChevronDown className="hero-content__scroll-icon" />
          </div>
        )}
      </div>
      
      {/* Accessibility Enhancements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isInView ? 'Sección principal cargada' : ''}
      </div>
    </section>
  );
};

export default HeroSection;