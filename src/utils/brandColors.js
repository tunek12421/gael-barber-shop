/**
 * GAEL Brand Colors Utility
 * Paleta de colores oficial de la marca GAEL
 * Incluye funciones helper para mantenimiento y consistencia
 */

// Paleta de colores principal GAEL - Elegante y Clásica
export const GAEL_COLORS = {
  // Colores primarios elegantes
  GUINDO_PROFUNDO: '#722F37',   // Color guindo elegante y sofisticado
  MADERA_CAOBA: '#8B4513',      // Marrón caoba elegante
  MADERA_CLARA: '#D2B48C',      // Variante más clara de madera
  VERDE_OLIVA: '#808000',       // Se mantiene como acento
  NEGRO: '#000000',
  BLANCO: '#FFFFFF',
  CREMA: '#F5F5DC',
  
  // Colores secundarios y matices elegantes
  MARRON_OSCURO: '#654321',     // Madera más oscura
  CAOBA_CLARO: '#A0522D',       // Variante de caoba
  GUINDO_CLARO: '#A0424A',      // Variante más clara de guindo
  GUINDO_OSCURO: '#4A1E23',     // Guindo muy oscuro
  
  // Grises y neutros refinados
  GRIS_CARBÓN: '#36454F',       // Gris carbón elegante
  GRIS_MEDIO: '#666666',
  GRIS_PERLA: '#E5E5E5',        // Gris perla suave
};

// Alias para facilidad de uso
export const BRAND_COLORS = {
  primary: GAEL_COLORS.GUINDO_PROFUNDO, // Guindo profundo como primario
  secondary: GAEL_COLORS.MADERA_CAOBA,  // Madera caoba como secundario
  accent: GAEL_COLORS.VERDE_OLIVA,      // Verde oliva como acento
  background: GAEL_COLORS.NEGRO,
  surface: GAEL_COLORS.BLANCO,
  text: GAEL_COLORS.CREMA,
};

// Gradientes predefinidos de marca - Elegantes y Clásicos
export const GAEL_GRADIENTS = {
  PRIMARY: `linear-gradient(135deg, ${GAEL_COLORS.MADERA_CAOBA} 0%, ${GAEL_COLORS.GUINDO_PROFUNDO} 100%)`,
  SECONDARY: `linear-gradient(90deg, ${GAEL_COLORS.MADERA_CAOBA} 0%, ${GAEL_COLORS.MADERA_CLARA} 100%)`,
  ACCENT: `linear-gradient(45deg, ${GAEL_COLORS.GUINDO_PROFUNDO} 0%, ${GAEL_COLORS.GUINDO_CLARO} 100%)`,
  HERO: `linear-gradient(135deg, ${GAEL_COLORS.NEGRO} 0%, rgba(114, 47, 55, 0.1) 50%, ${GAEL_COLORS.NEGRO} 100%)`,
  OVERLAY: `linear-gradient(0deg, rgba(114, 47, 55, 0.9) 0%, rgba(114, 47, 55, 0.3) 50%, rgba(0, 0, 0, 0.1) 100%)`,
  PROGRESS: `linear-gradient(90deg, ${GAEL_COLORS.MADERA_CAOBA} 0%, ${GAEL_COLORS.GUINDO_PROFUNDO} 100%)`,
  DIVIDER: `linear-gradient(90deg, transparent, ${GAEL_COLORS.MADERA_CAOBA}, ${GAEL_COLORS.GUINDO_PROFUNDO}, ${GAEL_COLORS.MADERA_CAOBA}, transparent)`,
  WOOD_TEXTURE: `linear-gradient(135deg, ${GAEL_COLORS.NEGRO} 0%, rgba(139, 69, 19, 0.05) 25%, ${GAEL_COLORS.NEGRO} 50%, rgba(139, 69, 19, 0.08) 75%, ${GAEL_COLORS.NEGRO} 100%)`,
};

