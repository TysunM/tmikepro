import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  dbUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  mailFrom: process.env.MAIL_FROM,
  baseUrl: process.env.BASE_URL,
  geminiApiKey: process.env.GEMINI_API_KEY
};
