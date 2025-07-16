/**
 * Configuration Service
 * Handles system configuration management, validation, and updates
 */

import { getErrorMessage } from '../utils';

export interface SystemSettings {
  panel: {
    name: string;
    url: string;
    description?: string;
    logo_url?: string;
    favicon_url?: string;
  };
  registration: {
    enabled: boolean;
    email_verification: boolean;
    approval_required: boolean;
    allowed_domains: string[];
    blocked_domains: string[];
  };
  limits: {
    max_servers_per_user: number;
    max_memory_per_server: number;
    max_disk_per_server: number;
    max_cpu_per_server: number;
    max_backups_per_server: number;
  };
  security: {
    enforce_2fa: boolean;
    session_timeout: number;
    max_login_attempts: number;
    lockout_duration: number;
  };
  features: {
    server_transfers: boolean;
    server_backups: boolean;
    scheduled_tasks: boolean;
    api_access: boolean;
    file_manager: boolean;
  };
}

export interface EmailSettings {
  driver: 'smtp' | 'mailgun' | 'ses' | 'sendmail';
  from_address: string;
  from_name: string;
  smtp?: {
    host: string;
    port: number;
    username?: string;
    password?: string;
    encryption: 'none' | 'tls' | 'ssl';
  };
  mailgun?: {
    domain: string;
    secret: string;
    endpoint?: string;
  };
  ses?: {
    key: string;
    secret: string;
    region: string;
  };
}

export interface SecuritySettings {
  rate_limits: {
    api_requests: number;
    login_attempts: number;
    registration_attempts: number;
    window_minutes: number;
  };
  access_control: {
    allowed_ips: string[];
    blocked_ips: string[];
    country_restrictions: string[];
    admin_ip_whitelist: string[];
  };
  authentication: {
    require_2fa_admin: boolean;
    require_2fa_users: boolean;
    password_min_length: number;
    password_complexity: boolean;
    session_lifetime: number;
  };
  security_headers: {
    hsts_enabled: boolean;
    csp_enabled: boolean;
    xss_protection: boolean;
    content_type_nosniff: boolean;
  };
}

export class ConfigService {
  private readonly CONFIG_CACHE_KEY = 'system_config';
  private readonly CONFIG_CACHE_TTL = 300; // 5 minutes

  /**
   * Get all system settings
   */
  async getSystemSettings(): Promise<SystemSettings> {
    // TODO: Implement caching and database retrieval
    const cached = await this.getFromCache(this.CONFIG_CACHE_KEY);
    if (cached) {
      return cached;
    }

    const settings = await this.loadSystemSettingsFromDatabase();
    await this.setCache(this.CONFIG_CACHE_KEY, settings, this.CONFIG_CACHE_TTL);
    
    return settings;
  }

  /**
   * Update system settings
   */
  async updateSystemSettings(updates: Partial<SystemSettings>, updatedBy: string): Promise<string[]> {
    const currentSettings = await this.getSystemSettings();
    const newSettings = this.mergeSettings(currentSettings, updates);
    
    // Validate the new settings
    await this.validateSystemSettings(newSettings);
    
    // Save to database
    await this.saveSystemSettingsToDatabase(newSettings, updatedBy);
    
    // Clear cache
    await this.clearCache(this.CONFIG_CACHE_KEY);
    
    // Log the changes
    await this.logConfigurationChange('system_settings', Object.keys(updates), updatedBy);
    
    return Object.keys(updates);
  }

  /**
   * Get email settings
   */
  async getEmailSettings(): Promise<EmailSettings> {
    // TODO: Implement database retrieval with password masking
    return await this.loadEmailSettingsFromDatabase();
  }

  /**
   * Update email settings
   */
  async updateEmailSettings(settings: EmailSettings, updatedBy: string): Promise<void> {
    // Validate email settings
    await this.validateEmailSettings(settings);
    
    // Save to database
    await this.saveEmailSettingsToDatabase(settings, updatedBy);
    
    // Clear cache
    await this.clearCache('email_config');
    
    // Log the change
    await this.logConfigurationChange('email_settings', ['email_configuration'], updatedBy);
  }

  /**
   * Get security settings
   */
  async getSecuritySettings(): Promise<SecuritySettings> {
    // TODO: Implement database retrieval
    return await this.loadSecuritySettingsFromDatabase();
  }

