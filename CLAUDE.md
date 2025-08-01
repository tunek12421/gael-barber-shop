# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based website for "Gael Barber Shop" - a premium barbershop/barber shop. It's a single-page application (SPA) built with Create React App that showcases services, barbers, gallery, testimonials, and includes a booking system.

## Technology Stack

- **Frontend Framework**: React 19.1.0 with functional components and hooks
- **Styling**: Tailwind CSS 4.1.11 (loaded via CDN in public/index.html)
- **Icons**: Lucide React
- **Build Tool**: Create React App (react-scripts 5.0.1)
- **Testing**: Jest with React Testing Library

## Common Commands

### Development
```bash
npm start          # Start development server (localhost:3000)
npm test           # Run tests in watch mode  
npm run build      # Create production build
npm run eject      # Eject from Create React App (one-way operation)
```

### Package Management
```bash
npm install        # Install dependencies
npm ci             # Clean install from package-lock.json
```

## Architecture & Code Structure

### Main Application Structure
- **App.js**: Main orchestrator component with global state management
- **index.js**: Standard React app entry point
- **index.css**: Global styles (Tailwind base)
- **src/components/**: Modular React components
- **src/data/**: Data constants and configuration
- **src/styles/**: CSS files for animations and custom styles

### Component Architecture
The app is built with modular components:

**Main Components:**
1. **LoadingScreen**: Animated loading experience
2. **Navigation**: Fixed header with mobile menu
3. **HeroSection**: Landing area with parallax effects
4. **ServicesSection**: Service offerings grid
5. **BarbersSection**: Team member profiles  
6. **GallerySection**: Portfolio with filtering
7. **TestimonialsSection**: Customer reviews carousel
8. **ContactSection**: Location and contact info
9. **BookingModal**: Multi-step reservation system
10. **Footer**: Site footer

**Data Structure:**
- **src/data/constants.js**: All static data (services, barbers, testimonials, gallery images, time slots)

### State Management
- **Global State**: Managed in App.js and passed down as props
- **Local State**: Individual components manage their own state where appropriate
- Uses React hooks: `useState`, `useEffect`, `useRef`

### Styling Approach
- Tailwind CSS utility classes
- Inline styles for dynamic/calculated values
- **src/styles/animations.css**: Custom animations and scrollbar styles
- Responsive design with mobile-first approach

### Key Features
- **Booking System**: 3-step reservation flow (service selection → date/time → contact info)
- **Interactive Elements**: Parallax effects, hover animations, scroll-triggered navbar
- **Gallery Filtering**: Dynamic content filtering by service type
- **Testimonial Carousel**: Auto-rotating customer reviews
- **Loading Screen**: Animated loading experience

## Development Notes

### Component Structure
The application has been refactored into modular components for better maintainability, reusability, and development experience. Each component has a single responsibility and clear props interface.

### Data Structure
All static data has been extracted to `src/data/constants.js` for easier maintenance and potential future API integration.

### Tailwind Configuration
Tailwind is loaded via CDN rather than being properly configured as a build dependency. The project has Tailwind in devDependencies but no configuration files.

### Testing
Standard CRA testing setup with React Testing Library and Jest is configured but no custom tests are present.

## Browser Compatibility
Targets modern browsers as specified in package.json browserslist configuration.