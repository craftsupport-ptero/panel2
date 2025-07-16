import { JWTService } from '../auth/jwt';
import { PasswordService } from '../auth/password';
import { SessionService } from '../auth/sessions';
import { ValidationMiddleware } from '../middleware/validation';
import { ErrorHandlerMiddleware } from '../middleware/errorHandler';
import { createSuccessResponse, createErrorResponse, createCreatedResponse } from '../utils/responses';
import { NotFoundError, InvalidCredentialsError, ConflictError } from '../utils/errors';
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  changePasswordSchema,
  passwordResetRequestSchema,
  passwordResetSchema
} from '../schemas/auth';
import type { Env, RequestContext, User } from '../types';

/**
 * Authentication routes handler
 */
export class AuthRoutes {
  private jwtService: JWTService;
  private passwordService: PasswordService;
  private sessionService: SessionService;
  private env: Env;

  constructor(env: Env) {
    this.env = env;
    this.jwtService = new JWTService(env);
    this.passwordService = new PasswordService(env);
    this.sessionService = new SessionService(env);
  }

  /**
   * User login endpoint
   * POST /api/auth/login
   */
  async login(request: Request, context: RequestContext): Promise<Response> {
    // Validate request body
    const validation = await ValidationMiddleware.validateBody(loginSchema)(request, context);
    if (validation) return validation;

    const { username, password, remember } = context.validatedBody;

    try {
      // Find user by username or email
      const user = await this.findUserByUsernameOrEmail(username);
      if (!user) {
        throw new InvalidCredentialsError();
      }

      // Verify password
      const isValidPassword = await this.passwordService.verifyPassword(password, user.password!);
      if (!isValidPassword) {
        throw new InvalidCredentialsError();
      }

      // Generate JWT tokens
      const { accessToken, refreshToken, expiresIn } = await this.jwtService.generateTokenPair(user);

      // Create session
      const session = await this.sessionService.createSession(user, request);

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;

      return createSuccessResponse({
        user: userWithoutPassword,
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: expiresIn,
          token_type: 'Bearer'
        },
        session: {
          id: session.id,
          expires_at: session.expires_at
        }
      }, 'Login successful');

    } catch (error) {
      throw error;
    }
  }

  /**
   * User registration endpoint
   * POST /api/auth/register
   */
  async register(request: Request, context: RequestContext): Promise<Response> {
    // Validate request body
    const validation = await ValidationMiddleware.validateBody(registerSchema)(request, context);
    if (validation) return validation;

    const { username, email, password, first_name, last_name } = context.validatedBody;

    try {
      // Check if username already exists
      const existingUsername = await this.findUserByUsername(username);
      if (existingUsername) {
        throw new ConflictError('Username already exists');
      }

      // Check if email already exists
      const existingEmail = await this.findUserByEmail(email);
      if (existingEmail) {
        throw new ConflictError('Email already exists');
      }

      // Hash password
      const hashedPassword = await this.passwordService.hashPassword(password);

      // Create user
      const user = await this.createUser({
        username,
        email,
        password: hashedPassword,
        first_name,
        last_name
      });

      // Generate JWT tokens
      const { accessToken, refreshToken, expiresIn } = await this.jwtService.generateTokenPair(user);

      // Create session
      const session = await this.sessionService.createSession(user, request);

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;

      return createCreatedResponse({
        user: userWithoutPassword,
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: expiresIn,
          token_type: 'Bearer'
        },
        session: {
          id: session.id,
          expires_at: session.expires_at
        }
      }, 'Registration successful');

    } catch (error) {
      throw error;
    }
  }

  /**
   * User logout endpoint
   * POST /api/auth/logout
   */
  async logout(request: Request, context: RequestContext): Promise<Response> {
    if (!context.user) {
      return createErrorResponse('Not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    try {
      // Get session ID from Authorization header or session context
      const authHeader = request.headers.get('authorization');
      if (authHeader && context.session?.id) {
        await this.sessionService.deleteSession(context.session.id);
      }

      return createSuccessResponse(null, 'Logout successful');
    } catch (error) {
      // Even if session deletion fails, we should still return success
      return createSuccessResponse(null, 'Logout successful');
    }
  }

  /**
   * Logout from all devices
   * POST /api/auth/logout-all
   */
  async logoutAll(request: Request, context: RequestContext): Promise<Response> {
    if (!context.user) {
      return createErrorResponse('Not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    try {
      await this.sessionService.deleteUserSessions(context.user.id);
      return createSuccessResponse(null, 'Logged out from all devices');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  async refresh(request: Request, context: RequestContext): Promise<Response> {
    // Validate request body
    const validation = await ValidationMiddleware.validateBody(refreshTokenSchema)(request, context);
    if (validation) return validation;

    const { refresh_token } = context.validatedBody;

    try {
      // Generate new access token
      const newAccessToken = await this.jwtService.refreshAccessToken(refresh_token);
      const expiresIn = this.jwtService['parseExpiration'](this.env.JWT_EXPIRES_IN);

      return createSuccessResponse({
        access_token: newAccessToken,
        expires_in: expiresIn,
        token_type: 'Bearer'
      }, 'Token refreshed successfully');

    } catch (error) {
      throw new InvalidCredentialsError('Invalid refresh token');
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  async me(request: Request, context: RequestContext): Promise<Response> {
    if (!context.user) {
      return createErrorResponse('Not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    // Remove password from user object
    const { password, ...userWithoutPassword } = context.user;

    return createSuccessResponse({
      user: userWithoutPassword,
      session: context.session ? {
        id: context.session.id,
        last_activity: context.session.last_activity,
        expires_at: context.session.expires_at
      } : null
    });
  }

  /**
   * Change password
   * POST /api/auth/change-password
   */
  async changePassword(request: Request, context: RequestContext): Promise<Response> {
    if (!context.user) {
      return createErrorResponse('Not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    // Validate request body
    const validation = await ValidationMiddleware.validateBody(changePasswordSchema)(request, context);
    if (validation) return validation;

    const { current_password, new_password } = context.validatedBody;

    try {
      // Get user with password
      const user = await this.findUserById(context.user.id);
      if (!user || !user.password) {
        throw new NotFoundError('User');
      }

      // Verify current password
      const isValidPassword = await this.passwordService.verifyPassword(current_password, user.password);
      if (!isValidPassword) {
        throw new InvalidCredentialsError('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await this.passwordService.hashPassword(new_password);

      // Update password
      await this.updateUserPassword(user.id, hashedPassword);

      // Invalidate all sessions except current one
      if (context.session) {
        const userSessions = await this.sessionService.getUserSessions(user.id);
        const otherSessions = userSessions.filter(s => s.id !== context.session!.id);
        
        for (const session of otherSessions) {
          await this.sessionService.deleteSession(session.id);
        }
      }

      return createSuccessResponse(null, 'Password changed successfully');

    } catch (error) {
      throw error;
    }
  }

  /**
   * Request password reset
   * POST /api/auth/reset-password
   */
  async requestPasswordReset(request: Request, context: RequestContext): Promise<Response> {
    // Validate request body
    const validation = await ValidationMiddleware.validateBody(passwordResetRequestSchema)(request, context);
    if (validation) return validation;

    const { email } = context.validatedBody;

    try {
      // Find user by email
      const user = await this.findUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return createSuccessResponse(null, 'If the email exists, a reset link has been sent');
      }

      // Generate reset token
      const resetToken = this.passwordService.generateResetToken();
      
      // Store reset token (in production, you'd store this in database with expiration)
      // For now, we'll just return success
      
      // TODO: Send email with reset link
      // await this.sendPasswordResetEmail(user.email, resetToken);

      return createSuccessResponse(null, 'If the email exists, a reset link has been sent');

    } catch (error) {
      // Always return success to prevent email enumeration
      return createSuccessResponse(null, 'If the email exists, a reset link has been sent');
    }
  }

  /**
   * Reset password with token
   * POST /api/auth/reset-password/confirm
   */
  async resetPassword(request: Request, context: RequestContext): Promise<Response> {
    // Validate request body
    const validation = await ValidationMiddleware.validateBody(passwordResetSchema)(request, context);
    if (validation) return validation;

    const { token, password } = context.validatedBody;

    try {
      // Verify reset token (in production, validate against database)
      // For now, we'll return an error since token validation is not implemented
      throw new InvalidCredentialsError('Invalid or expired reset token');

    } catch (error) {
      throw error;
    }
  }

  // Database methods

  private async findUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
    try {
      const stmt = this.env.DB.prepare(`
        SELECT id, username, email, password, root_admin, created_at, updated_at 
        FROM users 
        WHERE username = ? OR email = ?
      `);
      
      const result = await stmt.bind(usernameOrEmail, usernameOrEmail).first();
      
      if (!result) {
        return null;
      }

      return {
        id: result.id as number,
        username: result.username as string,
        email: result.email as string,
        password: result.password as string,
        root_admin: Boolean(result.root_admin),
        created_at: result.created_at as string,
        updated_at: result.updated_at as string
      };
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  }

  private async findUserByUsername(username: string): Promise<User | null> {
    try {
      const stmt = this.env.DB.prepare(`
        SELECT id, username, email, root_admin, created_at, updated_at 
        FROM users 
        WHERE username = ?
      `);
      
      const result = await stmt.bind(username).first();
      
      if (!result) {
        return null;
      }

      return {
        id: result.id as number,
        username: result.username as string,
        email: result.email as string,
        root_admin: Boolean(result.root_admin),
        created_at: result.created_at as string,
        updated_at: result.updated_at as string
      };
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  }

  private async findUserByEmail(email: string): Promise<User | null> {
    try {
      const stmt = this.env.DB.prepare(`
        SELECT id, username, email, root_admin, created_at, updated_at 
        FROM users 
        WHERE email = ?
      `);
      
      const result = await stmt.bind(email).first();
      
      if (!result) {
        return null;
      }

      return {
        id: result.id as number,
        username: result.username as string,
        email: result.email as string,
        root_admin: Boolean(result.root_admin),
        created_at: result.created_at as string,
        updated_at: result.updated_at as string
      };
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  }

  private async findUserById(id: number): Promise<User | null> {
    try {
      const stmt = this.env.DB.prepare(`
        SELECT id, username, email, password, root_admin, created_at, updated_at 
        FROM users 
        WHERE id = ?
      `);
      
      const result = await stmt.bind(id).first();
      
      if (!result) {
        return null;
      }

      return {
        id: result.id as number,
        username: result.username as string,
        email: result.email as string,
        password: result.password as string,
        root_admin: Boolean(result.root_admin),
        created_at: result.created_at as string,
        updated_at: result.updated_at as string
      };
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  }

  private async createUser(userData: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }): Promise<User> {
    try {
      const now = new Date().toISOString();
      
      const stmt = this.env.DB.prepare(`
        INSERT INTO users (username, email, password, first_name, last_name, root_admin, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = await stmt.bind(
        userData.username,
        userData.email,
        userData.password,
        userData.first_name,
        userData.last_name,
        false, // root_admin
        now,
        now
      ).run();

      if (!result.success) {
        throw new Error('Failed to create user');
      }

      return {
        id: result.meta.last_row_id as number,
        username: userData.username,
        email: userData.email,
        root_admin: false,
        created_at: now,
        updated_at: now
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  private async updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
    try {
      const stmt = this.env.DB.prepare(`
        UPDATE users 
        SET password = ?, updated_at = ?
        WHERE id = ?
      `);
      
      const result = await stmt.bind(hashedPassword, new Date().toISOString(), userId).run();
      
      if (!result.success) {
        throw new Error('Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      throw new Error('Failed to update password');
    }
  }
}