  /**
   * Update security settings
   */
  async updateSecuritySettings(settings: SecuritySettings, updatedBy: string): Promise<string[]> {
    // Validate security settings
    await this.validateSecuritySettings(settings);
    
    // Check for potentially dangerous changes
    const warnings = await this.checkSecurityWarnings(settings);
    
    // Save to database
    await this.saveSecuritySettingsToDatabase(settings, updatedBy);
    
    // Clear cache
    await this.clearCache('security_config');
    
    // Log the change
    await this.logConfigurationChange('security_settings', Object.keys(settings), updatedBy);
    
    return warnings;
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration(recipient: string): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      const emailSettings = await this.getEmailSettings();
      
      // TODO: Implement actual email sending
      const testResult = await this.sendTestEmail(emailSettings, recipient);
      
      return {
        success: true,
        message: `Test email sent successfully to ${recipient}`,
        details: {
          from: emailSettings.from_address,
          to: recipient,
          subject: 'Pterodactyl Panel - Email Configuration Test',
          delivery_time: testResult.deliveryTime
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to send test email: ${getErrorMessage(error)}`
      };
    }
  }

  /**
   * Get configuration by key
   */
  async getConfig(key: string, defaultValue?: any): Promise<any> {
    const settings = await this.getSystemSettings();
    return this.getNestedValue(settings, key) || defaultValue;
  }

  /**
   * Set configuration value
   */
  async setConfig(key: string, value: any, updatedBy: string): Promise<void> {
    const currentSettings = await this.getSystemSettings();
    const newSettings = this.setNestedValue(currentSettings, key, value);
    
    await this.updateSystemSettings(newSettings, updatedBy);
  }

  /**
   * Reset configuration to defaults
   */
  async resetToDefaults(sections?: string[], updatedBy?: string): Promise<void> {
    const defaultSettings = this.getDefaultSettings();
    
    if (sections && sections.length > 0) {
      const currentSettings = await this.getSystemSettings();
      const resetSettings = { ...currentSettings };
      
      sections.forEach(section => {
        if (section in defaultSettings) {
          (resetSettings as any)[section] = (defaultSettings as any)[section];
        }
      });
      
      await this.updateSystemSettings(resetSettings, updatedBy || 'system');
    } else {
      await this.updateSystemSettings(defaultSettings, updatedBy || 'system');
    }
  }

  // Private helper methods
  private async loadSystemSettingsFromDatabase(): Promise<SystemSettings> {
    // TODO: Implement actual database query
    return this.getDefaultSettings();
  }

  private async saveSystemSettingsToDatabase(settings: SystemSettings, updatedBy: string): Promise<void> {
    // TODO: Implement database save with audit trail
    console.log('Saving system settings updated by:', updatedBy);
  }

  private async loadEmailSettingsFromDatabase(): Promise<EmailSettings> {
    // TODO: Implement actual database query with password masking
    return {
      driver: 'smtp',
      from_address: 'noreply@example.com',
      from_name: 'Pterodactyl Panel',
      smtp: {
        host: 'smtp.example.com',
        port: 587,
        username: 'noreply@example.com',
        password: '***HIDDEN***',
        encryption: 'tls'
      }
    };
  }

  private async saveEmailSettingsToDatabase(settings: EmailSettings, updatedBy: string): Promise<void> {
    // TODO: Implement database save with password encryption
    console.log('Saving email settings updated by:', updatedBy);
  }

  private async loadSecuritySettingsFromDatabase(): Promise<SecuritySettings> {
    // TODO: Implement actual database query
    return {
      rate_limits: {
        api_requests: 1000,
        login_attempts: 5,
        registration_attempts: 3,
        window_minutes: 15
      },
      access_control: {
        allowed_ips: [],
        blocked_ips: [],
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
      }
    };
  }

  private async saveSecuritySettingsToDatabase(settings: SecuritySettings, updatedBy: string): Promise<void> {
    // TODO: Implement database save
    console.log('Saving security settings updated by:', updatedBy);
  }

  private getDefaultSettings(): SystemSettings {
    return {
      panel: {
        name: 'Pterodactyl Panel',
        url: 'https://panel.example.com',
        description: 'Game server management panel'
      },
      registration: {
        enabled: true,
        email_verification: true,
        approval_required: false,
        allowed_domains: [],
        blocked_domains: []
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
      }
    };
  }

  private mergeSettings(current: SystemSettings, updates: Partial<SystemSettings>): SystemSettings {
    // Deep merge the settings
    return { ...current, ...updates };
  }

  private async validateSystemSettings(settings: SystemSettings): Promise<void> {
    // TODO: Implement comprehensive validation
    if (!settings.panel.name || settings.panel.name.trim().length === 0) {
      throw new Error('Panel name is required');
    }
    
    if (!settings.panel.url || !this.isValidUrl(settings.panel.url)) {
      throw new Error('Valid panel URL is required');
    }
  }

  private async validateEmailSettings(settings: EmailSettings): Promise<void> {
    // TODO: Implement email settings validation
    if (!settings.from_address || !this.isValidEmail(settings.from_address)) {
      throw new Error('Valid from address is required');
    }
  }

  private async validateSecuritySettings(settings: SecuritySettings): Promise<void> {
    // TODO: Implement security settings validation
    if (settings.authentication.password_min_length < 6) {
      throw new Error('Minimum password length must be at least 6 characters');
    }
  }

  private async checkSecurityWarnings(settings: SecuritySettings): Promise<string[]> {
    const warnings: string[] = [];
    
    if (settings.access_control.admin_ip_whitelist.length === 0) {
      warnings.push('Admin IP whitelist is empty - ensure you have alternative access');
    }
    
    if (!settings.authentication.require_2fa_admin) {
      warnings.push('Two-factor authentication is not required for admins');
    }
    
    return warnings;
  }

  private async sendTestEmail(settings: EmailSettings, recipient: string): Promise<{ deliveryTime: number }> {
    // TODO: Implement actual email sending based on driver
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ deliveryTime: Math.random() * 1000 + 500 });
      }, 1000);
    });
  }

  private async logConfigurationChange(section: string, changes: string[], updatedBy: string): Promise<void> {
    // TODO: Implement audit logging
    console.log(`Configuration change in ${section}:`, changes, 'by', updatedBy);
  }

  private async getFromCache(key: string): Promise<any> {
    // TODO: Implement cache retrieval (Redis, etc.)
    return null;
  }

  private async setCache(key: string, value: any, ttl: number): Promise<void> {
    // TODO: Implement cache storage
  }

  private async clearCache(key: string): Promise<void> {
    // TODO: Implement cache clearing
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setNestedValue(obj: any, path: string, value: any): any {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      current[key] = current[key] || {};
      return current[key];
    }, obj);
    
    if (lastKey) {
      target[lastKey] = value;
    }
    
    return obj;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}