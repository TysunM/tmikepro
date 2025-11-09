// Modern Website Interactions
(function() {
  'use strict';

  // Mobile Menu Toggle
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenu.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Scroll-based Header
  const header = document.querySelector('.main-header');
  let lastScroll = 0;

  if (header) {
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    }, { passive: true });
  }

  // Intersection Observer for Fade-in Animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  // Observe all fade-in elements
  document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right').forEach(el => {
    observer.observe(el);
  });

  // Scroll Indicators
  const scrollIndicators = document.querySelectorAll('.scroll-indicator');
  const sections = document.querySelectorAll('.full-section');

  function updateActiveIndicator() {
    const scrollPosition = window.scrollY + window.innerHeight / 2;

    sections.forEach((section, index) => {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        scrollIndicators.forEach(indicator => indicator.classList.remove('active'));
        if (scrollIndicators[index]) {
          scrollIndicators[index].classList.add('active');
        }
      }
    });
  }

  window.addEventListener('scroll', updateActiveIndicator);
  updateActiveIndicator();

  // Scroll indicator click navigation
  scrollIndicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      if (sections[index]) {
        sections[index].scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Parallax Effect
  const parallaxSections = document.querySelectorAll('.parallax-bg .bg-image');

  function parallaxScroll() {
    parallaxSections.forEach(section => {
      const scrolled = window.pageYOffset;
      const sectionTop = section.parentElement.offsetTop;
      const rate = (scrolled - sectionTop) * 0.3;
      section.style.transform = `translateY(${rate}px) scale(1.1)`;
    });
  }

  window.addEventListener('scroll', () => {
    requestAnimationFrame(parallaxScroll);
  });

  // Smooth Scroll for Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Founder Video Button (Placeholder)
  const founderVideoBtn = document.getElementById('founderVideoBtn');
  if (founderVideoBtn) {
    founderVideoBtn.addEventListener('click', () => {
      alert('Founder video feature coming soon! This would open a video modal showcasing Tysun Mike Lynch discussing the vision and mission of Tysun Mike Productions.');
    });
  }

  // Dynamic Text Animation on Hero
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    heroTitle.style.opacity = '0';
    heroTitle.style.transform = 'translateY(50px)';
    
    setTimeout(() => {
      heroTitle.style.transition = 'all 1s ease';
      heroTitle.style.opacity = '1';
      heroTitle.style.transform = 'translateY(0)';
    }, 200);
  }

  // Package Card Hover Effects
  const packageCards = document.querySelectorAll('.package-card');
  packageCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });

  // Service Item Animation
  const serviceItems = document.querySelectorAll('.service-item');
  serviceItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
      this.querySelector('.service-number').style.color = 'var(--text)';
      this.querySelector('.service-content h3').style.color = 'var(--accent)';
    });
    
    item.addEventListener('mouseleave', function() {
      this.querySelector('.service-number').style.color = 'var(--accent)';
      this.querySelector('.service-content h3').style.color = 'var(--text)';
    });
  });

  // Loading Animation
  window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
      document.body.style.transition = 'opacity 0.5s ease';
      document.body.style.opacity = '1';
    }, 100);
  });

  // Testimonial Slider (Simple Version)
  const testimonials = [
    {
      text: "Tysun took my music to another level. The mix was clean, professional, and exactly what I envisioned. 10/10 would recommend!",
      author: "Independent Hip-Hop Artist"
    },
    {
      text: "The attention to detail and commitment to excellence is unmatched. My tracks have never sounded better!",
      author: "R&B Singer"
    },
    {
      text: "Not only did Tysun deliver an incredible mix, but the whole process was smooth and professional. True expertise!",
      author: "Music Producer"
    }
  ];

  let currentTestimonial = 0;
  const testimonialText = document.querySelector('.testimonial-text');
  const testimonialAuthor = document.querySelector('.testimonial-author');

  function rotateTestimonial() {
    if (testimonialText && testimonialAuthor) {
      currentTestimonial = (currentTestimonial + 1) % testimonials.length;
      
      testimonialText.style.opacity = '0';
      testimonialAuthor.style.opacity = '0';
      
      setTimeout(() => {
        testimonialText.textContent = `"${testimonials[currentTestimonial].text}"`;
        testimonialAuthor.textContent = `— ${testimonials[currentTestimonial].author}`;
        
        testimonialText.style.transition = 'opacity 0.5s ease';
        testimonialAuthor.style.transition = 'opacity 0.5s ease';
        testimonialText.style.opacity = '1';
        testimonialAuthor.style.opacity = '1';
      }, 300);
    }
  }

  // Rotate testimonials every 6 seconds
  setInterval(rotateTestimonial, 6000);

  // Stats Counter Animation
  const statNumbers = document.querySelectorAll('.stat-number');
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        const target = entry.target;
        const text = target.textContent;
        const number = parseInt(text.replace(/\D/g, ''));
        const suffix = text.replace(/[0-9]/g, '');
        
        if (number) {
          animateNumber(target, 0, number, 2000, suffix);
          target.dataset.counted = 'true';
        }
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(stat => {
    statsObserver.observe(stat);
  });

  function animateNumber(element, start, end, duration, suffix) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        element.textContent = end + suffix;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current) + suffix;
      }
    }, 16);
  }

  // Performance Optimization: Throttle Scroll Events
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Apply throttling to scroll events
  window.addEventListener('scroll', throttle(() => {
    updateActiveIndicator();
  }, 100));

  console.log('✨ Modern UI initialized successfully');
})();
