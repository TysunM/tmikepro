/**
 * Global Error Handling Middleware
 * Provides consistent error responses and logging
 */

export function errorHandler(err, req, res, next) {
  // Log error details
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Default error
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Invalid input data';
  } else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Authentication failed';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Session expired. Please login again.';
  } else if (err.code === '23505') { // PostgreSQL unique violation
    status = 409;
    message = 'A record with that information already exists';
  } else if (err.code === '23503') { // PostgreSQL foreign key violation
    status = 400;
    message = 'Invalid reference to related data';
  } else if (err.code === 'ECONNREFUSED') {
    status = 503;
    message = 'Service temporarily unavailable';
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && status === 500) {
    message = 'An unexpected error occurred. Please try again later.';
  }

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { details: err.message, stack: err.stack })
  });
}

// Async error wrapper
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
