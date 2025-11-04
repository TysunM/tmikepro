// --- LOAD ENVIRONMENT VARIABLES ---
require('dotenv').config();

// --- IMPORTS ---
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg'); // Import Pool
const helmet = require('helmet');
const cors = require('cors');

// --- IMPORT LOCAL MODULES (Project B Structure) ---
const config = require('./src/config');
const db = require('./src/db'); // This file should handle its own connection
const errorHandler = require('./src/middleware/errorHandler');

// Import All Routes from src/routes/
const viewRoutes = require('./src/routes/views');
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const projectRoutes = require('./src/routes/projects');
const referralRoutes = require('./src/routes/referrals');
const adminRoutes = require('./src/routes/admin');
const chatbotRoutes = require('./src/routes/chatbot');
const paymentRoutes = require('./src/routes/payments'); // --- ADDED THIS LINE ---

// --- APP INITIALIZATION ---
const app = express();
const PORT = config.port || 3000;

// --- DATABASE TEST (Optional but recommended) ---
// Test the database connection from src/db.js
(async () => {
  try {
    const client = await db.connect(); // Use the pool from db.js
    console.log('PostgreSQL connected successfully.');
    client.release();
  } catch (err) {
    console.error('Failed to connect to PostgreSQL:', err.message);
    process.exit(1);
  }
})();


// --- CORE MIDDLEWARE ---
// Set security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "https://cdn.tailwindcss.com", "https://js.stripe.com", "https://www.paypal.com"], // Allow scripts from self, tailwind, stripe, paypal
      "frame-src": ["'self'", "https://js.stripe.com", "https://www.paypal.com"], // Allow frames for Stripe and PayPal
    },
  },
}));
// Enable CORS for all routes (you can restrict this in production)
app.use(cors());
// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Cookie parser
app.use(cookieParser());

// --- STATIC FILES ---
// Serve static files (CSS, client-side JS, images) from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// --- API ROUTES (Project B) ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/payments', paymentRoutes); // --- ADDED THIS LINE ---

// --- VIEW ROUTES (Project B) ---
// These routes serve your HTML pages from the 'views' directory
app.use('/', viewRoutes);

// --- ERROR HANDLING ---
// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});
// Global error handler (must be last)
app.use(errorHandler);

// --- SERVER START ---
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
