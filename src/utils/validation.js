/**
 * Input validation utilities
 */

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password
 * @returns {object} { valid: boolean, message: string }
 */
export function validatePassword(password) {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (password.length > 128) {
    return { valid: false, message: 'Password is too long' };
  }
  
  // Enhanced password strength check
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain a lowercase letter' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain an uppercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain a number' };
  }
  
  return { valid: true, message: 'Password is valid' };
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input
 * @returns {string}
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/</g, '&lt;') // Encode <
    .replace(/>/g, '&gt;') // Encode >
    .replace(/"/g, '&quot;') // Encode "
    .replace(/'/g, '&#39;') // Encode '
    .replace(/\//g, '&#x2F;'); // Encode / to prevent closing tags
}

/**
 * Validate project package type
 * @param {string} packageType
 * @returns {boolean}
 */
export function isValidPackage(packageType) {
  const validPackages = ['basic', 'pro', 'master'];
  return validPackages.includes(packageType);
}

/**
 * Validate project size
 * @param {string} size
 * @returns {boolean}
 */
export function isValidSize(size) {
  const validSizes = ['normal', 'large'];
  return validSizes.includes(size);
}

/**
 * Validate project status
 * @param {string} status
 * @returns {boolean}
 */
export function isValidStatus(status) {
  const validStatuses = ['intake', 'mixing', 'mastering', 'revisions', 'delivered'];
  return validStatuses.includes(status);
}

/**
 * Validate name
 * @param {string} name
 * @returns {object} { valid: boolean, message: string, value: string }
 */
export function validateName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, message: 'Name is required' };
  }
  
  const sanitized = sanitizeInput(name).substring(0, 100);
  
  if (sanitized.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters' };
  }
  
  return { valid: true, value: sanitized };
}

/**
 * Validate project title
 * @param {string} title
 * @returns {object} { valid: boolean, message: string, value: string }
 */
export function validateProjectTitle(title) {
  if (!title || typeof title !== 'string') {
    return { valid: false, message: 'Project title is required' };
  }
  
  const sanitized = sanitizeInput(title).substring(0, 200);
  
  if (sanitized.length < 3) {
    return { valid: false, message: 'Project title must be at least 3 characters' };
  }
  
  return { valid: true, value: sanitized };
}

/**
 * Validate chatbot message
 * @param {string} message
 * @returns {object} { valid: boolean, message: string, value: string }
 */
export function validateChatbotMessage(message) {
  if (!message || typeof message !== 'string') {
    return { valid: false, message: 'Message is required' };
  }
  
  const sanitized = sanitizeInput(message).substring(0, 2000);
  
  if (sanitized.length === 0) {
    return { valid: false, message: 'Message cannot be empty' };
  }
  
  return { valid: true, value: sanitized };
}

