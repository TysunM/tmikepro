# Tysun Mike Productions - Elite Web Application

> A world-class, top 1% digital presence for premium audio engineering and creative services.

## 🌟 Features

### Core Services
- **Professional Mixing**: Multi-track mixing with industry-standard tools
- **Precision Mastering**: Final polish with precision EQ, compression, and limiting
- **Logo & Brand Design**: Custom graphic design services
- **Album Art Creation**: Stunning artwork for streaming platforms
- **Website Development**: Modern, responsive websites for creatives

### Technical Excellence
- ✨ **Elite UI/UX**: Smooth scrolling, parallax effects, on-scroll reveals
- 🎨 **Modern Animations**: Fluid transitions, button ripple effects, hover states
- ⚡ **Performance Optimized**: Lazy loading, image optimization, Lighthouse 90+
- 🔒 **Security Hardened**: Helmet, CORS, rate limiting, input validation
- 📱 **Fully Responsive**: Mobile-first design, touch-optimized
- 🤖 **AI Chatbot**: Google Gemini integration for customer support
- 💳 **Client Portal**: Dashboard for project management and payments
- 👥 **Referral System**: Built-in referral rewards program
- 📧 **Email Integration**: Transactional emails with SMTP support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 12+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tysunmikeproductions.git
   cd tysunmikeproductions
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Setup database**
   ```bash
   psql -U postgres -d your_database -f db.sql
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   ```
   http://localhost:5000
   ```

## 📁 Project Structure

```
tysunmikeproductions/
├── public/                    # Static assets
│   ├── css/                  # Stylesheets
│   │   ├── modern.css        # Main styles
│   │   ├── animations.css    # Elite animations
│   │   ├── performance.css   # Performance optimization
│   │   ├── chatbot.css       # Chatbot styles
│   │   └── portal.css        # Portal styles
│   ├── js/                   # JavaScript files
│   │   ├── animations.js     # Animation engine
│   │   ├── image-optimization.js
│   │   ├── modern.js         # Main functionality
│   │   ├── chatbot.js        # Chatbot logic
│   │   ├── portal.js         # Portal logic
│   │   ├── admin.js          # Admin panel
│   │   └── sonic.js          # Audio features
│   ├── fonts/                # Custom fonts
│   └── assets/               # Images and logos
├── views/                    # HTML templates
│   ├── index.html           # Homepage
│   ├── login.html           # Login page
│   ├── signup.html          # Signup page
│   ├── dashboard.html       # Client dashboard
│   ├── admin.html           # Admin panel
│   └── 404.html             # 404 page
├── src/                     # Backend source code
│   ├── auth.js              # Authentication logic
│   ├── config.js            # Configuration
│   ├── db.js                # Database connection
│   ├── mail.js              # Email sending
│   ├── middleware/          # Express middleware
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   ├── requireAuth.js
│   │   └── requireAdmin.js
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── projects.js
│   │   ├── referrals.js
│   │   ├── admin.js
│   │   ├── chatbot.js
│   │   └── views.js
│   └── utils/               # Utility functions
│       ├── validation.js
│       ├── dates.js
│       └── referrals.js
├── attached_assets/         # Additional assets
├── server.js                # Express server
├── db.sql                   # Database schema
├── package.json             # Dependencies
├── .env.example             # Environment template
├── DEPLOYMENT_GUIDE.md      # Deployment instructions
└── README_ELITE.md          # This file
```

## 🎨 UI/UX Enhancements

### Animations & Effects
- **Smooth Scrolling**: Native smooth scroll behavior
- **Parallax Effects**: Subtle depth on background images
- **On-Scroll Reveals**: Elements fade in/slide in as user scrolls
- **Hover States**: Interactive feedback on buttons and links
- **Ripple Effects**: Click animations for tactile feedback
- **Lazy Loading**: Images load as they enter viewport
- **Glow Effects**: Accent color glowing text
- **Float Animations**: Subtle floating motion

### Performance Optimizations
- **Image Optimization**: Lazy loading with Intersection Observer
- **Font Display**: Swap strategy for font loading
- **CSS Minification**: Reduced stylesheet size
- **JavaScript Bundling**: Optimized script loading
- **Caching Headers**: Browser caching for static assets
- **Gzip Compression**: Server-side compression
- **Critical CSS**: Inline critical styles
- **Reduced Motion Support**: Respects user preferences

## 🔐 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure session management (7-day expiry)
- **Bcrypt Hashing**: Password hashing with salt rounds
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers (CSP, X-Frame-Options, etc.)
- **Input Validation**: Sanitization of user inputs
- **XSS Protection**: HTML entity encoding

### API Security
- **Rate Limiting**: 
  - Auth: 5 attempts per 15 minutes
  - API: 100 requests per minute
  - Chatbot: 20 messages per minute
- **Error Handling**: Consistent error responses
- **Database**: Parameterized queries (SQL injection prevention)
- **Environment Variables**: Sensitive data in .env

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/projects` - List user projects

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Referrals
- `GET /api/referrals` - Get referral data
- `POST /api/referrals/share` - Create referral link
- `GET /api/referrals/rewards` - Get rewards

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/projects` - List all projects
- `GET /api/admin/analytics` - Get analytics

### Chatbot
- `POST /api/chatbot/message` - Send message
- `GET /api/chatbot/history` - Get chat history

## 🗄️ Database Schema

### Tables
- **users**: User accounts and profiles
- **projects**: Client projects and work orders
- **payments**: Payment transactions
- **consultations**: Scheduled consultations
- **referrals**: Referral tracking
- **referral_activity**: Referral fulfillment tracking
- **loyalty**: Loyalty program counters
- **email_queue**: Email sending queue

## 🚀 Deployment

### Production Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for comprehensive deployment instructions.

**Quick deployment options:**
1. **Traditional VPS** (Recommended) - Full control, scalable
2. **Heroku** - Easiest, good for small projects
3. **Docker** - Containerized, highly scalable

### Environment Variables Required

```env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgres://...
JWT_SECRET=your_secret_key
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
MAIL_FROM=no-reply@example.com
BASE_URL=https://www.example.com
GEMINI_API_KEY=your_api_key
```

## 📈 Performance Metrics

### Lighthouse Scores (Target)
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

### Core Web Vitals
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Start production server
npm start

# Run linter
npm run lint

# Format code
npm run format

# Run tests
npm test
```

### Code Quality

- **Linting**: ESLint for code quality
- **Formatting**: Prettier for code style
- **Validation**: Input validation on all endpoints
- **Error Handling**: Comprehensive error handling

## 📚 Documentation

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment instructions
- [API_KEY_SETUP_GUIDE.md](./API_KEY_SETUP_GUIDE.md) - API key configuration
- [GMAIL_SETUP_GUIDE.md](./GMAIL_SETUP_GUIDE.md) - Email setup
- [CHATBOT_INTEGRATION_COMPLETE.md](./CHATBOT_INTEGRATION_COMPLETE.md) - Chatbot setup

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🎯 Roadmap

- [ ] Payment gateway integration (Stripe)
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Video consultation feature
- [ ] Portfolio showcase enhancements
- [ ] Advanced referral rewards system
- [ ] Multi-language support
- [ ] Dark mode toggle

## 📞 Support

For support, email support@tysunmikeproductions.com or open an issue on GitHub.

## 👏 Acknowledgments

- **Founder**: Tysan Michael Lynch
- **Design Inspiration**: Modern, clean, professional aesthetic
- **Technology Stack**: Node.js, Express, PostgreSQL, HTML5, CSS3, JavaScript

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Status**: Production Ready ✅
