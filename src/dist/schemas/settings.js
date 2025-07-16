"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigRestoreSchema = exports.ConfigBackupSchema = exports.EmailTestSchema = exports.SystemSettingsSchema = exports.LoggingConfigSchema = exports.StorageConfigSchema = exports.QueueConfigSchema = exports.CacheConfigSchema = exports.DatabaseConfigSchema = exports.PostmarkSettingsSchema = exports.SESSettingsSchema = exports.MailgunSettingsSchema = exports.SMTPSettingsSchema = exports.EmailConfigSchema = exports.FeatureFlagsSchema = exports.SecurityHeadersSchema = exports.AccessControlSchema = exports.RateLimitingSchema = exports.SecuritySettingsSchema = exports.UserLimitsSchema = exports.RegistrationSettingsSchema = exports.PanelSettingsSchema = void 0;
exports.validateEmailDriver = validateEmailDriver;
exports.validatePasswordRequirements = validatePasswordRequirements;
exports.sanitizeConfigForExport = sanitizeConfigForExport;
const zod_1 = require("zod");
// System configuration validation schemas
// Panel settings schema
exports.PanelSettingsSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).trim(),
    url: zod_1.z.string().url(),
    description: zod_1.z.string().max(1000).optional(),
    logo_url: zod_1.z.string().url().optional(),
    favicon_url: zod_1.z.string().url().optional(),
    timezone: zod_1.z.string().default('UTC'),
    language: zod_1.z.string().default('en'),
    theme: zod_1.z.enum(['light', 'dark', 'auto']).default('light'),
    maintenance_mode: zod_1.z.boolean().default(false),
    maintenance_message: zod_1.z.string().max(500).optional()
});
// Registration settings schema
exports.RegistrationSettingsSchema = zod_1.z.object({
    enabled: zod_1.z.boolean().default(true),
    email_verification: zod_1.z.boolean().default(true),
    approval_required: zod_1.z.boolean().default(false),
    allowed_domains: zod_1.z.array(zod_1.z.string().email().transform(email => email.split('@')[1])).default([]),
    blocked_domains: zod_1.z.array(zod_1.z.string()).default([]),
    recaptcha_enabled: zod_1.z.boolean().default(false),
    recaptcha_site_key: zod_1.z.string().optional(),
    recaptcha_secret_key: zod_1.z.string().optional(),
    terms_required: zod_1.z.boolean().default(false),
    terms_url: zod_1.z.string().url().optional(),
    privacy_required: zod_1.z.boolean().default(false),
    privacy_url: zod_1.z.string().url().optional()
});
// User limits schema
exports.UserLimitsSchema = zod_1.z.object({
    max_servers_per_user: zod_1.z.number().min(0).max(1000).default(5),
    max_memory_per_server: zod_1.z.number().min(0).default(4096), // MB
    max_disk_per_server: zod_1.z.number().min(0).default(10240), // MB
    max_cpu_per_server: zod_1.z.number().min(0).max(1000).default(200), // percentage
    max_databases_per_server: zod_1.z.number().min(0).max(20).default(3),
    max_allocations_per_server: zod_1.z.number().min(0).max(10).default(1),
    max_backups_per_server: zod_1.z.number().min(0).max(50).default(5),
    max_file_uploads_per_minute: zod_1.z.number().min(1).max(100).default(10),
    max_api_requests_per_minute: zod_1.z.number().min(10).max(10000).default(120)
});
// Security settings schema
exports.SecuritySettingsSchema = zod_1.z.object({
    enforce_2fa: zod_1.z.boolean().default(false),
    enforce_2fa_admin: zod_1.z.boolean().default(true),
    session_timeout: zod_1.z.number().min(300).max(86400).default(3600), // seconds
    max_login_attempts: zod_1.z.number().min(3).max(20).default(5),
    lockout_duration: zod_1.z.number().min(300).max(3600).default(900), // seconds
    password_requirements: zod_1.z.object({
        min_length: zod_1.z.number().min(6).max(128).default(8),
        require_uppercase: zod_1.z.boolean().default(true),
        require_lowercase: zod_1.z.boolean().default(true),
        require_numbers: zod_1.z.boolean().default(true),
        require_symbols: zod_1.z.boolean().default(false),
        prevent_reuse: zod_1.z.number().min(0).max(24).default(5) // last N passwords
    }).default({}),
    session_security: zod_1.z.object({
        secure_cookies: zod_1.z.boolean().default(true),
        same_site: zod_1.z.enum(['strict', 'lax', 'none']).default('lax'),
        remember_me_duration: zod_1.z.number().min(86400).max(2592000).default(604800) // seconds (7 days default)
    }).default({})
});
// Rate limiting schema
exports.RateLimitingSchema = zod_1.z.object({
    api_requests: zod_1.z.object({
        enabled: zod_1.z.boolean().default(true),
        requests_per_minute: zod_1.z.number().min(10).max(10000).default(1000),
        burst_limit: zod_1.z.number().min(10).max(20000).default(1500),
        window_minutes: zod_1.z.number().min(1).max(60).default(15)
    }).default({}),
    login_attempts: zod_1.z.object({
        enabled: zod_1.z.boolean().default(true),
        attempts_per_minute: zod_1.z.number().min(3).max(20).default(5),
        window_minutes: zod_1.z.number().min(5).max(60).default(15),
        progressive_delay: zod_1.z.boolean().default(true)
    }).default({}),
    registration_attempts: zod_1.z.object({
        enabled: zod_1.z.boolean().default(true),
        attempts_per_hour: zod_1.z.number().min(1).max(10).default(3),
        window_hours: zod_1.z.number().min(1).max(24).default(1)
    }).default({}),
    password_reset: zod_1.z.object({
        enabled: zod_1.z.boolean().default(true),
        attempts_per_hour: zod_1.z.number().min(1).max(10).default(5),
        window_hours: zod_1.z.number().min(1).max(24).default(1)
    }).default({})
});
// Access control schema
exports.AccessControlSchema = zod_1.z.object({
    ip_whitelist: zod_1.z.object({
        enabled: zod_1.z.boolean().default(false),
        addresses: zod_1.z.array(zod_1.z.string().ip()).default([]),
        admin_only: zod_1.z.boolean().default(false)
    }).default({}),
    ip_blacklist: zod_1.z.object({
        enabled: zod_1.z.boolean().default(false),
        addresses: zod_1.z.array(zod_1.z.string().ip()).default([]),
        auto_ban: zod_1.z.boolean().default(false),
        auto_ban_threshold: zod_1.z.number().min(5).max(100).default(20)
    }).default({}),
    country_restrictions: zod_1.z.object({
        enabled: zod_1.z.boolean().default(false),
        allowed_countries: zod_1.z.array(zod_1.z.string().length(2)).default([]), // ISO country codes
        blocked_countries: zod_1.z.array(zod_1.z.string().length(2)).default([]),
        mode: zod_1.z.enum(['allow', 'block']).default('allow')
    }).default({}),
    admin_access: zod_1.z.object({
        ip_whitelist_only: zod_1.z.boolean().default(false),
        allowed_ips: zod_1.z.array(zod_1.z.string().ip()).default([]),
        require_2fa: zod_1.z.boolean().default(true),
        session_timeout: zod_1.z.number().min(300).max(7200).default(1800)
    }).default({})
});
// Security headers schema
exports.SecurityHeadersSchema = zod_1.z.object({
    hsts: zod_1.z.object({
        enabled: zod_1.z.boolean().default(true),
        max_age: zod_1.z.number().min(300).max(31536000).default(31536000), // 1 year
        include_subdomains: zod_1.z.boolean().default(true),
        preload: zod_1.z.boolean().default(false)
    }).default({}),
    csp: zod_1.z.object({
        enabled: zod_1.z.boolean().default(true),
        report_only: zod_1.z.boolean().default(false),
        directives: zod_1.z.record(zod_1.z.string()).default({
            'default-src': "'self'",
            'script-src': "'self' 'unsafe-inline'",
            'style-src': "'self' 'unsafe-inline'",
            'img-src': "'self' data: https:",
            'font-src': "'self'",
            'connect-src': "'self'",
            'frame-ancestors': "'none'"
        })
    }).default({}),
    other_headers: zod_1.z.object({
        x_frame_options: zod_1.z.enum(['DENY', 'SAMEORIGIN', 'DISABLED']).default('DENY'),
        x_content_type_options: zod_1.z.boolean().default(true),
        x_xss_protection: zod_1.z.boolean().default(true),
        referrer_policy: zod_1.z.enum([
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
exports.FeatureFlagsSchema = zod_1.z.object({
    server_transfers: zod_1.z.boolean().default(true),
    server_backups: zod_1.z.boolean().default(true),
    scheduled_tasks: zod_1.z.boolean().default(true),
    api_access: zod_1.z.boolean().default(true),
    file_manager: zod_1.z.boolean().default(true),
    database_management: zod_1.z.boolean().default(true),
    user_registration: zod_1.z.boolean().default(true),
    server_creation: zod_1.z.boolean().default(true),
    two_factor_auth: zod_1.z.boolean().default(true),
    email_verification: zod_1.z.boolean().default(true),
    recaptcha: zod_1.z.boolean().default(false),
    advanced_analytics: zod_1.z.boolean().default(false),
    server_monitoring: zod_1.z.boolean().default(true),
    automated_backups: zod_1.z.boolean().default(true),
    server_scaling: zod_1.z.boolean().default(false),
    multi_node: zod_1.z.boolean().default(true)
});
// Email configuration schema
exports.EmailConfigSchema = zod_1.z.object({
    driver: zod_1.z.enum(['smtp', 'mailgun', 'ses', 'postmark', 'sendmail']).default('smtp'),
    from_address: zod_1.z.string().email(),
    from_name: zod_1.z.string().min(1).max(255),
    reply_to: zod_1.z.string().email().optional(),
    encryption: zod_1.z.enum(['tls', 'ssl', 'none']).default('tls')
});
// SMTP settings schema
exports.SMTPSettingsSchema = zod_1.z.object({
    host: zod_1.z.string().min(1).max(255),
    port: zod_1.z.number().min(1).max(65535).default(587),
    username: zod_1.z.string().optional(),
    password: zod_1.z.string().optional(),
    encryption: zod_1.z.enum(['tls', 'ssl', 'none']).default('tls'),
    auth: zod_1.z.boolean().default(true),
    timeout: zod_1.z.number().min(5).max(300).default(30) // seconds
});
// Mailgun settings schema
exports.MailgunSettingsSchema = zod_1.z.object({
    domain: zod_1.z.string().min(1),
    secret: zod_1.z.string().min(1),
    endpoint: zod_1.z.string().url().optional(),
    version: zod_1.z.enum(['v2', 'v3']).default('v3')
});
// AWS SES settings schema
exports.SESSettingsSchema = zod_1.z.object({
    key: zod_1.z.string().min(1),
    secret: zod_1.z.string().min(1),
    region: zod_1.z.string().min(1).default('us-east-1'),
    configuration_set: zod_1.z.string().optional()
});
// Postmark settings schema
exports.PostmarkSettingsSchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
    message_stream: zod_1.z.string().default('outbound')
});
// Database configuration schema
exports.DatabaseConfigSchema = zod_1.z.object({
    connection: zod_1.z.enum(['mysql', 'postgresql', 'sqlite', 'mariadb']).default('mysql'),
    host: zod_1.z.string().min(1),
    port: zod_1.z.number().min(1).max(65535),
    database: zod_1.z.string().min(1),
    username: zod_1.z.string().min(1),
    password: zod_1.z.string(),
    charset: zod_1.z.string().default('utf8mb4'),
    collation: zod_1.z.string().default('utf8mb4_unicode_ci'),
    prefix: zod_1.z.string().default(''),
    strict: zod_1.z.boolean().default(true),
    engine: zod_1.z.string().optional(),
    options: zod_1.z.record(zod_1.z.any()).default({})
});
// Cache configuration schema
exports.CacheConfigSchema = zod_1.z.object({
    default: zod_1.z.enum(['file', 'redis', 'memcached', 'database']).default('file'),
    connections: zod_1.z.object({
        file: zod_1.z.object({
            driver: zod_1.z.literal('file'),
            path: zod_1.z.string().default('/tmp/cache')
        }).optional(),
        redis: zod_1.z.object({
            driver: zod_1.z.literal('redis'),
            host: zod_1.z.string().default('127.0.0.1'),
            port: zod_1.z.number().min(1).max(65535).default(6379),
            password: zod_1.z.string().optional(),
            database: zod_1.z.number().min(0).max(15).default(0)
        }).optional(),
        memcached: zod_1.z.object({
            driver: zod_1.z.literal('memcached'),
            servers: zod_1.z.array(zod_1.z.object({
                host: zod_1.z.string(),
                port: zod_1.z.number().min(1).max(65535),
                weight: zod_1.z.number().min(1).default(100)
            })).default([{ host: '127.0.0.1', port: 11211, weight: 100 }])
        }).optional()
    }).default({})
});
// Queue configuration schema
exports.QueueConfigSchema = zod_1.z.object({
    default: zod_1.z.enum(['sync', 'database', 'redis', 'sqs']).default('database'),
    connections: zod_1.z.object({
        database: zod_1.z.object({
            driver: zod_1.z.literal('database'),
            table: zod_1.z.string().default('jobs'),
            queue: zod_1.z.string().default('default'),
            retry_after: zod_1.z.number().min(60).default(90)
        }).optional(),
        redis: zod_1.z.object({
            driver: zod_1.z.literal('redis'),
            connection: zod_1.z.string().default('default'),
            queue: zod_1.z.string().default('default'),
            retry_after: zod_1.z.number().min(60).default(90),
            block_for: zod_1.z.number().min(0).default(0)
        }).optional(),
        sqs: zod_1.z.object({
            driver: zod_1.z.literal('sqs'),
            key: zod_1.z.string(),
            secret: zod_1.z.string(),
            prefix: zod_1.z.string().url(),
            queue: zod_1.z.string().default('default'),
            region: zod_1.z.string().default('us-east-1')
        }).optional()
    }).default({})
});
// File storage configuration schema
exports.StorageConfigSchema = zod_1.z.object({
    default: zod_1.z.enum(['local', 's3', 'gcs', 'azure']).default('local'),
    disks: zod_1.z.object({
        local: zod_1.z.object({
            driver: zod_1.z.literal('local'),
            root: zod_1.z.string().default('/storage/app'),
            url: zod_1.z.string().url().optional(),
            visibility: zod_1.z.enum(['public', 'private']).default('private')
        }).optional(),
        s3: zod_1.z.object({
            driver: zod_1.z.literal('s3'),
            key: zod_1.z.string(),
            secret: zod_1.z.string(),
            region: zod_1.z.string(),
            bucket: zod_1.z.string(),
            url: zod_1.z.string().url().optional(),
            endpoint: zod_1.z.string().url().optional(),
            use_path_style_endpoint: zod_1.z.boolean().default(false)
        }).optional(),
        gcs: zod_1.z.object({
            driver: zod_1.z.literal('gcs'),
            project_id: zod_1.z.string(),
            key_file: zod_1.z.string().optional(),
            bucket: zod_1.z.string(),
            path_prefix: zod_1.z.string().optional()
        }).optional(),
        azure: zod_1.z.object({
            driver: zod_1.z.literal('azure'),
            name: zod_1.z.string(),
            key: zod_1.z.string(),
            container: zod_1.z.string(),
            url: zod_1.z.string().url().optional()
        }).optional()
    }).default({})
});
// Logging configuration schema
exports.LoggingConfigSchema = zod_1.z.object({
    default: zod_1.z.enum(['stack', 'single', 'daily', 'syslog', 'errorlog']).default('stack'),
    channels: zod_1.z.object({
        stack: zod_1.z.object({
            driver: zod_1.z.literal('stack'),
            channels: zod_1.z.array(zod_1.z.string()).default(['single'])
        }).optional(),
        single: zod_1.z.object({
            driver: zod_1.z.literal('single'),
            path: zod_1.z.string().default('/storage/logs/panel.log'),
            level: zod_1.z.enum(['emergency', 'alert', 'critical', 'error', 'warning', 'notice', 'info', 'debug']).default('debug')
        }).optional(),
        daily: zod_1.z.object({
            driver: zod_1.z.literal('daily'),
            path: zod_1.z.string().default('/storage/logs/panel.log'),
            level: zod_1.z.enum(['emergency', 'alert', 'critical', 'error', 'warning', 'notice', 'info', 'debug']).default('debug'),
            days: zod_1.z.number().min(1).max(365).default(14)
        }).optional(),
        syslog: zod_1.z.object({
            driver: zod_1.z.literal('syslog'),
            level: zod_1.z.enum(['emergency', 'alert', 'critical', 'error', 'warning', 'notice', 'info', 'debug']).default('debug'),
            facility: zod_1.z.string().default('local0')
        }).optional()
    }).default({})
});
// Complete system settings schema combining all sections
exports.SystemSettingsSchema = zod_1.z.object({
    panel: exports.PanelSettingsSchema.optional(),
    registration: exports.RegistrationSettingsSchema.optional(),
    limits: exports.UserLimitsSchema.optional(),
    security: exports.SecuritySettingsSchema.optional(),
    rate_limiting: exports.RateLimitingSchema.optional(),
    access_control: exports.AccessControlSchema.optional(),
    security_headers: exports.SecurityHeadersSchema.optional(),
    features: exports.FeatureFlagsSchema.optional(),
    email: exports.EmailConfigSchema.optional(),
    smtp: exports.SMTPSettingsSchema.optional(),
    mailgun: exports.MailgunSettingsSchema.optional(),
    ses: exports.SESSettingsSchema.optional(),
    postmark: exports.PostmarkSettingsSchema.optional(),
    database: exports.DatabaseConfigSchema.optional(),
    cache: exports.CacheConfigSchema.optional(),
    queue: exports.QueueConfigSchema.optional(),
    storage: exports.StorageConfigSchema.optional(),
    logging: exports.LoggingConfigSchema.optional()
});
// Email test schema
exports.EmailTestSchema = zod_1.z.object({
    recipient: zod_1.z.string().email(),
    test_type: zod_1.z.enum(['basic', 'template', 'attachment']).default('basic'),
    template: zod_1.z.string().optional(),
    variables: zod_1.z.record(zod_1.z.any()).optional()
});
// Configuration backup/restore schemas
exports.ConfigBackupSchema = zod_1.z.object({
    include_sections: zod_1.z.array(zod_1.z.string()).optional(),
    exclude_sensitive: zod_1.z.boolean().default(true),
    format: zod_1.z.enum(['json', 'yaml', 'env']).default('json'),
    compress: zod_1.z.boolean().default(false)
});
exports.ConfigRestoreSchema = zod_1.z.object({
    backup_data: zod_1.z.string(),
    format: zod_1.z.enum(['json', 'yaml', 'env']),
    merge_mode: zod_1.z.enum(['replace', 'merge', 'overlay']).default('merge'),
    validate_only: zod_1.z.boolean().default(false),
    backup_current: zod_1.z.boolean().default(true)
});
// Export utility functions
function validateEmailDriver(driver, settings) {
    switch (driver) {
        case 'smtp':
            return exports.SMTPSettingsSchema.safeParse(settings).success;
        case 'mailgun':
            return exports.MailgunSettingsSchema.safeParse(settings).success;
        case 'ses':
            return exports.SESSettingsSchema.safeParse(settings).success;
        case 'postmark':
            return exports.PostmarkSettingsSchema.safeParse(settings).success;
        default:
            return false;
    }
}
function validatePasswordRequirements(password, requirements) {
    const errors = [];
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
function sanitizeConfigForExport(config, excludeSensitive = true) {
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
            }
            else {
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
//# sourceMappingURL=settings.js.map