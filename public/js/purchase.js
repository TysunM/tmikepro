!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Your Purchase - Tysun Mike Productions</title>
    
    <!-- Site Styles -->
    <link rel="stylesheet" href="/css/modern.css">
    
    <!-- NEW: Flatpickr (Calendar) Styles -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    
    <!-- NEW: Stripe.js -->
    <script src="https://js.stripe.com/v3/"></script>
    
    <!-- NEW: Flatpickr (Calendar) JS -->
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>

    <style>
        /* Styles specific to the purchase page */
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #000;
            color: #fff;
        }
        .purchase-container {
            width: 100%;
            max-width: 600px;
            background-color: #1a1a1a;
            padding: 2rem 3rem;
            border-radius: 10px;
            border: 1px solid #333;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .purchase-step {
            display: none; /* Hide all steps by default */
        }
        .purchase-step.active {
            display: block; /* Show only the active step */
        }
        .step-title {
            font-family: 'Krazynights', sans-serif;
            color: var(--gold-color);
            font-size: 2.5rem;
            margin-bottom: 1.5rem;
            text-align: center;
        }
        .step-loading-spinner {
            display: none;
            width: 50px;
            height: 50px;
            border: 5px solid #555;
            border-top: 5px solid var(--gold-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 2rem auto;
        }
        .step-loading-spinner.active {
            display: block;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .purchase-button {
            background: var(--gold-gradient);
            color: #000;
            font-weight: bold;
            padding: 12px 20px;
            border-radius: 5px;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            text-transform: uppercase;
            width: 100%;
            margin-top: 1.5rem;
            transition: all 0.3s ease;
        }
        .purchase-button:hover {
            opacity: 0.9;
            box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
        }
        .purchase-button:disabled {
            background: #555;
            cursor: not-allowed;
        }

        /* Calendar Styles */
        .calendar-container {
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #444;
        }

        /* Stripe Payment Element Styles */
        #payment-element {
            margin-bottom: 24px;
        }
        #payment-message {
            color: #ff4d4d;
            font-size: 0.9rem;
            margin-top: 10px;
            display: none; /* Hidden by default */
        }
        
        /* Confirmation & Thank You Step */
        .summary-box {
            background: #222;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #444;
        }
        .summary-box p {
            font-size: 1.1rem;
            line-height: 1.6;
            margin: 10px 0;
        }
        .summary-box strong {
            color: var(--gold-color);
            margin-right: 10px;
        }
        .thank-you-icon {
            font-size: 4rem;
            color: #28a745;
            text-align: center;
            display: block;
            margin-bottom: 1.5rem;
        }

    </style>
</head>
<body>

    <div class="purchase-container">

        <!-- ===== STEP 0: LOADING ===== -->
        <div class="purchase-step active" id="step-loading">
            <h2 class="step-title">Loading...</h2>
            <div class="step-loading-spinner active"></div>
            <p id="loading-message" style="text-align: center;">Authenticating your session...</p>
        </div>

        <!-- ===== STEP 1: SCHEDULING ===== -->
        <div class="purchase-step" id="step-schedule">
            <h2 class="step-title">1. Schedule Consultation</h2>
            <p style="text-align: center; margin-bottom: 1.5rem;">Select a date and time for your project consultation. Times are shown in your local timezone.</p>
            <div class="calendar-container">
                <input type="text" id="calendar-picker" placeholder="Select a date and time..." style="display:none;">
            </div>
            <p id="schedule-error" style="color: #ff4d4d; text-align: center; margin-top: 10px; display: none;"></p>
            <button class="purchase-button" id="btn-to-payment" disabled>Next: Payment</button>
        </div>

        <!-- ===== STEP 2: PAYMENT ===== -->
        <div class="purchase-step" id="step-payment">
            <h2 class="step-title">2. Secure Payment</h2>
            <form id="payment-form">
                <!-- Stripe.js will inject the Payment Element here -->
                <div id="payment-element"></div>
                
                <button class="purchase-button" disabled id="btn-submit-payment">
                    <span id="button-text">Pay Now</span>
                    <span id="spinner" style="display: none;">Processing...</span>
                </button>
                
                <!-- Used to display form errors -->
                <div id="payment-message" role="alert"></div>
            </form>
            <button class="purchase-button" id="btn-back-schedule" style="background: #444; margin-top: 10px;">Back to Scheduling</button>
        </div>

        <!-- ===== STEP 3: CONFIRMATION (YOUR "ACCEPT" WINDOW) ===== -->
        <div class="purchase-step" id="step-confirm">
            <h2 class="step-title">3. Confirm Purchase</h2>
            <div class="summary-box">
                <p>You are about to purchase the following package:</p>
                <p><strong>Package:</strong> <span id="confirm-package-name">...</span></p>
                <p><strong>Price:</strong> $<span id="confirm-package-price">...</span></p>
                <p><strong>Consultation:</strong> <span id="confirm-schedule-time">...</span></p>
            </div>
            <p style="font-size: 0.9rem; color: #999; margin-top: 1rem;">
                By clicking "Accept & Complete", you agree to our terms of service and confirm your consultation time. A receipt will be emailed to you.
            </p>
            <div class="step-loading-spinner" id="confirm-spinner"></div>
            <button class="purchase-button" id="btn-confirm-purchase">Accept & Complete Purchase</button>
            <button class="purchase-button" id="btn-back-payment" style="background: #444; margin-top: 10px;">Back to Payment</button>
        </div>

        <!-- ===== STEP 4: THANK YOU ===== -->
        <div class="purchase-step" id="step-thanks">
            <h2 class="step-title">Thank You!</h2>
            <div class="summary-box" style="text-align: center;">
                <span class="thank-you-icon">&#10003;</span>
                <p>Your purchase is complete!</p>
                <p style="font-size: 1rem;">Tysun will be contacting you soon with an email to follow up on your consultation.</p>
                <p style="font-size: 1rem;">Order details have been sent to: <strong id="final-user-email">...</strong></p>
            </div>
            <a href="/dashboard" class="purchase-button" style="text-align:center; text-decoration: none; display:block; margin-top: 1.5rem;">Go to Your Dashboard</a>
        </div>

    </div>

    <!-- Purchase Flow Logic -->
    <script src="/js/purchase.js"></script>

</body>
</html>

