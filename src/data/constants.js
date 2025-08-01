export const services = [
  { 
    id: 1, 
    name: 'CORTE CLÁSICO', 
    price: '320 Bs', 
    duration: '30 MIN', 
    description: 'Precisión artesanal en cada detalle',
    icon: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop&q=80',
    features: ['Consulta personalizada', 'Lavado con productos de calidad', 'Masaje capilar', 'Styling profesional'],
    popular: false
  },
  { 
    id: 2, 
    name: 'CORTE & BARBA', 
    price: '450 Bs', 
    duration: '45 MIN', 
    description: 'La experiencia completa del caballero moderno',
    icon: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=400&fit=crop&q=80',
    features: ['Corte de precisión', 'Diseño de barba personalizado', 'Aceites esenciales importados', 'Hot towel treatment'],
    popular: true
  },
  { 
    id: 3, 
    name: 'EXPERIENCIA VIP', 
    price: '850 Bs', 
    duration: '90 MIN', 
    description: 'Lujo absoluto para el hombre exigente',
    icon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop&q=80',
    features: ['Servicio completo', 'Tratamiento facial exclusivo', 'Masaje relajante', 'Bebida de cortesía', 'Aromaterapia personalizada'],
    popular: false
  },
  { 
    id: 4, 
    name: 'AFEITADO REAL', 
    price: '280 Bs', 
    duration: '30 MIN', 
    description: 'La tradición del afeitado perfecto',
    icon: 'https://images.unsplash.com/photo-1553521041-d168abd31de3?w=400&h=400&fit=crop&q=80',
    features: ['Preparación con vapor', 'Navaja japonesa', 'Tres pasadas perfectas', 'After-shave artesanal'],
    popular: false
  }
];

export const barbers = [
  { 
    id: 1, 
    name: 'ALESSANDRO ROMANO', 
    title: 'Master Craftsman',
    specialty: 'Arquitecto del Estilo', 
    experience: '15 años perfeccionando el arte', 
    rating: 5,
    image: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?q=80&w=800&h=1000&fit=crop',
    awards: ['Best Barber Europe 2023', 'Master Craftsman Award', 'Style Innovator 2022'],
    skills: ['Fade Specialist', 'Beard Architecture', 'Classic Cuts', 'Creative Designs'],
    quote: 'Cada corte es una obra de arte única',
    availability: 'Martes a Sábado'
  },
  { 
    id: 2, 
    name: 'MARCUS STERLING', 
    title: 'Beard Specialist',
    specialty: 'Escultor de Barbas', 
    experience: '10 años de excelencia', 
    rating: 5,
    image: 'https://images.unsplash.com/photo-1542327897-d73f4005b533?q=80&w=800&h=1000&fit=crop',
    awards: ['Beard Champion 2022', 'Precision Award 2023'],
    skills: ['Beard Design', 'Hot Towel Expert', 'Straight Razor', 'Facial Treatments'],
    quote: 'La barba define el carácter del hombre',
    availability: 'Lunes a Viernes'
  },
  { 
    id: 3, 
    name: 'VIKTOR NOIR', 
    title: 'Style Director',
    specialty: 'Visionario del Estilo', 
    experience: '12 años de innovación', 
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&h=1000&fit=crop',
    awards: ['Innovation Award 2023', 'Trendsetter 2022'],
    skills: ['Modern Styles', 'Color Expert', 'Texture Specialist', 'Fashion Cuts'],
    quote: 'El estilo es la expresión del alma',
    availability: 'Miércoles a Domingo'
  }
];

export const testimonials = [
  {
    name: "Carlos Mendoza",
    role: "CEO, Tech Ventures",
    text: "No es simplemente un corte de pelo, es una experiencia transformadora. La atención al detalle y el profesionalismo son incomparables.",
    rating: 5,
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&q=80'
  },
  {
    name: "Roberto García",
    role: "Senior Partner, Law Firm",
    text: "Cinco años de fidelidad absoluta. Gael Barber Shop ha redefinido mi concepto de cuidado personal masculino.",
    rating: 5,
    image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=100&h=100&fit=crop&q=80'
  },
  {
    name: "Miguel Ángel Torres",
    role: "Creative Director",
    text: "La excelencia personificada. Cada visita supera mis expectativas más altas. Un santuario del estilo masculino.",
    rating: 5,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80'
  }
];

