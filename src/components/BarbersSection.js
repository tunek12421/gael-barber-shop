import React, { useMemo, useCallback } from 'react';
import { Award, X, Instagram, Twitter, Linkedin } from 'lucide-react';
import { barbers } from '../data/constants';
import { 
  getDeviceInfo,
  getScreenCategory,
  canHover,
  hasPointerFine
} from '../utils/deviceDetection';
import { useCarouselGestures } from '../hooks/useTouchGestures';
import { useModalStates, usePerformanceMonitoring, useIntersectionObserver } from '../hooks/useModalStates';
import { useLazyLoading } from '../hooks/useLazyLoading';
import { useResponsiveImage } from '../hooks/useResponsiveImage';
import '../styles/barbers-section.css';

const BarbersSection = () => {
  // Performance monitoring - temporarily disabled to prevent loops
  // usePerformanceMonitoring('BarbersSection');
  
  // Device capabilities detection - use cached info to prevent loops
  const baseDeviceInfo = useMemo(() => getDeviceInfo(), []);
  const deviceInfo = useMemo(() => ({
    ...baseDeviceInfo,
    screenCategory: getScreenCategory(),
    canHover: canHover(),
    hasPointerFine: hasPointerFine()
  }), [baseDeviceInfo]); // Depend on stable cached info

  // Modal state management
  const {
    isOpen: isModalOpen,
    activeModalId,
    openModal,
    closeModal,
    handleBackdropClick,
    getModalClasses
  } = useModalStates({
    closeOnEscape: true,
    closeOnBackdropClick: true,
    preventBodyScroll: true,
    focusTrap: true
  });

  // Intersection observer for section
  const {
    elementRef: sectionRef,
    isIntersecting: isSectionVisible
  } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true
  });

  // Determine layout mode based on device
  const layoutMode = useMemo(() => {
    if (deviceInfo.isMobile || deviceInfo.screenCategory === 'small-tablet') {
      return 'carousel';
    }
    return 'grid';
  }, [deviceInfo]);

  // Carousel for mobile devices
  const carousel = useCarouselGestures(barbers, {
    autoPlay: !deviceInfo.reducedMotion && isSectionVisible,
    autoPlayDelay: 6000,
    infinite: true,
    swipeThreshold: 50,
    dragThreshold: 0.2,
    onSlideChange: (index) => {
      console.log(`Barber slide changed to: ${index}`);
    }
  });

  // Handle barber card click
  const handleBarberClick = useCallback((barberId) => {
    if (!deviceInfo.reducedMotion) {
      // Add haptic feedback on supported devices
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
    openModal(barberId);
  }, [deviceInfo.reducedMotion, openModal]);

  // Get selected barber for modal
  const selectedBarber = useMemo(() => {
    return barbers.find(barber => barber.id.toString() === activeModalId);
  }, [activeModalId]);

  return (
    <section 
      ref={sectionRef}
      id="maestros" 
      className="barbers-section"
      aria-labelledby="barbers-title"
    >
      <div className="barbers-section__container">
        {/* Section Header */}
        <header className="barbers-section__header">
          <div className="barbers-section__badge" aria-hidden="true">
            <div className="barbers-section__badge-line"></div>
            <span className="barbers-section__badge-number">02</span>
            <div className="barbers-section__badge-line barbers-section__badge-line--extend"></div>
          </div>
          
          <h2 
            id="barbers-title"
            className="barbers-section__title"
          >
            MAESTROS
          </h2>
          
          <p className="barbers-section__description">
            Artesanos que han dedicado su vida a perfeccionar el arte del grooming masculino
          </p>
        </header>
        
        {/* Barbers Layout */}
        <div className="barbers-layout">
          {layoutMode === 'carousel' ? (
            <CarouselLayout
              barbers={barbers}
              carousel={carousel}
              deviceInfo={deviceInfo}
              onBarberClick={handleBarberClick}
              isVisible={isSectionVisible}
            />
          ) : (
            <GridLayout
              barbers={barbers}
              deviceInfo={deviceInfo}
              onBarberClick={handleBarberClick}
              isVisible={isSectionVisible}
            />
          )}
        </div>
      </div>

      {/* Barber Detail Modal */}
      {selectedBarber && (
        <BarberModal
          barber={selectedBarber}
          isOpen={isModalOpen}
          onClose={closeModal}
          handleBackdropClick={handleBackdropClick}
          getModalClasses={getModalClasses}
          deviceInfo={deviceInfo}
        />
      )}
    </section>
  );
};

