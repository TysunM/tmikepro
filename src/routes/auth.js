import express from 'express';
import { createUser, authenticate } from '../auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { q } from '../db.js';
import { sendMail } from '../mail.js';
import { isValidEmail, validatePassword, sanitizeInput } from '../utils/validation.js';
import { authLimiter } from '../middleware/rateLimiter.js';
const router = express.Router();

// Apply strict rate limiting to authentication endpoints
router.post('/signup', authLimiter, asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    return res.status(400).json({ error: passwordCheck.message });
  }
  
  const sanitizedName = sanitizeInput(name || '');
  try {
    const user = await createUser(email.toLowerCase().trim(), password, sanitizedName);
    await q('INSERT INTO loyalty(user_id) VALUES($1) ON CONFLICT (user_id) DO NOTHING', [user.id]);
    await sendMail(email, 'Welcome to Tysun Mike Productions', `<p>Welcome, ${name || 'Artist'}! Your portal is ready.</p>`);
    res.json({ ok: true });
  } catch (e) {
    // Check for unique constraint violation (email already exists)
    if (e.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    throw e; // Let the global error handler catch other errors
  }
}));

router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const auth = await authenticate(email.toLowerCase().trim(), password);
  if (!auth) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token: auth.token, user: { id: auth.user.id, email: auth.user.email, name: auth.user.name } });
}));

export default router;
