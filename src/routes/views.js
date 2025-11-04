const express = require('express');
const path = require('path');
const { requireAuth } = require('../middleware/requireAuth');
const { requireAdmin } = require('../middleware/requireAdmin');

const router = express.Router();

// Define the project root, which is two levels up from /src/routes
const projectRoot = path.join(__dirname, '..', '..');

/**
 * Helper function to send an HTML page from the 'views' directory.
 * This avoids repeating the path.join logic for every route.
 * @param {string} pageName - The name of the HTML file (without .html)
 */
const sendPage = (pageName) => (req, res) => {
  res.sendFile(path.join(projectRoot, 'views', `${pageName}.html`));
};

// --- Public View Routes ---
router.get('/', sendPage('index'));
router.get('/login', sendPage('login'));
router.get('/signup', sendPage('signup'));

// --- Authenticated View Routes ---
// These routes use the 'requireAuth' middleware to protect them.
router.get('/dashboard', requireAuth, sendPage('dashboard'));
router.get('/purchase', requireAuth, sendPage('purchase'));

// --- Admin-Only View Route ---
// This route uses both 'requireAuth' and 'requireAdmin' middleware.
router.get('/admin', requireAuth, requireAdmin, sendPage('admin'));

// Handle 404 for any other GET request not caught by API or view routes
// This should be the last 'GET' route.
router.get('*', sendPage('404'));

module.exports = router;
