// --- LOAD ENVIRONMENT VARIABLES ---
// This MUST be at the top
require('dotenv').config();

// --- IMPORTS ---
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const apiRoutes = require('./routes/api'); // Our main API logic

// --- VALIDATE ENV ---
const requiredEnv = [
  'SESSION_SECRET', 'JWT_SECRET', 'DATABASE_URL', 
  'GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REFRESH_TOKEN',
  'PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', 'GEMINI_API_KEY'
];

// Check for GMAIL_USER_EMAIL separately as it's used by Nodemailer
if (!process.env.GMAIL_USER_EMAIL) {
    console.warn('WARNING: GMAIL_USER_EMAIL is not set in .env. Email features will fail.');
}

for (const v of requiredEnv) {
  if (!process.env[v]) {
    console.error(`FATAL ERROR: Environment variable ${v} is not set.`);
    process.exit(1); // Exit if critical config is missing
  }
}

// --- APP INITIALIZATION ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE ---
// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' } // Use secure cookies in production
}));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// --- API ROUTES ---
// Main API router
app.use('/api', apiRoutes);

// New endpoint to send public, non-secret keys to the frontend
app.get('/api/config', (req, res) => {
  res.json({
    paypalClientId: process.env.PAYPAL_CLIENT_ID
  });
});

// --- HTML FALLBACK (Serve index.html for any route not matched) ---
// This handles client-side routing for SPA-like behavior
app.get('*', (req, res, next) => {
  const ext = path.extname(req.path);
  // If it's not an API call and not a file, send the appropriate HTML
  if (!ext && !req.path.startsWith('/api')) {
    if (req.path.startsWith('/login')) {
      res.sendFile(path.join(__dirname, 'public', 'login.html'));
    } else if (req.path.startsWith('/signup')) {
      res.sendFile(path.join(__dirname, 'public', 'signup.html'));
    } else if (req.path.startsWith('/dashboard')) {
      res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    } else if (req.path.startsWith('/purchase')) {
      res.sendFile(path.join(__dirname, 'public', 'purchase.html'));
    } else {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
  } else if (ext) {
    // Handle 404 for files that don't exist
    res.status(404).send('File not found');
  } else {
    // Let API 404s be handled by the router
    next();
  }
});

// --- SERVER START ---
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
