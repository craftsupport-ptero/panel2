import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { users } from '../db/schema';
import { PasswordUtils, TokenUtils, ValidationUtils, ResponseUtils, UuidUtils } from '../utils';
import { authMiddleware } from '../middleware/auth';
import type { Env, AuthenticatedContext } from '../types';

const auth = new Hono<{ Bindings: Env; Variables: AuthenticatedContext }>();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// POST /api/auth/login
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return c.json(
        ResponseUtils.validationError(
          Object.fromEntries(
            result.error.errors.map(err => [err.path[0], [err.message]])
          )
        ),
        422
      );
    }

    const { email, password } = result.data;
    const db = drizzle(c.env.DB);

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return c.json(
        ResponseUtils.error(
          'AuthenticationException',
          '401',
          'Invalid credentials'
        ),
        401
      );
    }

    // Verify password
    const isValid = await PasswordUtils.verify(password, user.password);
    if (!isValid) {
      return c.json(
        ResponseUtils.error(
          'AuthenticationException',
          '401',
          'Invalid credentials'
        ),
        401
      );
    }

    // Generate JWT token
    const token = await TokenUtils.generateJWT(
      {
        sub: user.id.toString(),
        uuid: user.uuid,
        type: 'user',
      },
      c.env.JWT_SECRET
    );

    // Cache user session
    await c.env.CACHE.put(
      `session:${user.uuid}`,
      JSON.stringify({
        id: user.id,
        uuid: user.uuid,
        username: user.username,
        email: user.email,
        rootAdmin: user.rootAdmin,
      }),
      { expirationTtl: 86400 } // 24 hours
    );

    return c.json({
      object: 'token',
      attributes: {
        access_token: token,
        token_type: 'Bearer',
        expires_in: 86400,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json(
      ResponseUtils.error(
        'InternalServerError',
        '500',
        'An internal error occurred'
      ),
      500
    );
  }
});

// POST /api/auth/register
auth.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return c.json(
        ResponseUtils.validationError(
          Object.fromEntries(
            result.error.errors.map(err => [err.path[0], [err.message]])
          )
        ),
        422
      );
    }

    const { username, email, firstName, lastName, password } = result.data;

    // Additional validations
    if (!ValidationUtils.isUsername(username)) {
      return c.json(
        ResponseUtils.error(
          'ValidationException',
          '422',
          'Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens'
        ),
        422
      );
    }

    if (!ValidationUtils.isStrongPassword(password)) {
      return c.json(
        ResponseUtils.error(
          'ValidationException',
          '422',
          'Password must be at least 8 characters and contain uppercase, lowercase, and number'
        ),
        422
      );
    }

    const db = drizzle(c.env.DB);

    // Check if username or email already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return c.json(
        ResponseUtils.error(
          'ValidationException',
          '422',
          'A user with this email already exists'
        ),
        422
      );
    }

    const [existingUsername] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUsername) {
      return c.json(
        ResponseUtils.error(
          'ValidationException',
          '422',
          'A user with this username already exists'
        ),
        422
      );
    }

    // Hash password
    const hashedPassword = await PasswordUtils.hash(
      password,
      parseInt(c.env.BCRYPT_ROUNDS) || 12
    );

    // Create user
    const userUuid = UuidUtils.generate();
    const [newUser] = await db
      .insert(users)
      .values({
        uuid: userUuid,
        username,
        email,
        firstName,
        lastName,
        password: hashedPassword,
        language: 'en',
        rootAdmin: false,
        useTotp: false,
        gravatar: true,
      })
      .returning();

    // Generate JWT token
    const token = await TokenUtils.generateJWT(
      {
        sub: newUser.id.toString(),
        uuid: newUser.uuid,
        type: 'user',
      },
      c.env.JWT_SECRET
    );

    return c.json({
      object: 'token',
      attributes: {
        access_token: token,
        token_type: 'Bearer',
        expires_in: 86400,
        user: {
          id: newUser.id,
          uuid: newUser.uuid,
          username: newUser.username,
          email: newUser.email,
          first_name: newUser.firstName,
          last_name: newUser.lastName,
        },
      },
    }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return c.json(
      ResponseUtils.error(
        'InternalServerError',
        '500',
        'An internal error occurred'
      ),
      500
    );
  }
});

// GET /api/auth/me
auth.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');

  return c.json({
    object: 'user',
    attributes: {
      id: user.id,
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      root_admin: user.rootAdmin,
    },
  });
});

// POST /api/auth/logout
auth.post('/logout', authMiddleware, async (c) => {
  const user = c.get('user');

  try {
    // Remove session from cache
    await c.env.CACHE.delete(`session:${user.uuid}`);

    return c.json({
      object: 'response',
      message: 'Successfully logged out',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json(
      ResponseUtils.error(
        'InternalServerError',
        '500',
        'An internal error occurred'
      ),
      500
    );
  }
});

export default auth;