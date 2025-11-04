// This script assumes main.js has already run and checked auth
// But we will double-check auth just in case.

document.addEventListener('DOMContentLoaded', () => {
  
  // --- STATE ---
  let selectedPackage = null;
  let selectedTime = null;
  let paypalClientId = null;

  // --- ELEMENT SELECTORS ---
  const steps = {
    loading: document.getElementById('step-loading'),
    schedule: document.getElementById('step-schedule'),
    payment: document.getElementById('step-payment'),
    thanks: document.getElementById('step-thanks'),
  };
  const loadingMessage = document.getElementById('loading-message');
  const calendarPicker = document.getElementById('calendar-picker');
  const scheduleError = document.getElementById('schedule-error');
  const btnToPayment = document.getElementById('btn-to-payment');
  const btnBackSchedule = document.getElementById('btn-back-schedule');
  const paymentMessage = document.getElementById('payment-message');
  const paypalButtonContainer = document.getElementById('paypal-button-container');

  // --- FUNCTIONS ---

  /**
   * Shows a specific step and hides all others
   */
  function showStep(stepName) {
    Object.values(steps).forEach(step => step.classList.remove('active'));
    if (steps[stepName]) {
      steps[stepName].classList.add('active');
    }
  }

  /**
   * Loads the PayPal SDK script dynamically
   */
  function loadPayPalSDK() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD&intent=capture`;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  /**
   * Renders the PayPal buttons
   */
  function renderPayPalButton() {
    // Clear previous button
    paypalButtonContainer.innerHTML = '';
    
    paypal.Buttons({
      // 1. Create Order on PayPal's servers
      createOrder: async (data, actions) => {
        try {
          const res = await fetch('/api/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ packagePrice: selectedPackage.price })
          });
          const orderData = await res.json();
          if (orderData.success) {
            return orderData.orderID;
          } else {
            throw new Error(orderData.message || 'Failed to create order.');
          }
        } catch (err) {
          paymentMessage.textContent = err.message;
          paymentMessage.style.display = 'block';
          return null;
        }
      },

      // 2. Capture Order on our server
      onApprove: async (data, actions) => {
        paymentMessage.textContent = 'Processing payment...';
        paymentMessage.style.display = 'block';

        try {
          const res = await fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderID: data.orderID,
              packageName: selectedPackage.name,
              packagePrice: selectedPackage.price,
              consultationTime: selectedTime
            })
          });
          const captureData = await res.json();
          
          if (captureData.success) {
            // Payment complete! Show thank you screen.
            document.getElementById('final-user-email').textContent = captureData.payment.payer.email_address;
            document.getElementById('final-order-id').textContent = captureData.payment.id;
            localStorage.removeItem('pendingPurchasePackage'); // Clean up
            showStep('thanks');
          } else {
            throw new Error(captureData.message || 'Failed to capture payment.');
          }
        } catch (err) {
          paymentMessage.textContent = err.message;
          paymentMessage.style.display = 'block';
        }
      },

      // 3. Handle Errors
      onError: (err) => {
        console.error('PayPal button error:', err);
        paymentMessage.textContent = 'An error occurred with the PayPal transaction. Please try again.';
        paymentMessage.style.display = 'block';
      }
    }).render(paypalButtonContainer);
  }

  /**
   * Main Initialization
   */
  const initialize = async () => {
    try {
      // 1. Get package info from local storage
      const pkgString = localStorage.getItem('pendingPurchasePackage');
      if (!pkgString) {
        loadingMessage.textContent = 'No package selected. Redirecting...';
        setTimeout(() => window.location.href = '/', 2000);
        return;
      }
      selectedPackage = JSON.parse(pkgString);

      // 2. Check auth status (should be authed, but double-check)
      loadingMessage.textContent = 'Verifying your session...';
      const authRes = await fetch('/api/auth/status');
      if (!authRes.ok) {
        window.location.href = '/login?redirect=purchase';
        return;
      }

      // 3. Get public config (PayPal Client ID)
      loadingMessage.textContent = 'Initializing secure payment...';
      const configRes = await fetch('/api/config');
      const config = await configRes.json();
      if (!config.paypalClientId) {
        throw new Error('Could not retrieve payment configuration.');
      }
      paypalClientId = config.paypalClientId;

      // 4. Load PayPal SDK
      loadingMessage.textContent = 'Loading payment resources...';
      await loadPayPalSDK();

      // 5. Initialize Calendar
      flatpickr(calendarPicker, {
        inline: true,
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        minDate: "today",
        minuteIncrement: 30,
        onChange: (selectedDates) => {
          if (selectedDates.length > 0) {
            selectedTime = selectedDates[0].toISOString();
            btnToPayment.disabled = false;
            scheduleError.style.display = 'none';
          } else {
            selectedTime = null;
            btnToPayment.disabled = true;
          }
        },
      });

      // 6. Show first step
      showStep('schedule');

    } catch (err) {
      console.error('Initialization failed:', err);
      loadingMessage.textContent = `Error: ${err.message}. Please refresh and try again.`;
    }
  };

  // --- EVENT LISTENERS ---
  btnToPayment.addEventListener('click', () => {
    if (!selectedTime) {
      scheduleError.textContent = 'Please select a date and time.';
      scheduleError.style.display = 'block';
      return;
    }
    
    // Populate summary
    document.getElementById('summary-package-name').textContent = selectedPackage.name;
    document.getElementById('summary-package-price').textContent = `$${selectedPackage.price}`;
    document.getElementById('summary-schedule-time').textContent = new Date(selectedTime).toLocaleString();
    
    // Render PayPal buttons *after* step is shown
    showStep('payment');
    renderPayPalButton();
  });

  btnBackSchedule.addEventListener('click', () => showStep('schedule'));

  // --- START ---
  initialize();
});
