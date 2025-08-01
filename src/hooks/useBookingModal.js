import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { getDeviceType, isLowEndDevice, prefersReducedMotion } from '../utils/deviceDetection';

// Hook for focus trap management
export const useFocusTrap = (isActive) => {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    // Store current focus
    previousFocusRef.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements
    const getFocusableElements = () => {
      return container.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
    };

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Focus first element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore previous focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
};

// Hook for scroll lock
export const useScrollLock = (isActive) => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    if (isActive) {
      // Store current scroll position
      const currentScrollY = window.scrollY;
      setScrollPosition(currentScrollY);

      // Apply scroll lock
      document.body.style.position = 'fixed';
      document.body.style.top = `-${currentScrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    } else {
      // Remove scroll lock
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';

      // Restore scroll position
      window.scrollTo(0, scrollPosition);
    }

    return () => {
      // Cleanup on unmount
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
    };
  }, [isActive, scrollPosition]);
};

// Hook for adaptive modal layout
export const useAdaptiveModal = () => {
  const deviceInfo = useMemo(() => {
    const type = getDeviceType();
    return {
      isMobile: type.isMobile,
      isTablet: type.isTablet,
      isDesktop: type.isDesktop,
      isLowEnd: isLowEndDevice(),
      reducedMotion: prefersReducedMotion()
    };
  }, []);

  const modalLayout = useMemo(() => {
    if (deviceInfo.isMobile) {
      return {
        mode: 'fullscreen',
        padding: '1rem',
        maxWidth: '100%',
        maxHeight: '100%',
        borderRadius: '0',
        animation: deviceInfo.reducedMotion ? 'none' : 'slideUp'
      };
    } else if (deviceInfo.isTablet) {
      return {
        mode: 'centered',
        padding: '2rem',
        maxWidth: '90vw',
        maxHeight: '90vh',
        borderRadius: '0.5rem',
        animation: deviceInfo.reducedMotion ? 'none' : 'scaleIn'
      };
    } else {
      return {
        mode: 'centered',
        padding: '3rem',
        maxWidth: '64rem',
        maxHeight: '90vh',
        borderRadius: '0.5rem',
        animation: deviceInfo.reducedMotion ? 'none' : 'scaleIn'
      };
    }
  }, [deviceInfo]);

  return { deviceInfo, modalLayout };
};

// Hook for booking wizard state management
export const useBookingWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Booking data
  const [selectedService, setSelectedService] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  // Form validation
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const steps = useMemo(() => [
    {
      id: 1,
      title: 'Servicio',
      subtitle: 'Selecciona tu experiencia',
      fields: ['service', 'barber']
    },
    {
      id: 2,
      title: 'Horario',
      subtitle: 'Elige fecha y hora',
      fields: ['date', 'time']
    },
    {
      id: 3,
      title: 'Información',
      subtitle: 'Completa tus datos',
      fields: ['name', 'email', 'phone']
    },
    {
      id: 4,
      title: 'Confirmación',
      subtitle: 'Revisa tu reserva',
      fields: []
    }
  ], []);

  // Validation rules
  const validateStep = useCallback((stepNumber) => {
    const step = steps.find(s => s.id === stepNumber);
    if (!step) return true;

    const newErrors = {};

    step.fields.forEach(field => {
      switch (field) {
        case 'service':
          if (!selectedService) newErrors.service = 'Selecciona un servicio';
          break;
        case 'barber':
          if (!selectedBarber) newErrors.barber = 'Selecciona un maestro';
          break;
        case 'date':
          if (!selectedDate) newErrors.date = 'Selecciona una fecha';
          break;
        case 'time':
          if (!selectedTime) newErrors.time = 'Selecciona una hora';
          break;
        case 'name':
          if (!customerInfo.name.trim()) newErrors.name = 'Ingresa tu nombre';
          break;
        case 'email':
          if (!customerInfo.email.trim()) {
            newErrors.email = 'Ingresa tu email';
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
            newErrors.email = 'Email inválido';
          }
          break;
        case 'phone':
          if (!customerInfo.phone.trim()) {
            newErrors.phone = 'Ingresa tu teléfono';
          } else if (!/^[+]?[\d\s-()]{10,}$/.test(customerInfo.phone)) {
            newErrors.phone = 'Teléfono inválido';
          }
          break;
        default:
          // No validation needed for unknown fields
          break;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedService, selectedBarber, selectedDate, selectedTime, customerInfo.name, customerInfo.email, customerInfo.phone]);

  // Navigation functions
  const nextStep = useCallback(async () => {
    if (isTransitioning) return;

    const isValid = validateStep(currentStep);
    if (!isValid) return;

    setIsTransitioning(true);
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    
    // Small delay for smooth transition
    setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
      setIsTransitioning(false);
    }, 150);
  }, [currentStep, validateStep, isTransitioning, steps.length]);

  const prevStep = useCallback(() => {
    if (isTransitioning || currentStep <= 1) return;

    setIsTransitioning(true);
    setErrors({});
    
    setTimeout(() => {
      setCurrentStep(prev => prev - 1);
      setIsTransitioning(false);
    }, 150);
  }, [currentStep, isTransitioning]);

  const goToStep = useCallback((stepNumber) => {
    if (isTransitioning || stepNumber === currentStep) return;
    if (stepNumber > currentStep && !completedSteps.has(stepNumber - 1)) return;

    setIsTransitioning(true);
    setErrors({});
    
    setTimeout(() => {
      setCurrentStep(stepNumber);
      setIsTransitioning(false);
    }, 150);
  }, [currentStep, completedSteps, isTransitioning]);

  // Submit booking
  const submitBooking = useCallback(async () => {
    if (isSubmitting) return;

    const isValid = validateStep(3); // Validate customer info
    if (!isValid) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random success/failure for demo
      const success = Math.random() > 0.2;
      
      if (success) {
        setSubmitStatus('success');
        setCurrentStep(4); // Go to confirmation step
        setCompletedSteps(prev => new Set([...prev, 3]));
      } else {
        throw new Error('Error en el servidor');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrors({ general: 'Error al procesar la reserva. Intenta nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, validateStep]);

  // Reset wizard
  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setCompletedSteps(new Set());
    setIsTransitioning(false);
    setSelectedService('');
    setSelectedBarber('');
    setSelectedDate('');
    setSelectedTime('');
    setCustomerInfo({ name: '', email: '', phone: '', notes: '' });
    setErrors({});
    setIsSubmitting(false);
    setSubmitStatus(null);
  }, []);

  // Progress calculation
  const progress = useMemo(() => ({
    current: currentStep,
    total: steps.length,
    percentage: (currentStep / steps.length) * 100,
    completed: completedSteps.size
  }), [currentStep, steps.length, completedSteps]);

  // Stable helper functions
  const canGoNext = useCallback(() => validateStep(currentStep), [validateStep, currentStep]);
  const canGoPrev = useCallback(() => currentStep > 1, [currentStep]);
  const isStepComplete = useCallback((stepNumber) => completedSteps.has(stepNumber), [completedSteps]);
  const getCurrentStepData = useCallback(() => steps.find(s => s.id === currentStep), [steps, currentStep]);

  return {
    // State
    currentStep,
    steps,
    progress,
    isTransitioning,
    completedSteps,
    
    // Booking data
    selectedService,
    setSelectedService,
    selectedBarber,
    setSelectedBarber,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    customerInfo,
    setCustomerInfo,
    
    // Validation
    errors,
    setErrors,
    validateStep,
    
    // Submission
    isSubmitting,
    submitStatus,
    submitBooking,
    
    // Navigation
    nextStep,
    prevStep,
    goToStep,
    resetWizard,
    
    // Helpers
    canGoNext,
    canGoPrev,
    isStepComplete,
    getCurrentStepData
  };
};