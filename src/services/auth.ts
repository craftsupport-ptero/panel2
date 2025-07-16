import bcrypt from 'bcryptjs';
import { sign } from 'hono/jwt';
import { HTTPException } from 'hono/http-exception';
import { createDb } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
}

export interface AuthResult {
  user: {
    id: number;
    uuid: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    rootAdmin: boolean;
    language: string;
    useTotp: boolean;
  };
  token: string;
}

export class AuthService {
  constructor(
    private db: ReturnType<typeof createDb>,
    private jwtSecret: string,
    private bcryptRounds: number = 12
  ) {}

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    // Find user by email
    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.email, credentials.email.toLowerCase()))
      .get();

    if (!user) {
      throw new HTTPException(401, { message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
    if (!isValidPassword) {
      throw new HTTPException(401, { message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = await this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        username: user.username || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        rootAdmin: user.rootAdmin,
        language: user.language || 'en',
        useTotp: user.useTotp,
      },
      token,
    };
  }

  async register(data: RegisterData): Promise<AuthResult> {
    // Check if user already exists
    const existingUser = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email.toLowerCase()))
      .get();

    if (existingUser) {
      throw new HTTPException(409, { message: 'User already exists' });
    }

    // Check if username is taken
    if (data.username) {
      const existingUsername = await this.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, data.username))
        .get();

      if (existingUsername) {
        throw new HTTPException(409, { message: 'Username already taken' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, this.bcryptRounds);

    // Create user
    const newUser = await this.db
      .insert(users)
      .values({
        uuid: uuidv4(),
        email: data.email.toLowerCase(),
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        language: 'en',
        rootAdmin: false,
        useTotp: false,
      })
      .returning()
      .get();

    // Generate JWT token
    const token = await this.generateToken(newUser.id);

    return {
      user: {
        id: newUser.id,
        uuid: newUser.uuid,
        email: newUser.email,
        username: newUser.username || '',
        firstName: newUser.firstName || '',
        lastName: newUser.lastName || '',
        rootAdmin: newUser.rootAdmin,
        language: newUser.language || 'en',
        useTotp: newUser.useTotp,
      },
      token,
    };
  }

  async updatePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    // Get current user
    const user = await this.db
      .select({ password: users.password })
      .from(users)
      .where(eq(users.id, userId))
      .get();

    if (!user) {
      throw new HTTPException(404, { message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new HTTPException(401, { message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, this.bcryptRounds);

    // Update password
    await this.db
      .update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async updateEmail(userId: number, newEmail: string, password: string): Promise<void> {
    // Get current user
    const user = await this.db
      .select({ password: users.password, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .get();

    if (!user) {
      throw new HTTPException(404, { message: 'User not found' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new HTTPException(401, { message: 'Password is incorrect' });
    }

    // Check if email is already taken
    const existingUser = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, newEmail.toLowerCase()))
      .get();

    if (existingUser && existingUser.id !== userId) {
      throw new HTTPException(409, { message: 'Email already in use' });
    }

    // Update email
    await this.db
      .update(users)
      .set({ 
        email: newEmail.toLowerCase(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async getUserById(id: number) {
    const user = await this.db
      .select({
        id: users.id,
        uuid: users.uuid,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        rootAdmin: users.rootAdmin,
        language: users.language,
        useTotp: users.useTotp,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .get();

    if (!user) {
      throw new HTTPException(404, { message: 'User not found' });
    }

    return user;
  }

  private async generateToken(userId: number): Promise<string> {
    const payload = {
      sub: userId.toString(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
    };

    return await sign(payload, this.jwtSecret);
  }

  async verifyToken(token: string): Promise<number | null> {
    try {
      const { verify } = await import('hono/jwt');
      const payload = await verify(token, this.jwtSecret);
      
      if (!payload || !payload.sub) {
        return null;
      }

      return parseInt(payload.sub as string, 10);
    } catch (error) {
      return null;
    }
  }
}