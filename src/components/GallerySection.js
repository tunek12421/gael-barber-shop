import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { 
  Search, 
  X, 
  RotateCcw, 
  Filter, 
  Grid3X3, 
  Layout, 
  ChevronDown,
  Eye,
  Heart,
  Share2,
  ZoomIn,
  ArrowRight,
  Sparkles,
  Star
} from 'lucide-react';
import { galleryImages } from '../data/constants';
import { getDeviceInfo } from '../utils/deviceDetection';
import { useGalleryFiltering } from '../hooks/useGalleryFiltering';
import { usePremiumGallery } from '../hooks/usePremiumGallery';
import { useLightbox } from '../hooks/useLightbox';
import '../styles/premium-gallery.css';

// Premium Gallery Image Component
const PremiumGalleryImage = ({ image, index, layoutConfig, onImageClick, isHero = false, isFeatured = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const imageRef = useRef(null);
  
  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);
  
  const handleImageClick = useCallback(() => {
    onImageClick(image, index);
  }, [image, index, onImageClick]);
  
  const toggleFavorite = useCallback((e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  }, [isFavorite]);
  
  const imageClasses = useMemo(() => {
    const baseClasses = ['premium-gallery__image'];
    if (isHero) baseClasses.push('premium-gallery__image--hero');
    if (isFeatured) baseClasses.push('premium-gallery__image--featured');
    if (isLoaded) baseClasses.push('premium-gallery__image--loaded');
    if (isHovered) baseClasses.push('premium-gallery__image--hovered');
    return baseClasses.join(' ');
  }, [isHero, isFeatured, isLoaded, isHovered]);
  
  return (
    <article 
      ref={imageRef}
      className={imageClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleImageClick}
      style={{
        '--stagger-delay': `${index * (layoutConfig.enableStagger ? 100 : 0)}ms`
      }}
    >
      {/* Image Container */}
      <div className="premium-gallery__image-container">
        <img
          src={image.url}
          alt={`${image.service} - ${image.description}`}
          className="premium-gallery__img"
          onLoad={handleImageLoad}
          loading="lazy"
        />
        
        {/* Image Overlay */}
        <div className="premium-gallery__overlay">
          <div className="premium-gallery__overlay-content">
            {/* Quick Actions */}
            <div className="premium-gallery__quick-actions">
              <button
                onClick={toggleFavorite}
                className={`premium-gallery__action ${isFavorite ? 'premium-gallery__action--active' : ''}`}
                aria-label="Agregar a favoritos"
              >
                <Heart className="premium-gallery__action-icon" />
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                className="premium-gallery__action"
                aria-label="Compartir"
              >
                <Share2 className="premium-gallery__action-icon" />
              </button>
              <button
                onClick={handleImageClick}
                className="premium-gallery__action premium-gallery__action--primary"
                aria-label="Ver en grande"
              >
                <ZoomIn className="premium-gallery__action-icon" />
              </button>
            </div>
            
            {/* Image Info */}
            <div className="premium-gallery__info">
              <h3 className="premium-gallery__service">{image.service}</h3>
              <p className="premium-gallery__description">{image.description}</p>
              <span className="premium-gallery__category">{image.category}</span>
            </div>
          </div>
        </div>
        
        {/* Badges */}
        <div className="premium-gallery__badges">
          {image.featured && (
            <span className="premium-gallery__badge premium-gallery__badge--featured">
              <Star className="premium-gallery__badge-icon" />
              Destacado
            </span>
          )}
          {isHero && (
            <span className="premium-gallery__badge premium-gallery__badge--hero">
              <Sparkles className="premium-gallery__badge-icon" />
              Showcase
            </span>
          )}
        </div>
        
        {/* Loading State */}
        {!isLoaded && (
          <div className="premium-gallery__loading">
            <div className="premium-gallery__loading-skeleton" />
          </div>
        )}
      </div>
    </article>
  );
};

