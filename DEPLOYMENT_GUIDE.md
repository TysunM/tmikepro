# Tysun Mike Productions - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Tysun Mike Productions web application to a production environment. The application is a full-stack Node.js/Express application with PostgreSQL database, featuring elite UI/UX, modern animations, and comprehensive security measures.

## Pre-Deployment Checklist

### Security

- [ ] Set a strong, random JWT_SECRET (minimum 32 characters)
- [ ] Configure SMTP credentials for email sending
- [ ] Enable HTTPS/SSL certificate
- [ ] Set NODE_ENV=production
- [ ] Review and update CORS origins
- [ ] Verify rate limiting is enabled
- [ ] Check database credentials are secure
- [ ] Review helmet security headers configuration
- [ ] Ensure all API keys are stored in environment variables
- [ ] Disable debug mode and verbose logging

### Performance

- [ ] Verify all images are optimized (lazy loading enabled)
- [ ] Test Lighthouse score (target: 90+)
- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Verify font loading optimization
- [ ] Test page load time on 3G connection
- [ ] Verify caching headers are set correctly
- [ ] Test on multiple browsers and devices

### Database

- [ ] Backup existing database
- [ ] Run database migrations (db.sql)
- [ ] Verify database connection string
- [ ] Set up database backups (daily recommended)
- [ ] Test database failover procedures
- [ ] Verify database indexes are created
- [ ] Monitor database performance

### Functionality

- [ ] Test all authentication flows (signup, login, logout)
- [ ] Verify email sending works
- [ ] Test chatbot functionality
- [ ] Verify all API endpoints respond correctly
- [ ] Test form submissions
- [ ] Verify file uploads work
- [ ] Test payment processing (if applicable)
- [ ] Verify referral system works

## Environment Setup

### 1. Create Production Environment File

Copy `.env.example` to `.env` and configure all variables:

```bash
cp .env.example .env
```

Edit `.env` with production values:

```env
PORT=5000
NODE_ENV=production

# Database
DATABASE_URL=postgres://user:password@host:port/database

# Security
JWT_SECRET=your_super_secret_key_here_minimum_32_characters

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password
MAIL_FROM="Tysun Mike Productions <no-reply@tysunmikeproductions.com>"

# Application
BASE_URL=https://www.tysunmikeproductions.com

# AI/Chatbot
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Connect to your PostgreSQL database and run the schema:

```bash
psql -U postgres -d your_database -f db.sql
```

Or using a database client:
1. Create a new database
2. Run the SQL commands from `db.sql`

## Deployment Methods

### Option 1: Traditional VPS (Recommended for Full Control)

#### Prerequisites
- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+ and npm
- PostgreSQL 12+
- Nginx or Apache
- SSL certificate (Let's Encrypt recommended)

#### Steps

1. **SSH into your server**
   ```bash
   ssh user@your_server_ip
   ```

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PostgreSQL**
   ```bash
   sudo apt-get install -y postgresql postgresql-contrib
   ```

4. **Clone the repository**
   ```bash
   cd /var/www
   git clone https://github.com/yourusername/tysunmikeproductions.git
   cd tysunmikeproductions
   ```

5. **Install dependencies**
   ```bash
   npm install
   ```

6. **Configure environment**
   ```bash
   nano .env
   # Add all production variables
   ```

7. **Setup Nginx reverse proxy**
   ```bash
   sudo nano /etc/nginx/sites-available/tysunmikeproductions
   ```

   Add this configuration:
   ```nginx
   upstream app {
     server 127.0.0.1:5000;
   }

   server {
     listen 80;
     server_name www.tysunmikeproductions.com;
     
     # Redirect HTTP to HTTPS
     return 301 https://$server_name$request_uri;
   }

   server {
     listen 443 ssl http2;
     server_name www.tysunmikeproductions.com;

     ssl_certificate /etc/letsencrypt/live/www.tysunmikeproductions.com/fullchain.pem;
     ssl_certificate_key /etc/letsencrypt/live/www.tysunmikeproductions.com/privkey.pem;

     # Security headers
     add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
     add_header X-Content-Type-Options "nosniff" always;
     add_header X-Frame-Options "SAMEORIGIN" always;
     add_header X-XSS-Protection "1; mode=block" always;

     # Gzip compression
     gzip on;
     gzip_types text/plain text/css text/javascript application/json application/javascript;

     # Static files with caching
     location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
     }

     # Proxy to Node.js app
     location / {
       proxy_pass http://app;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }
   }
   ```

8. **Enable the site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/tysunmikeproductions /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot certonly --nginx -d www.tysunmikeproductions.com
   ```

