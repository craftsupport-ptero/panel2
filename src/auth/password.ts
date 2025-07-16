import bcrypt from 'bcryptjs';
import type { Env } from '../types';

/**
 * Password service for secure hashing and verification
 */
export class PasswordService {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = parseInt(this.env.BCRYPT_ROUNDS, 10);
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify a password against its hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      // Log error in production
      console.error('Password verification error:', error);
      return false;
    }
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Minimum length
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    // Maximum length for security
    if (password.length > 255) {
      errors.push('Password must not exceed 255 characters');
    }

    // Require at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Require at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Require at least one number
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Require at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common patterns
    if (this.hasCommonPatterns(password)) {
      errors.push('Password contains common patterns and may be weak');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate a secure random password
   */
  generateSecurePassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + special;
    const requiredChars = [
      lowercase[Math.floor(Math.random() * lowercase.length)],
      uppercase[Math.floor(Math.random() * uppercase.length)],
      numbers[Math.floor(Math.random() * numbers.length)],
      special[Math.floor(Math.random() * special.length)]
    ];

    let password = requiredChars.join('');
    
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password to avoid predictable patterns
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Generate a password reset token
   */
  generateResetToken(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Check for common password patterns that should be avoided
   */
  private hasCommonPatterns(password: string): boolean {
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /admin/i,
      /letmein/i,
      /welcome/i,
      /monkey/i,
      /dragon/i
    ];

    // Check for sequential characters
    for (let i = 0; i < password.length - 2; i++) {
      const char1 = password.charCodeAt(i);
      const char2 = password.charCodeAt(i + 1);
      const char3 = password.charCodeAt(i + 2);
      
      if (char2 === char1 + 1 && char3 === char2 + 1) {
        return true; // Found sequential pattern like "abc" or "123"
      }
    }

    // Check for repeated characters
    if (/(.)\1{2,}/.test(password)) {
      return true; // Found 3+ repeated characters
    }

    // Check against common patterns
    return commonPatterns.some(pattern => pattern.test(password));
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
}

/**
 * Password validation rules
 */
export const PASSWORD_RULES = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 255,
  REQUIRE_LOWERCASE: true,
  REQUIRE_UPPERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL: true,
  REJECT_COMMON_PATTERNS: true
} as const;