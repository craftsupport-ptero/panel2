import { hash, compare } from 'bcryptjs';
import { sign } from 'hono/jwt';
import type { JWTPayload } from '../types';

export class PasswordUtils {
  static async hash(password: string, rounds: number = 12): Promise<string> {
    return hash(password, rounds);
  }

  static async verify(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
  }
}

export class TokenUtils {
  static async generateJWT(
    payload: Omit<JWTPayload, 'iat' | 'exp'>,
    secret: string,
    expiresIn: number = 86400 // 24 hours
  ): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    
    const jwtPayload: JWTPayload = {
      ...payload,
      iat: now,
      exp: now + expiresIn,
    };

    return sign(jwtPayload, secret);
  }
}

export class UuidUtils {
  static generate(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  static generateShort(length: number = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export class ValidationUtils {
  static isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
  }

  static isStrongPassword(password: string): boolean {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }
}

export class ResponseUtils {
  static success<T>(data: T, meta?: Record<string, any>) {
    return {
      object: 'response',
      data,
      meta,
    };
  }

  static paginated<T>(
    data: T[], 
    total: number, 
    page: number, 
    perPage: number,
    baseUrl?: string
  ) {
    const totalPages = Math.ceil(total / perPage);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      object: 'list',
      data,
      meta: {
        pagination: {
          total,
          count: data.length,
          per_page: perPage,
          current_page: page,
          total_pages: totalPages,
          links: {
            ...(hasNext && baseUrl && { next: `${baseUrl}?page=${page + 1}` }),
            ...(hasPrevious && baseUrl && { previous: `${baseUrl}?page=${page - 1}` }),
          },
        },
      },
    };
  }

  static error(
    code: string,
    status: string,
    detail: string,
    meta?: Record<string, any>
  ) {
    return {
      errors: [{
        code,
        status,
        detail,
        meta,
      }],
    };
  }

  static validationError(errors: Record<string, string[]>) {
    return {
      errors: Object.entries(errors).map(([field, messages]) => ({
        code: 'ValidationException',
        status: '422',
        detail: `The ${field} field ${messages[0]}`,
        source: { field },
        meta: { messages },
      })),
    };
  }
}

export class DateUtils {
  static toISOString(date?: Date | string | null): string | null {
    if (!date) return null;
    if (typeof date === 'string') return date;
    return date.toISOString();
  }

  static now(): string {
    return new Date().toISOString();
  }

  static addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
  }

  static addHours(date: Date, hours: number): Date {
    return new Date(date.getTime() + hours * 3600000);
  }

  static addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 86400000);
  }
}