/**
 * Convierte un color hexadecimal a RGB
 * @param {string} hex - Color en formato hexadecimal (#FFFFFF)
 * @returns {object} - Objeto con propiedades r, g, b
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Obtiene un color GAEL con opacidad especificada
 * @param {string} colorName - Nombre del color de GAEL_COLORS
 * @param {number} opacity - Opacidad entre 0 y 1
 * @returns {string} - Color en formato rgba()
 */
export function getGaelColorWithOpacity(colorName, opacity = 1) {
  if (!GAEL_COLORS[colorName]) {
    console.warn(`Color ${colorName} no encontrado en la paleta GAEL`);
    return GAEL_COLORS.NEGRO;
  }
  
  const hex = GAEL_COLORS[colorName];
  const rgb = hexToRgb(hex);
  
  if (!rgb) {
    console.warn(`No se pudo convertir el color ${hex} a RGB`);
    return hex;
  }
  
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Genera un gradiente personalizado con colores GAEL
 * @param {string} fromColor - Color inicial (nombre de GAEL_COLORS o hex)
 * @param {string} toColor - Color final (nombre de GAEL_COLORS o hex)
 * @param {number} angle - Ángulo del gradiente en grados (default: 90)
 * @returns {string} - Gradiente CSS
 */
export function createGaelGradient(fromColor, toColor, angle = 90) {
  const from = GAEL_COLORS[fromColor] || fromColor;
  const to = GAEL_COLORS[toColor] || toColor;
  
  return `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`;
}

/**
 * Genera un gradiente radial con colores GAEL
 * @param {string} centerColor - Color central
 * @param {string} outerColor - Color exterior
 * @param {string} shape - Forma del gradiente ('circle' o 'ellipse')
 * @returns {string} - Gradiente radial CSS
 */
export function createGaelRadialGradient(centerColor, outerColor, shape = 'circle') {
  const center = GAEL_COLORS[centerColor] || centerColor;
  const outer = GAEL_COLORS[outerColor] || outerColor;
  
  return `radial-gradient(${shape}, ${center} 0%, ${outer} 100%)`;
}

/**
 * Calcula el contraste relativo entre dos colores
 * @param {string} color1 - Primer color (hex)
 * @param {string} color2 - Segundo color (hex)
 * @returns {number} - Ratio de contraste (1-21)
 */
export function calculateContrastRatio(color1, color2) {
  const getLuminance = (hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Valida si dos colores tienen suficiente contraste para accesibilidad
 * @param {string} foreground - Color de texto
 * @param {string} background - Color de fondo
 * @param {string} level - Nivel WCAG ('AA' o 'AAA')
 * @returns {object} - Resultado de validación con detalles
 */
export function validateColorContrast(foreground, background, level = 'AA') {
  const fgColor = GAEL_COLORS[foreground] || foreground;
  const bgColor = GAEL_COLORS[background] || background;
  
  const ratio = calculateContrastRatio(fgColor, bgColor);
  
  const requirements = {
    'AA': { normal: 4.5, large: 3 },
    'AAA': { normal: 7, large: 4.5 }
  };
  
  const req = requirements[level] || requirements['AA'];
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    passesNormal: ratio >= req.normal,
    passesLarge: ratio >= req.large,
    level: level,
    foreground: fgColor,
    background: bgColor,
    recommendation: ratio < req.normal ? 
      'Considere usar colores con mayor contraste para mejor accesibilidad' :
      'Combinación de colores accesible'
  };
}

/**
 * Obtiene combinaciones de colores recomendadas para diferentes contextos
 */
export const GAEL_COLOR_COMBINATIONS = {
  // Combinaciones para texto sobre fondos
  TEXT_ON_DARK: {
    primary: { text: GAEL_COLORS.CREMA, background: GAEL_COLORS.NEGRO },
    accent: { text: GAEL_COLORS.DORADO, background: GAEL_COLORS.NEGRO },
    emphasis: { text: GAEL_COLORS.ROJO, background: GAEL_COLORS.NEGRO }
  },
  
  TEXT_ON_LIGHT: {
    primary: { text: GAEL_COLORS.NEGRO, background: GAEL_COLORS.CREMA },
    accent: { text: GAEL_COLORS.ROJO, background: GAEL_COLORS.CREMA },
    emphasis: { text: GAEL_COLORS.VERDE_OLIVA, background: GAEL_COLORS.CREMA }
  },
  
  // Combinaciones para botones
  BUTTONS: {
    primary: { background: GAEL_COLORS.ROJO, text: GAEL_COLORS.BLANCO },
    secondary: { background: GAEL_COLORS.DORADO, text: GAEL_COLORS.NEGRO },
    accent: { background: GAEL_COLORS.VERDE_OLIVA, text: GAEL_COLORS.BLANCO }
  },
  
  // Combinaciones para estados
  STATES: {
    success: { background: GAEL_COLORS.VERDE_OLIVA, text: GAEL_COLORS.BLANCO },
    warning: { background: GAEL_COLORS.DORADO_BRILLANTE, text: GAEL_COLORS.NEGRO },
    error: { background: GAEL_COLORS.ROJO, text: GAEL_COLORS.BLANCO },
    info: { background: GAEL_COLORS.DORADO, text: GAEL_COLORS.NEGRO }
  }
};

/**
 * Genera propiedades CSS para box-shadow con colores GAEL
 * @param {string} color - Color de la sombra
 * @param {number} opacity - Opacidad de la sombra
 * @param {number} blur - Desenfoque en px
 * @param {number} spread - Expansión en px
 * @returns {string} - Propiedad box-shadow CSS
 */
export function createGaelShadow(color, opacity = 0.3, blur = 10, spread = 0) {
  const shadowColor = GAEL_COLORS[color] || color;
  const rgb = hexToRgb(shadowColor);
  
  if (!rgb) return 'none';
  
  return `0 0 ${blur}px ${spread}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Genera múltiples sombras para efectos premium
 * @param {Array} shadows - Array de configuraciones de sombra
 * @returns {string} - Múltiples box-shadows CSS
 */
export function createGaelMultipleShadows(shadows) {
  return shadows.map(shadow => {
    const { color, opacity = 0.3, blur = 10, spread = 0, x = 0, y = 0 } = shadow;
    const shadowColor = GAEL_COLORS[color] || color;
    const rgb = hexToRgb(shadowColor);
    
    if (!rgb) return 'none';
    
    return `${x}px ${y}px ${blur}px ${spread}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  }).join(', ');
}

