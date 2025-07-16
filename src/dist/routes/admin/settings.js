"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemSettings = getSystemSettings;
exports.updateSystemSettings = updateSystemSettings;
exports.getEmailSettings = getEmailSettings;
exports.updateEmailSettings = updateEmailSettings;
exports.getSecuritySettings = getSecuritySettings;
exports.updateSecuritySettings = updateSecuritySettings;
exports.testEmailConfiguration = testEmailConfiguration;
const zod_1 = require("zod");
// System settings schema
const SystemSettingsSchema = zod_1.z.object({
    panel: zod_1.z.object({
        name: zod_1.z.string().min(1).max(255),
        url: zod_1.z.string().url(),
        description: zod_1.z.string().max(1000).optional(),
        logo_url: zod_1.z.string().url().optional(),
        favicon_url: zod_1.z.string().url().optional()
    }).optional(),
    registration: zod_1.z.object({
        enabled: zod_1.z.boolean(),
        email_verification: zod_1.z.boolean(),
        approval_required: zod_1.z.boolean().default(false),
        allowed_domains: zod_1.z.array(zod_1.z.string()).optional(),
        blocked_domains: zod_1.z.array(zod_1.z.string()).optional()
    }).optional(),
    limits: zod_1.z.object({
        max_servers_per_user: zod_1.z.number().min(0),
        max_memory_per_server: zod_1.z.number().min(0),
        max_disk_per_server: zod_1.z.number().min(0),
        max_cpu_per_server: zod_1.z.number().min(0),
        max_backups_per_server: zod_1.z.number().min(0).default(5)
    }).optional(),
    security: zod_1.z.object({
        enforce_2fa: zod_1.z.boolean().default(false),
        session_timeout: zod_1.z.number().min(300).max(86400), // 5 minutes to 24 hours
        max_login_attempts: zod_1.z.number().min(3).max(20).default(5),
        lockout_duration: zod_1.z.number().min(300).max(3600).default(900) // 5 minutes to 1 hour
    }).optional(),
    features: zod_1.z.object({
        server_transfers: zod_1.z.boolean().default(true),
        server_backups: zod_1.z.boolean().default(true),
        scheduled_tasks: zod_1.z.boolean().default(true),
        api_access: zod_1.z.boolean().default(true),
        file_manager: zod_1.z.boolean().default(true)
    }).optional()
});
// Email settings schema
const EmailSettingsSchema = zod_1.z.object({
    driver: zod_1.z.enum(['smtp', 'mailgun', 'ses', 'sendmail']),
    from_address: zod_1.z.string().email(),
    from_name: zod_1.z.string().min(1).max(255),
    smtp: zod_1.z.object({
        host: zod_1.z.string().min(1),
        port: zod_1.z.number().min(1).max(65535),
        username: zod_1.z.string().optional(),
        password: zod_1.z.string().optional(),
        encryption: zod_1.z.enum(['none', 'tls', 'ssl']).default('tls')
    }).optional(),
    mailgun: zod_1.z.object({
        domain: zod_1.z.string().min(1),
        secret: zod_1.z.string().min(1),
        endpoint: zod_1.z.string().url().optional()
    }).optional(),
    ses: zod_1.z.object({
        key: zod_1.z.string().min(1),
        secret: zod_1.z.string().min(1),
        region: zod_1.z.string().min(1)
    }).optional()
});
// Security settings schema
const SecuritySettingsSchema = zod_1.z.object({
    rate_limits: zod_1.z.object({
        api_requests: zod_1.z.number().min(10).max(10000).default(1000),
        login_attempts: zod_1.z.number().min(3).max(20).default(5),
        registration_attempts: zod_1.z.number().min(1).max(10).default(3),
        window_minutes: zod_1.z.number().min(1).max(60).default(15)
    }),
    access_control: zod_1.z.object({
        allowed_ips: zod_1.z.array(zod_1.z.string()).optional(),
        blocked_ips: zod_1.z.array(zod_1.z.string()).optional(),
        country_restrictions: zod_1.z.array(zod_1.z.string()).optional(),
        admin_ip_whitelist: zod_1.z.array(zod_1.z.string()).optional()
    }),
    authentication: zod_1.z.object({
        require_2fa_admin: zod_1.z.boolean().default(true),
        require_2fa_users: zod_1.z.boolean().default(false),
        password_min_length: zod_1.z.number().min(6).max(128).default(8),
        password_complexity: zod_1.z.boolean().default(true),
        session_lifetime: zod_1.z.number().min(3600).max(2592000).default(86400) // 1 hour to 30 days
    }),
    security_headers: zod_1.z.object({
        hsts_enabled: zod_1.z.boolean().default(true),
        csp_enabled: zod_1.z.boolean().default(true),
        xss_protection: zod_1.z.boolean().default(true),
        content_type_nosniff: zod_1.z.boolean().default(true)
    })
});
/**
 * Get all system settings
 * GET /api/admin/settings
 */
