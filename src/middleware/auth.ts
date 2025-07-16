import { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';
import { HTTPException } from 'hono/http-exception';
import { createDb } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface AuthContext {
  Variables: {
    user: {
      id: number;
      uuid: string;
      email: string;
      rootAdmin: boolean;
      username: string;
    };
    db: ReturnType<typeof createDb>;
  };
}

export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  STORAGE: R2Bucket;
  JWT_SECRET: string;
  BCRYPT_ROUNDS: string;
  API_RATE_LIMIT: string;
  SESSION_TIMEOUT: string;
}

export async function authMiddleware(c: Context<{ Bindings: Env } & AuthContext>, next: Next) {
  try {
    // Get JWT from Authorization header or cookie
    const authHeader = c.req.header('Authorization');
    let token: string | undefined;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = getCookie(c, 'pterodactyl_session');
    }

    if (!token) {
      throw new HTTPException(401, { message: 'Authentication required' });
    }

    // Verify JWT token
    const payload = await verify(token, c.env.JWT_SECRET);
    
    if (!payload || !payload.sub) {
      throw new HTTPException(401, { message: 'Invalid token' });
    }

    // Get database connection
    const db = createDb(c.env.DB);
    c.set('db', db);

    // Fetch user from database
    const user = await db
      .select({
        id: users.id,
        uuid: users.uuid,
        email: users.email,
        rootAdmin: users.rootAdmin,
        username: users.username,
      })
      .from(users)
      .where(eq(users.id, Number(payload.sub)))
      .get();

    if (!user) {
      throw new HTTPException(401, { message: 'User not found' });
    }

    // Check token expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new HTTPException(401, { message: 'Token expired' });
    }

    // Set user in context
    c.set('user', user);

    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    
    console.error('Auth middleware error:', error);
    throw new HTTPException(401, { message: 'Authentication failed' });
  }
}

export async function adminMiddleware(c: Context<{ Bindings: Env } & AuthContext>, next: Next) {
  const user = c.get('user');
  
  if (!user || !user.rootAdmin) {
    throw new HTTPException(403, { message: 'Administrator access required' });
  }

  await next();
}

export async function optionalAuthMiddleware(c: Context<{ Bindings: Env } & AuthContext>, next: Next) {
  try {
    await authMiddleware(c, next);
  } catch (error) {
    // If auth fails, continue without user context
    const db = createDb(c.env.DB);
    c.set('db', db);
    await next();
  }
}