export const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '14:00', '14:30', '15:00', '15:30', '16:00',
  '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
];

export const galleryImages = [
  // CORTES CLÁSICOS -> FADE -> LOW FADE (Degradado Bajo)
  { 
    url: 'https://fadehaircut.net/wp-content/uploads/2023/10/Low-Fade-Haircut-1024x1024.jpg',
    category: 'clasicos',
    subcategory: 'fade',
    subsubcategory: 'bajo',
    service: 'Low Fade Clásico',
    description: 'Degradado bajo tradicional',
    featured: true
  },
  { 
    url: 'https://fadehaircut.net/wp-content/uploads/2023/10/Low-Taper-Fade-1024x1024.jpg',
    category: 'clasicos',
    subcategory: 'fade',
    subsubcategory: 'bajo',
    service: 'Low Taper Fade',
    description: 'Degradado bajo con taper'
  },
  { 
    url: 'https://fadehaircut.net/wp-content/uploads/2023/10/Low-Skin-Fade-1024x1024.png',
    category: 'clasicos',
    subcategory: 'fade',
    subsubcategory: 'bajo',
    service: 'Low Skin Fade',
    description: 'Degradado bajo a piel'
  },
  { 
    url: 'https://fadehaircut.net/wp-content/uploads/2023/10/Low-Bald-Fade-1024x1024.jpg',
    category: 'clasicos',
    subcategory: 'fade',
    subsubcategory: 'bajo',
    service: 'Low Bald Fade',
    description: 'Degradado bajo rapado'
  },

  // CORTES CLÁSICOS -> FADE -> MID FADE (Degradado Medio)
  { 
    url: 'https://fadehaircut.net/wp-content/uploads/2023/10/Medium-Low-Fade-1024x972.jpg',
    category: 'clasicos',
    subcategory: 'fade',
    subsubcategory: 'medio',
    service: 'Medium Low Fade',
    description: 'Degradado medio-bajo',
    featured: true
  },
  { 
    url: 'https://fadehaircut.net/wp-content/uploads/2023/10/Mid-Taper-Fade-Cut.jpg',
    category: 'clasicos',
    subcategory: 'fade',
    subsubcategory: 'medio',
    service: 'Mid Taper Fade',
    description: 'Degradado medio con taper'
  },

  // CORTES CLÁSICOS -> FADE -> HIGH FADE (Degradado Alto)
  { 
    url: 'https://fadehaircut.net/wp-content/uploads/2023/10/High-Taper-Fade-Haircut.png',
    category: 'clasicos',
    subcategory: 'fade',
    subsubcategory: 'alto',
    service: 'High Taper Fade',
    description: 'Degradado alto con taper',
    featured: true
  },
  { 
    url: 'https://fadehaircut.net/wp-content/uploads/2023/10/High-Fade-Takuache-Haircut.png',
    category: 'clasicos',
    subcategory: 'fade',
    subsubcategory: 'alto',
    service: 'High Fade Takuache',
    description: 'Estilo takuache moderno'
  },

  // CORTES CLÁSICOS -> FADE -> FADE GENERAL
  { 
    url: 'https://fadehaircut.net/wp-content/uploads/2023/10/Fade-HairCut-1-1024x1024.png',
    category: 'clasicos',
    subcategory: 'fade',
    subsubcategory: 'general',
    service: 'Fade Clásico',
    description: 'El fade tradicional perfecto',
    featured: true
  },
  { 
    url: 'https://fadehaircut.net/wp-content/uploads/2023/10/Fade-HairCut-2-1024x1024.png',
    category: 'clasicos',
    subcategory: 'fade',
    subsubcategory: 'general',
    service: 'Variaciones de Fade',
    description: 'Múltiples estilos de degradado'
  },
  { 
    url: 'https://fadehaircut.net/wp-content/uploads/2023/10/Fade-HairCut-3-1-1024x1024.png',
    category: 'clasicos',
    subcategory: 'fade',
    subsubcategory: 'general',
    service: 'Fade Moderno',
    description: 'Tendencia contemporánea'
  },

  // CORTES CLÁSICOS -> FADE -> TEXTURED FADE
  { 
    url: 'https://fadehaircut.net/wp-content/uploads/2023/10/Fade-Cut-Curly-Hair.jpg',
    category: 'clasicos',
    subcategory: 'fade',
    subsubcategory: 'texturizado',
    service: 'Curly Fade',
    description: 'Fade para cabello rizado',
    featured: true
  },
  { 
    url: 'https://fadehaircut.net/wp-content/uploads/2023/10/Wavy-Fade-Haircut-1.jpg',
    category: 'clasicos',
    subcategory: 'fade',
    subsubcategory: 'texturizado',
    service: 'Wavy Fade',
    description: 'Fade para cabello ondulado'
  },
  { 
    url: 'https://fadehaircut.net/wp-content/uploads/2023/10/Textured-Fade-Cut-1.jpg',
    category: 'clasicos',
    subcategory: 'fade',
    subsubcategory: 'texturizado',
    service: 'Textured Fade',
    description: 'Fade con textura definida'
  },
  { 
    url: 'https://fadehaircut.net/wp-content/uploads/2023/10/fluffy-fade-haircut.jpg',
    category: 'clasicos',
    subcategory: 'fade',
    subsubcategory: 'texturizado',
    service: 'Fluffy Fade',
    description: 'Fade con volumen esponjoso'
  },

  // CORTES CLÁSICOS -> FADE -> DROP FADE
  { 
    url: 'https://fadehaircut.net/wp-content/uploads/2023/10/Drop-Fade-Cut-1.jpg',
    category: 'clasicos',
    subcategory: 'fade',
    subsubcategory: 'drop',
    service: 'Drop Fade',
    description: 'Degradado con caída curva',
    featured: true
  },
  { 
    url: 'https://fadehaircut.net/wp-content/uploads/2023/10/Drop-Fade-Cut-2.jpg',
    category: 'clasicos',
    subcategory: 'fade',
    subsubcategory: 'drop',
    service: 'Drop Fade Variación',
    description: 'Estilo drop fade alternativo'
  },

  // CORTES CLÁSICOS -> UNDERCUT -> BÁSICO
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2024/01/Undercut-Haircut.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'basico',
    service: 'Undercut Clásico',
    description: 'El undercut tradicional',
    featured: true
  },
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2024/01/Short-Undercut-Men.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'basico',
    service: 'Undercut Corto',
    description: 'Undercut con cabello corto arriba'
  },
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2024/01/Medium-Hair-Undercut-Men.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'basico',
    service: 'Undercut Mediano',
    description: 'Longitud media en la parte superior'
  },
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2024/01/Long-Hair-Undercut-Men.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'basico',
    service: 'Undercut Cabello Largo',
    description: 'Undercut con cabello largo arriba'
  },

  // CORTES CLÁSICOS -> UNDERCUT -> CON FADE
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2024/01/High-Fade-Undercut-Men.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'con-fade',
    service: 'High Fade Undercut',
    description: 'Undercut con degradado alto',
    featured: true
  },
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2024/01/Undercut-Low-Fade-Men.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'con-fade',
    service: 'Low Fade Undercut',
    description: 'Undercut con degradado bajo'
  },
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2024/01/Undercut-Fade-Men.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'con-fade',
    service: 'Undercut Fade General',
    description: 'Undercut con degradado clásico'
  },

  // CORTES CLÁSICOS -> UNDERCUT -> DESCONECTADO
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2023/12/Disconnected-Undercut-Man.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'desconectado',
    service: 'Disconnected Undercut',
    description: 'Undercut desconectado marcado',
    featured: true
  },
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2024/01/Side-Part-Undercut.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'desconectado',
    service: 'Side Part Undercut',
    description: 'Undercut con raya al costado'
  },

  // CORTES CLÁSICOS -> UNDERCUT -> ESTILO RETRO
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2023/12/Pompadour-Undercut.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'retro',
    service: 'Pompadour Undercut',
    description: 'Undercut con pompadour',
    featured: true
  },
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2023/12/Slick-Back-Undercut.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'retro',
    service: 'Slick Back Undercut',
    description: 'Undercut peinado hacia atrás'
  },
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2023/12/Hard-Part-Undercut.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'retro',
    service: 'Hard Part Undercut',
    description: 'Undercut con raya marcada'
  },

  // CORTES CLÁSICOS -> UNDERCUT -> MODERNO
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2024/03/Quiff-Undercut.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'moderno',
    service: 'Quiff Undercut',
    description: 'Undercut con quiff moderno',
    featured: true
  },
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2023/12/Comb-Over-Undercut.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'moderno',
    service: 'Comb Over Undercut',
    description: 'Undercut peinado al costado'
  },
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2024/01/Comb-Over-Undercut-Hairstyle.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'moderno',
    service: 'Comb Over Undercut Variante',
    description: 'Estilo comb over alternativo'
  },

  // CORTES CLÁSICOS -> UNDERCUT -> CON TEXTURA
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2023/12/Textured-Undercut.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'texturizado',
    service: 'Textured Undercut',
    description: 'Undercut con textura definida',
    featured: true
  },
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2024/01/Medium-Messy-Undercut.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'texturizado',
    service: 'Messy Undercut',
    description: 'Undercut desestructurado'
  },
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2025/06/Curly-Undercut-Men.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'texturizado',
    service: 'Curly Undercut',
    description: 'Undercut para cabello rizado'
  },

  // CORTES CLÁSICOS -> UNDERCUT -> CABELLO RIZADO
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2024/01/Afro-Undercut.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'rizado',
    service: 'Afro Undercut',
    description: 'Undercut estilo afro',
    featured: true
  },
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2024/01/Twisted-Locs-Undercut-Hairstyle.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'rizado',
    service: 'Twisted Locs Undercut',
    description: 'Undercut con locs retorcidos'
  },

  // CORTES CLÁSICOS -> UNDERCUT -> ESTILOS ÚNICOS
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2023/12/Man-Bun-Undercut.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'unicos',
    service: 'Man Bun Undercut',
    description: 'Undercut con moño masculino',
    featured: true
  },
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2023/12/Mohawk-Undercut.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'unicos',
    service: 'Mohawk Undercut',
    description: 'Undercut estilo mohawk'
  },
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2023/12/Bowl-Cut-Undercut.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'unicos',
    service: 'Bowl Cut Undercut',
    description: 'Undercut con corte de tazón'
  },
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2024/01/Mullet-Undercut.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'unicos',
    service: 'Mullet Undercut',
    description: 'Undercut estilo mullet'
  },

  // CORTES CLÁSICOS -> UNDERCUT -> ESPECIALES
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2023/12/Curtain-Undercut.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'especiales',
    service: 'Curtain Undercut',
    description: 'Undercut con flequillo cortina',
    featured: true
  },
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2024/01/Undercut-Middle-Part-Men.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'especiales',
    service: 'Middle Part Undercut',
    description: 'Undercut con raya al medio'
  },
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2023/12/Side-Swept-Undercut.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'especiales',
    service: 'Side-Swept Undercut',
    description: 'Undercut peinado lateral'
  },
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2023/12/Spiky-Undercut.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'especiales',
    service: 'Spiky Undercut',
    description: 'Undercut con puntas'
  },

  // CORTES CLÁSICOS -> UNDERCUT -> CON DISEÑOS
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2024/01/Undercut-Design-Men.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'disenos',
    service: 'Undercut con Diseños',
    description: 'Undercut con patrones grabados',
    featured: true
  },

  // CORTES CLÁSICOS -> UNDERCUT -> ESTILIZADOS
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2023/12/Textured-Crop-Undercut.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'estilizados',
    service: 'Textured Crop Undercut',
    description: 'Undercut con crop texturizado',
    featured: true
  },
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2023/12/Tapered-Undercut.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'estilizados',
    service: 'Tapered Undercut',
    description: 'Undercut degradado suave'
  },
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2024/01/Messy-Slicked-Back-Undercut-Men.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'estilizados',
    service: 'Messy Slick Back Undercut',
    description: 'Slick back desestructurado'
  },

  // CORTES CLÁSICOS -> UNDERCUT -> CON BARBA
  { 
    url: 'https://www.thefashionisto.com/wp-content/uploads/2024/10/Wavy-Undercut-Hairstyle-Men.jpg',
    category: 'clasicos',
    subcategory: 'undercut',
    subsubcategory: 'con-barba',
    service: 'Undercut + Barba',
    description: 'Undercut ondulado con barba',
    featured: true
  },

  // CORTES CLÁSICOS -> POMPADOUR (Placeholders)
  { 
    url: 'https://images.unsplash.com/photo-1614026480577-85ac93ad1dc3?w=900&h=600&fit=crop&q=80',
    category: 'clasicos',
    subcategory: 'pompadour',
    subsubcategory: 'clasico',
    service: 'Pompadour Clásico',
    description: 'Volumen hacia arriba frontal',
    featured: true
  },

  // CORTES CLÁSICOS -> QUIFF (Placeholders)
  { 
    url: 'https://images.unsplash.com/photo-1574015974293-817f0ebebb74?w=750&h=850&fit=crop&q=80',
    category: 'clasicos',
    subcategory: 'quiff',
    subsubcategory: 'clasico',
    service: 'Quiff Clásico',
    description: 'Pompadour menos estructurado',
    featured: true
  },

  // CORTES CLÁSICOS -> SIDE PART (Placeholders)
  { 
    url: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=850&h=650&fit=crop&q=80',
    category: 'clasicos',
    subcategory: 'side-part',
    subsubcategory: 'clasico',
    service: 'Side Part Clásico',
    description: 'Raya al lado tradicional',
    featured: true
  },

  // CORTES MODERNOS -> BUZZ CUT (Placeholders)
  { 
    url: 'https://fadehaircut.net/wp-content/uploads/2023/10/Fade-Buzz-Cut-1-683x1024.png',
    category: 'modernos',
    subcategory: 'buzz-cut',
    subsubcategory: 'clasico',
    service: 'Buzz Cut',
    description: 'Muy corto en toda la cabeza',
    featured: true
  },

  // CORTES MODERNOS -> CREW CUT (Placeholders)
  { 
    url: 'https://images.unsplash.com/photo-1594736797933-d0d39b4e5db0?w=650&h=850&fit=crop&q=80',
    category: 'modernos',
    subcategory: 'crew-cut',
    subsubcategory: 'clasico',
    service: 'Crew Cut',
    description: 'Corto con algo más de largo arriba',
    featured: true
  },

  // CORTES MODERNOS -> TEXTURED CROP (Placeholders)
  { 
    url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&h=600&fit=crop&q=80',
    category: 'modernos',
    subcategory: 'textured-crop',
    subsubcategory: 'clasico',
    service: 'Textured Crop',
    description: 'Corte texturizado desestructurado',
    featured: true
  },

  // CORTES MODERNOS -> FRENCH CROP (Placeholders)
  { 
    url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=850&h=650&fit=crop&q=80',
    category: 'modernos',
    subcategory: 'french-crop',
    subsubcategory: 'clasico',
    service: 'French Crop',
    description: 'Flequillo hacia adelante',
    featured: true
  },

  // CORTES MODERNOS -> MAN BUN (Placeholders)
  { 
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=700&fit=crop&q=80',
    category: 'modernos',
    subcategory: 'man-bun',
    subsubcategory: 'clasico',
    service: 'Man Bun',
    description: 'Cabello largo recogido',
    featured: true
  }
];

