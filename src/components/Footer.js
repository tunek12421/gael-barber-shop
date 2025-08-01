import React, { useState, useCallback } from 'react';
import { 
  ChevronDown, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  Music,
  Send,
  ExternalLink,
  Shield,
  Award,
  Leaf
} from 'lucide-react';
import { footerData } from '../data/constants';
import '../styles/footer.css';

// Custom hook for responsive footer behavior
const useResponsiveFooter = () => {
  const [expandedSections, setExpandedSections] = useState(new Set());
  
  const toggleSection = useCallback((sectionId) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const isSectionExpanded = useCallback((sectionId) => {
    return expandedSections.has(sectionId);
  }, [expandedSections]);

  return { toggleSection, isSectionExpanded };
};

// Newsletter component
const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubscribed(true);
    setEmail('');
    setIsSubmitting(false);
  }, [email]);

  if (isSubscribed) {
    return (
      <div className="footer-newsletter footer-newsletter--success">
        <div className="footer-newsletter__success">
          <Send className="footer-newsletter__success-icon" />
          <p className="footer-newsletter__success-text">
            ¡Suscripción exitosa! Revisa tu email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="footer-newsletter">
      <h3 className="footer-newsletter__title">{footerData.newsletter.title}</h3>
      <p className="footer-newsletter__subtitle">{footerData.newsletter.subtitle}</p>
      
      <form onSubmit={handleSubmit} className="footer-newsletter__form">
        <div className="footer-newsletter__input-group">
          <Mail className="footer-newsletter__input-icon" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={footerData.newsletter.placeholder}
            className="footer-newsletter__input"
            required
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            className="footer-newsletter__button"
          >
            {isSubmitting ? (
              <div className="footer-newsletter__spinner" />
            ) : (
              <Send className="footer-newsletter__button-icon" />
            )}
            <span>{footerData.newsletter.buttonText}</span>
          </button>
        </div>
      </form>
      
      <div className="footer-newsletter__benefits">
        {footerData.newsletter.benefits.map((benefit, index) => (
          <span key={index} className="footer-newsletter__benefit">
            {benefit}
          </span>
        ))}
      </div>
      
      <p className="footer-newsletter__privacy">{footerData.newsletter.privacy}</p>
    </div>
  );
};

// Social links component
const SocialLinks = () => {
  const iconMap = {
    Instagram,
    Facebook,
    Twitter,
    Youtube,
    Music
  };

  return (
    <div className="footer-social">
      <h3 className="footer-social__title">{footerData.social.title}</h3>
      <div className="footer-social__grid">
        {footerData.social.platforms.map((platform) => {
          const IconComponent = iconMap[platform.icon];
          return (
            <a
              key={platform.name}
              href={platform.href}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social__link"
              aria-label={`Síguenos en ${platform.name}`}
              style={{ '--social-color': platform.color }}
            >
              <div className="footer-social__icon-wrapper">
                <IconComponent className="footer-social__icon" />
              </div>
              <div className="footer-social__info">
                <span className="footer-social__name">{platform.name}</span>
                <span className="footer-social__handle">{platform.handle}</span>
              </div>
              <ExternalLink className="footer-social__external" />
            </a>
          );
        })}
      </div>
    </div>
  );
};

