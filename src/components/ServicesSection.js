import React, { useMemo, useCallback } from 'react';
import { services } from '../data/constants';
import { 
  getDeviceInfo,
  getScreenCategory,
  canHover,
  hasPointerFine
} from '../utils/deviceDetection';
import { useLazyLoading, useLazyGrid, useSkeletonLoading } from '../hooks/useLazyLoading';
import { useResponsiveGrid, useGridItemAnimation } from '../hooks/useResponsiveGrid';
import { useResponsiveImage } from '../hooks/useResponsiveImage';
import '../styles/services-section.css';

const ServicesSection = () => {
  // Device capabilities detection - use cached info to prevent loops
  const baseDeviceInfo = useMemo(() => getDeviceInfo(), []);
  const deviceInfo = useMemo(() => ({
    type: baseDeviceInfo,
    screenCategory: getScreenCategory(),
    isLowEnd: baseDeviceInfo.isLowEnd,
    reducedMotion: baseDeviceInfo.reducedMotion,
    canHover: canHover(),
    hasPointerFine: hasPointerFine()
  }), [baseDeviceInfo]);

  // Grid configuration
  const gridOptions = useMemo(() => ({
    minItemWidth: deviceInfo.screenCategory === 'xs-mobile' ? 240 : 280,
    maxItemWidth: 400,
    gap: deviceInfo.type.isMobile ? 16 : 24,
    aspectRatio: deviceInfo.type.isMobile ? 'auto' : '1/1.3',
    enableInfiniteScroll: false,
    itemsPerPage: 8
  }), [deviceInfo]);

  // Responsive grid hook
  const {
    containerRef,
    gridConfig,
    getGridStyles,
    getItemStyles,
    getTouchProps
  } = useResponsiveGrid(services, gridOptions);

  // Lazy loading for grid items
  const {
    shouldLoadItem,
    loadedCount
  } = useLazyGrid(services, {
    batchSize: deviceInfo.isLowEnd ? 2 : 4,
    staggerDelay: deviceInfo.reducedMotion ? 0 : 100
  });

  return (
    <section 
      id="servicios" 
      className="services-section"
      aria-labelledby="services-title"
    >
      <div className="services-section__container">
        {/* Section Header */}
        <header className="services-section__header">
          <div className="services-section__badge" aria-hidden="true">
            <div className="services-section__badge-line"></div>
            <span className="services-section__badge-number">01</span>
            <div className="services-section__badge-line services-section__badge-line--extend"></div>
          </div>
          
          <h2 
            id="services-title"
            className="services-section__title"
          >
            SERVICIOS
          </h2>
          
          <p className="services-section__description">
            Cada servicio es una sinfonía de precisión, dedicación y arte masculino
          </p>
        </header>
        
        {/* Services Grid */}
        <div 
          ref={containerRef}
          className="services-grid"
          style={getGridStyles()}
          role="grid"
          aria-label="Servicios disponibles"
          {...getTouchProps()}
        >
          {services.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              shouldLoad={shouldLoadItem(index)}
              deviceInfo={deviceInfo}
              gridConfig={gridConfig}
              getItemStyles={getItemStyles}
            />
          ))}
        </div>
        
        {/* Loading Progress Indicator */}
        {loadedCount < services.length && (
          <div 
            className="services-section__loading-indicator"
            role="status"
            aria-label={`Cargando servicios: ${loadedCount} de ${services.length}`}
          >
            <div 
              className="services-section__progress-bar"
              style={{ width: `${(loadedCount / services.length) * 100}%` }}
            />
          </div>
        )}
      </div>
    </section>
  );
};

