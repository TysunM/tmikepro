/**
 * ELITE INTERACTIONS - TOP 1% WEBSITE FEATURES
 * Advanced JavaScript for magnetic buttons, smooth transitions, and micro-interactions
 */

(function() {
  'use strict';

  // ============================================
  // INITIALIZATION
  // ============================================

  const EliteInteractions = {
    init() {
      this.setupMagneticButtons();
      this.setupScrollAnimations();
      this.setupCursorEffects();
      this.setupScrollProgress();
      this.setup3DTilt();
      this.setupRippleEffects();
      this.setupParallaxScroll();
      this.setupTextAnimations();
      this.setupPageTransitions();
      this.setupSmoothScroll();
      console.log('Elite interactions initialized');
    },

    // ============================================
    // MAGNETIC BUTTON EFFECT
    // ============================================

    setupMagneticButtons() {
      const buttons = document.querySelectorAll('.cta-button, .nav-cta');

      buttons.forEach(button => {
        button.classList.add('magnetic');

        button.addEventListener('mousemove', (e) => {
          const rect = button.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;

          const moveX = x * 0.3;
          const moveY = y * 0.3;

          button.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
        });

        button.addEventListener('mouseleave', () => {
          button.style.transform = 'translate(0, 0) scale(1)';
        });
      });
    },

    // ============================================
    // ADVANCED SCROLL ANIMATIONS
    // ============================================

    setupScrollAnimations() {
      const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // Trigger any child animations
            const children = entry.target.querySelectorAll('[data-reveal-delay]');
            children.forEach(child => {
              setTimeout(() => {
                child.classList.add('visible');
              }, parseInt(child.dataset.revealDelay) * 1000);
            });
          }
        });
      }, observerOptions);

      // Observe all elements with reveal classes
      document.querySelectorAll('.reveal-on-scroll, .content-section').forEach(el => {
        observer.observe(el);
      });
    },

    // ============================================
    // CURSOR TRAIL EFFECT
    // ============================================

    setupCursorEffects() {
      const trailCount = 15;
      const trails = [];

      // Create trail elements
      for (let i = 0; i < trailCount; i++) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        document.body.appendChild(trail);
        trails.push(trail);
      }

      let mouseX = 0;
      let mouseY = 0;
      let currentX = 0;
      let currentY = 0;

      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      function animateTrails() {
        const speed = 0.15;
        currentX += (mouseX - currentX) * speed;
        currentY += (mouseY - currentY) * speed;

        trails.forEach((trail, index) => {
          const nextTrail = trails[index + 1] || trails[0];
          const x = parseFloat(trail.style.left) || currentX;
          const y = parseFloat(trail.style.top) || currentY;

          trail.style.left = x + (currentX - x) * 0.3 + 'px';
          trail.style.top = y + (currentY - y) * 0.3 + 'px';
          trail.style.opacity = (trailCount - index) / trailCount;
          trail.style.transform = `translate(-50%, -50%) scale(${1 - index * 0.05})`;
        });

        requestAnimationFrame(animateTrails);
      }

      animateTrails();

      // Show trails on mouse enter
      document.addEventListener('mouseenter', () => {
        trails.forEach(trail => trail.classList.add('active'));
      });
    },

    // ============================================
    // SCROLL PROGRESS BAR
    // ============================================

    setupScrollProgress() {
      let progressBar = document.querySelector('.scroll-progress-bar');

      if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress-bar';
        document.body.appendChild(progressBar);
      }

      window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = `${scrolled}%`;
      }, { passive: true });
    },

    // ============================================
    // 3D TILT EFFECT
    // ============================================

    setup3DTilt() {
      const tiltElements = document.querySelectorAll('[data-tilt]');

      tiltElements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
          const rect = element.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotateX = (y - centerY) / 10;
          const rotateY = (centerX - x) / 10;

          element.style.setProperty('--tilt-x', `${rotateX}deg`);
          element.style.setProperty('--tilt-y', `${rotateY}deg`);
          element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        element.addEventListener('mouseleave', () => {
          element.style.setProperty('--tilt-x', '0deg');
          element.style.setProperty('--tilt-y', '0deg');
          element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
      });
    },

    // ============================================
    // RIPPLE EFFECT ON CLICK
    // ============================================

    setupRippleEffects() {
      document.addEventListener('click', (e) => {
        const target = e.target.closest('.cta-button, .service-card, .nav-cta');

        if (!target) return;

        const ripple = document.createElement('span');
        ripple.className = 'ripple';

        const rect = target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        target.classList.add('ripple-effect');
        target.appendChild(ripple);

        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    },

    // ============================================
    // ADVANCED PARALLAX SCROLL
    // ============================================

    setupParallaxScroll() {
      const parallaxElements = document.querySelectorAll('.parallax-section, [data-parallax]');

      window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;

        parallaxElements.forEach(element => {
          const speed = element.dataset.parallaxSpeed || 0.5;
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + scrolled;
          const offset = (scrolled - elementTop) * speed;

          element.style.setProperty('--parallax-offset', `${offset}px`);

          // Apply transform if it's a direct parallax element
          if (element.dataset.parallax !== undefined) {
            element.style.transform = `translateY(${offset}px)`;
          }
        });
      }, { passive: true });
    },

    // ============================================
    // TEXT ANIMATIONS
    // ============================================

    setupTextAnimations() {
      // Split text into characters for animation
      const textElements = document.querySelectorAll('.text-reveal');

      textElements.forEach(element => {
        const text = element.textContent;
        element.innerHTML = '';

        text.split('').forEach((char, index) => {
          const span = document.createElement('span');
          span.textContent = char === ' ' ? '\u00A0' : char;
          span.style.animationDelay = `${index * 0.03}s`;
          element.appendChild(span);
        });
      });

      // Observe and trigger when in view
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animating');
          }
        });
      }, { threshold: 0.5 });

      textElements.forEach(el => observer.observe(el));
    },

    // ============================================
    // PAGE TRANSITIONS
    // ============================================

    setupPageTransitions() {
      // Intercept link clicks for smooth transitions
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="/"]');

        if (!link || link.target === '_blank') return;

        const href = link.getAttribute('href');

        // Skip if it's an anchor link
        if (href.startsWith('#')) return;

        e.preventDefault();

        // Fade out
        document.body.style.opacity = '0';
        document.body.style.transform = 'translateY(-20px)';
        document.body.style.transition = 'all 0.4s ease-out';

        setTimeout(() => {
          window.location.href = href;
        }, 400);
      });

      // Fade in on load
      window.addEventListener('load', () => {
        document.body.style.opacity = '1';
        document.body.style.transform = 'translateY(0)';
      });
    },

    // ============================================
    // ENHANCED SMOOTH SCROLL
    // ============================================

    setupSmoothScroll() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          const href = this.getAttribute('href');

          if (href === '#' || href === '#!') return;

          e.preventDefault();

          const target = document.querySelector(href);
          if (!target) return;

          // Custom smooth scroll with easing
          const targetPosition = target.offsetTop - 100;
          const startPosition = window.pageYOffset;
          const distance = targetPosition - startPosition;
          const duration = 1200;
          let start = null;

          function animation(currentTime) {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const progress = Math.min(timeElapsed / duration, 1);

            // Easing function (easeInOutCubic)
            const ease = progress < 0.5
              ? 4 * progress * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            window.scrollTo(0, startPosition + distance * ease);

            if (timeElapsed < duration) {
              requestAnimationFrame(animation);
            }
          }

          requestAnimationFrame(animation);
        });
      });
    },

    // ============================================
    // PERFORMANCE MONITORING
    // ============================================

    monitorPerformance() {
      // Track FPS
      let lastTime = performance.now();
      let frames = 0;
      let fps = 60;

      function trackFPS() {
        const now = performance.now();
        frames++;

        if (now >= lastTime + 1000) {
          fps = Math.round((frames * 1000) / (now - lastTime));
          frames = 0;
          lastTime = now;

          // Reduce effects if FPS drops below 30
          if (fps < 30) {
            console.warn('Low FPS detected, optimizing animations');
            document.body.classList.add('performance-mode');
          }
        }

        requestAnimationFrame(trackFPS);
      }

      trackFPS();
    }
  };

  // ============================================
  // AUTO-INITIALIZE
  // ============================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      EliteInteractions.init();
    });
  } else {
    EliteInteractions.init();
  }

  // Expose globally for manual control
  window.EliteInteractions = EliteInteractions;

})();
