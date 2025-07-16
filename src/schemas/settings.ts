import { z } from 'zod';

// System configuration validation schemas

// Panel settings schema
export const PanelSettingsSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  url: z.string().url(),
  description: z.string().max(1000).optional(),
  logo_url: z.string().url().optional(),
  favicon_url: z.string().url().optional(),
  timezone: z.string().default('UTC'),
  language: z.string().default('en'),
  theme: z.enum(['light', 'dark', 'auto']).default('light'),
  maintenance_mode: z.boolean().default(false),
  maintenance_message: z.string().max(500).optional()
});

// Registration settings schema
export const RegistrationSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  email_verification: z.boolean().default(true),
  approval_required: z.boolean().default(false),
  allowed_domains: z.array(z.string().email().transform(email => email.split('@')[1])).default([]),
  blocked_domains: z.array(z.string()).default([]),
  recaptcha_enabled: z.boolean().default(false),
  recaptcha_site_key: z.string().optional(),
  recaptcha_secret_key: z.string().optional(),
  terms_required: z.boolean().default(false),
  terms_url: z.string().url().optional(),
  privacy_required: z.boolean().default(false),
  privacy_url: z.string().url().optional()
});

// User limits schema
export const UserLimitsSchema = z.object({
  max_servers_per_user: z.number().min(0).max(1000).default(5),
  max_memory_per_server: z.number().min(0).default(4096), // MB
  max_disk_per_server: z.number().min(0).default(10240), // MB
  max_cpu_per_server: z.number().min(0).max(1000).default(200), // percentage
  max_databases_per_server: z.number().min(0).max(20).default(3),
  max_allocations_per_server: z.number().min(0).max(10).default(1),
  max_backups_per_server: z.number().min(0).max(50).default(5),
  max_file_uploads_per_minute: z.number().min(1).max(100).default(10),
  max_api_requests_per_minute: z.number().min(10).max(10000).default(120)
});

// Security settings schema
export const SecuritySettingsSchema = z.object({
  enforce_2fa: z.boolean().default(false),
  enforce_2fa_admin: z.boolean().default(true),
  session_timeout: z.number().min(300).max(86400).default(3600), // seconds
  max_login_attempts: z.number().min(3).max(20).default(5),
  lockout_duration: z.number().min(300).max(3600).default(900), // seconds
  password_requirements: z.object({
    min_length: z.number().min(6).max(128).default(8),
    require_uppercase: z.boolean().default(true),
    require_lowercase: z.boolean().default(true),
    require_numbers: z.boolean().default(true),
    require_symbols: z.boolean().default(false),
    prevent_reuse: z.number().min(0).max(24).default(5) // last N passwords
  }).default({}),
  session_security: z.object({
    secure_cookies: z.boolean().default(true),
    same_site: z.enum(['strict', 'lax', 'none']).default('lax'),
    remember_me_duration: z.number().min(86400).max(2592000).default(604800) // seconds (7 days default)
  }).default({})
});

// Rate limiting schema
export const RateLimitingSchema = z.object({
  api_requests: z.object({
    enabled: z.boolean().default(true),
    requests_per_minute: z.number().min(10).max(10000).default(1000),
    burst_limit: z.number().min(10).max(20000).default(1500),
    window_minutes: z.number().min(1).max(60).default(15)
  }).default({}),
  login_attempts: z.object({
    enabled: z.boolean().default(true),
    attempts_per_minute: z.number().min(3).max(20).default(5),
    window_minutes: z.number().min(5).max(60).default(15),
    progressive_delay: z.boolean().default(true)
  }).default({}),
  registration_attempts: z.object({
    enabled: z.boolean().default(true),
    attempts_per_hour: z.number().min(1).max(10).default(3),
    window_hours: z.number().min(1).max(24).default(1)
  }).default({}),
  password_reset: z.object({
    enabled: z.boolean().default(true),
    attempts_per_hour: z.number().min(1).max(10).default(5),
    window_hours: z.number().min(1).max(24).default(1)
  }).default({})
});

