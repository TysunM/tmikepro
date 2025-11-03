/**
 * Elite Animations & Effects Engine
 * Handles scroll reveals, parallax, smooth transitions, and interactive effects
 */

class AnimationsEngine {
  constructor() {
    this.observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };
    
    this.parallaxElements = [];
    this.scrollProgress = 0;
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    this.init();
  }

  /**
   * Initialize all animation systems
   */
  init() {
    if (this.isReducedMotion) {
      console.log('Reduced motion detected. Animations disabled.');
      return;
    }

    this.setupScrollReveal();
    this.setupParallax();
    this.setupScrollProgress();
    this.setupImageLazyLoad();
    this.setupButtonRipple();
    this.setupNavLinkUnderline();
    this.setupSmoothScroll();
  }

  /**
   * Setup Intersection Observer for scroll reveal animations
   */
  setupScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Optional: unobserve after animation to improve performance
          // observer.unobserve(entry.target);
        }
      });
    }, this.observerOptions);

    // Observe all elements with animation classes
    document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .fade-in-scale').forEach(el => {
      observer.observe(el);
    });
  }

  /**
   * Setup parallax effect on scroll
   */
  setupParallax() {
    const parallaxElements = document.querySelectorAll('.parallax-layer');
    
    if (parallaxElements.length === 0) return;

    parallaxElements.forEach(el => {
      this.parallaxElements.push({
        element: el,
        speed: parseFloat(el.dataset.speed) || 0.5
      });
    });

    window.addEventListener('scroll', () => this.updateParallax(), { passive: true });
  }

  /**
   * Update parallax positions based on scroll
   */
  updateParallax() {
    const scrollY = window.scrollY;

    this.parallaxElements.forEach(item => {
      const offset = scrollY * item.speed;
      item.element.style.transform = `translateY(${offset}px)`;
    });
  }

  /**
   * Setup scroll progress indicator
   */
  setupScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;
      progressBar.style.width = scrolled + '%';
    }, { passive: true });
  }

  /**
   * Setup lazy loading for images
   */
  setupImageLazyLoad() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            
            // Load image
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            
            // Remove lazy-load class
            img.classList.remove('lazy-load');
            
            // Unobserve
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px'
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  /**
   * Setup ripple effect on button click
   */
  setupButtonRipple() {
    document.addEventListener('click', (e) => {
      const button = e.target.closest('button, .btn, a.cta-button');
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Create ripple element
      const ripple = document.createElement('span');
      ripple.style.position = 'absolute';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.style.width = '0';
      ripple.style.height = '0';
      ripple.style.borderRadius = '50%';
      ripple.style.background = 'rgba(255, 255, 255, 0.5)';
      ripple.style.pointerEvents = 'none';
      ripple.style.animation = 'ripple 0.6s ease-out';

      button.style.position = 'relative';
      button.style.overflow = 'hidden';
      button.appendChild(ripple);

      // Remove ripple after animation
      setTimeout(() => ripple.remove(), 600);
    });
  }

  /**
   * Setup nav link underline animation
   */
  setupNavLinkUnderline() {
    const navLinks = document.querySelectorAll('a.nav-link');
    
    navLinks.forEach(link => {
      link.addEventListener('mouseenter', function() {
        this.style.color = 'var(--accent, #00FFC8)';
      });
      
      link.addEventListener('mouseleave', function() {
        this.style.color = '';
      });
    });
  }

  /**
   * Setup smooth scroll behavior
   */
  setupSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /**
   * Trigger animation on element
   */
  triggerAnimation(element, animationClass) {
    element.classList.remove(animationClass);
    // Trigger reflow to restart animation
    void element.offsetWidth;
    element.classList.add(animationClass);
  }

  /**
   * Add animation to element
   */
  addAnimation(element, animationClass) {
    element.classList.add(animationClass);
  }

  /**
   * Remove animation from element
   */
  removeAnimation(element, animationClass) {
    element.classList.remove(animationClass);
  }
}

/**
 * Initialize animations engine when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  window.animationsEngine = new AnimationsEngine();
});

/**
 * Utility: Smooth scroll to element
 */
function smoothScrollTo(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Utility: Add fade-in animation to element
 */
function addFadeInAnimation(element, direction = 'up') {
  const animationClass = `fade-in-${direction}`;
  element.classList.add(animationClass);
}

/**
 * Utility: Trigger scroll reveal for all elements
 */
function triggerScrollReveal() {
  if (window.animationsEngine) {
    window.animationsEngine.setupScrollReveal();
  }
}
