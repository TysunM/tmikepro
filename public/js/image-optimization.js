/**
 * Image Optimization Utility
 * Handles lazy loading, responsive images, and performance optimization
 */

class ImageOptimizer {
  constructor() {
    this.lazyImages = [];
    this.init();
  }

  /**
   * Initialize image optimization
   */
  init() {
    this.setupLazyLoading();
    this.optimizeBackgroundImages();
  }

  /**
   * Setup lazy loading for images using Intersection Observer
   */
  setupLazyLoading() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      this.loadAllImages();
      return;
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          this.loadImage(img);
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px',
      threshold: 0.01
    });

    // Observe all lazy images
    document.querySelectorAll('img[data-src], img[data-lazy]').forEach(img => {
      imageObserver.observe(img);
      img.classList.add('lazy-load');
    });
  }

  /**
   * Load an image
   */
  loadImage(img) {
    const src = img.dataset.src || img.dataset.lazy;
    
    if (!src) return;

    // Create a new image to preload
    const newImg = new Image();
    
    newImg.onload = () => {
      img.src = src;
      img.removeAttribute('data-src');
      img.removeAttribute('data-lazy');
      img.classList.remove('lazy-load');
      img.classList.add('loaded');
    };

    newImg.onerror = () => {
      console.error('Failed to load image:', src);
      img.classList.add('load-error');
    };

    newImg.src = src;
  }

  /**
   * Fallback: Load all images immediately
   */
  loadAllImages() {
    document.querySelectorAll('img[data-src], img[data-lazy]').forEach(img => {
      this.loadImage(img);
    });
  }

  /**
   * Optimize background images for performance
   */
  optimizeBackgroundImages() {
    const bgElements = document.querySelectorAll('[data-bg-image]');
    
    bgElements.forEach(el => {
      const imagePath = el.dataset.bgImage;
      if (!imagePath) return;

      // Preload background image
      const img = new Image();
      img.onload = () => {
        el.style.backgroundImage = `url('${imagePath}')`;
        el.classList.add('bg-loaded');
      };
      img.src = imagePath;
    });
  }

  /**
   * Get responsive image URL based on device width
   */
  getResponsiveImageUrl(basePath, width) {
    // Example: basePath = '/images/photo' -> '/images/photo-1200w.jpg'
    const extension = basePath.split('.').pop();
    const nameWithoutExt = basePath.substring(0, basePath.lastIndexOf('.'));
    return `${nameWithoutExt}-${width}w.${extension}`;
  }

  /**
   * Preload critical images
   */
  preloadCriticalImages(imagePaths) {
    imagePaths.forEach(path => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = path;
      document.head.appendChild(link);
    });
  }
}

/**
 * Initialize image optimizer when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  window.imageOptimizer = new ImageOptimizer();
});
