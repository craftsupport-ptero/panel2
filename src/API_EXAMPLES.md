# API Usage Examples

This document provides practical examples of how to use the Pterodactyl Panel Authentication API.

## Base URL
```
Development: http://localhost:8787
Production: https://your-worker.your-subdomain.workers.dev
```

## Authentication Flow

### 1. User Login
```bash
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "AdminPassword123!",
    "remember": false
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "root_admin": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 900,
      "token_type": "Bearer"
    },
    "session": {
      "id": "abc123...",
      "expires_at": "2024-01-22T10:30:00Z"
    }
  },
  "message": "Login successful"
}
```

### 2. User Registration
```bash
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "password_confirmation": "SecurePassword123!",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### 3. Access Protected Resources
```bash
curl -X GET http://localhost:8787/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "root_admin": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    "session": {
      "id": "abc123...",
      "last_activity": "2024-01-15T11:00:00Z",
      "expires_at": "2024-01-22T10:30:00Z"
    }
  }
}
```

### 4. Refresh Access Token
```bash
curl -X POST http://localhost:8787/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### 5. Change Password
```bash
curl -X POST http://localhost:8787/api/auth/change-password \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "OldPassword123!",
    "new_password": "NewPassword123!",
    "new_password_confirmation": "NewPassword123!"
  }'
```

### 6. Logout
```bash
# Logout current session
curl -X POST http://localhost:8787/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"

# Logout all sessions
curl -X POST http://localhost:8787/api/auth/logout-all \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

## API Key Authentication

Instead of JWT tokens, you can use API keys for application access:

```bash
curl -X GET http://localhost:8787/api/auth/me \
  -H "X-API-Key: ptlr_abc123def456..." \
  -H "Content-Type: application/json"
```

## Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "AUTHENTICATION_ERROR",
  "message": "Invalid username or password",
  "code": "AUTHENTICATION_ERROR"
}
```

Common error codes:
- `AUTHENTICATION_ERROR` - Invalid credentials
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `VALIDATION_ERROR` - Invalid request data
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `NOT_FOUND` - Resource not found

## Rate Limiting

The API includes rate limiting with different limits per endpoint type:

- **Authentication endpoints** (login, register): 5 requests/minute
- **API endpoints**: 100 requests/15 minutes
- **Public endpoints**: 1000 requests/hour

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248600
```

## CORS Support

The API supports CORS for web applications. Allowed origins are configurable:

**Development:**
- http://localhost:3000
- http://localhost:8080

**Production:**
- Configured via environment variables

## Security Headers

All responses include security headers:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

## JavaScript Example

```javascript
class PterodactylAuth {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  async login(username, password) {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    
    if (data.success) {
      this.accessToken = data.data.tokens.access_token;
      this.refreshToken = data.data.tokens.refresh_token;
      
      localStorage.setItem('access_token', this.accessToken);
      localStorage.setItem('refresh_token', this.refreshToken);
      
      return data.data.user;
    }
    
    throw new Error(data.message);
  }

  async getProfile() {
    const response = await fetch(`${this.baseURL}/api/auth/me`, {
      headers: { 
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data.success) {
      return data.data.user;
    }
    
    throw new Error(data.message);
  }

  async logout() {
    await fetch(`${this.baseURL}/api/auth/logout`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

// Usage
const auth = new PterodactylAuth('http://localhost:8787');

try {
  const user = await auth.login('admin', 'AdminPassword123!');
  console.log('Logged in as:', user.username);
  
  const profile = await auth.getProfile();
  console.log('User profile:', profile);
  
  await auth.logout();
  console.log('Logged out successfully');
} catch (error) {
  console.error('Authentication error:', error.message);
}
```

## Environment Configuration

Required environment variables for deployment:

```bash
# JWT Configuration
wrangler secret put JWT_SECRET
# Enter: your-super-secret-256-bit-key

# Optional overrides
wrangler secret put JWT_EXPIRES_IN    # Default: 15m
wrangler secret put BCRYPT_ROUNDS     # Default: 12
wrangler secret put RATE_LIMIT_REQUESTS # Default: 100
```

## Database Setup

Create the users table in your D1 database:

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

This completes the authentication system implementation with comprehensive examples and documentation.