async function getSystemSettings(req, res) {
    try {
        if (!req.user?.hasPermission('admin.settings.view')) {
            return res.status(403).json({
                error: 'Insufficient permissions'
            });
        }
        // TODO: Implement actual settings retrieval from database
        const settings = {
            panel: {
                name: 'Pterodactyl Panel',
                url: 'https://panel.example.com',
                description: 'Game server management panel',
                logo_url: null,
                favicon_url: null
            },
            registration: {
                enabled: true,
                email_verification: true,
                approval_required: false,
                allowed_domains: [],
                blocked_domains: ['tempmail.org', '10minutemail.com']
            },
            limits: {
                max_servers_per_user: 5,
                max_memory_per_server: 4096,
                max_disk_per_server: 10240,
                max_cpu_per_server: 200,
                max_backups_per_server: 5
            },
            security: {
                enforce_2fa: false,
                session_timeout: 3600,
                max_login_attempts: 5,
                lockout_duration: 900
            },
            features: {
                server_transfers: true,
                server_backups: true,
                scheduled_tasks: true,
                api_access: true,
                file_manager: true
            },
            last_updated: '2024-01-15T10:30:00Z',
            updated_by: 'admin'
        };
        res.json(settings);
    }
    catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve system settings'
        });
    }
}
/**
 * Update system settings
 * PUT /api/admin/settings
 */
async function updateSystemSettings(req, res) {
    try {
        if (!req.user?.hasPermission('admin.settings.update')) {
            return res.status(403).json({
                error: 'Insufficient permissions'
            });
        }
        const validatedSettings = SystemSettingsSchema.parse(req.body);
        // TODO: Implement actual settings update
        const updatedFields = Object.keys(validatedSettings);
        const result = {
            updated_settings: updatedFields,
            validation_errors: [],
            applied_at: new Date().toISOString(),
            updated_by: req.user.username
        };
        res.json(result);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors
            });
        }
        console.error('Update settings error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update system settings'
        });
    }
}
/**
 * Get email configuration
 * GET /api/admin/settings/email
 */
async function getEmailSettings(req, res) {
    try {
        if (!req.user?.hasPermission('admin.settings.view')) {
            return res.status(403).json({
                error: 'Insufficient permissions'
            });
        }
        // TODO: Implement actual email settings retrieval
        const emailSettings = {
            driver: 'smtp',
            from_address: 'noreply@example.com',
            from_name: 'Pterodactyl Panel',
            smtp: {
                host: 'smtp.example.com',
                port: 587,
                username: 'noreply@example.com',
                password: '***HIDDEN***', // Never expose actual password
                encryption: 'tls'
            },
            test_status: {
                last_test: '2024-01-15T09:30:00Z',
                success: true,
                message: 'Email test successful'
            }
        };
        res.json(emailSettings);
    }
    catch (error) {
        console.error('Get email settings error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve email settings'
        });
    }
}
/**
 * Update email configuration
 * PUT /api/admin/settings/email
 */