// Carousel Layout Component
const CarouselLayout = ({ barbers, carousel, deviceInfo, onBarberClick, isVisible }) => {
  return (
    <div className="barbers-carousel">
      <div 
        ref={carousel.containerRef}
        className="barbers-carousel__track"
        style={{
          transform: carousel.getSlideTransform(),
          transition: carousel.isDragging ? 'none' : 'transform 0.4s ease-out'
        }}
        role="region"
        aria-label="Carousel de barberos"
        aria-live={carousel.isAutoPlaying ? 'polite' : 'off'}
      >
        {barbers.map((barber, index) => (
          <div 
            key={barber.id}
            className="barbers-carousel__slide"
            role="group"
            aria-label={`${index + 1} de ${barbers.length}`}
          >
            <BarberCard
              barber={barber}
              index={index}
              onClick={() => onBarberClick(barber.id)}
              deviceInfo={deviceInfo}
              isVisible={isVisible}
            />
          </div>
        ))}
      </div>
      
      {/* Carousel Navigation Dots */}
      <nav className="barbers-carousel__nav" aria-label="Navegación de carousel">
        {barbers.map((_, index) => (
          <button
            key={index}
            className={`barbers-carousel__dot ${
              index === carousel.currentIndex ? 'barbers-carousel__dot--active' : ''
            }`}
            onClick={() => {
              carousel.pauseAutoPlay();
              carousel.goToSlide(index);
            }}
            aria-label={`Ir al barbero ${index + 1}`}
            aria-current={index === carousel.currentIndex ? 'true' : 'false'}
          />
        ))}
      </nav>
    </div>
  );
};

// Grid Layout Component
const GridLayout = ({ barbers, deviceInfo, onBarberClick, isVisible }) => {
  return (
    <div 
      className="barbers-grid"
      role="grid"
      aria-label="Lista de barberos"
    >
      {barbers.map((barber, index) => (
        <div key={barber.id} role="gridcell">
          <BarberCard
            barber={barber}
            index={index}
            onClick={() => onBarberClick(barber.id)}
            deviceInfo={deviceInfo}
            isVisible={isVisible}
          />
        </div>
      ))}
    </div>
  );
};

