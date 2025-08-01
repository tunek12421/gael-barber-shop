import { useState, useMemo, useCallback } from 'react';
import { getDeviceInfo } from '../utils/deviceDetection';

// Custom hook for premium gallery with intelligent pagination and curation
export const usePremiumGallery = (images = [], options = {}) => {
  const {
    initialItemsPerPage = null, // Auto-calculate based on device
    loadMoreIncrement = null,   // Auto-calculate based on device
    prioritizeFeatured = true,
    enableCuration = true
  } = options;

  // Device-based configuration - use cached device info
  const deviceInfo = useMemo(() => getDeviceInfo(), []);
  
  const deviceConfig = useMemo(() => {
    return {
      isMobile: deviceInfo.isMobile,
      isTablet: deviceInfo.isTablet,
      isDesktop: deviceInfo.isDesktop,
      isLowEnd: deviceInfo.isLowEnd,
      // Intelligent defaults based on device
      itemsPerPage: initialItemsPerPage || (
        deviceInfo.isMobile ? (deviceInfo.isLowEnd ? 4 : 6) :
        deviceInfo.isTablet ? 8 :
        12 // Desktop
      ),
      loadMoreCount: loadMoreIncrement || (
        deviceInfo.isMobile ? (deviceInfo.isLowEnd ? 2 : 4) :
        deviceInfo.isTablet ? 4 :
        6 // Desktop
      ),
      // Grid configuration
      gridColumns: deviceInfo.isMobile ? 2 : deviceInfo.isTablet ? 3 : 4,
      // Animation settings
      enableAnimations: !deviceInfo.isLowEnd,
      staggerDelay: deviceInfo.isLowEnd ? 0 : 100
    };
  }, [initialItemsPerPage, loadMoreIncrement, deviceInfo]);

  // Gallery state
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(deviceConfig.itemsPerPage);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('curated'); // 'curated' | 'grid' | 'masonry'

  // Curated and sorted images
  const curatedImages = useMemo(() => {
    if (!enableCuration) return images;

    // Sort images intelligently
    return [...images].sort((a, b) => {
      // Priority 1: Featured images first
      if (prioritizeFeatured) {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
      }
      
      // Priority 2: Category variety (VIP > Corte > Barba > Afeitado)
      const categoryPriority = { vip: 4, corte: 3, barba: 2, afeitado: 1 };
      const aPriority = categoryPriority[a.category] || 0;
      const bPriority = categoryPriority[b.category] || 0;
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      // Priority 3: Maintain order within same category
      return 0;
    });
  }, [images, prioritizeFeatured, enableCuration]);

  // Create gallery sections for optimal presentation
  const gallerySections = useMemo(() => {
    const featured = curatedImages.filter(img => img.featured);
    const regular = curatedImages.filter(img => !img.featured);
    
    return {
      hero: featured.slice(0, 1), // Main hero image
      featured: featured.slice(1, Math.min(4, featured.length)), // 3 featured
      showcase: regular.slice(0, Math.min(8, regular.length)), // Best of the rest
      remaining: regular.slice(8) // Load more content
    };
  }, [curatedImages]);

  // Currently visible images based on pagination
  const visibleImages = useMemo(() => {
    switch (viewMode) {
      case 'curated':
        return [
          ...gallerySections.hero,
          ...gallerySections.featured,
          ...gallerySections.showcase.slice(0, visibleCount - gallerySections.hero.length - gallerySections.featured.length)
        ];
      case 'grid':
      case 'masonry':
      default:
        return curatedImages.slice(0, visibleCount);
    }
  }, [gallerySections, curatedImages, visibleCount, viewMode]);

  // Pagination info
  const paginationInfo = useMemo(() => {
    const totalItems = curatedImages.length;
    const totalPages = Math.ceil(totalItems / deviceConfig.itemsPerPage);
    const hasMore = visibleCount < totalItems;
    const remainingCount = totalItems - visibleCount;
    
    return {
      currentPage,
      totalPages,
      totalItems,
      visibleCount,
      hasMore,
      remainingCount,
      progress: (visibleCount / totalItems) * 100
    };
  }, [curatedImages.length, visibleCount, currentPage, deviceConfig.itemsPerPage]);

  // Load more images with smooth animation
  const loadMore = useCallback(async () => {
    if (isLoading || !paginationInfo.hasMore) return;
    
    setIsLoading(true);
    
    // Simulate network delay for smooth UX
    await new Promise(resolve => setTimeout(resolve, 400));
    
    setVisibleCount(prev => 
      Math.min(prev + deviceConfig.loadMoreCount, curatedImages.length)
    );
    setCurrentPage(prev => prev + 1);
    setIsLoading(false);
  }, [isLoading, paginationInfo.hasMore, deviceConfig.loadMoreCount, curatedImages.length]);

  // Reset gallery to initial state
  const resetGallery = useCallback(() => {
    setCurrentPage(1);
    setVisibleCount(deviceConfig.itemsPerPage);
    setIsLoading(false);
  }, [deviceConfig.itemsPerPage]);

  // Change view mode
  const changeViewMode = useCallback((newMode) => {
    setViewMode(newMode);
    resetGallery();
  }, [resetGallery]);

  // Jump to specific page
  const goToPage = useCallback((pageNumber) => {
    const targetCount = pageNumber * deviceConfig.itemsPerPage;
    setVisibleCount(Math.min(targetCount, curatedImages.length));
    setCurrentPage(pageNumber);
  }, [deviceConfig.itemsPerPage, curatedImages.length]);

  // Load specific amount
  const loadSpecificAmount = useCallback((count) => {
    setVisibleCount(Math.min(count, curatedImages.length));
    setCurrentPage(Math.ceil(count / deviceConfig.itemsPerPage));
  }, [curatedImages.length, deviceConfig.itemsPerPage]);

  // Auto-load more for infinite scroll - disabled to prevent dependency issues
  // useEffect(() => {
  //   if (!enableInfiniteScroll) return;
  //   const handleScroll = () => {
  //     const scrollTop = document.documentElement.scrollTop;
  //     const windowHeight = window.innerHeight;
  //     const docHeight = document.documentElement.offsetHeight;
  //     if (scrollTop + windowHeight >= docHeight - 1000) {
  //       loadMore();
  //     }
  //   };
  //   window.addEventListener('scroll', handleScroll);
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, [enableInfiniteScroll, loadMore]);

  // Get layout configuration for current view mode
  const getLayoutConfig = useCallback(() => {
    switch (viewMode) {
      case 'curated':
        return {
          type: 'curated',
          heroSize: 'large',
          featuredSize: 'medium',
          regularSize: 'small',
          enableStagger: deviceConfig.enableAnimations
        };
      case 'masonry':
        return {
          type: 'masonry',
          columns: deviceConfig.gridColumns,
          gap: '1rem',
          enableStagger: deviceConfig.enableAnimations
        };
      case 'grid':
      default:
        return {
          type: 'grid',
          columns: deviceConfig.gridColumns,
          aspectRatio: '1:1',
          gap: '1rem',
          enableStagger: deviceConfig.enableAnimations
        };
    }
  }, [viewMode, deviceConfig]);

  // Performance metrics
  const performanceMetrics = useMemo(() => ({
    imagesLoaded: visibleImages.length,
    totalImages: curatedImages.length,
    loadProgress: (visibleImages.length / curatedImages.length) * 100,
    estimatedLoadTime: visibleImages.length * (deviceConfig.isLowEnd ? 200 : 100), // ms
    memoryUsage: visibleImages.length * 0.5 // MB estimate
  }), [visibleImages.length, curatedImages.length, deviceConfig.isLowEnd]);

  return {
    // Images and data
    visibleImages,
    gallerySections,
    curatedImages,
    
    // Pagination
    paginationInfo,
    isLoading,
    
    // View mode
    viewMode,
    changeViewMode,
    
    // Actions
    loadMore,
    resetGallery,
    goToPage,
    loadSpecificAmount,
    
    // Configuration
    deviceConfig,
    getLayoutConfig,
    
    // Performance
    performanceMetrics
  };
};