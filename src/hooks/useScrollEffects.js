import { useState, useEffect, useCallback, useRef } from 'react';

export const useScrollEffects = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [activeSection, setActiveSection] = useState('inicio');
  const [loadedElements, setLoadedElements] = useState(new Set());
  const lastScrollYRef = useRef(0);
  const observerRef = useRef(null);

  // Definir las secciones que queremos trackear
  const sections = ['inicio', 'servicios', 'maestros', 'galeria', 'contacto'];

  // Función para marcar un elemento como cargado
  const markElementAsLoaded = useCallback((elementId) => {
    setLoadedElements(prev => {
      const newSet = new Set(prev);
      newSet.add(elementId);
      return newSet;
    });
  }, []);

  // Configurar Intersection Observer para efectos de carga
  const setupLoadingObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observerOptions = {
      threshold: 0.1, // Se activa cuando 10% del elemento es visible
      rootMargin: '0px 0px -50px 0px' // Margen para activar un poco antes
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const elementId = entry.target.id || entry.target.dataset.loadId;
          if (elementId) {
            // Añadir clase 'loaded' al elemento
            entry.target.classList.add('loaded');
            
            // Marcar como cargado en nuestro estado
            markElementAsLoaded(elementId);
            
            // Dejar de observar este elemento
            observerRef.current.unobserve(entry.target);
          }
        }
      });
    }, observerOptions);

    // Observar elementos que necesitan efectos de carga
    const elementsToObserve = document.querySelectorAll(
      '.services-section, .barbers-section, .services-grid__item, .barber-card, [data-load-effect]'
    );

    elementsToObserve.forEach(element => {
      // Asignar ID si no lo tiene
      if (!element.id && !element.dataset.loadId) {
        element.dataset.loadId = `element-${Math.random().toString(36).substr(2, 9)}`;
      }
      observerRef.current.observe(element);
    });
  }, [markElementAsLoaded]);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    
    // Update scroll state
    setIsScrolled(currentScrollY > 50);
    
    // Determine scroll direction using ref
    if (currentScrollY > lastScrollYRef.current && currentScrollY > 100) {
      setScrollDirection('down');
    } else {
      setScrollDirection('up');
    }
    
    // Detectar sección activa
    const navHeight = document.querySelector('.navigation')?.offsetHeight || 0;
    const scrollPosition = currentScrollY + navHeight + 100;
    
    let currentActiveSection = 'inicio';
    
    // Revisar cada sección para ver cuál está en el viewport
    for (const sectionId of sections) {
      const element = document.getElementById(sectionId);
      if (element) {
        const elementTop = element.offsetTop;
        const elementBottom = elementTop + element.offsetHeight;
        
        if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
          currentActiveSection = sectionId;
          break;
        }
      }
    }
    
    // Caso especial: si estamos al final de la página, activar la última sección
    if (currentScrollY + window.innerHeight >= document.documentElement.scrollHeight - 10) {
      currentActiveSection = sections[sections.length - 1];
    }
    
    setActiveSection(currentActiveSection);
    lastScrollYRef.current = currentScrollY;
  }, [sections]);

  // Setup scroll listener con throttling
  useEffect(() => {
    let timeoutId = null;
    
    const throttledHandleScroll = () => {
      if (timeoutId === null) {
        timeoutId = requestAnimationFrame(() => {
          handleScroll();
          timeoutId = null;
        });
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (timeoutId) {
        cancelAnimationFrame(timeoutId);
      }
    };
  }, [handleScroll]);

  // Setup loading observer cuando el DOM esté listo
  useEffect(() => {
    // Delay para asegurar que el DOM esté completamente renderizado
    const timer = setTimeout(() => {
      setupLoadingObserver();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [setupLoadingObserver]);

  // Función para hacer scroll suave a una sección
  const scrollToSection = useCallback((sectionId) => {
    const element = document.querySelector(sectionId);
    if (element) {
      const navHeight = document.querySelector('.navigation')?.offsetHeight || 0;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navHeight - 20;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  // Función manual para marcar elementos como cargados (útil para casos especiales)
  const triggerLoadEffect = useCallback((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      element.classList.add('loaded');
      const elementId = element.id || element.dataset.loadId;
      if (elementId) {
        markElementAsLoaded(elementId);
      }
    });
  }, [markElementAsLoaded]);

  return {
    isScrolled,
    scrollDirection,
    activeSection,
    loadedElements,
    scrollToSection,
    triggerLoadEffect,
    isElementLoaded: (elementId) => loadedElements.has(elementId)
  };
};