/**
 * Valida todas las combinaciones de colores de la marca
 * @returns {object} - Reporte completo de accesibilidad
 */
export function validateBrandAccessibility() {
  const report = {
    passed: [],
    failed: [],
    warnings: []
  };
  
  // Validar combinaciones principales
  Object.entries(GAEL_COLOR_COMBINATIONS.TEXT_ON_DARK).forEach(([name, combo]) => {
    const result = validateColorContrast(combo.text, combo.background);
    if (result.passesNormal) {
      report.passed.push({ name: `TEXT_ON_DARK.${name}`, ...result });
    } else {
      report.failed.push({ name: `TEXT_ON_DARK.${name}`, ...result });
    }
  });
  
  Object.entries(GAEL_COLOR_COMBINATIONS.BUTTONS).forEach(([name, combo]) => {
    const result = validateColorContrast(combo.text, combo.background);
    if (result.passesNormal) {
      report.passed.push({ name: `BUTTONS.${name}`, ...result });
    } else {
      report.failed.push({ name: `BUTTONS.${name}`, ...result });
    }
  });
  
  return report;
}

// Exportar funciones de utilidad comunes
export const gaelColorUtils = {
  getWithOpacity: getGaelColorWithOpacity,
  createGradient: createGaelGradient,
  createRadialGradient: createGaelRadialGradient,
  validateContrast: validateColorContrast,
  createShadow: createGaelShadow,
  createMultipleShadows: createGaelMultipleShadows,
  validateAccessibility: validateBrandAccessibility
};

// Exportación por defecto
export default {
  colors: GAEL_COLORS,
  brandColors: BRAND_COLORS,
  gradients: GAEL_GRADIENTS,
  combinations: GAEL_COLOR_COMBINATIONS,
  utils: gaelColorUtils
};