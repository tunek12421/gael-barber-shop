import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { getDeviceType, isLowEndDevice, hasPointerFine } from '../utils/deviceDetection';

// Hook for contact form specific functionality
export const useContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [submitMessage, setSubmitMessage] = useState('');

  const deviceInfo = useMemo(() => {
    const type = getDeviceType();
    return {
      isMobile: type.isMobile,
      isTablet: type.isTablet,
      isDesktop: type.isDesktop,
      isLowEnd: isLowEndDevice(),
      hasPointerFine: hasPointerFine(),
      isTouchDevice: 'ontouchstart' in window
    };
  }, []);

  // Simulate form submission
  const submitForm = useCallback(async (formData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success/error randomly for demo
      const isSuccess = Math.random() > 0.2;
      
      if (isSuccess) {
        setSubmitStatus('success');
        setSubmitMessage('¡Mensaje enviado correctamente! Te contactaremos pronto.');
      } else {
        throw new Error('Error de conexión');
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('Error al enviar el mensaje. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Clear submit status
  const clearSubmitStatus = useCallback(() => {
    setSubmitStatus(null);
    setSubmitMessage('');
  }, []);

  return {
    deviceInfo,
    isSubmitting,
    submitStatus,
    submitMessage,
    submitForm,
    clearSubmitStatus
  };
};

// Hook for adaptive input sizing and spacing
export const useAdaptiveInput = () => {
  const deviceInfo = useMemo(() => {
    const type = getDeviceType();
    return {
      isMobile: type.isMobile,
      isTablet: type.isTablet,
      isDesktop: type.isDesktop,
      hasPointerFine: hasPointerFine(),
      isTouchDevice: 'ontouchstart' in window
    };
  }, []);

  // Get input dimensions based on device
  const inputDimensions = useMemo(() => {
    if (deviceInfo.isMobile) {
      return {
        height: '56px', // Minimum 44px touch target
        fontSize: '16px', // Prevent zoom on iOS
        padding: '16px',
        gap: '16px'
      };
    }
    
    if (deviceInfo.isTablet) {
      return {
        height: '52px',
        fontSize: '15px',
        padding: '14px',
        gap: '14px'
      };
    }
    
    return {
      height: '48px',
      fontSize: '14px',
      padding: '12px',
      gap: '12px'
    };
  }, [deviceInfo]);

  // Get button dimensions
  const buttonDimensions = useMemo(() => {
    if (deviceInfo.isMobile) {
      return {
        height: '56px',
        fontSize: '16px',
        padding: '16px 24px'
      };
    }
    
    if (deviceInfo.isTablet) {
      return {
        height: '52px',
        fontSize: '15px',
        padding: '14px 20px'
      };
    }
    
    return {
      height: '48px',
      fontSize: '14px',
      padding: '12px 16px'
    };
  }, [deviceInfo]);

  return {
    deviceInfo,
    inputDimensions,
    buttonDimensions
  };
};

// Hook for focus management and accessibility
export const useFocusManagement = (formRef) => {
  const [focusedField, setFocusedField] = useState(null);
  const firstErrorRef = useRef(null);

  // Focus first error field
  const focusFirstError = useCallback(() => {
    if (firstErrorRef.current) {
      firstErrorRef.current.focus();
      firstErrorRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, []);

  // Handle focus for field
  const handleFieldFocus = useCallback((fieldName) => {
    setFocusedField(fieldName);
  }, []);

  // Handle blur for field
  const handleFieldBlur = useCallback(() => {
    setFocusedField(null);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!formRef.current) return;

      // Enter key on buttons
      if (e.key === 'Enter' && e.target.tagName === 'BUTTON') {
        e.target.click();
      }

      // Tab navigation improvements
      if (e.key === 'Tab') {
        const focusableElements = formRef.current.querySelectorAll(
          'input:not([disabled]), textarea:not([disabled]), button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // If we're on the last element and not shifting, go to first
        if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }

        // If we're on the first element and shifting, go to last
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [formRef]);

  return {
    focusedField,
    firstErrorRef,
    focusFirstError,
    handleFieldFocus,
    handleFieldBlur
  };
};

// Hook for click-to-call/email functionality
export const useContactActions = () => {
  const deviceInfo = useMemo(() => {
    const type = getDeviceType();
    return {
      isMobile: type.isMobile,
      isTablet: type.isTablet,
      canCall: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    };
  }, []);

  // Format phone for calling
  const formatPhoneForCall = useCallback((phone) => {
    return phone.replace(/[\s\-()]/g, '');
  }, []);

  // Handle phone call
  const handleCall = useCallback((phone) => {
    if (deviceInfo.canCall) {
      window.location.href = `tel:${formatPhoneForCall(phone)}`;
    }
  }, [deviceInfo.canCall, formatPhoneForCall]);

  // Handle email
  const handleEmail = useCallback((email, subject = '', body = '') => {
    const mailto = `mailto:${email}`;
    const params = new URLSearchParams();
    
    if (subject) params.append('subject', subject);
    if (body) params.append('body', body);
    
    const queryString = params.toString();
    window.location.href = `${mailto}${queryString ? '?' + queryString : ''}`;
  }, []);

  // Handle address (open in maps)
  const handleAddress = useCallback((address) => {
    const encodedAddress = encodeURIComponent(address);
    
    if (deviceInfo.isMobile) {
      // Try to open in native maps app
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = `maps://maps.apple.com/?q=${encodedAddress}`;
      } else if (/Android/i.test(navigator.userAgent)) {
        window.location.href = `geo:0,0?q=${encodedAddress}`;
      } else {
        window.open(`https://maps.google.com/maps?q=${encodedAddress}`, '_blank');
      }
    } else {
      window.open(`https://maps.google.com/maps?q=${encodedAddress}`, '_blank');
    }
  }, [deviceInfo.isMobile]);

  return {
    deviceInfo,
    handleCall,
    handleEmail,
    handleAddress,
    formatPhoneForCall
  };
};