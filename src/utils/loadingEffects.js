// Loading Effects for Sections
export const initializeLoadingEffects = () => {
  console.log('Inicializando efectos de carga...');
  
  // Función para activar una sección
  const activateSection = (section) => {
    console.log('Activando sección:', section.className);
    section.classList.add('loaded');
  };

  // Intersection Observer para detectar cuando las secciones entran en viewport
  const observerOptions = {
    threshold: 0.1, // Se activa cuando 10% de la sección es visible
    rootMargin: '50px 0px -50px 0px' // Margen para activar antes
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        activateSection(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Esperar a que el DOM esté completamente cargado
  setTimeout(() => {
    // Observar todas las secciones que tienen efectos de carga
    const sectionsToObserve = document.querySelectorAll('.services-section, .barbers-section');
    console.log('Secciones encontradas:', sectionsToObserve.length);
    
    sectionsToObserve.forEach((section, index) => {
      console.log(`Observando sección ${index + 1}:`, section.className);
      
      // Verificar si la sección ya está en pantalla
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        // Si está visible, activar inmediatamente
        setTimeout(() => activateSection(section), 500);
      } else {
        // Si no está visible, observar para cuando aparezca
        observer.observe(section);
      }
    });
    
    // Forzar activación de la primera sección si es necesario
    const firstSection = document.querySelector('.services-section');
    if (firstSection && !firstSection.classList.contains('loaded')) {
      setTimeout(() => activateSection(firstSection), 1000);
    }
  }, 500);
};

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLoadingEffects);
} else {
  initializeLoadingEffects();
}