// Contact info component
const ContactInfo = () => {
  const { contact } = footerData;

  return (
    <div className="footer-contact">
      <h3 className="footer-contact__title">{contact.title}</h3>
      
      <div className="footer-contact__item">
        <MapPin className="footer-contact__icon" />
        <div className="footer-contact__content">
          <span className="footer-contact__label">Dirección</span>
          <a 
            href={`https://maps.google.com/?q=${encodeURIComponent(contact.address.full)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-contact__value footer-contact__value--link"
          >
            {contact.address.street}<br />
            {contact.address.city}, {contact.address.state} {contact.address.zip}
          </a>
        </div>
      </div>
      
      <div className="footer-contact__item">
        <Phone className="footer-contact__icon" />
        <div className="footer-contact__content">
          <span className="footer-contact__label">Teléfono</span>
          <a 
            href={contact.phone.href}
            className="footer-contact__value footer-contact__value--link"
          >
            {contact.phone.display}
          </a>
        </div>
      </div>
      
      <div className="footer-contact__item">
        <Mail className="footer-contact__icon" />
        <div className="footer-contact__content">
          <span className="footer-contact__label">Email</span>
          <a 
            href={`mailto:${contact.email.primary}`}
            className="footer-contact__value footer-contact__value--link"
          >
            {contact.email.primary}
          </a>
        </div>
      </div>
      
      <div className="footer-contact__item">
        <Clock className="footer-contact__icon" />
        <div className="footer-contact__content">
          <span className="footer-contact__label">Horarios</span>
          <div className="footer-contact__hours">
            <div>{contact.hours.weekdays}</div>
            <div>{contact.hours.saturday}</div>
            <div>{contact.hours.sunday}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Navigation section component
const NavigationSection = ({ section, sectionId, isExpanded, onToggle }) => {
  return (
    <div className="footer-nav-section">
      <button
        onClick={() => onToggle(sectionId)}
        className="footer-nav-section__header"
        aria-expanded={isExpanded}
        aria-controls={`footer-nav-${sectionId}`}
      >
        <h3 className="footer-nav-section__title">{section.title}</h3>
        <ChevronDown 
          className={`footer-nav-section__chevron ${
            isExpanded ? 'footer-nav-section__chevron--expanded' : ''
          }`}
        />
      </button>
      
      <div
        id={`footer-nav-${sectionId}`}
        className={`footer-nav-section__content ${
          isExpanded ? 'footer-nav-section__content--expanded' : ''
        }`}
      >
        <ul className="footer-nav-section__list">
          {section.links.map((link) => (
            <li key={link.id}>
              <a 
                href={link.href} 
                className="footer-nav-section__link"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector(link.href)?.scrollIntoView({ 
                    behavior: 'smooth' 
                  });
                }}
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Footer = () => {
  const { toggleSection, isSectionExpanded } = useResponsiveFooter();
  
  const certificationIcons = {
    'Certificado de Calidad ISO 9001': Shield,
    'Miembro de la Asociación de Barberos de América': Award,
    'Compromiso con la Sostenibilidad': Leaf
  };

  return (
    <footer className="footer">
      {/* Main Footer Content */}
      <div className="footer__main">
        <div className="footer__container">
          {/* Company/Logo Section */}
          <div className="footer__brand">
            <div className="footer__logo">
              <h2 className="footer__logo-text">{footerData.company.logo.text}</h2>
              <p className="footer__logo-subtitle">{footerData.company.logo.subtitle}</p>
            </div>
            <p className="footer__tagline">{footerData.company.tagline}</p>
            <p className="footer__description">{footerData.company.description}</p>
          </div>

          {/* Navigation Sections */}
          <div className="footer__nav">
            {Object.entries(footerData.navigation).map(([key, section]) => (
              <NavigationSection
                key={key}
                section={section}
                sectionId={key}
                isExpanded={isSectionExpanded(key)}
                onToggle={toggleSection}
              />
            ))}
          </div>

          {/* Contact Info */}
          <div className="footer__contact-wrapper">
            <ContactInfo />
          </div>

          {/* Newsletter */}
          <div className="footer__newsletter-wrapper">
            <NewsletterSignup />
          </div>

          {/* Social Links */}
          <div className="footer__social-wrapper">
            <SocialLinks />
          </div>
        </div>
      </div>

      {/* Legal/Copyright Section */}
      <div className="footer__legal">
        <div className="footer__container">
          <div className="footer__legal-content">
            <div className="footer__copyright">
              <p>{footerData.legal.copyright}</p>
            </div>
            
            <div className="footer__legal-links">
              {footerData.legal.links.map((link) => (
                <a 
                  key={link.id} 
                  href={link.href} 
                  className="footer__legal-link"
                >
                  {link.name}
                </a>
              ))}
            </div>
            
            <div className="footer__certifications">
              {footerData.legal.certifications.map((cert, index) => {
                const IconComponent = certificationIcons[cert];
                return (
                  <div key={index} className="footer__certification">
                    {IconComponent && <IconComponent className="footer__certification-icon" />}
                    <span className="footer__certification-text">{cert}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;