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

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({ 
  origin: true,
  credentials: true 
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(express.static('public', {
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
}));

// Serve stock images
app.use('/stock_images', express.static('attached_assets/stock_images', {
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
}));

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);

// View Routes
import viewRoutes from './src/routes/views.js';
app.use('/', viewRoutes);

// Global 404 handler (for all unhandled routes)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    // API 404
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  // HTML 404
  res.status(404).sendFile(process.cwd() + '/views/404.html');
});

// Global error handler (must be last)
app.use(errorHandler);

app.listen(config.port, '0.0.0.0', () => {
  console.log(`✨ Tysun Mike Portal running on port ${config.port}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Security: Helmet, CORS, Rate Limiting enabled`);
});

