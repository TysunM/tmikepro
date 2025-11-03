/**
 * Rate Limiting Middleware
 * Prevents abuse and DDoS attacks
 */

const requestCounts = new Map();
const blocklist = new Set();

// Store limiter configurations to properly clean up entries
const limiterConfigs = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    // Use the actual window from the limiter config, not hardcoded 60s
    const config = limiterConfigs.get(data.limiterId);
    const windowMs = config ? config.windowMs : 60000;
    
    if (now - data.windowStart > windowMs) {
      requestCounts.delete(key);
    }
  }
}, 300000);

/**
 * Rate limiter configuration
 * @param {Object} options - Configuration options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests per window
 * @param {string} options.message - Error message to send
 * @param {string} options.id - Unique identifier for this limiter
 */
export function rateLimit(options = {}) {
  const {
    windowMs = 60000, // 1 minute
    max = 100, // 100 requests per minute
    message = 'Too many requests, please try again later.',
    id = 'default'
  } = options;

  // Store config for cleanup routine
  limiterConfigs.set(id, { windowMs, max });

  return (req, res, next) => {
    const key = `${id}:${req.ip}`;
    
    // Check if IP is blocked
    if (blocklist.has(key)) {
      return res.status(429).json({
        error: 'Your IP has been temporarily blocked due to excessive requests.',
        retryAfter: 3600 // 1 hour
      });
    }

    const now = Date.now();
    const requestData = requestCounts.get(key);

    if (!requestData) {
      requestCounts.set(key, {
        count: 1,
        windowStart: now,
        limiterId: id
      });
      return next();
    }

    // Reset window if expired
    if (now - requestData.windowStart > windowMs) {
      requestData.count = 1;
      requestData.windowStart = now;
      return next();
    }

    // Increment counter
    requestData.count++;

    // Block if exceeded
    if (requestData.count > max) {
      // Temporary block after excessive violations
      if (requestData.count > max * 3) {
        blocklist.add(key);
        setTimeout(() => blocklist.delete(key), 3600000); // Unblock after 1 hour
      }
      
      res.set('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json({
        error: message,
        retryAfter: Math.ceil((windowMs - (now - requestData.windowStart)) / 1000)
      });
    }

    next();
  };
}

// Predefined rate limiters
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts. Please try again in 15 minutes.',
  id: 'auth'
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  id: 'api'
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute for sensitive operations
  id: 'strict'
});

export const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 messages per minute
  message: 'You are sending messages too quickly. Please slow down.',
  id: 'chatbot'
});
