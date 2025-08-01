import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { getDeviceInfo } from '../utils/deviceDetection';
import { useScrollEffects } from '../hooks/useScrollEffects';
import '../styles/navigation.css';

const Navigation = ({ 
  isMenuOpen, 
  setIsMenuOpen, 
  currentTime, 
  setShowBookingModal
}) => {
  const navRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const firstMenuItemRef = useRef(null);
  const lastMenuItemRef = useRef(null);
  
  // Use custom scroll effects hook (includes navigation + loading effects)
  const { isScrolled, activeSection, scrollToSection } = useScrollEffects();
  
  // Use cached device info to avoid recalculation
  const baseDeviceInfo = useMemo(() => getDeviceInfo(), []);
  const deviceInfo = useMemo(() => ({ 
    type: baseDeviceInfo, 
    reducedMotion: baseDeviceInfo.reducedMotion 
  }), [baseDeviceInfo]);

  // Navigation items configuration
  const navItems = [
    { id: 'inicio', label: 'INICIO', href: '#inicio' },
    { id: 'servicios', label: 'SERVICIOS', href: '#servicios' },
    { id: 'maestros', label: 'MAESTROS', href: '#maestros' },
    { id: 'galeria', label: 'GALERÍA', href: '#galería' },
    { id: 'contacto', label: 'CONTACTO', href: '#contacto' }
  ];

  // Handle escape key to close mobile menu
  const handleEscapeKey = useCallback((event) => {
    if (event.key === 'Escape' && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMenuOpen, setIsMenuOpen]);

  // Handle tab key for focus trapping in mobile menu
  const handleTabKey = useCallback((event) => {
    if (!isMenuOpen) return;

    if (event.key === 'Tab') {
      const focusableElements = mobileMenuRef.current?.querySelectorAll(
        'a, button, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [isMenuOpen]);

  // Handle mobile menu item click
  const handleMobileMenuClick = useCallback((href) => {
    setIsMenuOpen(false);
    // Small delay to allow menu to close before scrolling
    setTimeout(() => {
      scrollToSection(href);
    }, 300);
  }, [setIsMenuOpen, scrollToSection]);

  // Handle CTA button click
  const handleCTAClick = useCallback(() => {
    setShowBookingModal(true);
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [setShowBookingModal, isMenuOpen, setIsMenuOpen]);

  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, [setIsMenuOpen]);

  // Setup event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('keydown', handleTabKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [handleEscapeKey, handleTabKey]);

  // Focus management for mobile menu
  useEffect(() => {
    if (isMenuOpen && firstMenuItemRef.current) {
      // Focus first menu item when menu opens
      setTimeout(() => {
        firstMenuItemRef.current?.focus();
      }, 100);
    }
  }, [isMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isMenuOpen]);

  return (
    <>
      <nav 
        ref={navRef}
        className={`navigation ${isScrolled ? 'scrolled' : ''}`}
        role="navigation"
        aria-label="Navegación principal"
      >
        <div className="nav-container">
          {/* Logo */}
          <a 
            href="#inicio" 
            className="nav-logo"
            aria-label="Gael Barber Shop - Ir al inicio"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('#inicio');
            }}
          >
            <div className="nav-logo-text">
              GAEL<br />
              BARBER<br />
              SHOP
            </div>
            <div className="nav-logo-divider" aria-hidden="true"></div>
          </a>

          {/* Desktop Navigation Menu */}
          <ul className="nav-menu-desktop" role="menubar">
            {navItems.map((item) => (
              <li key={item.id} className="nav-menu-item" role="none">
                <a
                  href={item.href}
                  className={`nav-menu-link ${activeSection === item.id ? 'active' : ''}`}
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.href);
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Time Display (Desktop only) */}
          <div 
            className="nav-time"
            aria-label={`Hora actual: ${currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`}
          >
            {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </div>

          {/* Desktop CTA Button */}
          <button 
            className="nav-cta"
            onClick={handleCTAClick}
            aria-label="Reservar experiencia"
          >
            RESERVAR
          </button>

          {/* Mobile Hamburger Button */}
          <button
            className={`hamburger-button ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <div className="hamburger-icon" aria-hidden="true">
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Overlay Menu */}
      <div
        className={`mobile-overlay ${isMenuOpen ? 'active' : ''}`}
        aria-hidden={!isMenuOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsMenuOpen(false);
          }
        }}
      >
        <div 
          ref={mobileMenuRef}
          className="mobile-menu"
          id="mobile-menu"
          role="menu"
          aria-label="Menú de navegación móvil"
        >
          {navItems.map((item, index) => (
            <div 
              key={item.id} 
              className="mobile-menu-item"
              style={{ 
                transitionDelay: deviceInfo.reducedMotion ? '0s' : `${index * 0.05}s` 
              }}
            >
              <a
                ref={index === 0 ? firstMenuItemRef : index === navItems.length - 1 ? lastMenuItemRef : null}
                href={item.href}
                className={`mobile-menu-link ${activeSection === item.id ? 'active' : ''}`}
                role="menuitem"
                tabIndex={isMenuOpen ? 0 : -1}
                onClick={(e) => {
                  e.preventDefault();
                  handleMobileMenuClick(item.href);
                }}
              >
                {item.label}
              </a>
            </div>
          ))}
          
          <div 
            className="mobile-menu-item"
            style={{ 
              transitionDelay: deviceInfo.reducedMotion ? '0s' : `${navItems.length * 0.05}s` 
            }}
          >
            <button
              className="mobile-menu-cta"
              onClick={handleCTAClick}
              tabIndex={isMenuOpen ? 0 : -1}
              aria-label="Reservar experiencia"
            >
              RESERVAR
            </button>
          </div>
        </div>
      </div>

      {/* Screen reader announcement for menu state */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {isMenuOpen ? 'Menú abierto' : ''}
      </div>
    </>
  );
};

export default Navigation;