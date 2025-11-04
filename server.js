import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './src/config.js';
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/users.js';
import projectRoutes from './src/routes/projects.js';
import referralRoutes from './src/routes/referrals.js';
import adminRoutes from './src/routes/admin.js';
import chatbotRoutes from './src/routes/chatbot.js';
import { apiLimiter } from './src/middleware/rateLimiter.js';
import { errorHandler, asyncHandler } from './src/middleware/errorHandler.js';

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'a-very-strong-default-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// --- API Routes ---
// All API logic is handled by the 'api.js' router
app.use('/api', apiRoutes);

// --- Page Serving ---
// Serve the main pages.
// This allows users to refresh pages like /purchase or /login
// without getting a "Cannot GET /purchase" error.

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/purchase', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'purchase.html'));
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
