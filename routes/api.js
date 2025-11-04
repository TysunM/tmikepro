const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const paypal = require('@paypal/checkout-server-sdk');

const router = express.Router();

// --- 1. DATABASE SETUP (POSTGRES) ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for many cloud Postgres providers
  }
});

// Database Initialization Function
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    // Create Purchases Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        package_name VARCHAR(255) NOT NULL,
        package_price NUMERIC(10, 2) NOT NULL,
        consultation_time TIMESTAMPTZ,
        paypal_order_id VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create Chat History Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        session_id VARCHAR(255) NOT NULL,
        role VARCHAR(10) NOT NULL, -- 'user' or 'model'
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    console.log('Database tables checked/created successfully.');
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1); // Stop server if DB init fails
  } finally {
    client.release();
  }
}
// Run DB initialization on server start
initializeDatabase();


// --- 2. MIDDLEWARE (JWT AUTH) ---
// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ isAuthenticated: false, message: 'No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ isAuthenticated: false, message: 'Invalid token.' });
    }
    req.user = user; // Add user payload to request
    next();
  });
};


// --- 3. SERVICES SETUP ---

// NODEMAILER (GMAIL)
const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GMAIL_USER_EMAIL, // The email address to send from
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
  }
});

// PAYPAL
const payPalEnvironment = process.env.NODE_ENV === 'production'
  ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
  : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
const payPalClient = new paypal.core.PayPalHttpClient(payPalEnvironment);

// GEMINI AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-09-2025' });


// --- 4. AUTHENTICATION ENDPOINTS ---

// POST /api/auth/signup
router.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, password_hash]
    );

    res.status(201).json({ success: true, user: newUser.rows[0] });
  } catch (err) {
    if (err.code === '23505') { // Unique violation
      return res.status(409).json({ success: false, message: 'User already exists.' });
    }
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: 'Server error during signup.' });
  }
});

// POST /api/auth/login
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    
    // Create JWT
    const tokenPayload = { id: user.id, email: user.email };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.json({ success: true, message: 'Login successful.', user: tokenPayload });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// GET /api/auth/status (Protected)
router.get('/auth/status', authenticateToken, (req, res) => {
  // If authenticateToken middleware passes, req.user is set
  res.json({ isAuthenticated: true, user: req.user });
});

// POST /api/auth/logout
router.post('/auth/logout', (req, res) => {
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  res.json({ success: true, message: 'Logged out successfully.' });
});


// --- 5. PAYPAL & PURCHASE ENDPOINTS ---

// POST /api/paypal/create-order (Protected)
router.post('/paypal/create-order', authenticateToken, async (req, res) => {
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

// POST /api/paypal/capture-order (Protected)
router.post('/paypal/capture-order', authenticateToken, async (req, res) => {
  const { orderID, packageName, packagePrice, consultationTime } = req.body;
  const userId = req.user.id;
  const userEmail = req.user.email;
  
  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await payPalClient.execute(request);
    const payment = capture.result;

    if (payment.status === 'COMPLETED') {
      // 1. Save purchase to our database
      await pool.query(
        `INSERT INTO purchases (user_id, package_name, package_price, consultation_time, paypal_order_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, packageName, packagePrice, consultationTime, orderID]
      );

      // 2. Send confirmation email (do not block response for this)
      sendConfirmationEmail(userEmail, packageName, packagePrice, consultationTime, orderID);

      res.json({ success: true, payment });
    } else {
      res.status(400).json({ success: false, message: 'Payment not completed.' });
    }
  } catch (err) {
    console.error('PayPal capture order error:', err);
    res.status(500).json({ success: false, message: 'Failed to capture payment.' });
  }
});

// --- 6. OTHER API ENDPOINTS ---

// POST /api/contact
router.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;
  
  const mailOptions = {
    from: `"${name}" <${email}>`, // Sender address
    to: process.env.GMAIL_USER_EMAIL, // Your receiving email
    subject: `New Contact Form Message from ${name}`,
    text: message,
    html: `<p>You have a new message from:</p>
           <p><strong>Name:</strong> ${name}</p>
           <p><strong>Email:</strong> ${email}</p>
           <p><strong>Message:</strong></p>
           <p>${message}</p>`
  };

  try {
    await mailTransporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    console.error('Contact form email error:', err);
    res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
});

// POST /api/chat (Protected)
router.post('/chat', authenticateToken, async (req, res) => {
  const { prompt, history, sessionId } = req.body;
  const userId = req.user.id;

  if (!prompt || !sessionId) {
    return res.status(400).json({ success: false, message: 'Prompt and sessionId are required.' });
  }

  try {
    // 1. Format history for Gemini
    const geminiHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    // 2. Start chat and send message
    const chat = aiModel.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const aiText = response.text();

    // 3. Save user prompt and AI response to DB
    await pool.query(
      'INSERT INTO chat_history (user_id, session_id, role, content) VALUES ($1, $2, $3, $4), ($1, $2, $5, $6)',
      [userId, sessionId, 'user', prompt, 'model', aiText]
    );

    res.json({ success: true, response: aiText });
  } catch (err) {
    console.error('Gemini chat error:', err);
    res.status(500).json({ success: false, message: 'Error communicating with AI.' });
  }
});


// --- 7. HELPER FUNCTIONS ---

async function sendConfirmationEmail(toEmail, packageName, packagePrice, consultationTime, orderID) {
  const formattedTime = new Date(consultationTime).toLocaleString('en-US', { timeZone: 'UTC' });

  const mailOptions = {
    from: `"Your Website Name" <${process.env.GMAIL_USER_EMAIL}>`,
    to: toEmail,
    subject: 'Your Purchase Confirmation',
    html: `
      <h1>Thank you for your purchase!</h1>
      <p>Here are your order details:</p>
      <ul>
        <li><strong>Package:</strong> ${packageName}</li>
        <li><strong>Price:</strong> $${packagePrice}</li>
        <li><strong>Consultation Time:</strong> ${formattedTime} (UTC)</li>
        <li><strong>Order ID:</strong> ${orderID}</li>
      </ul>
      <p>We look forward to speaking with you!</p>
    `
  };

  try {
    await mailTransporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${toEmail}`);
  } catch (err) {
    console.error(`Failed to send confirmation email to ${toEmail}:`, err);
  }
}

// --- EXPORT ROUTER ---
module.exports = router;