// Individual Barber Card Component
const BarberCard = ({ barber, index, onClick, deviceInfo, isVisible }) => {
  // Lazy loading for the card
  const {
    elementRef,
    isIntersecting,
    handleImageLoad
  } = useLazyLoading({
    threshold: deviceInfo.isLowEnd ? 0.05 : 0.1,
    rootMargin: deviceInfo.isMobile ? '20px' : '50px',
    triggerOnce: true
  });

  // Responsive image
  const {
    optimizedSrc,
    isLoaded: imageLoaded
  } = useResponsiveImage(barber.image, {
    sizes: {
      mobile: 400,
      tablet: 600,
      desktop: 800
    },
    quality: deviceInfo.isLowEnd ? 60 : 80,
    format: 'webp'
  });

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  }, [onClick]);

  // Animation delay based on index and device performance
  const animationDelay = useMemo(() => {
    if (deviceInfo.reducedMotion) return 0;
    return deviceInfo.isLowEnd ? index * 150 : index * 100;
  }, [index, deviceInfo]);

  return (
    <article 
      ref={elementRef}
      className="barber-card"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Ver perfil de ${barber.name}, ${barber.title}`}
      aria-describedby={`barber-${barber.id}-description`}
      style={{
        animationDelay: `${animationDelay}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease-out ${animationDelay}ms, transform 0.6s ease-out ${animationDelay}ms`
      }}
    >
      {/* Avatar Container */}
      <div className="barber-card__avatar-container">
        {isIntersecting && (
          <>
            <img 
              src={optimizedSrc}
              alt={`Foto de ${barber.name}`}
              className="barber-card__avatar"
              loading="lazy"
              decoding="async"
              onLoad={() => handleImageLoad(optimizedSrc)}
              style={{
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.4s ease-out'
              }}
            />
            <div className="barber-card__avatar-overlay" aria-hidden="true" />
            
            {/* Quote Overlay */}
            <div className="barber-card__quote" aria-hidden="true">
              "{barber.quote}"
            </div>
          </>
        )}
      </div>
      
      {/* Card Content */}
      <div className="barber-card__content">
        <header className="barber-card__header">
          <h3 className="barber-card__name">
            {barber.name}
          </h3>
          <p className="barber-card__title">
            {barber.title}
          </p>
          <p 
            id={`barber-${barber.id}-description`}
            className="barber-card__specialty"
          >
            {barber.specialty}
          </p>
        </header>
        
        {/* Bio Text (Truncated on Mobile) */}
        <div className="barber-card__bio">
          {barber.experience}
        </div>
        
        {/* Skills */}
        <div className="barber-card__skills">
          {barber.skills.slice(0, deviceInfo.isMobile ? 2 : 4).map((skill, idx) => (
            <span key={idx} className="barber-card__skill">
              {skill}
            </span>
          ))}
        </div>
        
        {/* Meta Information */}
        <div className="barber-card__meta">
          {/* Award */}
          <div className="barber-card__award">
            <Award className="barber-card__award-icon" aria-hidden="true" />
            <span>{barber.awards[0]}</span>
          </div>
          
          {/* Rating */}
          <div className="barber-card__rating">
            <div className="barber-card__stars" aria-label={`Calificación: ${barber.rating} de 5 estrellas`}>
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className={`barber-card__star ${
                    i < Math.floor(barber.rating) ? 'barber-card__star--filled' : ''
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="barber-card__rating-value">{barber.rating}</span>
          </div>
          
          {/* Availability */}
          <div className="barber-card__availability">
            Disponible: {barber.availability}
          </div>
        </div>
        
        {/* Social Links */}
        <div className="barber-card__social">
          <button 
            className="barber-card__social-link"
            aria-label={`Instagram de ${barber.name}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Instagram size={16} aria-hidden="true" />
          </button>
          <button 
            className="barber-card__social-link"
            aria-label={`Twitter de ${barber.name}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Twitter size={16} aria-hidden="true" />
          </button>
          <button 
            className="barber-card__social-link"
            aria-label={`LinkedIn de ${barber.name}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Linkedin size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
};

// Barber Detail Modal Component
const BarberModal = ({ barber, isOpen, onClose, handleBackdropClick, getModalClasses, deviceInfo }) => {
  if (!isOpen) return null;

  return (
    <div 
      className={getModalClasses('barber-modal')}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`modal-${barber.id}-title`}
      aria-describedby={`modal-${barber.id}-description`}
    >
      <div className="barber-modal__content">
        <button
          className="barber-modal__close"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          <X size={20} aria-hidden="true" />
        </button>
        
        <div className="modal-barber-profile">
          <header className="modal-barber-profile__header">
            <img 
              src={barber.image}
              alt={`Foto de ${barber.name}`}
              className="modal-barber-profile__avatar"
              style={{
                width: deviceInfo.isMobile ? '120px' : '200px',
                height: deviceInfo.isMobile ? '150px' : '250px',
                objectFit: 'cover'
              }}
            />
            <div className="modal-barber-profile__info">
              <h2 
                id={`modal-${barber.id}-title`}
                className="modal-barber-profile__name"
              >
                {barber.name}
              </h2>
              <p className="modal-barber-profile__title">{barber.title}</p>
              <p className="modal-barber-profile__specialty">{barber.specialty}</p>
            </div>
          </header>
          
          <div 
            id={`modal-${barber.id}-description`}
            className="modal-barber-profile__content"
          >
            <section className="modal-barber-profile__section">
              <h3>Experiencia</h3>
              <p>{barber.experience}</p>
            </section>
            
            <section className="modal-barber-profile__section">
              <h3>Especialidades</h3>
              <ul>
                {barber.skills.map((skill, idx) => (
                  <li key={idx}>{skill}</li>
                ))}
              </ul>
            </section>
            
            <section className="modal-barber-profile__section">
              <h3>Reconocimientos</h3>
              <ul>
                {barber.awards.map((award, idx) => (
                  <li key={idx}>{award}</li>
                ))}
              </ul>
            </section>
            
            <section className="modal-barber-profile__section">
              <h3>Disponibilidad</h3>
              <p>{barber.availability}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarbersSection;