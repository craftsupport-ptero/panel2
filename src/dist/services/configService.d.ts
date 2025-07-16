/**
 * Configuration Service
 * Handles system configuration management, validation, and updates
 */
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
export declare class ConfigService {
    private readonly CONFIG_CACHE_KEY;
    private readonly CONFIG_CACHE_TTL;
    /**
     * Get all system settings
     */
    getSystemSettings(): Promise<SystemSettings>;
    /**
     * Update system settings
     */
    updateSystemSettings(updates: Partial<SystemSettings>, updatedBy: string): Promise<string[]>;
    /**
     * Get email settings
     */
    getEmailSettings(): Promise<EmailSettings>;
    /**
     * Update email settings
     */
    updateEmailSettings(settings: EmailSettings, updatedBy: string): Promise<void>;
    /**
     * Get security settings
     */
    getSecuritySettings(): Promise<SecuritySettings>;
    /**
     * Update security settings
     */
    updateSecuritySettings(settings: SecuritySettings, updatedBy: string): Promise<string[]>;
    /**
     * Test email configuration
     */
    testEmailConfiguration(recipient: string): Promise<{
        success: boolean;
        message: string;
        details?: any;
    }>;
    /**
     * Get configuration by key
     */
    getConfig(key: string, defaultValue?: any): Promise<any>;
    /**
     * Set configuration value
     */
    setConfig(key: string, value: any, updatedBy: string): Promise<void>;
    /**
     * Reset configuration to defaults
     */
    resetToDefaults(sections?: string[], updatedBy?: string): Promise<void>;
    private loadSystemSettingsFromDatabase;
    private saveSystemSettingsToDatabase;
    private loadEmailSettingsFromDatabase;
    private saveEmailSettingsToDatabase;
    private loadSecuritySettingsFromDatabase;
    private saveSecuritySettingsToDatabase;
    private getDefaultSettings;
    private mergeSettings;
    private validateSystemSettings;
    private validateEmailSettings;
    private validateSecuritySettings;
    private checkSecurityWarnings;
    private sendTestEmail;
    private logConfigurationChange;
    private getFromCache;
    private setCache;
    private clearCache;
    private getNestedValue;
    private setNestedValue;
    private isValidUrl;
    private isValidEmail;
}
//# sourceMappingURL=configService.d.ts.map