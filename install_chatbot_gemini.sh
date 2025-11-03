#!/bin/bash

echo "🤖 Installing AI Chatbot with Google Gemini..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Tysun Mike Productions - AI Chatbot Setup"
echo "  Powered by Google Gemini 2.5 Pro"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: Please run this script from the TysunMikePro directory"
    echo "   cd /path/to/TysunMikePro && ./install_chatbot_gemini.sh"
    exit 1
fi

# Install Google Generative AI SDK
echo "📦 Installing Google Generative AI SDK..."
npm install @google/generative-ai

# Verify nodemailer is installed
echo "📧 Verifying nodemailer..."
npm install nodemailer

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  NEXT STEPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Get your Gemini API key:"
echo "   → Visit: https://aistudio.google.com/app/apikey"
echo "   → Click 'Get API Key' or 'Create API Key'"
echo "   → Copy your key (starts with AIza...)"
echo ""
echo "2️⃣  Add to your .env file:"
echo "   GEMINI_API_KEY=AIzaSy...your-key-here"
echo ""
echo "3️⃣  Run database migration:"
echo "   psql \"\$DATABASE_URL\" < db_chatbot_migration.sql"
echo ""
echo "4️⃣  Add chatbot to your HTML pages:"
echo "   <link rel=\"stylesheet\" href=\"/css/chatbot.css\">"
echo "   <script src=\"/js/chatbot.js\" defer></script>"
echo ""
echo "5️⃣  Restart your server:"
echo "   npm start"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 For detailed instructions, see:"
echo "   → CHATBOT_GEMINI_SETUP.md"
echo ""
echo "💰 Cost: FREE for up to 1,500 conversations/day!"
echo "🚀 Powered by Google Gemini 2.5 Pro"
echo ""
echo "Questions? Check the setup guide or test the chatbot!"
echo ""