// Gallery Controls Component
const GalleryControls = ({ 
  viewMode, 
  onViewModeChange, 
  paginationInfo, 
  onLoadMore, 
  isLoading,
  activeFilter,
  availableFilters,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onResetFilters 
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState(new Set());

  // Toggle category expansion
  const toggleCategory = useCallback((categoryKey) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryKey)) {
        newSet.delete(categoryKey);
        // Also collapse all subcategories of this category
        setExpandedSubcategories(prevSub => {
          const newSubSet = new Set(prevSub);
          availableFilters.forEach(filter => {
            if (filter.key === categoryKey && filter.children) {
              filter.children.forEach(subfilter => {
                newSubSet.delete(subfilter.key);
              });
            }
          });
          return newSubSet;
        });
      } else {
        newSet.add(categoryKey);
      }
      return newSet;
    });
  }, [availableFilters]);

  // Toggle subcategory expansion
  const toggleSubcategory = useCallback((subcategoryKey) => {
    setExpandedSubcategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subcategoryKey)) {
        newSet.delete(subcategoryKey);
      } else {
        newSet.add(subcategoryKey);
      }
      return newSet;
    });
  }, []);

  // Auto-expand categories based on active filter
  useEffect(() => {
    if (activeFilter !== 'all') {
      const filterParts = activeFilter.split('-');
      if (filterParts.length >= 1) {
        setExpandedCategories(prev => new Set(prev).add(filterParts[0]));
      }
      if (filterParts.length >= 2) {
        const subcategoryKey = `${filterParts[0]}-${filterParts[1]}`;
        setExpandedSubcategories(prev => new Set(prev).add(subcategoryKey));
      }
    }
  }, [activeFilter]);
  
  return (
    <div className="premium-gallery__controls">
      {/* Search and Filter Bar */}
      <div className="premium-gallery__toolbar">
        {/* Search */}
        <div className="premium-gallery__search">
          <Search className="premium-gallery__search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por servicio..."
            className="premium-gallery__search-input"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="premium-gallery__search-clear"
            >
              <X />
            </button>
          )}
        </div>
        
        {/* Hierarchical Filters */}
        <div className="premium-gallery__filter-group">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="premium-gallery__filter-toggle"
          >
            <Filter />
            Filtros
            <ChevronDown className={showFilters ? 'premium-gallery__chevron--open' : ''} />
          </button>
          
          {showFilters && (
            <div className="premium-gallery__filter-dropdown">
              {availableFilters.map(filter => (
                <div key={filter.key} className="premium-gallery__filter-category">
                  {/* Category Level */}
                  <div className="premium-gallery__filter-category-header">
                    <button
                      onClick={() => onFilterChange(filter.key)}
                      className={`premium-gallery__filter-option premium-gallery__filter-option--category ${
                        activeFilter === filter.key ? 'premium-gallery__filter-option--active' : ''
                      }`}
                    >
                      {filter.label}
                      <span className="premium-gallery__filter-count">({filter.count})</span>
                    </button>
                    
                    {/* Expand/Collapse button for categories with children */}
                    {filter.children && filter.children.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategory(filter.key);
                        }}
                        className="premium-gallery__filter-expand"
                        aria-label={expandedCategories.has(filter.key) ? 'Contraer' : 'Expandir'}
                      >
                        <ChevronDown 
                          className={`premium-gallery__expand-icon ${
                            expandedCategories.has(filter.key) ? 'premium-gallery__expand-icon--open' : ''
                          }`} 
                        />
                      </button>
                    )}
                  </div>
                  
                  {/* Subcategory Level - Only show when expanded */}
                  {filter.children && filter.children.length > 0 && expandedCategories.has(filter.key) && (
                    <div className="premium-gallery__filter-subcategories">
                      {filter.children.map(subfilter => (
                        <div key={subfilter.key} className="premium-gallery__filter-subcategory">
                          <div className="premium-gallery__filter-subcategory-header">
                            <button
                              onClick={() => onFilterChange(subfilter.key)}
                              className={`premium-gallery__filter-option premium-gallery__filter-option--subcategory ${
                                activeFilter === subfilter.key ? 'premium-gallery__filter-option--active' : ''
                              }`}
                            >
                              ↳ {subfilter.label}
                              <span className="premium-gallery__filter-count">({subfilter.count})</span>
                            </button>
                            
                            {/* Expand/Collapse button for subcategories with children */}
                            {subfilter.children && subfilter.children.length > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSubcategory(subfilter.key);
                                }}
                                className="premium-gallery__filter-expand premium-gallery__filter-expand--small"
                                aria-label={expandedSubcategories.has(subfilter.key) ? 'Contraer' : 'Expandir'}
                              >
                                <ChevronDown 
                                  className={`premium-gallery__expand-icon premium-gallery__expand-icon--small ${
                                    expandedSubcategories.has(subfilter.key) ? 'premium-gallery__expand-icon--open' : ''
                                  }`} 
                                />
                              </button>
                            )}
                          </div>
                          
                          {/* Sub-subcategory Level - Only show when expanded */}
                          {subfilter.children && subfilter.children.length > 0 && expandedSubcategories.has(subfilter.key) && (
                            <div className="premium-gallery__filter-subsubcategories">
                              {subfilter.children.map(subsubfilter => (
                                <button
                                  key={subsubfilter.key}
                                  onClick={() => onFilterChange(subsubfilter.key)}
                                  className={`premium-gallery__filter-option premium-gallery__filter-option--subsubcategory ${
                                    activeFilter === subsubfilter.key ? 'premium-gallery__filter-option--active' : ''
                                  }`}
                                >
                                  &nbsp;&nbsp;→ {subsubfilter.label}
                                  <span className="premium-gallery__filter-count">({subsubfilter.count})</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={onResetFilters}
                className="premium-gallery__filter-reset"
              >
                <RotateCcw />
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
        
        {/* View Mode Selector */}
        <div className="premium-gallery__view-modes">
          <button
            onClick={() => onViewModeChange('curated')}
            className={`premium-gallery__view-mode ${viewMode === 'curated' ? 'premium-gallery__view-mode--active' : ''}`}
            title="Vista curada"
          >
            <Sparkles />
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`premium-gallery__view-mode ${viewMode === 'grid' ? 'premium-gallery__view-mode--active' : ''}`}
            title="Vista grid"
          >
            <Grid3X3 />
          </button>
          <button
            onClick={() => onViewModeChange('masonry')}
            className={`premium-gallery__view-mode ${viewMode === 'masonry' ? 'premium-gallery__view-mode--active' : ''}`}
            title="Vista masonry"
          >
            <Layout />
          </button>
        </div>
      </div>
      
      {/* Gallery Stats */}
      <div className="premium-gallery__stats">
        <span className="premium-gallery__stat">
          <Eye />
          Mostrando {paginationInfo.visibleCount} de {paginationInfo.totalItems}
        </span>
        {paginationInfo.hasMore && (
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="premium-gallery__load-more"
          >
            {isLoading ? (
              <>
                <div className="premium-gallery__spinner" />
                Cargando...
              </>
            ) : (
              <>
                Mostrar más ({paginationInfo.remainingCount} restantes)
                <ArrowRight />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const GallerySection = () => {
  // Device detection - use cached info to prevent re-renders
  const deviceInfo = useMemo(() => getDeviceInfo(), []);

  const sectionRef = useRef(null);

  // Gallery filtering
  const {
    activeFilter,
    searchQuery,
    filteredItems,
    availableFilters,
    handleFilterChange,
    handleSearchChange,
    resetFilters
  } = useGalleryFiltering(galleryImages, {
    searchFields: ['service', 'description', 'category'],
    filterKey: 'category',
    defaultFilter: 'all',
    animationStagger: deviceInfo.isLowEnd ? 150 : 100,
    debounceMs: deviceInfo.isLowEnd ? 500 : 300
  });

  // Premium Gallery Hook
  const {
    visibleImages,
    gallerySections,
    paginationInfo,
    isLoading,
    viewMode,
    changeViewMode,
    loadMore,
    getLayoutConfig,
    performanceMetrics
  } = usePremiumGallery(filteredItems, {
    initialItemsPerPage: deviceInfo.isMobile ? 4 : deviceInfo.isTablet ? 6 : 8,
    loadMoreIncrement: deviceInfo.isMobile ? 2 : 4,
    prioritizeFeatured: true,
    enableCuration: true
  });

  // Lightbox for full-size viewing
  const {
    isOpen: lightboxOpen,
    currentIndex: lightboxIndex,
    openLightbox,
    closeLightbox,
    nextImage: goToNext,
    prevImage: goToPrevious,
    handleBackdropClick
  } = useLightbox(visibleImages);

  // Handle image click
  const handleImageClick = useCallback((image, index) => {
    openLightbox(index);
  }, [openLightbox]);

  // Get layout configuration
  const layoutConfig = getLayoutConfig();

  // Render gallery based on view mode
  const renderGalleryContent = () => {
    if (viewMode === 'curated') {
      return (
        <div className="premium-gallery__curated">
          {/* Hero Section */}
          {gallerySections.hero.length > 0 && (
            <section className="premium-gallery__hero-section">
              <h3 className="premium-gallery__section-title">
                <Sparkles className="premium-gallery__section-icon" />
                Trabajo Destacado
              </h3>
              <div className="premium-gallery__hero-grid">
                {gallerySections.hero.map((image, index) => (
                  <PremiumGalleryImage
                    key={`hero-${image.url}`}
                    image={image}
                    index={index}
                    layoutConfig={layoutConfig}
                    onImageClick={handleImageClick}
                    isHero={true}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Featured Section */}
          {gallerySections.featured.length > 0 && (
            <section className="premium-gallery__featured-section">
              <h3 className="premium-gallery__section-title">
                <Star className="premium-gallery__section-icon" />
                Trabajos Destacados
              </h3>
              <div className="premium-gallery__featured-grid">
                {gallerySections.featured.map((image, index) => (
                  <PremiumGalleryImage
                    key={`featured-${image.url}`}
                    image={image}
                    index={gallerySections.hero.length + index}
                    layoutConfig={layoutConfig}
                    onImageClick={handleImageClick}
                    isFeatured={true}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Showcase Section */}
          {gallerySections.showcase.length > 0 && (
            <section className="premium-gallery__showcase-section">
              <h3 className="premium-gallery__section-title">
                <Eye className="premium-gallery__section-icon" />
                Más Trabajos
              </h3>
              <div className="premium-gallery__showcase-grid">
                {gallerySections.showcase.slice(0, visibleImages.length - gallerySections.hero.length - gallerySections.featured.length).map((image, index) => (
                  <PremiumGalleryImage
                    key={`showcase-${image.url}`}
                    image={image}
                    index={gallerySections.hero.length + gallerySections.featured.length + index}
                    layoutConfig={layoutConfig}
                    onImageClick={handleImageClick}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      );
    } else {
      // Grid or Masonry view
      return (
        <div className={`premium-gallery__${viewMode}`}>
          <div className={`premium-gallery__${viewMode}-container`}>
            {visibleImages.map((image, index) => (
              <PremiumGalleryImage
                key={`${viewMode}-${image.url}`}
                image={image}
                index={index}
                layoutConfig={layoutConfig}
                onImageClick={handleImageClick}
                isFeatured={image.featured}
              />
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <section 
      ref={sectionRef}
      id="galeria" 
      className="premium-gallery-section"
      aria-labelledby="gallery-title"
    >
      <div className="premium-gallery-section__container">
        {/* Section Header */}
        <header className="premium-gallery-section__header">
          <div className="premium-gallery-section__badge" aria-hidden="true">
            GALERÍA
          </div>
          <h2 id="gallery-title" className="premium-gallery-section__title">
            Galería de Trabajos
          </h2>
          <p className="premium-gallery-section__subtitle">
            Descubre la excelencia en cada corte, la maestría en cada afeitado
          </p>
        </header>

        {/* Gallery Controls */}
        <GalleryControls
          viewMode={viewMode}
          onViewModeChange={changeViewMode}
          paginationInfo={paginationInfo}
          onLoadMore={loadMore}
          isLoading={isLoading}
          activeFilter={activeFilter}
          availableFilters={availableFilters}
          onFilterChange={handleFilterChange}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onResetFilters={resetFilters}
        />

        {/* Gallery Content */}
        <div className="premium-gallery-section__content">
          {visibleImages.length > 0 ? (
            renderGalleryContent()
          ) : (
            <div className="premium-gallery__empty">
              <div className="premium-gallery__empty-content">
                <Search className="premium-gallery__empty-icon" />
                <h3 className="premium-gallery__empty-title">
                  No se encontraron resultados
                </h3>
                <p className="premium-gallery__empty-text">
                  Intenta ajustar tus filtros o términos de búsqueda
                </p>
                <button
                  onClick={resetFilters}
                  className="premium-gallery__empty-action"
                >
                  <RotateCcw />
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Performance Indicator (dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="premium-gallery__performance">
            <small>
              Imágenes cargadas: {performanceMetrics.imagesLoaded} | 
              Memoria estimada: {performanceMetrics.memoryUsage.toFixed(1)}MB |
              Progreso: {performanceMetrics.loadProgress.toFixed(0)}%
            </small>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="premium-gallery__lightbox">
          <div className="premium-gallery__lightbox-backdrop" onClick={handleBackdropClick}>
            <div className="premium-gallery__lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={closeLightbox}
                className="premium-gallery__lightbox-close"
                aria-label="Cerrar galería"
              >
                <X />
              </button>
              
              <button
                onClick={goToPrevious}
                className="premium-gallery__lightbox-nav premium-gallery__lightbox-nav--prev"
                aria-label="Imagen anterior"
              >
                <ArrowRight style={{ transform: 'rotate(180deg)' }} />
              </button>
              
              <img
                src={visibleImages[lightboxIndex]?.url}
                alt={visibleImages[lightboxIndex]?.service}
                className="premium-gallery__lightbox-image"
              />
              
              <button
                onClick={goToNext}
                className="premium-gallery__lightbox-nav premium-gallery__lightbox-nav--next"
                aria-label="Imagen siguiente"
              >
                <ArrowRight />
              </button>
              
              <div className="premium-gallery__lightbox-info">
                <h3>{visibleImages[lightboxIndex]?.service}</h3>
                <p>{visibleImages[lightboxIndex]?.description}</p>
                <span className="premium-gallery__lightbox-counter">
                  {lightboxIndex + 1} de {visibleImages.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
