import { SignJWT, jwtVerify } from 'jose';
import type { Env, JWTPayload, User } from '../types';

// JWT utilities for secure token generation and verification
export class JWTService {
  private env: Env;
  private algorithm = 'HS256'; // Use HMAC for simplicity

  constructor(env: Env) {
    this.env = env;
  }

  /**
   * Generate an access token for the user
   */
  async generateAccessToken(user: User): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = this.parseExpiration(this.env.JWT_EXPIRES_IN);

    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      sub: user.id,
      username: user.username,
      email: user.email,
      admin: user.root_admin,
      type: 'access'
    };

    return this.signToken(payload, now, now + expiresIn);
  }

  /**
   * Generate a refresh token for the user
   */
  async generateRefreshToken(user: User): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = this.parseExpiration(this.env.JWT_REFRESH_EXPIRES_IN);

    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      sub: user.id,
      username: user.username,
      email: user.email,
      admin: user.root_admin,
      type: 'refresh'
    };

    return this.signToken(payload, now, now + expiresIn);
  }

  /**
   * Verify and decode a JWT token
   */
  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const secretKey = await this.getSymmetricKey();
      const { payload } = await jwtVerify(token, secretKey, {
        algorithms: [this.algorithm]
      });

      return payload as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Generate both access and refresh tokens
   */
  async generateTokenPair(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user)
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiration(this.env.JWT_EXPIRES_IN)
    };
  }

  /**
   * Refresh an access token using a valid refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<string> {
    const payload = await this.verifyToken(refreshToken);
    
    if (payload.type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }

    // Create a new access token with updated expiration
    const user: User = {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
      root_admin: payload.admin,
      created_at: '',
      updated_at: ''
    };

    return this.generateAccessToken(user);
  }

  /**
   * Sign a JWT token with the private key
   */
  private async signToken(
    payload: Omit<JWTPayload, 'iat' | 'exp'>,
    iat: number,
    exp: number
  ): Promise<string> {
    const secretKey = await this.getSymmetricKey();
    
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: this.algorithm })
      .setIssuedAt(iat)
      .setExpirationTime(exp)
      .sign(secretKey);

    return jwt;
  }

  /**
   * Get the private key for signing tokens
   */
  private async getPrivateKey(): Promise<CryptoKey> {
    // For now, use HMAC with the secret key
    // In production, you should use RSA keys
    return this.getSymmetricKey();
  }

  /**
   * Get the public key for verifying tokens
   */
  private async getPublicKey(): Promise<CryptoKey> {
    // For now, use HMAC with the secret key
    // In production, you should use RSA keys
    return this.getSymmetricKey();
  }

  /**
   * Get symmetric key for development (HMAC)
   */
  private async getSymmetricKey(): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.env.JWT_SECRET);
    
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );
  }

  /**
   * Parse expiration string (e.g., "15m", "7d") to seconds
   */
  private parseExpiration(exp: string): number {
    const match = exp.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid expiration format: ${exp}`);
    }

    const [, amount, unit] = match;
    const num = parseInt(amount, 10);

    switch (unit) {
      case 's': return num;
      case 'm': return num * 60;
      case 'h': return num * 60 * 60;
      case 'd': return num * 60 * 60 * 24;
      default: throw new Error(`Invalid time unit: ${unit}`);
    }
  }
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(payload: JWTPayload): boolean {
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
}