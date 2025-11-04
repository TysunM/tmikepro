document.addEventListener('DOMContentLoaded', () => {
    
    // --- Page Loader ---
    const loader = document.getElementById('loader-wrapper');
    const mainContent = document.getElementById('main-content');
    
    window.addEventListener('load', () => {
        if (loader) {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
        }
        if (mainContent) {
            mainContent.style.visibility = 'visible';
            mainContent.style.opacity = '1'; /* You can add opacity transition in CSS */
        }
    });
    
    // Fallback if load event is slow
    setTimeout(() => {
        if (loader) {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
        }
        if (mainContent) {
            mainContent.style.visibility = 'visible';
            mainContent.style.opacity = '1';
        }
    }, 2000);

    // --- Authentication State ---
    const loginLink = document.getElementById('login-link');
    const signupLink = document.getElementById('signup-link');
    const dashboardLink = document.getElementById('dashboard-link');
    const logoutLink = document.getElementById('logout-link');

    // Check auth status
    fetch('/api/users/check-auth')
        .then(res => res.json())
        .then(data => {
            if (data.isAuthenticated) {
                if (loginLink) loginLink.style.display = 'none';
                if (signupLink) signupLink.style.display = 'none';
                if (dashboardLink) dashboardLink.style.display = 'block';
                if (logoutLink) logoutLink.style.display = 'block';
            } else {
                if (loginLink) loginLink.style.display = 'block';
                if (signupLink) signupLink.style.display = 'block';
                if (dashboardLink) dashboardLink.style.display = 'none';
                if (logoutLink) logoutLink.style.display = 'none';
            }
        })
        .catch(err => {
            console.error('Error checking auth status:', err);
            // Show default state (logged out)
            if (loginLink) loginLink.style.display = 'block';
            if (signupLink) signupLink.style.display = 'block';
            if (dashboardLink) dashboardLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'none';
        });

    // Logout functionality
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            fetch('/api/auth/logout', { method: 'POST' })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = '/';
                    }
                })
                .catch(err => console.error('Logout failed:', err));
        });
    }

    // --- Contact Form ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            if (formStatus) formStatus.textContent = 'Sending...';
            
            // NOTE: This assumes you have a /api/contact endpoint
            // This is a mock-up, replace with your actual endpoint
            fetch('/api/contact', { // <--- CREATE THIS ENDPOINT IN server.js
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            .then(res => res.json())
            .then(response => {
                if (response.success) {
                    if (formStatus) {
                        formStatus.textContent = 'Message sent successfully!';
                        formStatus.style.color = 'green';
                    }
                    contactForm.reset();
                } else {
                    if (formStatus) {
                        formStatus.textContent = response.message || 'An error occurred.';
                        formStatus.style.color = 'red';
                    }
                }
            })
            .catch(err => {
                if (formStatus) {
                    formStatus.textContent = 'An error occurred. Please try again.';
                    formStatus.style.color = 'red';
                }
                console.error('Contact form error:', err);
            })
            .finally(() => {
                setTimeout(() => {
                    if (formStatus) formStatus.textContent = '';
                }, 5000);
            });
        });
    }

    // --- NEW: Purchase Button Click Handler (Task 3) ---
    const purchaseButtons = document.querySelectorAll('.purchase-btn');
    
    purchaseButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            const packageName = button.dataset.packageName;
            const packagePrice = button.dataset.packagePrice;
            
            if (packageName && packagePrice) {
                // Store package info in localStorage to retrieve on the purchase page
                const purchaseData = {
                    name: packageName,
                    price: packagePrice,
                    timestamp: new Date().getTime() // Add timestamp for potential expiry
                };
                
                try {
                    localStorage.setItem('pendingPurchase', JSON.stringify(purchaseData));
                    // Redirect to the new purchase page
                    window.location.href = '/purchase';
                } catch (error) {
                    console.error("Error saving to localStorage", error);
                    // Handle private browsing or full localStorage
                    alert("Could not initiate purchase. Please ensure cookies and site data are enabled.");
                }
            } else {
                console.error("Purchase button is missing data attributes", button);
                alert("An error occurred. Could not get package details.");
            }
        });
    });

});
