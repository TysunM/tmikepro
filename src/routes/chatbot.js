import express from 'express';
import nodemailer from 'nodemailer';
import { q } from '../db.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';
import { chatbotLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(config.geminiApiKey || process.env.GEMINI_API_KEY);

// Email transporter setup using SendGrid
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});

// System prompt that defines the chatbot's personality and knowledge
const SYSTEM_PROMPT = `You are an AI assistant for Tysun Mike Productions, a professional audio engineering and creative services company. You are helpful, friendly, knowledgeable, and conversational.

ABOUT TYSUN MIKE PRODUCTIONS:
Founded by Tysun Mike Lynch, a professional audio engineer and creative technologist with:
- 10+ years of experience, 500+ tracks mixed
- 98% client satisfaction rate
- Expert in mixing, mastering, and audio engineering across all genres
- Full-stack web developer and branding strategist
- Creator of modular workflow systems for client onboarding
- Deeply invested in transparency, excellence, and long-term creative partnerships

SERVICES OFFERED:
1. Professional Mixing & Mastering
2. Logo & Album Art Design
3. Website Building for Artists and Creatives
4. Consultation & Onboarding

BRANDED PRICING TIERS:

**Ballin' on a Budget**
- Mix Only: $25 | Mix & Master: $50
- Basic edits, volume expression, EQ, delay, de-essing
- 5-day turnaround
- Perfect for artists just starting out

**So Fresh & So Clean**
- Mix Only: $50 | Mix & Master: $85
- Clean mix, volume automation, basic sound balance
- Standard processing
- Great value for independent artists

**The Big Leagues** (MOST POPULAR)
- Mix Only: $85 | Mix & Master: $150
- Advanced processing, pitch correction, professional EQ
- Tuning, sidechaining, up to 10 tracks
- Revisions included
- Professional quality for serious artists

**Double Uranium** (PREMIUM)
- Mix Only: $150 | Mix & Master: $275
- Unlimited tracks, full production
- Advanced revisions, 2-day turnaround
- Full creative input, priority support
- Top-tier package for demanding projects

STUDIO ARSENAL:
**Mic Locker:**
- Basic: Neumann U87 Ai, Shure SM7B, Rode NT1, AT2020
- Pro: Warm Audio WA-251, Telefunken U47, R2i Ribbon
- Prestige: Sennheiser MKH 416, AEA R34 Ribbon, Neumann KMS 105

**Monitoring Philosophy:**
Multiple headphone references for perfect mix translation:
Sennheiser HD 900, Sony MDR-1, Focal Utopia, Beyerdynamic DT 990P, AKG K702, Audio-Technica M50x, Neumann NDH 20

**Plugin Arsenal:**
Full professional suites including Waves, FabFilter, Soundtoys, iZotope, Arturia, Plugin Alliance, Slate Digital, Antares, DMG Audio, Valhalla DSP, Native Instruments, Eventide, MeldaProduction, PSP Audioware, Universal Audio, and many more.

LOYALTY & REWARDS PROGRAMS:

1. **New Client Bonus:** First-time clients get a FREE mix to build trust (mastering billed separately)

2. **Referral Program:** Refer a client who completes one project = get a free mix (mix-only tier)

3. **Milestone Bonus:** Complete 9 mix & master projects + refer a client who completes 3 projects in 3 months = free "So Fresh & So Clean" level mix & master

4. **Birthday Bonus:** Receive a gift voucher on your birthday, valid for 2 months starting from the 1st of your birthday month

5. **Founder's Birthday Sale:** Every year on Tysun's birthday, ALL packages are 30% off

6. **20-Song Loyalty Reward:** After 20 completed mix & master projects (two full albums) = 50% off "Double Uranium" package

UNIQUE FEATURES:
- Real-time project progress tracking (Start → Static Mix → Mix → Master → Review → Complete)
- Interactive booking with visual pricing
- Secure client portal for file upload/download
- Transparent workflow that builds trust
- Loyalty tracker showing referral credits and rewards

SPECIALTIES:
- All genres: Hip-Hop, R&B, Pop, Electronic, Rock, Indie, Singer-Songwriter
- Vocal mixing and tuning expertise
- Streaming optimization (-14 LUFS)
- Cross-platform translation

HOW TO BOOK:
1. Sign up at /signup
2. Choose your package
3. Upload files through secure portal
4. Track progress in real-time
5. Receive professional results

YOUR PERSONALITY:
- Be conversational and friendly, not robotic
- Use natural language, contractions, occasional enthusiasm
- Ask clarifying questions when needed
- Provide specific, helpful information
- If you don't know something, admit it and offer to connect them with Tysun
- Encourage booking but don't be pushy
- Show genuine interest in their music and projects
- Highlight the loyalty programs and rewards when relevant

HANDLING COMMON QUESTIONS:
- File formats: Accept WAV, AIFF, MP3, FLAC (prefer 24-bit WAV)
- Turnaround: 2-5 days depending on package
- Revisions: Included in all packages
- Payment: Secure online payment through portal
- Refunds: Satisfaction guaranteed, work until client is happy
- First-time clients: Get a FREE mix to try the service

If someone asks about booking, guide them to sign up at /signup or contact the studio.

Always be helpful, professional, and genuinely interested in helping artists achieve their goals. Emphasize the value, quality, and loyalty rewards that make Tysun Mike Productions special.`;

