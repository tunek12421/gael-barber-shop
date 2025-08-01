import React, { useState, useEffect, useRef } from 'react';
import LoadingScreen from './components/LoadingScreen';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import BarbersSection from './components/BarbersSection';
import GallerySection from './components/GallerySection';
// import TestimonialsSection from './components/TestimonialsSection';
import ContactSection from './components/ContactSection';
import BookingModal from './components/BookingModal';
import Footer from './components/Footer';
import './styles/animations.css';
import './styles/loading-effects.css';

const GaelBarberShop = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [scrollY, setScrollY] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());
  const heroRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 2500);

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      setMousePosition({ x, y });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(timeInterval);
    };
  }, []);

  const handleBooking = () => {
    if (bookingStep === 3 && formData.name && formData.email && formData.phone) {
      alert(`Estimado ${formData.name}, su reserva ha sido confirmada. Recibirá un correo de confirmación en ${formData.email}`);
      setShowBookingModal(false);
      resetBooking();
    }
  };

  const resetBooking = () => {
    setSelectedService('');
    setSelectedDate('');
    setSelectedTime('');
    setSelectedBarber('');
    setBookingStep(1);
    setFormData({ name: '', email: '', phone: '' });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute top-0 left-0 w-[600px] h-[600px] opacity-[0.03]"
          style={{
            background: 'radial-gradient(circle, white 0%, transparent 70%)',
            transform: `translate(${mousePosition.x * 50}px, ${mousePosition.y * 50}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
      </div>

      <Navigation
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        currentTime={currentTime}
        setShowBookingModal={setShowBookingModal}
      />

      <HeroSection
        scrollY={scrollY}
        setShowBookingModal={setShowBookingModal}
        heroRef={heroRef}
      />

      <ServicesSection />

      <BarbersSection />

      <GallerySection />

      {/* <TestimonialsSection /> */}

      <ContactSection setShowBookingModal={setShowBookingModal} />

      <BookingModal
        showBookingModal={showBookingModal}
        setShowBookingModal={setShowBookingModal}
        bookingStep={bookingStep}
        setBookingStep={setBookingStep}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
        selectedBarber={selectedBarber}
        setSelectedBarber={setSelectedBarber}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        formData={formData}
        setFormData={setFormData}
        handleBooking={handleBooking}
        resetBooking={resetBooking}
      />

      <Footer />
    </div>
  );
};

export default GaelBarberShop;