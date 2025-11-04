// --- IMPORTS ---
const express = require('express');
const paypal = require('@paypal/checkout-server-sdk');
const db = require('../db'); // Import your Project B database pool
const { sendConfirmationEmail } = require('../mail'); // Import your Project B mailer
const { requireAuth } = require('../middleware/requireAuth'); // Import your Project B auth middleware
const config = require('../config');

const router = express.Router();

// --- PAYPAL ENVIRONMENT SETUP ---
const payPalEnvironment = config.nodeEnv === 'production'
  ? new paypal.core.LiveEnvironment(config.paypal.clientId, config.paypal.clientSecret)
  : new paypal.core.SandboxEnvironment(config.paypal.clientId, config.paypal.clientSecret);
const payPalClient = new paypal.core.PayPalHttpClient(payPalEnvironment);

// --- ROUTES ---

/**
 * GET /api/payments/config
 * Sends the public PayPal Client ID to the frontend.
 */
router.get('/config', requireAuth, (req, res) => {
  res.json({
    success: true,
    paypalClientId: config.paypal.clientId
  });
});

/**
 * POST /api/payments/create-order
 * Creates a new PayPal order.
 */
router.post('/create-order', requireAuth, async (req, res) => {
  const { packagePrice } = req.body;

  if (!packagePrice || isNaN(parseFloat(packagePrice))) {
    return res.status(400).json({ success: false, message: 'Invalid package price.' });
  }

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: parseFloat(packagePrice).toFixed(2)
      }
    }]
  });

  try {
    const order = await payPalClient.execute(request);
    res.status(201).json({ success: true, orderID: order.result.id });
  } catch (err) {
    console.error('PayPal create order error:', err);
    res.status(500).json({ success: false, message: 'Failed to create PayPal order.' });
  }
});

/**
 * POST /api/payments/capture-order
 * Captures the payment, saves to DB, and sends confirmation email.
 */
router.post('/capture-order', requireAuth, async (req, res) => {
  const { orderID, packageName, packagePrice, consultationTime } = req.body;
  const userId = req.user.id; // From requireAuth middleware
  const userEmail = req.user.email; // From requireAuth middleware

  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await payPalClient.execute(request);
    const payment = capture.result;

    if (payment.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Payment not completed.' });
    }

    // 1. Save purchase to our database
    // Note: Your 'db.sql' file shows a 'purchases' table.
    await db.query(
      `INSERT INTO purchases (user_id, package_name, package_price, consultation_time, paypal_order_id, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, packageName, packagePrice, consultationTime, orderID, 'completed']
    );

    // 2. Send confirmation email (do not block response for this)
    sendConfirmationEmail(userEmail, {
      packageName,
      packagePrice,
      consultationTime,
      orderID
    }).catch(err => console.error('Failed to send confirmation email:', err)); // Log error but don't fail request

    res.json({ success: true, payment });

  } catch (err) {
    console.error('PayPal capture order error:', err);
    res.status(500).json({ success: false, message: 'Failed to capture payment.' });
  }
});

module.exports = router;