// Individual Service Card Component
const ServiceCard = ({ service, index, shouldLoad, deviceInfo, gridConfig, getItemStyles }) => {
  // Lazy loading for the card
  const {
    elementRef,
    isIntersecting,
    handleImageLoad
  } = useLazyLoading({
    threshold: deviceInfo.isLowEnd ? 0.05 : 0.1,
    rootMargin: deviceInfo.type.isMobile ? '20px' : '50px',
    triggerOnce: true
  });

  // Skeleton loading state
  const {
    showSkeleton
  } = useSkeletonLoading(!shouldLoad || !isIntersecting, {
    minLoadingTime: deviceInfo.isLowEnd ? 800 : 500,
    maxLoadingTime: deviceInfo.isLowEnd ? 4000 : 3000
  });

  // Grid item animation
  const {
    getAnimationStyles
  } = useGridItemAnimation(index, {
    delay: 200,
    staggerDelay: deviceInfo.reducedMotion ? 0 : 100,
    animationType: 'fadeInUp'
  });

  // Responsive image
  const {
    optimizedSrc,
    isLoaded: imageLoaded
  } = useResponsiveImage(service.icon, {
    sizes: {
      mobile: 400,
      tablet: 600,
      desktop: 800
    },
    quality: deviceInfo.isLowEnd ? 60 : 80,
    format: 'webp'
  });

  // Handle service card interaction
  const handleCardClick = useCallback(() => {
    // Could integrate with booking modal or service details
    console.log(`Selected service: ${service.name}`);
  }, [service.name]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  }, [handleCardClick]);

  // Render skeleton if loading
  if (showSkeleton) {
    return (
      <article 
        ref={elementRef}
        className="services-grid__item"
        style={{ ...getItemStyles(), ...getAnimationStyles() }}
        aria-hidden="true"
      >
        <div className="service-card service-card--loading">
          <div className="service-card__skeleton">
            <div className="skeleton-image" />
            <div className="skeleton-content">
              <div className="skeleton-title" />
              <div className="skeleton-description" />
              <div className="skeleton-price" />
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article 
      ref={elementRef}
      className="services-grid__item"
      style={{ ...getItemStyles(), ...getAnimationStyles() }}
      role="gridcell"
    >
      <div 
        className="service-card"
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Seleccionar servicio ${service.name}, $${service.price} USD, ${service.duration}`}
        aria-describedby={`service-${service.id}-description`}
      >
        {/* Popular Badge */}
        {service.popular && (
          <div 
            className="service-card__popular-badge"
            aria-label="Servicio popular"
          >
            POPULAR
          </div>
        )}
        
        {/* Image Container */}
        <div className="service-card__image-container">
          {isIntersecting && (
            <>
              <img 
                src={optimizedSrc}
                alt={`Imagen del servicio ${service.name}`}
                className="service-card__image"
                loading="lazy"
                decoding="async"
                onLoad={() => handleImageLoad(optimizedSrc)}
                style={{
                  opacity: imageLoaded ? 1 : 0,
                  transition: 'opacity 0.4s ease-out'
                }}
              />
              <div className="service-card__image-overlay" aria-hidden="true" />
            </>
          )}
        </div>
        
        {/* Content */}
        <div className="service-card__content">
          <header>
            <h3 className="service-card__title">
              {service.name}
            </h3>
            <p 
              id={`service-${service.id}-description`}
              className="service-card__description"
            >
              {service.description}
            </p>
          </header>
          
          {/* Features List */}
          <ul 
            className="service-card__features"
            aria-label={`Características del servicio ${service.name}`}
          >
            {service.features.slice(0, deviceInfo.type.isMobile ? 3 : 4).map((feature, idx) => (
              <li key={idx} className="service-card__feature">
                <div className="service-card__feature-bullet" aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          {/* Price Section */}
          <footer className="service-card__price-section">
            <div className="service-card__price-container">
              <span 
                className="service-card__price"
                aria-label={`Precio: ${service.price} dólares`}
              >
                ${service.price}
              </span>
              <span className="service-card__currency" aria-hidden="true">
                USD
              </span>
            </div>
            <span 
              className="service-card__duration"
              aria-label={`Duración: ${service.duration}`}
            >
              {service.duration}
            </span>
          </footer>
        </div>
        
        {/* Bottom Line Animation */}
        <div className="service-card__bottom-line" aria-hidden="true" />
      </div>
    </article>
  );
};

export default ServicesSection;