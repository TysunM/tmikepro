/* public/js/main.js */
document.addEventListener('DOMContentLoaded', () => {

    // --- Phase 2: On-Scroll-Reveal Animation ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.revealDelay || 0;
                setTimeout(() => {
                    entry.target.classList.add('is-visible');
                }, delay * 1000);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        revealObserver.observe(el);
    });

    // --- Phase 2: Button Click "Ripple" Animation ---
    document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

            this.appendChild(ripple);
            
            ripple.addEventListener('animationend', () => {
                ripple.remove();
            });
        });
    });

    // --- Phase 2: Image Lazy Loading ---
    // This is now native! We add the attribute to our HTML:
    // <img src="image.jpg" loading="lazy" alt="...">
    // No JS needed for modern browsers.

    // --- Phase 2: Parallax Effect (Simple CSS version) ---
    // For a more robust effect, we can use JS:
    window.addEventListener('scroll', () => {
        const parallaxSections = document.querySelectorAll('.parallax-section');
        parallaxSections.forEach(section => {
            const speed = section.dataset.parallaxSpeed || 0.5;
            const offset = window.pageYOffset;
            section.style.backgroundPositionY = `${(offset - section.offsetTop) * speed}px`;
        });
    });
    
    // --- Phase 2: Hover-Tilt Effect (using tilt.js) ---
    // To use this, we would include the tilt.js library
    // <script src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.0/vanilla-tilt.min.js"></script>
    // And then initialize it:
    // VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
    //     max: 15,
    //     speed: 400,
    //     glare: true,
    //     "max-glare": 0.5
    // });
});
