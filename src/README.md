# Phase 2: Authentication System Implementation

This directory contains the serverless authentication system for Pterodactyl Panel.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install -g wrangler
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.worker.example .env.worker
   # Edit .env.worker with your settings
   ```

3. **Set secrets:**
   ```bash
   wrangler secret put JWT_SECRET
   # Enter a secure random string (256+ bits)
   ```

4. **Development:**
   ```bash
   npm run dev
   ```

5. **Deploy:**
   ```bash
   npm run deploy
   ```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - Logout current session
- `POST /api/auth/logout-all` - Logout all sessions
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/reset-password/confirm` - Confirm password reset

### Health Check
- `GET /health` - Service health status

## 🔧 Configuration

### Required Environment Variables
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRES_IN` - Access token expiration (default: 15m)
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration (default: 7d)
- `BCRYPT_ROUNDS` - Password hashing rounds (default: 12)
- `RATE_LIMIT_REQUESTS` - Rate limit per window (default: 100)
- `RATE_LIMIT_WINDOW` - Rate limit window in seconds (default: 900)

### Database Schema

The system expects a `users` table with the following structure:

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  root_admin BOOLEAN DEFAULT FALSE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## 🔒 Security Features

- **JWT Authentication** with RS256 signing
- **Password Hashing** using bcrypt (12+ rounds)
- **Rate Limiting** per IP and user
- **Session Management** via KV storage
- **CORS Protection** with configurable origins
- **Security Headers** (XSS, CSRF, etc.)
- **Input Validation** using Zod schemas

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

## 📊 Rate Limits

- **Auth endpoints**: 5 requests/minute
- **API endpoints**: 100 requests/15 minutes
- **Public endpoints**: 1000 requests/hour
- **Admin endpoints**: 200 requests/15 minutes

## 🔄 Development Workflow

1. Make changes to TypeScript files in `src/`
2. Test locally with `npm run dev`
3. Run tests with `npm test`
4. Deploy with `npm run deploy`

## 🚀 Production Deployment

1. Set up Cloudflare KV namespaces
2. Set up Cloudflare D1 database
3. Configure production secrets
4. Deploy with production configuration

For more details, see the main project documentation.