10. **Setup PM2 for process management**
    ```bash
    sudo npm install -g pm2
    pm2 start server.js --name "tysun-mike-productions"
    pm2 startup
    pm2 save
    ```

11. **Verify deployment**
    ```bash
    pm2 logs
    curl https://www.tysunmikeproductions.com
    ```

### Option 2: Heroku (Easiest for Quick Deployment)

1. **Install Heroku CLI**
   ```bash
   curl https://cli.heroku.com/install.sh | sh
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku app**
   ```bash
   heroku create tysunmikeproductions
   ```

4. **Add PostgreSQL addon**
   ```bash
   heroku addons:create heroku-postgresql:standard-0
   ```

5. **Set environment variables**
   ```bash
   heroku config:set JWT_SECRET=your_secret_key
   heroku config:set SMTP_HOST=smtp.example.com
   # ... set all other variables
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

7. **Run migrations**
   ```bash
   heroku run "psql $DATABASE_URL < db.sql"
   ```

### Option 3: Docker (Recommended for Scalability)

1. **Build Docker image**
   ```bash
   docker build -t tysunmikeproductions .
   ```

2. **Run container**
   ```bash
   docker run -d \
     -p 5000:5000 \
     -e DATABASE_URL=postgres://... \
     -e JWT_SECRET=your_secret \
     --name tysun-app \
     tysunmikeproductions
   ```

3. **Use Docker Compose for full stack**
   ```bash
   docker-compose up -d
   ```

## Post-Deployment

### 1. Verify Application

```bash
curl https://www.tysunmikeproductions.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. Monitor Logs

```bash
# Using PM2
pm2 logs

# Using Docker
docker logs -f container_name

# Using Heroku
heroku logs --tail
```

### 3. Setup Monitoring

- Configure error tracking (Sentry recommended)
- Setup performance monitoring (New Relic or DataDog)
- Configure uptime monitoring
- Setup log aggregation

### 4. Database Backups

```bash
# Daily backup script
0 2 * * * pg_dump -U postgres database_name > /backups/db_$(date +\%Y\%m\%d).sql
```

### 5. Security Hardening

- Enable 2FA for admin accounts
- Configure firewall rules
- Setup DDoS protection
- Enable WAF (Web Application Firewall)
- Regular security audits

## Troubleshooting

### Application won't start

```bash
# Check logs
pm2 logs

# Verify environment variables
env | grep DATABASE_URL

# Test database connection
psql $DATABASE_URL -c "SELECT 1"
```

### Database connection errors

```bash
# Verify connection string format
postgres://username:password@host:port/database

# Test connection
psql postgres://username:password@host:port/database -c "SELECT 1"
```

### SSL certificate issues

```bash
# Renew Let's Encrypt certificate
sudo certbot renew

# Check certificate expiry
openssl s_client -connect www.tysunmikeproductions.com:443 -showcerts
```

### Performance issues

- Check Lighthouse score
- Monitor database queries
- Verify image optimization
- Check for memory leaks
- Review rate limiting logs

## Maintenance

### Regular Tasks

- **Daily**: Monitor logs and errors
- **Weekly**: Backup database, check uptime
- **Monthly**: Security updates, dependency updates
- **Quarterly**: Full security audit, performance review

### Updating Application

```bash
# Pull latest code
git pull origin main

# Install new dependencies
npm install

# Run migrations if needed
npm run migrate

# Restart application
pm2 restart all
```

## Support & Resources

- **Documentation**: See README.md
- **Issues**: Report bugs on GitHub Issues
- **Security**: Report security issues to security@example.com
- **Community**: Join our Discord server

## Rollback Procedure

If deployment fails:

```bash
# Revert to previous version
git revert HEAD
git push origin main

# Or use PM2 to restart previous version
pm2 restart all
```

---

**Last Updated**: January 2024  
**Version**: 1.0.0