// Access control schema
export const AccessControlSchema = z.object({
  ip_whitelist: z.object({
    enabled: z.boolean().default(false),
    addresses: z.array(z.string().ip()).default([]),
    admin_only: z.boolean().default(false)
  }).default({}),
  ip_blacklist: z.object({
    enabled: z.boolean().default(false),
    addresses: z.array(z.string().ip()).default([]),
    auto_ban: z.boolean().default(false),
    auto_ban_threshold: z.number().min(5).max(100).default(20)
  }).default({}),
  country_restrictions: z.object({
    enabled: z.boolean().default(false),
    allowed_countries: z.array(z.string().length(2)).default([]), // ISO country codes
    blocked_countries: z.array(z.string().length(2)).default([]),
    mode: z.enum(['allow', 'block']).default('allow')
  }).default({}),
  admin_access: z.object({
    ip_whitelist_only: z.boolean().default(false),
    allowed_ips: z.array(z.string().ip()).default([]),
    require_2fa: z.boolean().default(true),
    session_timeout: z.number().min(300).max(7200).default(1800)
  }).default({})
});

// Security headers schema
export const SecurityHeadersSchema = z.object({
  hsts: z.object({
    enabled: z.boolean().default(true),
    max_age: z.number().min(300).max(31536000).default(31536000), // 1 year
    include_subdomains: z.boolean().default(true),
    preload: z.boolean().default(false)
  }).default({}),
  csp: z.object({
    enabled: z.boolean().default(true),
    report_only: z.boolean().default(false),
    directives: z.record(z.string()).default({
      'default-src': "'self'",
      'script-src': "'self' 'unsafe-inline'",
      'style-src': "'self' 'unsafe-inline'",
      'img-src': "'self' data: https:",
      'font-src': "'self'",
      'connect-src': "'self'",
      'frame-ancestors': "'none'"
    })
  }).default({}),
  other_headers: z.object({
    x_frame_options: z.enum(['DENY', 'SAMEORIGIN', 'DISABLED']).default('DENY'),
    x_content_type_options: z.boolean().default(true),
    x_xss_protection: z.boolean().default(true),
    referrer_policy: z.enum([
      'no-referrer',
      'no-referrer-when-downgrade',
      'origin',
      'origin-when-cross-origin',
      'same-origin',
      'strict-origin',
      'strict-origin-when-cross-origin',
      'unsafe-url'
    ]).default('strict-origin-when-cross-origin')
  }).default({})
});

// Feature flags schema
export const FeatureFlagsSchema = z.object({
  server_transfers: z.boolean().default(true),
  server_backups: z.boolean().default(true),
  scheduled_tasks: z.boolean().default(true),
  api_access: z.boolean().default(true),
  file_manager: z.boolean().default(true),
  database_management: z.boolean().default(true),
  user_registration: z.boolean().default(true),
  server_creation: z.boolean().default(true),
  two_factor_auth: z.boolean().default(true),
  email_verification: z.boolean().default(true),
  recaptcha: z.boolean().default(false),
  advanced_analytics: z.boolean().default(false),
  server_monitoring: z.boolean().default(true),
  automated_backups: z.boolean().default(true),
  server_scaling: z.boolean().default(false),
  multi_node: z.boolean().default(true)
});

// Email configuration schema
export const EmailConfigSchema = z.object({
  driver: z.enum(['smtp', 'mailgun', 'ses', 'postmark', 'sendmail']).default('smtp'),
  from_address: z.string().email(),
  from_name: z.string().min(1).max(255),
  reply_to: z.string().email().optional(),
  encryption: z.enum(['tls', 'ssl', 'none']).default('tls')
});

// SMTP settings schema
export const SMTPSettingsSchema = z.object({
  host: z.string().min(1).max(255),
  port: z.number().min(1).max(65535).default(587),
  username: z.string().optional(),
  password: z.string().optional(),
  encryption: z.enum(['tls', 'ssl', 'none']).default('tls'),
  auth: z.boolean().default(true),
  timeout: z.number().min(5).max(300).default(30) // seconds
});

// Mailgun settings schema
export const MailgunSettingsSchema = z.object({
  domain: z.string().min(1),
  secret: z.string().min(1),
  endpoint: z.string().url().optional(),
  version: z.enum(['v2', 'v3']).default('v3')
});

