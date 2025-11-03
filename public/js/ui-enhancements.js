/* ============================================================================
   TYSUN MIKE PRODUCTIONS - UI ENHANCEMENTS
   Toast notifications, scroll effects, and micro-interactions
   ============================================================================ */

(function() {
    'use strict';
    
    // Toast notification system
    const Toast = {
        container: null,
        
        init() {
            // Create toast container if it doesn't exist
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = 'toast-container';
                this.container.style.cssText = 'position: fixed; bottom: 30px; right: 30px; z-index: 10000;';
                document.body.appendChild(this.container);
            }
        },
        
        show(message, type = 'success', duration = 4000) {
            this.init();
            
            const toast = document.createElement('div');
            toast.className = `toast ${type} fade-in-right`;
            
            const icons = {
                success: '✓',
                error: '✕',
                warning: '⚠',
                info: 'ℹ'
            };
            
            toast.innerHTML = `
                <div class="toast-content">
                    <div class="toast-icon">${icons[type] || icons.info}</div>
                    <div class="toast-message">${message}</div>
                    <button class="toast-close" aria-label="Close">×</button>
                </div>
            `;
            
            this.container.appendChild(toast);
            
            // Close button
            toast.querySelector('.toast-close').addEventListener('click', () => {
                this.remove(toast);
            });
            
            // Auto-remove
            if (duration > 0) {
                setTimeout(() => this.remove(toast), duration);
            }
            
            return toast;
        },
        
        remove(toast) {
            toast.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        },
        
        success(message, duration) {
            return this.show(message, 'success', duration);
        },
        
        error(message, duration) {
            return this.show(message, 'error', duration);
        },
        
        warning(message, duration) {
            return this.show(message, 'warning', duration);
        },
        
        info(message, duration) {
            return this.show(message, 'info', duration);
        }
    };
    
    // Scroll effects
    function initScrollEffects() {
        const nav = document.querySelector('nav');
        
        if (nav) {
            let lastScroll = 0;
            
            window.addEventListener('scroll', () => {
                const currentScroll = window.pageYOffset;
                
                if (currentScroll > 50) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }
                
                lastScroll = currentScroll;
            });
        }
    }
    
    // Intersection Observer for scroll animations
    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe elements
        document.querySelectorAll('.service-card, .package-card, .step').forEach(el => {
            observer.observe(el);
        });
    }
    
    // Form validation enhancements
    function enhanceFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            
            inputs.forEach(input => {
                // Real-time validation feedback
                input.addEventListener('blur', () => {
                    if (input.validity.valid) {
                        input.style.borderColor = 'rgba(0, 255, 200, 0.5)';
                    } else if (input.value) {
                        input.style.borderColor = '#ff4444';
                    }
                });
                
                input.addEventListener('input', () => {
                    if (input.validity.valid && input.value) {
                        input.style.borderColor = 'rgba(0, 255, 200, 0.5)';
                    } else {
                        input.style.borderColor = '';
                    }
                });
            });
        });
    }
    
    // Loading state helper
    function setLoading(element, isLoading) {
        if (isLoading) {
            element.classList.add('loading');
            element.disabled = true;
            element.dataset.originalText = element.textContent;
        } else {
            element.classList.remove('loading');
            element.disabled = false;
            if (element.dataset.originalText) {
                element.textContent = element.dataset.originalText;
            }
        }
    }
    
    // Initialize on DOM ready
    function init() {
        initScrollEffects();
        initScrollAnimations();
        enhanceFormValidation();
        
        console.log('UI enhancements initialized');
    }
    
    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expose Toast globally
    window.Toast = Toast;
    window.setLoading = setLoading;
    
})();

// Fadeout animation for toasts
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100px); }
    }
    
    @keyframes fadeInRight {
        from { opacity: 0; transform: translateX(100px); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    .fade-in-right {
        animation: fadeInRight 0.4s ease-out;
    }
`;
document.head.appendChild(style);
