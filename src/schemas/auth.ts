import { z } from 'zod';

/**
 * Authentication request schemas
 */

// Login schema
export const loginSchema = z.object({
  username: z.string()
    .min(1, 'Username is required')
    .max(255, 'Username too long'),
  password: z.string()
    .min(1, 'Password is required')
    .max(255, 'Password too long'),
  remember: z.boolean().optional().default(false)
});

export type LoginRequest = z.infer<typeof loginSchema>;

// Register schema
export const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(255, 'Username too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(255, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, 
           'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  password_confirmation: z.string()
    .min(1, 'Password confirmation is required'),
  first_name: z.string()
    .min(1, 'First name is required')
    .max(255, 'First name too long'),
  last_name: z.string()
    .min(1, 'Last name is required')
    .max(255, 'Last name too long')
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"]
});

export type RegisterRequest = z.infer<typeof registerSchema>;

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email too long')
});

export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;

// Password reset schema
export const passwordResetSchema = z.object({
  token: z.string()
    .min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(255, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, 
           'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  password_confirmation: z.string()
    .min(1, 'Password confirmation is required')
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"]
});

export type PasswordReset = z.infer<typeof passwordResetSchema>;

// Change password schema
export const changePasswordSchema = z.object({
  current_password: z.string()
    .min(1, 'Current password is required'),
  new_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(255, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, 
           'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  new_password_confirmation: z.string()
    .min(1, 'Password confirmation is required')
}).refine((data) => data.new_password === data.new_password_confirmation, {
  message: "Passwords don't match",
  path: ["new_password_confirmation"]
});

export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;

// Refresh token schema
export const refreshTokenSchema = z.object({
  refresh_token: z.string()
    .min(1, 'Refresh token is required')
});

export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;

// Two-factor authentication setup schema
export const twoFactorSetupSchema = z.object({
  password: z.string()
    .min(1, 'Password is required for 2FA setup')
});

export type TwoFactorSetupRequest = z.infer<typeof twoFactorSetupSchema>;

// Two-factor authentication verify schema
export const twoFactorVerifySchema = z.object({
  code: z.string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only digits'),
  password: z.string()
    .min(1, 'Password is required')
});

export type TwoFactorVerifyRequest = z.infer<typeof twoFactorVerifySchema>;

// Two-factor authentication login schema
export const twoFactorLoginSchema = z.object({
  username: z.string()
    .min(1, 'Username is required'),
  password: z.string()
    .min(1, 'Password is required'),
  code: z.string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only digits'),
  remember: z.boolean().optional().default(false)
});

export type TwoFactorLoginRequest = z.infer<typeof twoFactorLoginSchema>;

// API key creation schema
export const createApiKeySchema = z.object({
  name: z.string()
    .min(1, 'API key name is required')
    .max(255, 'API key name too long'),
  permissions: z.array(z.string())
    .min(1, 'At least one permission is required')
    .max(50, 'Too many permissions'),
  allowed_ips: z.array(z.string().ip())
    .optional(),
  expires_at: z.string()
    .datetime()
    .optional()
});

export type CreateApiKeyRequest = z.infer<typeof createApiKeySchema>;

// Update profile schema
export const updateProfileSchema = z.object({
  first_name: z.string()
    .min(1, 'First name is required')
    .max(255, 'First name too long')
    .optional(),
  last_name: z.string()
    .min(1, 'Last name is required')
    .max(255, 'Last name too long')
    .optional(),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email too long')
    .optional(),
  language: z.string()
    .max(10, 'Language code too long')
    .optional()
});

export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;

// Session management schemas
export const revokeSessionSchema = z.object({
  session_id: z.string()
    .min(1, 'Session ID is required')
});

export type RevokeSessionRequest = z.infer<typeof revokeSessionSchema>;

// Auth response schemas
export const authResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: z.object({
      id: z.number(),
      username: z.string(),
      email: z.string(),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      root_admin: z.boolean(),
      created_at: z.string(),
      updated_at: z.string()
    }),
    tokens: z.object({
      access_token: z.string(),
      refresh_token: z.string(),
      expires_in: z.number()
    }).optional()
  }).optional(),
  error: z.string().optional(),
  message: z.string().optional()
});

export type AuthResponse = z.infer<typeof authResponseSchema>;