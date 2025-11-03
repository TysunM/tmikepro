import nodemailer from 'nodemailer';
import { config } from './config.js';

// Create a generic SMTP transporter
// The user should configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 465,
  secure: process.env.SMTP_SECURE === 'true' || true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || config.gmailUser,
    pass: process.env.SMTP_PASS || config.gmailAppPassword
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Mailer configuration error:', error.message);
  } else {
    console.log('✅ Mailer is ready to send emails');
  }
});

export async function sendMail(to, subject, html) {
  try {
    const mailOptions = {
      from: config.mailFrom,
      to: to,
      subject: subject,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    throw error;
  }
}

