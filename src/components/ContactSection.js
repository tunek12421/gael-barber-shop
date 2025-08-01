import React, { useMemo, useRef, useEffect, useState } from 'react';
import { ArrowRight, Shield, MapPin, Clock, Phone, Mail } from 'lucide-react';
import { 
  getDeviceInfo,
  getScreenCategory,
  canHover,
  hasPointerFine
} from '../utils/deviceDetection';
import { useContactActions } from '../hooks/useContactForm';
import { useIntersectionObserver } from '../hooks/useModalStates';
import '../styles/contact-section.css';

const ContactSection = ({ setShowBookingModal }) => {
  const sectionRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Device detection for responsive behavior - use cached info to prevent loops
  const baseDeviceInfo = useMemo(() => getDeviceInfo(), []);
  const deviceInfo = useMemo(() => ({
    isMobile: baseDeviceInfo.isMobile,
    isTablet: baseDeviceInfo.isTablet,
    isDesktop: baseDeviceInfo.isDesktop,
    screenCategory: getScreenCategory(),
    isLowEnd: baseDeviceInfo.isLowEnd,
    reducedMotion: baseDeviceInfo.reducedMotion,
    canHover: canHover(),
    hasPointerFine: hasPointerFine()
  }), [baseDeviceInfo]);

  // Contact actions for mobile
  const { handleCall, handleEmail, handleAddress } = useContactActions();

  // Intersection observer for animations
  const { isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true
  });

  // Handle component load to prevent animation flicker
  useEffect(() => {
    // Small delay to ensure proper loading
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Contact data
  const contactData = {
    address: 'Av. Principal 1234, Zona Centro, Torre Ejecutiva, Santa Cruz, Bolivia',
    phone: '+591 3 345-7890',
    email: 'reservas@gaelbarber.com',
    hours: [
      { days: 'Lunes — Viernes', time: '09:00 — 20:00' },
      { days: 'Sábado', time: '09:00 — 19:00' },
      { days: 'Domingo', time: 'Cerrado' }
    ]
  };

  // Enhanced contact item with touch interactions
  const ContactItem = ({ icon: Icon, title, children, onClick, interactive = false }) => (
    <div className={`contact-item ${interactive ? 'contact-item--interactive' : ''}`}>
      <h3 className="contact-item__title">
        {title}
      </h3>
      <div 
        className={`contact-item__content ${interactive ? 'contact-item__content--clickable' : ''}`}
        onClick={interactive ? onClick : undefined}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={interactive ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        } : undefined}
      >
        <div className="contact-item__icon">
          <Icon className="contact-item__icon-svg" />
        </div>
        <div className="contact-item__text">
          {children}
        </div>
        {interactive && deviceInfo.isMobile && (
          <div className="contact-item__action-hint">
            Tocar para {title.toLowerCase()}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section 
      ref={sectionRef}
      id="contacto" 
      className={`contact-section ${isIntersecting ? 'contact-section--visible' : ''} ${isLoaded ? 'contact-section--loaded' : ''}`}
      data-device={deviceInfo.screenCategory}
      data-reduced-motion={deviceInfo.reducedMotion}
    >
      <div className="contact-section__container">
        {/* Section Header */}
        <div className="contact-section__header">
          <div className="contact-section__header-line">
            <div className="contact-section__line contact-section__line--short"></div>
            <p className="contact-section__number">04</p>
            <div className="contact-section__line contact-section__line--long"></div>
          </div>
          <h2 className="contact-section__title">CONTACTO</h2>
        </div>
        
        {/* Main Content Grid */}
        <div className="contact-section__grid">
          {/* Contact Information */}
          <div className="contact-section__info">
            {/* Location */}
            <ContactItem
              icon={MapPin}
              title="UBICACIÓN"
              interactive={true}
              onClick={() => handleAddress(contactData.address)}
            >
              <div className="contact-address">
                <p>Av. San Martín 1234</p>
                <p>Zona Centro, Torre Ejecutiva</p>
                <p>Santa Cruz, Bolivia</p>
              </div>
              {deviceInfo.isMobile && (
                <p className="contact-address__action">
                  Ver en mapas →
                </p>
              )}
            </ContactItem>
            
            {/* Hours */}
            <ContactItem icon={Clock} title="HORARIO">
              <div className="contact-hours">
                {contactData.hours.map((schedule, index) => (
                  <div key={index} className="contact-hours__item">
                    <span className="contact-hours__days">{schedule.days}</span>
                    <span className={`contact-hours__time ${schedule.time === 'Cerrado' ? 'contact-hours__time--closed' : ''}`}>
                      {schedule.time}
                    </span>
                  </div>
                ))}
              </div>
            </ContactItem>
            
            {/* Direct Contact */}
            <div className="contact-direct">
              <h3 className="contact-direct__title">CONTACTO DIRECTO</h3>
              <div className="contact-direct__items">
                {/* Phone */}
                <div 
                  className={`contact-direct__item ${deviceInfo.isMobile ? 'contact-direct__item--clickable' : ''}`}
                  onClick={deviceInfo.isMobile ? () => handleCall(contactData.phone) : undefined}
                  role={deviceInfo.isMobile ? 'button' : undefined}
                  tabIndex={deviceInfo.isMobile ? 0 : undefined}
                >
                  <Phone className="contact-direct__icon" />
                  <span className="contact-direct__text">{contactData.phone}</span>
                </div>
                
                {/* Email */}
                <div 
                  className="contact-direct__item contact-direct__item--clickable"
                  onClick={() => handleEmail(contactData.email, 'Consulta desde Gael Barber Shop')}
                  role="button"
                  tabIndex={0}
                >
                  <Mail className="contact-direct__icon" />
                  <span className="contact-direct__text">{contactData.email}</span>
                </div>
              </div>
            </div>
            
            {/* CTA Button */}
            <button 
              onClick={() => setShowBookingModal(true)}
              className="contact-section__cta"
              aria-label="Abrir modal de reservas"
            >
              <span className="contact-section__cta-text">
                AGENDAR EXPERIENCIA
              </span>
              <ArrowRight className="contact-section__cta-icon" />
              <div className="contact-section__cta-bg"></div>
              <span className="contact-section__cta-hover">
                AGENDAR EXPERIENCIA
                <ArrowRight className="contact-section__cta-hover-icon" />
              </span>
            </button>
          </div>
          
          {/* Visual Content */}
          <div className="contact-section__visual">
            {/* Main Image */}
            <div className="contact-section__image-container">
              <img 
                src="https://images.unsplash.com/photo-1521490683712-35a1cb235d1c?q=80&w=800&h=600&fit=crop" 
                alt="Gael Barber Shop Interior"
                className="contact-section__image"
                loading="lazy"
              />
              <div className="contact-section__image-overlay"></div>
              
              {/* Experience Badge */}
              <div className="contact-section__badge">
                <div className="contact-section__badge-content">
                  <div className="contact-section__badge-info">
                    <p className="contact-section__badge-label">EXPERIENCIA EXCLUSIVA</p>
                    <p className="contact-section__badge-text">Desde 2025</p>
                  </div>
                  <Shield className="contact-section__badge-icon" />
                </div>
              </div>
            </div>
            
            {/* Interactive Map for larger screens */}
            {!deviceInfo.isMobile && (
              <div className="contact-section__map">
                <div className="contact-section__map-container">
                  {/* Embedded map or interactive content */}
                  <div 
                    className="contact-section__map-placeholder"
                    onClick={() => handleAddress(contactData.address)}
                  >
                    <MapPin className="contact-section__map-icon" />
                    <p className="contact-section__map-text">Ver ubicación en mapa</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Actions for Mobile */}
        {deviceInfo.isMobile && (
          <div className="contact-section__quick-actions">
            <h3 className="contact-section__quick-title">Acciones Rápidas</h3>
            <div className="contact-section__quick-grid">
              <button
                onClick={() => handleCall(contactData.phone)}
                className="contact-section__quick-action contact-section__quick-action--call"
              >
                <Phone className="contact-section__quick-icon" />
                <span>Llamar</span>
              </button>
              <button
                onClick={() => handleEmail(contactData.email)}
                className="contact-section__quick-action contact-section__quick-action--email"
              >
                <Mail className="contact-section__quick-icon" />
                <span>Email</span>
              </button>
              <button
                onClick={() => handleAddress(contactData.address)}
                className="contact-section__quick-action contact-section__quick-action--map"
              >
                <MapPin className="contact-section__quick-icon" />
                <span>Ubicación</span>
              </button>
              <button
                onClick={() => setShowBookingModal(true)}
                className="contact-section__quick-action contact-section__quick-action--book"
              >
                <ArrowRight className="contact-section__quick-icon" />
                <span>Reservar</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ContactSection;