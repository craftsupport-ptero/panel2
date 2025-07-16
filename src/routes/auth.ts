import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import { zValidator } from '@hono/zod-validator';
import { createDb } from '../db';
import { AuthService } from '../services/auth';
import { authRateLimit } from '../middleware/rateLimit';
import { authMiddleware, Env, AuthContext } from '../middleware/auth';
import { 
  loginSchema, 
  registerSchema, 
  updatePasswordSchema, 
  updateEmailSchema 
} from '../types/validation';

const auth = new Hono<{ Bindings: Env } & AuthContext>();

// Apply rate limiting to auth endpoints
auth.use('*', authRateLimit);

// Login endpoint
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  
  try {
    const db = createDb(c.env.DB);
    const authService = new AuthService(db, c.env.JWT_SECRET, parseInt(c.env.BCRYPT_ROUNDS));
    
    const result = await authService.login({ email, password });
    
    // Set HTTP-only cookie
    setCookie(c, 'pterodactyl_session', result.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });
    
    return c.json({
      object: 'bearer_token',
      attributes: {
        token: result.token,
        user: result.user,
      },
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    
    console.error('Login error:', error);
    throw new HTTPException(500, { message: 'Authentication failed' });
  }
});

// Register endpoint (if registration is enabled)
auth.post('/register', zValidator('json', registerSchema), async (c) => {
  try {
    const db = createDb(c.env.DB);
    const authService = new AuthService(db, c.env.JWT_SECRET, parseInt(c.env.BCRYPT_ROUNDS));
    
    const data = c.req.valid('json');
    const result = await authService.register(data);
    
    // Set HTTP-only cookie
    setCookie(c, 'pterodactyl_session', result.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });
    
    return c.json({
      object: 'bearer_token',
      attributes: {
        token: result.token,
        user: result.user,
      },
    }, 201);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    
    console.error('Registration error:', error);
    throw new HTTPException(500, { message: 'Registration failed' });
  }
});

// Logout endpoint
auth.post('/logout', async (c) => {
  // Clear the cookie
  setCookie(c, 'pterodactyl_session', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 0,
    path: '/',
  });
  
  return c.json({
    object: 'success',
    attributes: {
      message: 'Successfully logged out',
    },
  });
});

// Get current user info (requires authentication)
auth.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');
  const db = c.get('db');
  
  try {
    const authService = new AuthService(db, c.env.JWT_SECRET);
    const fullUser = await authService.getUserById(user.id);
    
    return c.json({
      object: 'user',
      attributes: fullUser,
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    
    console.error('Get user error:', error);
    throw new HTTPException(500, { message: 'Failed to get user information' });
  }
});

// Update password (requires authentication)
auth.put('/password', authMiddleware, zValidator('json', updatePasswordSchema), async (c) => {
  const user = c.get('user');
  const db = c.get('db');
  const { currentPassword, password } = c.req.valid('json');
  
  try {
    const authService = new AuthService(db, c.env.JWT_SECRET);
    await authService.updatePassword(user.id, currentPassword, password);
    
    return c.json({
      object: 'success',
      attributes: {
        message: 'Password updated successfully',
      },
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    
    console.error('Update password error:', error);
    throw new HTTPException(500, { message: 'Failed to update password' });
  }
});

// Update email (requires authentication)
auth.put('/email', authMiddleware, zValidator('json', updateEmailSchema), async (c) => {
  const user = c.get('user');
  const db = c.get('db');
  const { email, password } = c.req.valid('json');
  
  try {
    const authService = new AuthService(db, c.env.JWT_SECRET);
    await authService.updateEmail(user.id, email, password);
    
    return c.json({
      object: 'success',
      attributes: {
        message: 'Email updated successfully',
      },
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    
    console.error('Update email error:', error);
    throw new HTTPException(500, { message: 'Failed to update email' });
  }
});

// Verify token endpoint
auth.post('/verify', async (c) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(400, { message: 'Invalid authorization header' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const db = createDb(c.env.DB);
    const authService = new AuthService(db, c.env.JWT_SECRET);
    const userId = await authService.verifyToken(token);
    
    if (!userId) {
      throw new HTTPException(401, { message: 'Invalid token' });
    }
    
    const user = await authService.getUserById(userId);
    
    return c.json({
      object: 'token_verification',
      attributes: {
        valid: true,
        user: {
          id: user.id,
          uuid: user.uuid,
          email: user.email,
          rootAdmin: user.rootAdmin,
        },
      },
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    
    return c.json({
      object: 'token_verification',
      attributes: {
        valid: false,
        error: 'Token verification failed',
      },
    }, 401);
  }
});

export default auth;