import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { testimonials } from '../data/constants';
import '../styles/testimonials.css';

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % testimonials.length);
      setIsTransitioning(false);
    }, 150);
  }, [isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
      setIsTransitioning(false);
    }, 150);
  }, [isTransitioning]);

  const goToSlide = useCallback((index) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 150);
  }, [currentIndex, isTransitioning]);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section style={{ 
      padding: '100px 20px', 
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)', 
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(212, 175, 55, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }}></div>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        {/* Header */}
        <div style={{ marginBottom: '80px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginBottom: '30px',
            animation: 'fadeInUp 0.8s ease-out'
          }}>
            <div style={{ 
              height: '2px', 
              width: '60px', 
              background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
              borderRadius: '1px'
            }}></div>
            <span style={{ 
              margin: '0 30px', 
              color: '#d4af37', 
              fontWeight: '700',
              fontSize: '1.1rem',
              letterSpacing: '2px'
            }}>04</span>
            <div style={{ 
              height: '2px', 
              width: '120px', 
              background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
              borderRadius: '1px'
            }}></div>
          </div>
          
          <h2 style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', 
            fontWeight: '800', 
            marginBottom: '25px',
            letterSpacing: '3px',
            background: 'linear-gradient(135deg, #ffffff 0%, #d4af37 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'fadeInUp 0.8s ease-out 0.2s both'
          }}>
            TESTIMONIOS
          </h2>
          
          <p style={{ 
            fontSize: '1.3rem', 
            opacity: '0.9', 
            maxWidth: '650px', 
            margin: '0 auto',
            lineHeight: '1.6',
            animation: 'fadeInUp 0.8s ease-out 0.4s both'
          }}>
            La experiencia de nuestros clientes habla por sí sola
          </p>
        </div>

        {/* Decorative Quote Icon */}
        <div style={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: '0.03',
          zIndex: 0
        }}>
          <Quote size={400} />
        </div>

        {/* Navigation Controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '30px', 
          marginBottom: '60px',
          zIndex: 10,
          position: 'relative'
        }}>
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.1))',
              border: '2px solid #d4af37',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d4af37',
              cursor: isTransitioning ? 'not-allowed' : 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: 'scale(1)',
              boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)',
              backdrop: 'blur(10px)',
              opacity: isTransitioning ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!isTransitioning) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #d4af37, #b8941f)';
                e.currentTarget.style.color = '#1a1a1a';
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(212, 175, 55, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isTransitioning) {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.1))';
                e.currentTarget.style.color = '#d4af37';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(212, 175, 55, 0.3)';
              }
            }}
          >
            <ChevronLeft size={26} />
          </button>

          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.1))',
              border: '2px solid #d4af37',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d4af37',
              cursor: isTransitioning ? 'not-allowed' : 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: 'scale(1)',
              boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)',
              backdrop: 'blur(10px)',
              opacity: isTransitioning ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!isTransitioning) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #d4af37, #b8941f)';
                e.currentTarget.style.color = '#1a1a1a';
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(212, 175, 55, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isTransitioning) {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.1))';
                e.currentTarget.style.color = '#d4af37';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(212, 175, 55, 0.3)';
              }
            }}
          >
            <ChevronRight size={26} />
          </button>
        </div>

        {/* Current Testimonial */}
        <div style={{ 
          maxWidth: '900px', 
          margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(212, 175, 55, 0.05) 100%)',
          borderRadius: '30px',
          padding: '80px 60px',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          position: 'relative',
          zIndex: 5,
          transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
          opacity: isTransitioning ? 0.7 : 1,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {/* Floating Quote Icons */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '30px',
            color: '#d4af37',
            opacity: 0.2
          }}>
            <Quote size={32} />
          </div>
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '30px',
            color: '#d4af37',
            opacity: 0.2,
            transform: 'rotate(180deg)'
          }}>
            <Quote size={32} />
          </div>

          <blockquote style={{ 
            fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
            lineHeight: '1.8',
            marginBottom: '50px',
            fontStyle: 'italic',
            opacity: '0.95',
            fontWeight: '400',
            textAlign: 'center',
            position: 'relative',
            zIndex: 2
          }}>
            {testimonials[currentIndex].text}
          </blockquote>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '25px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              position: 'relative'
            }}>
              <img 
                src={testimonials[currentIndex].image}
                alt={testimonials[currentIndex].name}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #d4af37',
                  boxShadow: '0 8px 25px rgba(212, 175, 55, 0.4)'
                }}
              />
              {/* Glow effect */}
              <div style={{
                position: 'absolute',
                top: '-5px',
                left: '-5px',
                right: '-5px',
                bottom: '-5px',
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #d4af37, transparent, #d4af37)',
                opacity: 0.3,
                zIndex: -1,
                animation: 'pulse 2s ease-in-out infinite'
              }}></div>
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ 
                fontSize: '1.3rem', 
                fontWeight: '700', 
                marginBottom: '8px',
                color: '#ffffff',
                letterSpacing: '0.5px'
              }}>
                {testimonials[currentIndex].name}
              </h4>
              <p style={{ 
                opacity: '0.8', 
                marginBottom: '12px',
                fontSize: '1rem',
                color: '#d4af37',
                fontWeight: '500'
              }}>
                {testimonials[currentIndex].role}
              </p>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i < testimonials[currentIndex].rating ? '#d4af37' : 'none'}
                    color="#d4af37"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(212, 175, 55, 0.3))'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Dots Navigation */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '15px', 
          marginTop: '60px',
          position: 'relative',
          zIndex: 10
        }}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              style={{
                width: index === currentIndex ? '40px' : '16px',
                height: '16px',
                borderRadius: '8px',
                border: 'none',
                background: index === currentIndex 
                  ? 'linear-gradient(90deg, #d4af37, #b8941f)' 
                  : 'rgba(212, 175, 55, 0.3)',
                cursor: isTransitioning ? 'not-allowed' : 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: index === currentIndex ? 'scale(1.1)' : 'scale(1)',
                boxShadow: index === currentIndex 
                  ? '0 4px 15px rgba(212, 175, 55, 0.5)' 
                  : '0 2px 8px rgba(212, 175, 55, 0.2)',
                opacity: isTransitioning ? 0.5 : 1,
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!isTransitioning && index !== currentIndex) {
                  e.currentTarget.style.background = 'rgba(212, 175, 55, 0.6)';
                  e.currentTarget.style.transform = 'scale(1.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isTransitioning && index !== currentIndex) {
                  e.currentTarget.style.background = 'rgba(212, 175, 55, 0.3)';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};


export default TestimonialsSection;