// Store conversation history in memory (in production, use Redis or database)
const conversationStore = new Map();

// POST /api/chatbot/message - Send a message to the chatbot
router.post('/message', chatbotLimiter, async (req, res) => {
  try {
    const { message, conversationId, userName, userEmail } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Generate or use existing conversation ID
    const convId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get or create conversation history
    let conversation = conversationStore.get(convId) || {
      id: convId,
      messages: [],
      userName: userName || 'Guest',
      userEmail: userEmail || null,
      startedAt: new Date(),
      lastMessageAt: new Date(),
      geminiChat: null
    };

    // Initialize Gemini chat session if not exists
    if (!conversation.geminiChat) {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1024,
        }
      });
      
      conversation.geminiChat = model.startChat({
        history: [],
      });
    }

    // Add user message to history
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Send message to Gemini
    const result = await conversation.geminiChat.sendMessage(message);
    const assistantMessage = result.response.text();

    // Add assistant response to history
    conversation.messages.push({
      role: 'assistant',
      content: assistantMessage,
      timestamp: new Date()
    });

    // Update conversation metadata
    conversation.lastMessageAt = new Date();
    if (userName) conversation.userName = userName;
    if (userEmail) conversation.userEmail = userEmail;

    // Store updated conversation
    conversationStore.set(convId, conversation);

    // Save to database for persistence
    try {
      await q(
        `INSERT INTO chatbot_conversations (conversation_id, user_name, user_email, messages, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (conversation_id) 
         DO UPDATE SET messages = $4, updated_at = $6, user_name = $2, user_email = $3`,
        [
          convId,
          conversation.userName,
          conversation.userEmail,
          JSON.stringify(conversation.messages),
          conversation.startedAt,
          conversation.lastMessageAt
        ]
      );
    } catch (dbError) {
      console.error('Error saving conversation to database:', dbError);
      // Continue even if DB save fails
    }

    res.json({
      conversationId: convId,
      message: assistantMessage,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Handle specific Gemini API errors
    let errorMessage = 'Sorry, I encountered an error. Please try again or contact us directly at productions@tysunmike.us';
    
    if (error.message && error.message.includes('API key')) {
      errorMessage = 'Configuration error. Please contact support.';
    } else if (error.message && error.message.includes('quota')) {
      errorMessage = 'Service temporarily unavailable. Please try again in a moment or email productions@tysunmike.us';
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

// POST /api/chatbot/end - End conversation and send email
router.post('/end', chatbotLimiter, async (req, res) => {
  try {
    const { conversationId, userEmail, userName } = req.body;

    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID is required' });
    }

    // Get conversation from store or database
    let conversation = conversationStore.get(conversationId);
    
    if (!conversation) {
      // Try to fetch from database
      const result = await q(
        'SELECT * FROM chatbot_conversations WHERE conversation_id = $1',
        [conversationId]
      );
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        conversation = {
          id: row.conversation_id,
          userName: row.user_name,
          userEmail: row.user_email,
          messages: row.messages,
          startedAt: row.created_at,
          lastMessageAt: row.updated_at
        };
      }
    }

    if (!conversation || conversation.messages.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Update with provided email/name if available
    if (userEmail) conversation.userEmail = userEmail;
    if (userName) conversation.userName = userName;

    // Format conversation for email
    const conversationText = conversation.messages
      .map(msg => {
        const time = new Date(msg.timestamp).toLocaleString();
        const speaker = msg.role === 'user' ? conversation.userName : 'Tysun AI Assistant';
        return `[${time}] ${speaker}:\n${msg.content}\n`;
      })
      .join('\n');

    // Create HTML version
    const conversationHtml = conversation.messages
      .map(msg => {
        const time = new Date(msg.timestamp).toLocaleString();
        const speaker = msg.role === 'user' ? conversation.userName : 'Tysun AI Assistant';
        const bgColor = msg.role === 'user' ? '#f0f0f0' : '#e3f9f4';
        return `
          <div style="margin: 15px 0; padding: 15px; background: ${bgColor}; border-radius: 8px;">
            <strong style="color: #333;">${speaker}</strong>
            <span style="color: #999; font-size: 12px; margin-left: 10px;">${time}</span>
            <p style="margin: 10px 0 0 0; color: #333; line-height: 1.6;">${msg.content.replace(/\n/g, '<br>')}</p>
          </div>
        `;
      })
      .join('');

    // Send email to Tysun
    const mailOptions = {
      from: process.env.MAIL_FROM || 'noreply@tysunmike.us',
      to: 'productions@tysunmike.us',
      subject: `💬 New Chatbot Conversation from ${conversation.userName}`,
      text: `
New chatbot conversation received!

User: ${conversation.userName}
Email: ${conversation.userEmail || 'Not provided'}
Started: ${new Date(conversation.startedAt).toLocaleString()}
Ended: ${new Date(conversation.lastMessageAt).toLocaleString()}
Messages: ${conversation.messages.length}

CONVERSATION:
${conversationText}

---
This conversation was automatically sent from your website chatbot.
Reply directly to this email if the user provided their email address.
      `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: #0a0a0a; color: #00FFC8; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .info { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .info-item { margin: 8px 0; }
            .label { font-weight: bold; color: #666; }
            .conversation { margin-top: 20px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; color: #999; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">💬 New Chatbot Conversation</h2>
              <p style="margin: 5px 0 0 0; opacity: 0.8;">Powered by Google Gemini AI</p>
            </div>
            
            <div class="info">
              <div class="info-item"><span class="label">User:</span> ${conversation.userName}</div>
              <div class="info-item"><span class="label">Email:</span> ${conversation.userEmail || 'Not provided'}</div>
              <div class="info-item"><span class="label">Started:</span> ${new Date(conversation.startedAt).toLocaleString()}</div>
              <div class="info-item"><span class="label">Ended:</span> ${new Date(conversation.lastMessageAt).toLocaleString()}</div>
              <div class="info-item"><span class="label">Total Messages:</span> ${conversation.messages.length}</div>
            </div>

            <div class="conversation">
              <h3>Conversation Transcript:</h3>
              ${conversationHtml}
            </div>

            <div class="footer">
              <p>This conversation was automatically sent from your website chatbot.</p>
              <p>If the user provided their email address, you can reply directly to follow up.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      replyTo: conversation.userEmail || undefined
    };

    await transporter.sendMail(mailOptions);

    // Mark conversation as sent in database
    await q(
      'UPDATE chatbot_conversations SET email_sent = true, email_sent_at = $1 WHERE conversation_id = $2',
      [new Date(), conversationId]
    );

    // Clean up from memory store (keep in DB for records)
    conversationStore.delete(conversationId);

    res.json({ 
      success: true, 
      message: 'Conversation sent successfully' 
    });

  } catch (error) {
    console.error('Error ending conversation:', error);
    res.status(500).json({ 
      error: 'Failed to send conversation. Please contact us directly at productions@tysunmike.us' 
    });
  }
});

// GET /api/chatbot/history/:conversationId - Get conversation history
router.get('/history/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Try memory store first
    let conversation = conversationStore.get(conversationId);

    // If not in memory, try database
    if (!conversation) {
      const result = await q(
        'SELECT * FROM chatbot_conversations WHERE conversation_id = $1',
        [conversationId]
      );

      if (result.rows.length > 0) {
        const row = result.rows[0];
        conversation = {
          id: row.conversation_id,
          userName: row.user_name,
          userEmail: row.user_email,
          messages: row.messages,
          startedAt: row.created_at,
          lastMessageAt: row.updated_at
        };
      }
    }

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      conversationId: conversation.id,
      messages: conversation.messages,
      userName: conversation.userName,
      startedAt: conversation.startedAt
    });

  } catch (error) {
    console.error('Error fetching conversation history:', error);
    res.status(500).json({ error: 'Failed to fetch conversation history' });
  }
});

// Cleanup old conversations from memory (run periodically)
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  for (const [id, conv] of conversationStore.entries()) {
    if (now - new Date(conv.lastMessageAt).getTime() > maxAge) {
      conversationStore.delete(id);
    }
  }
}, 60 * 60 * 1000); // Run every hour

export default router;