// AWS SES settings schema
export const SESSettingsSchema = z.object({
  key: z.string().min(1),
  secret: z.string().min(1),
  region: z.string().min(1).default('us-east-1'),
  configuration_set: z.string().optional()
});

// Postmark settings schema
export const PostmarkSettingsSchema = z.object({
  token: z.string().min(1),
  message_stream: z.string().default('outbound')
});

// Database configuration schema
export const DatabaseConfigSchema = z.object({
  connection: z.enum(['mysql', 'postgresql', 'sqlite', 'mariadb']).default('mysql'),
  host: z.string().min(1),
  port: z.number().min(1).max(65535),
  database: z.string().min(1),
  username: z.string().min(1),
  password: z.string(),
  charset: z.string().default('utf8mb4'),
  collation: z.string().default('utf8mb4_unicode_ci'),
  prefix: z.string().default(''),
  strict: z.boolean().default(true),
  engine: z.string().optional(),
  options: z.record(z.any()).default({})
});

// Cache configuration schema
export const CacheConfigSchema = z.object({
  default: z.enum(['file', 'redis', 'memcached', 'database']).default('file'),
  connections: z.object({
    file: z.object({
      driver: z.literal('file'),
      path: z.string().default('/tmp/cache')
    }).optional(),
    redis: z.object({
      driver: z.literal('redis'),
      host: z.string().default('127.0.0.1'),
      port: z.number().min(1).max(65535).default(6379),
      password: z.string().optional(),
      database: z.number().min(0).max(15).default(0)
    }).optional(),
    memcached: z.object({
      driver: z.literal('memcached'),
      servers: z.array(z.object({
        host: z.string(),
        port: z.number().min(1).max(65535),
        weight: z.number().min(1).default(100)
      })).default([{ host: '127.0.0.1', port: 11211, weight: 100 }])
    }).optional()
  }).default({})
});

// Queue configuration schema
export const QueueConfigSchema = z.object({
  default: z.enum(['sync', 'database', 'redis', 'sqs']).default('database'),
  connections: z.object({
    database: z.object({
      driver: z.literal('database'),
      table: z.string().default('jobs'),
      queue: z.string().default('default'),
      retry_after: z.number().min(60).default(90)
    }).optional(),
    redis: z.object({
      driver: z.literal('redis'),
      connection: z.string().default('default'),
      queue: z.string().default('default'),
      retry_after: z.number().min(60).default(90),
      block_for: z.number().min(0).default(0)
    }).optional(),
    sqs: z.object({
      driver: z.literal('sqs'),
      key: z.string(),
      secret: z.string(),
      prefix: z.string().url(),
      queue: z.string().default('default'),
      region: z.string().default('us-east-1')
    }).optional()
  }).default({})
});

// File storage configuration schema
export const StorageConfigSchema = z.object({
  default: z.enum(['local', 's3', 'gcs', 'azure']).default('local'),
  disks: z.object({
    local: z.object({
      driver: z.literal('local'),
      root: z.string().default('/storage/app'),
      url: z.string().url().optional(),
      visibility: z.enum(['public', 'private']).default('private')
    }).optional(),
    s3: z.object({
      driver: z.literal('s3'),
      key: z.string(),
      secret: z.string(),
      region: z.string(),
      bucket: z.string(),
      url: z.string().url().optional(),
      endpoint: z.string().url().optional(),
      use_path_style_endpoint: z.boolean().default(false)
    }).optional(),
    gcs: z.object({
      driver: z.literal('gcs'),
      project_id: z.string(),
      key_file: z.string().optional(),
      bucket: z.string(),
      path_prefix: z.string().optional()
    }).optional(),
    azure: z.object({
      driver: z.literal('azure'),
      name: z.string(),
      key: z.string(),
      container: z.string(),
      url: z.string().url().optional()
    }).optional()
  }).default({})
});

