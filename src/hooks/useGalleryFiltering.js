import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getDeviceInfo } from '../utils/deviceDetection';

// Hook for advanced gallery filtering with search and animation
export const useGalleryFiltering = (items = [], options = {}) => {
  const {
    searchFields = ['service', 'description', 'category'],
    filterKey = 'category',
    defaultFilter = 'all',
    debounceMs = 300,
    minSearchLength = 2,
    onFilterChange,
    onSearchChange,
  } = options;

  const [activeFilter, setActiveFilter] = useState(defaultFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);
  const [availableFilters, setAvailableFilters] = useState([]);
  const [isFiltering] = useState(false);
  
  const searchTimeoutRef = useRef(null);

  // Device capabilities - use cached info to prevent re-renders
  const deviceInfo = useMemo(() => getDeviceInfo(), []);




  // Extract hierarchical filters from items
  useEffect(() => {
    const hierarchicalFilters = new Map();
    
    // Label mappings for categories
    const getCategoryLabel = (value) => {
      const labels = {
        'clasicos': 'Cortes Clásicos',
        'modernos': 'Cortes Modernos',
        'all': 'Todos los Cortes'
      };
      return labels[value] || value.charAt(0).toUpperCase() + value.slice(1);
    };

    const getSubcategoryLabel = (value) => {
      const labels = {
        'fade': 'Fade (Degradado)',
        'undercut': 'Undercut',
        'pompadour': 'Pompadour',
        'quiff': 'Quiff',
        'side-part': 'Side Part',
        'buzz-cut': 'Buzz Cut',
        'crew-cut': 'Crew Cut',
        'textured-crop': 'Textured Crop',
        'french-crop': 'French Crop',
        'man-bun': 'Man Bun'
      };
      return labels[value] || value.charAt(0).toUpperCase() + value.slice(1);
    };

    const getSubsubcategoryLabel = (value) => {
      const labels = {
        // Fade subcategories
        'bajo': 'Degradado Bajo',
        'medio': 'Degradado Medio', 
        'alto': 'Degradado Alto',
        'general': 'Fade General',
        'texturizado': 'Texturizado',
        'drop': 'Drop Fade',
        // Undercut subcategories
        'basico': 'Básico',
        'con-fade': 'Con Fade',
        'desconectado': 'Desconectado',
        'retro': 'Estilo Retro',
        'moderno': 'Moderno',
        'rizado': 'Cabello Rizado',
        'unicos': 'Estilos Únicos',
        'especiales': 'Especiales',
        'disenos': 'Con Diseños',
        'estilizados': 'Estilizados',
        'con-barba': 'Con Barba',
        // General
        'clasico': 'Clásico'
      };
      return labels[value] || value.charAt(0).toUpperCase() + value.slice(1);
    };
    
    // Add default 'all' filter
    hierarchicalFilters.set('all', {
      key: 'all',
      label: 'Todos los Cortes',
      count: items.length,
      description: 'Mostrar toda la galería',
      level: 'root'
    });
    
    // Build hierarchical structure
    items.forEach(item => {
      const { category, subcategory, subsubcategory } = item;
      
      // Category level
      if (category) {
        const categoryKey = category;
        if (!hierarchicalFilters.has(categoryKey)) {
          hierarchicalFilters.set(categoryKey, {
            key: categoryKey,
            label: getCategoryLabel(category),
            count: 0,
            description: `Ver ${getCategoryLabel(category)}`,
            level: 'category',
            children: new Map()
          });
        }
        hierarchicalFilters.get(categoryKey).count++;
        
        // Subcategory level
        if (subcategory) {
          const subcategoryKey = `${category}-${subcategory}`;
          const parentCategory = hierarchicalFilters.get(categoryKey);
          
          if (!parentCategory.children.has(subcategoryKey)) {
            parentCategory.children.set(subcategoryKey, {
              key: subcategoryKey,
              label: getSubcategoryLabel(subcategory),
              count: 0,
              description: `Ver ${getSubcategoryLabel(subcategory)}`,
              level: 'subcategory',
              parent: categoryKey,
              children: new Map()
            });
          }
          parentCategory.children.get(subcategoryKey).count++;
          
          // Sub-subcategory level
          if (subsubcategory) {
            const subsubcategoryKey = `${category}-${subcategory}-${subsubcategory}`;
            const parentSubcategory = parentCategory.children.get(subcategoryKey);
            
            if (!parentSubcategory.children.has(subsubcategoryKey)) {
              parentSubcategory.children.set(subsubcategoryKey, {
                key: subsubcategoryKey,
                label: getSubsubcategoryLabel(subsubcategory),
                count: 0,
                description: `Ver ${getSubsubcategoryLabel(subsubcategory)}`,
                level: 'subsubcategory',
                parent: subcategoryKey,
                grandparent: categoryKey
              });
            }
            parentSubcategory.children.get(subsubcategoryKey).count++;
          }
        }
      }
    });
    
    // Convert Maps to Arrays for easier rendering
    const processFilters = (filterMap) => {
      return Array.from(filterMap.values()).map(filter => ({
        ...filter,
        children: filter.children ? processFilters(filter.children) : []
      }));
    };
    
    const newFilters = processFilters(hierarchicalFilters);
    setAvailableFilters(newFilters);
  }, [items, filterKey]);



  // Store callback refs to prevent infinite loops
  const onFilterChangeRef = useRef(onFilterChange);
  const onSearchChangeRef = useRef(onSearchChange);
  onFilterChangeRef.current = onFilterChange;
  onSearchChangeRef.current = onSearchChange;

  // Handle filter change
  const handleFilterChange = useCallback((filterKey) => {
    if (filterKey === activeFilter) return;
    
    setActiveFilter(filterKey);
    onFilterChangeRef.current && onFilterChangeRef.current(filterKey);
  }, [activeFilter]);

  // Handle search with debouncing
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      onSearchChangeRef.current && onSearchChangeRef.current(query);
    }, debounceMs);
  }, [debounceMs]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    onSearchChangeRef.current && onSearchChangeRef.current('');
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setActiveFilter(defaultFilter);
    setSearchQuery('');
    onFilterChangeRef.current && onFilterChangeRef.current(defaultFilter);
    onSearchChangeRef.current && onSearchChangeRef.current('');
  }, [defaultFilter]);

  // Stabilize searchFields to prevent infinite loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableSearchFields = useMemo(() => searchFields, []);

  // Apply hierarchical filters when key dependencies change
  useEffect(() => {
    const result = items.filter(item => {
      // Handle hierarchical filtering
      if (activeFilter !== 'all') {
        const filterParts = activeFilter.split('-');
        
        if (filterParts.length === 1) {
          // Category level filter (e.g., 'clasicos', 'modernos')
          if (item.category !== filterParts[0]) {
            return false;
          }
        } else if (filterParts.length === 2) {
          // Subcategory level filter (e.g., 'clasicos-fade')
          if (item.category !== filterParts[0] || item.subcategory !== filterParts[1]) {
            return false;
          }
        } else if (filterParts.length === 3) {
          // Sub-subcategory level filter (e.g., 'clasicos-fade-bajo')
          if (item.category !== filterParts[0] || 
              item.subcategory !== filterParts[1] || 
              item.subsubcategory !== filterParts[2]) {
            return false;
          }
        }
      }
      
      // Filter by search
      if (searchQuery && searchQuery.length >= minSearchLength) {
        const searchText = stableSearchFields
          .map(field => item[field] || '')
          .join(' ')
          .toLowerCase();
        return searchText.includes(searchQuery.toLowerCase());
      }
      
      return true;
    });
    
    setFilteredItems(result);
  }, [items, activeFilter, searchQuery, filterKey, stableSearchFields, minSearchLength]);

  // Get filter classes - simplified
  const getFilterClasses = useCallback((filterKey) => {
    const classes = ['gallery-filter'];
    
    if (filterKey === activeFilter) {
      classes.push('gallery-filter--active');
    }
    
    if (deviceInfo.isMobile) {
      classes.push('gallery-filter--mobile');
    }
    
    return classes.join(' ');
  }, [activeFilter, deviceInfo.isMobile]);

  return {
    // State
    activeFilter,
    searchQuery,
    filteredItems,
    availableFilters,
    isFiltering,
    
    // Actions  
    handleFilterChange,
    handleSearchChange,
    clearSearch,
    resetFilters,
    
    // Utilities
    getFilterClasses,
    
    // Device info
    deviceInfo,
    
    // Stats
    stats: {
      totalItems: items.length,
      filteredCount: filteredItems.length,
      filterRatio: items.length > 0 ? (filteredItems.length / items.length) * 100 : 0,
      activeFilters: (searchQuery ? 1 : 0) + (activeFilter !== 'all' ? 1 : 0)
    }
  };
};

