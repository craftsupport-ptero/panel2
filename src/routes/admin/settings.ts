import { Request, Response } from 'express';
import { z } from 'zod';

// System settings schema
const SystemSettingsSchema = z.object({
  panel: z.object({
    name: z.string().min(1).max(255),
    url: z.string().url(),
    description: z.string().max(1000).optional(),
    logo_url: z.string().url().optional(),
    favicon_url: z.string().url().optional()
  }).optional(),
  registration: z.object({
    enabled: z.boolean(),
    email_verification: z.boolean(),
    approval_required: z.boolean().default(false),
    allowed_domains: z.array(z.string()).optional(),
    blocked_domains: z.array(z.string()).optional()
  }).optional(),
  limits: z.object({
    max_servers_per_user: z.number().min(0),
    max_memory_per_server: z.number().min(0),
    max_disk_per_server: z.number().min(0),
    max_cpu_per_server: z.number().min(0),
    max_backups_per_server: z.number().min(0).default(5)
  }).optional(),
  security: z.object({
    enforce_2fa: z.boolean().default(false),
    session_timeout: z.number().min(300).max(86400), // 5 minutes to 24 hours
    max_login_attempts: z.number().min(3).max(20).default(5),
    lockout_duration: z.number().min(300).max(3600).default(900) // 5 minutes to 1 hour
  }).optional(),
  features: z.object({
    server_transfers: z.boolean().default(true),
    server_backups: z.boolean().default(true),
    scheduled_tasks: z.boolean().default(true),
    api_access: z.boolean().default(true),
    file_manager: z.boolean().default(true)
  }).optional()
});

// Email settings schema
const EmailSettingsSchema = z.object({
  driver: z.enum(['smtp', 'mailgun', 'ses', 'sendmail']),
  from_address: z.string().email(),
  from_name: z.string().min(1).max(255),
  smtp: z.object({
    host: z.string().min(1),
    port: z.number().min(1).max(65535),
    username: z.string().optional(),
    password: z.string().optional(),
    encryption: z.enum(['none', 'tls', 'ssl']).default('tls')
  }).optional(),
  mailgun: z.object({
    domain: z.string().min(1),
    secret: z.string().min(1),
    endpoint: z.string().url().optional()
  }).optional(),
  ses: z.object({
    key: z.string().min(1),
    secret: z.string().min(1),
    region: z.string().min(1)
  }).optional()
});

// Security settings schema
const SecuritySettingsSchema = z.object({
  rate_limits: z.object({
    api_requests: z.number().min(10).max(10000).default(1000),
    login_attempts: z.number().min(3).max(20).default(5),
    registration_attempts: z.number().min(1).max(10).default(3),
    window_minutes: z.number().min(1).max(60).default(15)
  }),
  access_control: z.object({
    allowed_ips: z.array(z.string()).optional(),
    blocked_ips: z.array(z.string()).optional(),
    country_restrictions: z.array(z.string()).optional(),
    admin_ip_whitelist: z.array(z.string()).optional()
  }),
  authentication: z.object({
    require_2fa_admin: z.boolean().default(true),
    require_2fa_users: z.boolean().default(false),
    password_min_length: z.number().min(6).max(128).default(8),
    password_complexity: z.boolean().default(true),
    session_lifetime: z.number().min(3600).max(2592000).default(86400) // 1 hour to 30 days
  }),
  security_headers: z.object({
    hsts_enabled: z.boolean().default(true),
    csp_enabled: z.boolean().default(true),
    xss_protection: z.boolean().default(true),
    content_type_nosniff: z.boolean().default(true)
  })
});

/**
 * Get all system settings
 * GET /api/admin/settings
 */
export async function getSystemSettings(req: Request, res: Response) {
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
  } catch (error) {
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
export async function updateSystemSettings(req: Request, res: Response) {
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
  } catch (error) {
    if (error instanceof z.ZodError) {
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
export async function getEmailSettings(req: Request, res: Response) {
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
  } catch (error) {
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
export async function updateEmailSettings(req: Request, res: Response) {
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
  } catch (error) {
    if (error instanceof z.ZodError) {
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
export async function getSecuritySettings(req: Request, res: Response) {
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
  } catch (error) {
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
export async function updateSecuritySettings(req: Request, res: Response) {
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
      warnings: [] as string[]
    };

    // Add warnings for potentially dangerous changes
    if (securitySettings.access_control?.admin_ip_whitelist?.length === 0) {
      result.warnings.push('Admin IP whitelist is empty - ensure you have alternative access');
    }

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
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
export async function testEmailConfiguration(req: Request, res: Response) {
  try {
    if (!req.user?.hasPermission('admin.settings.update')) {
      return res.status(403).json({
        error: 'Insufficient permissions'
      });
    }

    const { recipient } = z.object({
      recipient: z.string().email().optional()
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
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to send test email'
    });
  }
}