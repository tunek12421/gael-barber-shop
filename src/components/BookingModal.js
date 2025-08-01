import React, { useEffect, useCallback, useState } from 'react';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import { services, barbers } from '../data/constants';
import '../styles/booking-modal.css';

const BookingModal = ({ showBookingModal, setShowBookingModal }) => {
  // Simple local state instead of complex hooks
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');

  // Reset state when modal closes
  useEffect(() => {
    if (!showBookingModal) {
      setCurrentStep(1);
      setSelectedService('');
      setSelectedBarber('');
    }
  }, [showBookingModal]);

  // Handle modal close
  const handleClose = useCallback(() => {
    setShowBookingModal(false);
  }, [setShowBookingModal]);

  // Navigation
  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 2)); // Max 2 steps for now
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showBookingModal) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showBookingModal, handleClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  if (!showBookingModal) return null;

  return (
    <div 
      className="booking-modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div 
        className="booking-modal booking-modal--centered"
        role="dialog"
        aria-labelledby="booking-modal-title"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="booking-modal__close"
          aria-label="Cerrar modal de reserva"
        >
          <X className="booking-modal__close-icon" />
        </button>

        {/* Modal Header */}
        <header className="booking-modal__header">
          <h1 id="booking-modal-title" className="booking-modal__title">
            Reservar Experiencia
          </h1>
          <p className="booking-modal__subtitle">
            Paso {currentStep} de 2
          </p>
        </header>

        {/* Modal Content */}
        <div className="booking-modal__content">
          
          {currentStep === 1 && (
            <div className="booking-step booking-step--service">
              <div className="booking-section">
                <h2 className="booking-section__title">Selecciona tu Servicio</h2>
                <div className="service-grid">
                  {services.map(service => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className={`service-card ${
                        selectedService === service.id ? 'service-card--selected' : ''
                      }`}
                      aria-pressed={selectedService === service.id}
                    >
                      <div className="service-card__header">
                        <h3 className="service-card__name">{service.name}</h3>
                        <span className="service-card__price">${service.price}</span>
                      </div>
                      <p className="service-card__duration">{service.duration}</p>
                      <p className="service-card__description">{service.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="booking-section">
                <h2 className="booking-section__title">Selecciona tu Maestro</h2>
                <div className="barber-grid">
                  {barbers.map(barber => (
                    <button
                      key={barber.id}
                      onClick={() => setSelectedBarber(barber.id)}
                      className={`barber-card ${
                        selectedBarber === barber.id ? 'barber-card--selected' : ''
                      }`}
                      aria-pressed={selectedBarber === barber.id}
                    >
                      <h3 className="barber-card__name">{barber.name}</h3>
                      <p className="barber-card__specialty">{barber.specialty}</p>
                      <div className="barber-card__rating">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`barber-card__star ${
                              i < Math.floor(barber.rating) ? 'barber-card__star--filled' : ''
                            }`}
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="booking-step booking-step--confirmation">
              <div className="booking-section">
                <h2 className="booking-section__title">Resumen de tu Reserva</h2>
                <div className="booking-summary">
                  <div className="booking-summary__item">
                    <span className="booking-summary__label">Servicio:</span>
                    <span className="booking-summary__value">
                      {services.find(s => s.id === selectedService)?.name}
                    </span>
                  </div>
                  <div className="booking-summary__item">
                    <span className="booking-summary__label">Maestro:</span>
                    <span className="booking-summary__value">
                      {barbers.find(b => b.id === selectedBarber)?.name}
                    </span>
                  </div>
                  <div className="booking-summary__total">
                    <span className="booking-summary__label">Total:</span>
                    <span className="booking-summary__price">
                      ${services.find(s => s.id === selectedService)?.price} USD
                    </span>
                  </div>
                </div>
                <p className="booking-confirmation__message">¡Tu reserva está lista!</p>
              </div>
            </div>
          )}
          
        </div>

        {/* Modal Footer */}
        <footer className="booking-modal__footer">
          <div className="booking-modal__actions">
            {currentStep > 1 && (
              <button 
                onClick={prevStep}
                className="booking-modal__btn booking-modal__btn--secondary"
              >
                <ArrowLeft className="booking-modal__btn-icon" />
                <span>Anterior</span>
              </button>
            )}
            
            <div className="booking-modal__actions-right">
              {currentStep < 2 ? (
                <button 
                  onClick={nextStep}
                  disabled={!selectedService || !selectedBarber}
                  className="booking-modal__btn booking-modal__btn--primary"
                >
                  <span>Continuar</span>
                  <ArrowRight className="booking-modal__btn-icon" />
                </button>
              ) : (
                <button 
                  onClick={handleClose}
                  className="booking-modal__btn booking-modal__btn--primary"
                >
                  Confirmar Reserva
                </button>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BookingModal;