// Footer Data Structure
export const footerData = {
  company: {
    name: 'GAEL BARBER SHOP',
    tagline: 'EST. 2025 • EXCELLENCE IN EVERY DETAIL',
    description: 'Redefiniendo el lujo masculino desde 2025. Experiencias excepcionales en un ambiente de distinción y elegancia.',
    logo: {
      text: 'GAEL BARBER SHOP',
      subtitle: 'Barbería de Calidad'
    }
  },
  
  navigation: {
    services: {
      title: 'Servicios',
      links: [
        { name: 'Corte Clásico', href: '#servicios', id: 'corte' },
        { name: 'Afeitado Real', href: '#servicios', id: 'afeitado' },
        { name: 'Tratamiento Capilar', href: '#servicios', id: 'tratamiento' },
        { name: 'Experiencia VIP', href: '#servicios', id: 'vip' },
        { name: 'Paquetes Especiales', href: '#servicios', id: 'paquetes' }
      ]
    },
    company: {
      title: 'Nosotros',
      links: [
        { name: 'Nuestro Equipo', href: '#barberos', id: 'team' },
        { name: 'Historia', href: '#historia', id: 'history' },
        { name: 'Filosofía', href: '#filosofia', id: 'philosophy' },
        { name: 'Testimonios', href: '#testimonios', id: 'testimonials' },
        { name: 'Galería', href: '#galeria', id: 'gallery' }
      ]
    },
    support: {
      title: 'Soporte',
      links: [
        { name: 'Reservar Cita', href: '#reservar', id: 'booking' },
        { name: 'Política de Cancelación', href: '#politicas', id: 'cancellation' },
        { name: 'Gift Cards', href: '#gift-cards', id: 'gifts' },
        { name: 'Programa de Lealtad', href: '#loyalty', id: 'loyalty' },
        { name: 'FAQ', href: '#faq', id: 'faq' }
      ]
    }
  },
  
  contact: {
    title: 'Contacto',
    address: {
      street: 'Av. San Martín 1234',
      city: 'Santa Cruz',
      state: 'Santa Cruz',
      zip: '',
      country: 'Bolivia',
      full: 'Av. San Martín 1234, Santa Cruz, Bolivia'
    },
    phone: {
      primary: '+591 3 345-7890',
      display: '3 345-7890',
      href: 'tel:+59133457890'
    },
    email: {
      primary: 'contact@gaelbarber.com',
      reservations: 'reservas@gaelbarber.com',
      support: 'soporte@gaelbarber.com'
    },
    hours: {
      weekdays: 'Lun - Vie: 9:00 AM - 8:00 PM',
      saturday: 'Sábado: 8:00 AM - 6:00 PM',
      sunday: 'Domingo: 10:00 AM - 4:00 PM'
    }
  },
  
  social: {
    title: 'Síguenos',
    platforms: [
      {
        name: 'Instagram',
        href: 'https://instagram.com/gaelbarber',
        icon: 'Instagram',
        handle: '@gaelbarber',
        color: '#E4405F'
      },
      {
        name: 'Facebook',
        href: 'https://facebook.com/gaelbarber',
        icon: 'Facebook',
        handle: 'Gael Barber Shop',
        color: '#1877F2'
      },
      {
        name: 'Twitter',
        href: 'https://twitter.com/gaelbarber',
        icon: 'Twitter',
        handle: '@gaelbarber',
        color: '#1DA1F2'
      },
      {
        name: 'TikTok',
        href: 'https://tiktok.com/@gaelbarber',
        icon: 'Music',
        handle: '@gaelbarber',
        color: '#FF0050'
      },
      {
        name: 'YouTube',
        href: 'https://youtube.com/gaelbarber',
        icon: 'Youtube',
        handle: 'Gael Barber Shop',
        color: '#FF0000'
      }
    ]
  },
  
  newsletter: {
    title: 'Newsletter Exclusivo',
    subtitle: 'Ofertas especiales y tips de grooming',
    placeholder: 'Tu email...',
    buttonText: 'Suscribirse',
    privacy: 'Respetamos tu privacidad. Sin spam.',
    benefits: [
      'Descuentos exclusivos',
      'Tips de grooming',
      'Nuevos servicios',
      'Eventos especiales'
    ]
  },
  
  legal: {
    copyright: '© 2025 Gael Barber Shop. Todos los derechos reservados.',
    links: [
      { name: 'Política de Privacidad', href: '/privacidad', id: 'privacy' },
      { name: 'Términos de Servicio', href: '/terminos', id: 'terms' },
      { name: 'Política de Cookies', href: '/cookies', id: 'cookies' },
      { name: 'Política de Reembolso', href: '/reembolso', id: 'refund' }
    ],
    certifications: [
      'Certificado de Calidad ISO 9001',
      'Miembro de la Asociación de Barberos de América',
      'Compromiso con la Sostenibilidad'
    ]
  }
};