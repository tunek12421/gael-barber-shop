import { useState, useEffect, useCallback, useRef } from 'react';

export const useNavigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [activeSection, setActiveSection] = useState('inicio');
  const lastScrollYRef = useRef(0);

  // Definir las secciones que queremos trackear
  const sections = ['inicio', 'servicios', 'maestros', 'galeria', 'contacto'];

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
    const scrollPosition = currentScrollY + navHeight + 100; // Offset para detectar la sección
    
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
  }, [sections]); // Incluir sections como dependencia

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

  const scrollToSection = useCallback((sectionId) => {
    const element = document.querySelector(sectionId);
    if (element) {
      const navHeight = document.querySelector('.navigation')?.offsetHeight || 0;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navHeight - 20; // 20px extra padding

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  return {
    isScrolled,
    scrollDirection,
    activeSection,
    scrollToSection
  };
};