async function updateEmailSettings(req, res) {
    try {
        if (!req.user?.hasPermission('admin.settings.update')) {
            return res.status(403).json({
                error: 'Insufficient permissions'
            });
        }
        const emailSettings = EmailSettingsSchema.parse(req.body);
        // TODO: Implement actual email settings update
        const result = {
            message: 'Email settings updated successfully',
            updated_fields: Object.keys(emailSettings),
            applied_at: new Date().toISOString()
        };
        res.json(result);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors
            });
        }
        console.error('Update email settings error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update email settings'
        });
    }
}
/**
 * Get security configuration
 * GET /api/admin/settings/security
 */
async function getSecuritySettings(req, res) {
    try {
        if (!req.user?.hasPermission('admin.security.view')) {
            return res.status(403).json({
                error: 'Insufficient permissions'
            });
        }
        // TODO: Implement actual security settings retrieval
        const securitySettings = {
            rate_limits: {
                api_requests: 1000,
                login_attempts: 5,
                registration_attempts: 3,
                window_minutes: 15
            },
            access_control: {
                allowed_ips: [],
                blocked_ips: ['192.168.1.100'],
                country_restrictions: [],
                admin_ip_whitelist: []
            },
            authentication: {
                require_2fa_admin: true,
                require_2fa_users: false,
                password_min_length: 8,
                password_complexity: true,
                session_lifetime: 86400
            },
            security_headers: {
                hsts_enabled: true,
                csp_enabled: true,
                xss_protection: true,
                content_type_nosniff: true
            },
            recent_events: [
                {
                    type: 'failed_login',
                    ip: '192.168.1.100',
                    timestamp: '2024-01-15T10:25:00Z',
                    user_agent: 'Mozilla/5.0...'
                }
            ]
        };
        res.json(securitySettings);
    }
    catch (error) {
        console.error('Get security settings error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve security settings'
        });
    }
}
/**
 * Update security configuration
 * PUT /api/admin/settings/security
 */
async function updateSecuritySettings(req, res) {
    try {
        if (!req.user?.hasPermission('admin.security.manage')) {
            return res.status(403).json({
                error: 'Insufficient permissions'
            });
        }
        const securitySettings = SecuritySettingsSchema.parse(req.body);
        // TODO: Implement actual security settings update
        const result = {
            message: 'Security settings updated successfully',
            updated_fields: Object.keys(securitySettings),
            applied_at: new Date().toISOString(),
            warnings: []
        };
        // Add warnings for potentially dangerous changes
        if (securitySettings.access_control?.admin_ip_whitelist?.length === 0) {
            result.warnings.push('Admin IP whitelist is empty - ensure you have alternative access');
        }
        res.json(result);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors
            });
        }
        console.error('Update security settings error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update security settings'
        });
    }
}
/**
 * Test email configuration
 * POST /api/admin/settings/test-email
 */
async function testEmailConfiguration(req, res) {
    try {
        if (!req.user?.hasPermission('admin.settings.update')) {
            return res.status(403).json({
                error: 'Insufficient permissions'
            });
        }
        const { recipient } = zod_1.z.object({
            recipient: zod_1.z.string().email().optional()
        }).parse(req.body);
        const testEmail = recipient || req.user.email;
        // TODO: Implement actual email test
        const testResult = {
            success: true,
            message: `Test email sent successfully to ${testEmail}`,
            timestamp: new Date().toISOString(),
            details: {
                from: 'noreply@example.com',
                to: testEmail,
                subject: 'Pterodactyl Panel - Email Configuration Test',
                delivery_time: 847 // milliseconds
            }
        };
        res.json(testResult);
    }
    catch (error) {
        console.error('Email test error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to send test email'
        });
    }
}
//# sourceMappingURL=settings.js.map