// Hook for filter UI animations
export const useFilterAnimations = (isActive, options = {}) => {
  const {
    enterDuration = 300,
    exitDuration = 200,
    staggerDelay = 50
  } = options;

  const [animationState, setAnimationState] = useState('idle');
  const timeoutRef = useRef(null);

  const animationDeviceInfo = useMemo(() => getDeviceInfo(), []);

  useEffect(() => {
    if (animationDeviceInfo.reducedMotion) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isActive) {
      setAnimationState('entering');
      timeoutRef.current = setTimeout(() => {
        setAnimationState('entered');
      }, enterDuration);
    } else {
      setAnimationState('exiting');
      timeoutRef.current = setTimeout(() => {
        setAnimationState('exited');
      }, exitDuration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isActive, enterDuration, exitDuration, animationDeviceInfo.reducedMotion]);

  const getItemStyle = useCallback((index) => {
    if (animationDeviceInfo.reducedMotion) {
      return {};
    }

    const delay = index * staggerDelay;
    
    switch (animationState) {
      case 'entering':
        return {
          opacity: 0,
          transform: 'translateY(20px)',
          transition: `opacity ${enterDuration}ms ease-out ${delay}ms, transform ${enterDuration}ms ease-out ${delay}ms`
        };
      
      case 'entered':
        return {
          opacity: 1,
          transform: 'translateY(0)',
          transition: `opacity ${enterDuration}ms ease-out ${delay}ms, transform ${enterDuration}ms ease-out ${delay}ms`
        };
      
      case 'exiting':
        return {
          opacity: 0,
          transform: 'translateY(-10px)',
          transition: `opacity ${exitDuration}ms ease-in, transform ${exitDuration}ms ease-in`
        };
      
      default:
        return {
          opacity: 1,
          transform: 'translateY(0)'
        };
    }
  }, [animationState, enterDuration, exitDuration, staggerDelay, animationDeviceInfo.reducedMotion]);

  return {
    animationState,
    getItemStyle,
    deviceInfo: animationDeviceInfo
  };
};