// Logging configuration schema
export const LoggingConfigSchema = z.object({
  default: z.enum(['stack', 'single', 'daily', 'syslog', 'errorlog']).default('stack'),
  channels: z.object({
    stack: z.object({
      driver: z.literal('stack'),
      channels: z.array(z.string()).default(['single'])
    }).optional(),
    single: z.object({
      driver: z.literal('single'),
      path: z.string().default('/storage/logs/panel.log'),
      level: z.enum(['emergency', 'alert', 'critical', 'error', 'warning', 'notice', 'info', 'debug']).default('debug')
    }).optional(),
    daily: z.object({
      driver: z.literal('daily'),
      path: z.string().default('/storage/logs/panel.log'),
      level: z.enum(['emergency', 'alert', 'critical', 'error', 'warning', 'notice', 'info', 'debug']).default('debug'),
      days: z.number().min(1).max(365).default(14)
    }).optional(),
    syslog: z.object({
      driver: z.literal('syslog'),
      level: z.enum(['emergency', 'alert', 'critical', 'error', 'warning', 'notice', 'info', 'debug']).default('debug'),
      facility: z.string().default('local0')
    }).optional()
  }).default({})
});

// Complete system settings schema combining all sections
export const SystemSettingsSchema = z.object({
  panel: PanelSettingsSchema.optional(),
  registration: RegistrationSettingsSchema.optional(),
  limits: UserLimitsSchema.optional(),
  security: SecuritySettingsSchema.optional(),
  rate_limiting: RateLimitingSchema.optional(),
  access_control: AccessControlSchema.optional(),
  security_headers: SecurityHeadersSchema.optional(),
  features: FeatureFlagsSchema.optional(),
  email: EmailConfigSchema.optional(),
  smtp: SMTPSettingsSchema.optional(),
  mailgun: MailgunSettingsSchema.optional(),
  ses: SESSettingsSchema.optional(),
  postmark: PostmarkSettingsSchema.optional(),
  database: DatabaseConfigSchema.optional(),
  cache: CacheConfigSchema.optional(),
  queue: QueueConfigSchema.optional(),
  storage: StorageConfigSchema.optional(),
  logging: LoggingConfigSchema.optional()
});

// Email test schema
export const EmailTestSchema = z.object({
  recipient: z.string().email(),
  test_type: z.enum(['basic', 'template', 'attachment']).default('basic'),
  template: z.string().optional(),
  variables: z.record(z.any()).optional()
});

// Configuration backup/restore schemas
export const ConfigBackupSchema = z.object({
  include_sections: z.array(z.string()).optional(),
  exclude_sensitive: z.boolean().default(true),
  format: z.enum(['json', 'yaml', 'env']).default('json'),
  compress: z.boolean().default(false)
});

export const ConfigRestoreSchema = z.object({
  backup_data: z.string(),
  format: z.enum(['json', 'yaml', 'env']),
  merge_mode: z.enum(['replace', 'merge', 'overlay']).default('merge'),
  validate_only: z.boolean().default(false),
  backup_current: z.boolean().default(true)
});

// Export utility functions
export function validateEmailDriver(driver: string, settings: any): boolean {
  switch (driver) {
    case 'smtp':
      return SMTPSettingsSchema.safeParse(settings).success;
    case 'mailgun':
      return MailgunSettingsSchema.safeParse(settings).success;
    case 'ses':
      return SESSettingsSchema.safeParse(settings).success;
    case 'postmark':
      return PostmarkSettingsSchema.safeParse(settings).success;
    default:
      return false;
  }
}

export function validatePasswordRequirements(password: string, requirements: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < requirements.min_length) {
    errors.push(`Password must be at least ${requirements.min_length} characters long`);
  }
  
  if (requirements.require_uppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (requirements.require_lowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (requirements.require_numbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (requirements.require_symbols && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function sanitizeConfigForExport(config: any, excludeSensitive: boolean = true): any {
  if (!excludeSensitive) {
    return config;
  }
  
  const sensitiveFields = [
    'password', 'secret', 'key', 'token', 'private_key',
    'smtp.password', 'mailgun.secret', 'ses.secret',
    'database.password', 'redis.password'
  ];
  
  const sanitized = JSON.parse(JSON.stringify(config));
  
  sensitiveFields.forEach(field => {
    const keys = field.split('.');
    let current = sanitized;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (current[keys[i]]) {
        current = current[keys[i]];
      } else {
        break;
      }
    }
    
    const lastKey = keys[keys.length - 1];
    if (current && current[lastKey]) {
      current[lastKey] = '***REDACTED***';
    }
  });
  
  return sanitized;
}