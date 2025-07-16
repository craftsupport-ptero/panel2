import { z } from 'zod';
export declare const PanelSettingsSchema: z.ZodObject<{
    name: z.ZodString;
    url: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    logo_url: z.ZodOptional<z.ZodString>;
    favicon_url: z.ZodOptional<z.ZodString>;
    timezone: z.ZodDefault<z.ZodString>;
    language: z.ZodDefault<z.ZodString>;
    theme: z.ZodDefault<z.ZodEnum<["light", "dark", "auto"]>>;
    maintenance_mode: z.ZodDefault<z.ZodBoolean>;
    maintenance_message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    maintenance_mode: boolean;
    name: string;
    url: string;
    language: string;
    timezone: string;
    theme: "light" | "dark" | "auto";
    description?: string | undefined;
    logo_url?: string | undefined;
    favicon_url?: string | undefined;
    maintenance_message?: string | undefined;
}, {
    name: string;
    url: string;
    maintenance_mode?: boolean | undefined;
    description?: string | undefined;
    logo_url?: string | undefined;
    favicon_url?: string | undefined;
    language?: string | undefined;
    timezone?: string | undefined;
    theme?: "light" | "dark" | "auto" | undefined;
    maintenance_message?: string | undefined;
}>;
export declare const RegistrationSettingsSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    email_verification: z.ZodDefault<z.ZodBoolean>;
    approval_required: z.ZodDefault<z.ZodBoolean>;
    allowed_domains: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
    blocked_domains: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    recaptcha_enabled: z.ZodDefault<z.ZodBoolean>;
    recaptcha_site_key: z.ZodOptional<z.ZodString>;
    recaptcha_secret_key: z.ZodOptional<z.ZodString>;
    terms_required: z.ZodDefault<z.ZodBoolean>;
    terms_url: z.ZodOptional<z.ZodString>;
    privacy_required: z.ZodDefault<z.ZodBoolean>;
    privacy_url: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    email_verification: boolean;
    approval_required: boolean;
    allowed_domains: string[];
    blocked_domains: string[];
    recaptcha_enabled: boolean;
    terms_required: boolean;
    privacy_required: boolean;
    recaptcha_site_key?: string | undefined;
    recaptcha_secret_key?: string | undefined;
    terms_url?: string | undefined;
    privacy_url?: string | undefined;
}, {
    enabled?: boolean | undefined;
    email_verification?: boolean | undefined;
    approval_required?: boolean | undefined;
    allowed_domains?: string[] | undefined;
    blocked_domains?: string[] | undefined;
    recaptcha_enabled?: boolean | undefined;
    recaptcha_site_key?: string | undefined;
    recaptcha_secret_key?: string | undefined;
    terms_required?: boolean | undefined;
    terms_url?: string | undefined;
    privacy_required?: boolean | undefined;
    privacy_url?: string | undefined;
}>;
export declare const UserLimitsSchema: z.ZodObject<{
    max_servers_per_user: z.ZodDefault<z.ZodNumber>;
    max_memory_per_server: z.ZodDefault<z.ZodNumber>;
    max_disk_per_server: z.ZodDefault<z.ZodNumber>;
    max_cpu_per_server: z.ZodDefault<z.ZodNumber>;
    max_databases_per_server: z.ZodDefault<z.ZodNumber>;
    max_allocations_per_server: z.ZodDefault<z.ZodNumber>;
    max_backups_per_server: z.ZodDefault<z.ZodNumber>;
    max_file_uploads_per_minute: z.ZodDefault<z.ZodNumber>;
    max_api_requests_per_minute: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    max_servers_per_user: number;
    max_memory_per_server: number;
    max_disk_per_server: number;
    max_cpu_per_server: number;
    max_backups_per_server: number;
    max_databases_per_server: number;
    max_allocations_per_server: number;
    max_file_uploads_per_minute: number;
    max_api_requests_per_minute: number;
}, {
    max_servers_per_user?: number | undefined;
    max_memory_per_server?: number | undefined;
    max_disk_per_server?: number | undefined;
    max_cpu_per_server?: number | undefined;
    max_backups_per_server?: number | undefined;
    max_databases_per_server?: number | undefined;
    max_allocations_per_server?: number | undefined;
    max_file_uploads_per_minute?: number | undefined;
    max_api_requests_per_minute?: number | undefined;
}>;
export declare const SecuritySettingsSchema: z.ZodObject<{
    enforce_2fa: z.ZodDefault<z.ZodBoolean>;
    enforce_2fa_admin: z.ZodDefault<z.ZodBoolean>;
    session_timeout: z.ZodDefault<z.ZodNumber>;
    max_login_attempts: z.ZodDefault<z.ZodNumber>;
    lockout_duration: z.ZodDefault<z.ZodNumber>;
    password_requirements: z.ZodDefault<z.ZodObject<{
        min_length: z.ZodDefault<z.ZodNumber>;
        require_uppercase: z.ZodDefault<z.ZodBoolean>;
        require_lowercase: z.ZodDefault<z.ZodBoolean>;
        require_numbers: z.ZodDefault<z.ZodBoolean>;
        require_symbols: z.ZodDefault<z.ZodBoolean>;
        prevent_reuse: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        min_length: number;
        require_uppercase: boolean;
        require_lowercase: boolean;
        require_numbers: boolean;
        require_symbols: boolean;
        prevent_reuse: number;
    }, {
        min_length?: number | undefined;
        require_uppercase?: boolean | undefined;
        require_lowercase?: boolean | undefined;
        require_numbers?: boolean | undefined;
        require_symbols?: boolean | undefined;
        prevent_reuse?: number | undefined;
    }>>;
    session_security: z.ZodDefault<z.ZodObject<{
        secure_cookies: z.ZodDefault<z.ZodBoolean>;
        same_site: z.ZodDefault<z.ZodEnum<["strict", "lax", "none"]>>;
        remember_me_duration: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        secure_cookies: boolean;
        same_site: "none" | "strict" | "lax";
        remember_me_duration: number;
    }, {
        secure_cookies?: boolean | undefined;
        same_site?: "none" | "strict" | "lax" | undefined;
        remember_me_duration?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    enforce_2fa: boolean;
    session_timeout: number;
    max_login_attempts: number;
    lockout_duration: number;
    enforce_2fa_admin: boolean;
    password_requirements: {
        min_length: number;
        require_uppercase: boolean;
        require_lowercase: boolean;
        require_numbers: boolean;
        require_symbols: boolean;
        prevent_reuse: number;
    };
    session_security: {
        secure_cookies: boolean;
        same_site: "none" | "strict" | "lax";
        remember_me_duration: number;
    };
}, {
    enforce_2fa?: boolean | undefined;
    session_timeout?: number | undefined;
    max_login_attempts?: number | undefined;
    lockout_duration?: number | undefined;
    enforce_2fa_admin?: boolean | undefined;
    password_requirements?: {
        min_length?: number | undefined;
        require_uppercase?: boolean | undefined;
        require_lowercase?: boolean | undefined;
        require_numbers?: boolean | undefined;
        require_symbols?: boolean | undefined;
        prevent_reuse?: number | undefined;
    } | undefined;
    session_security?: {
        secure_cookies?: boolean | undefined;
        same_site?: "none" | "strict" | "lax" | undefined;
        remember_me_duration?: number | undefined;
    } | undefined;
}>;
export declare const RateLimitingSchema: z.ZodObject<{
    api_requests: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        requests_per_minute: z.ZodDefault<z.ZodNumber>;
        burst_limit: z.ZodDefault<z.ZodNumber>;
        window_minutes: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        window_minutes: number;
        requests_per_minute: number;
        burst_limit: number;
    }, {
        enabled?: boolean | undefined;
        window_minutes?: number | undefined;
        requests_per_minute?: number | undefined;
        burst_limit?: number | undefined;
    }>>;
    login_attempts: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        attempts_per_minute: z.ZodDefault<z.ZodNumber>;
        window_minutes: z.ZodDefault<z.ZodNumber>;
        progressive_delay: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        window_minutes: number;
        attempts_per_minute: number;
        progressive_delay: boolean;
    }, {
        enabled?: boolean | undefined;
        window_minutes?: number | undefined;
        attempts_per_minute?: number | undefined;
        progressive_delay?: boolean | undefined;
    }>>;
    registration_attempts: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        attempts_per_hour: z.ZodDefault<z.ZodNumber>;
        window_hours: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        attempts_per_hour: number;
        window_hours: number;
    }, {
        enabled?: boolean | undefined;
        attempts_per_hour?: number | undefined;
        window_hours?: number | undefined;
    }>>;
    password_reset: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        attempts_per_hour: z.ZodDefault<z.ZodNumber>;
        window_hours: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        attempts_per_hour: number;
        window_hours: number;
    }, {
        enabled?: boolean | undefined;
        attempts_per_hour?: number | undefined;
        window_hours?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    api_requests: {
        enabled: boolean;
        window_minutes: number;
        requests_per_minute: number;
        burst_limit: number;
    };
    login_attempts: {
        enabled: boolean;
        window_minutes: number;
        attempts_per_minute: number;
        progressive_delay: boolean;
    };
    registration_attempts: {
        enabled: boolean;
        attempts_per_hour: number;
        window_hours: number;
    };
    password_reset: {
        enabled: boolean;
        attempts_per_hour: number;
        window_hours: number;
    };
}, {
    api_requests?: {
        enabled?: boolean | undefined;
        window_minutes?: number | undefined;
        requests_per_minute?: number | undefined;
        burst_limit?: number | undefined;
    } | undefined;
    login_attempts?: {
        enabled?: boolean | undefined;
        window_minutes?: number | undefined;
        attempts_per_minute?: number | undefined;
        progressive_delay?: boolean | undefined;
    } | undefined;
    registration_attempts?: {
        enabled?: boolean | undefined;
        attempts_per_hour?: number | undefined;
        window_hours?: number | undefined;
    } | undefined;
    password_reset?: {
        enabled?: boolean | undefined;
        attempts_per_hour?: number | undefined;
        window_hours?: number | undefined;
    } | undefined;
}>;
export declare const AccessControlSchema: z.ZodObject<{
    ip_whitelist: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        addresses: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        admin_only: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        addresses: string[];
        admin_only: boolean;
    }, {
        enabled?: boolean | undefined;
        addresses?: string[] | undefined;
        admin_only?: boolean | undefined;
    }>>;
    ip_blacklist: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        addresses: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        auto_ban: z.ZodDefault<z.ZodBoolean>;
        auto_ban_threshold: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        addresses: string[];
        auto_ban: boolean;
        auto_ban_threshold: number;
    }, {
        enabled?: boolean | undefined;
        addresses?: string[] | undefined;
        auto_ban?: boolean | undefined;
        auto_ban_threshold?: number | undefined;
    }>>;
    country_restrictions: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        allowed_countries: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        blocked_countries: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        mode: z.ZodDefault<z.ZodEnum<["allow", "block"]>>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        allowed_countries: string[];
        blocked_countries: string[];
        mode: "allow" | "block";
    }, {
        enabled?: boolean | undefined;
        allowed_countries?: string[] | undefined;
        blocked_countries?: string[] | undefined;
        mode?: "allow" | "block" | undefined;
    }>>;
    admin_access: z.ZodDefault<z.ZodObject<{
        ip_whitelist_only: z.ZodDefault<z.ZodBoolean>;
        allowed_ips: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        require_2fa: z.ZodDefault<z.ZodBoolean>;
        session_timeout: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        session_timeout: number;
        allowed_ips: string[];
        ip_whitelist_only: boolean;
        require_2fa: boolean;
    }, {
        session_timeout?: number | undefined;
        allowed_ips?: string[] | undefined;
        ip_whitelist_only?: boolean | undefined;
        require_2fa?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    country_restrictions: {
        enabled: boolean;
        allowed_countries: string[];
        blocked_countries: string[];
        mode: "allow" | "block";
    };
    ip_whitelist: {
        enabled: boolean;
        addresses: string[];
        admin_only: boolean;
    };
    ip_blacklist: {
        enabled: boolean;
        addresses: string[];
        auto_ban: boolean;
        auto_ban_threshold: number;
    };
    admin_access: {
        session_timeout: number;
        allowed_ips: string[];
        ip_whitelist_only: boolean;
        require_2fa: boolean;
    };
}, {
    country_restrictions?: {
        enabled?: boolean | undefined;
        allowed_countries?: string[] | undefined;
        blocked_countries?: string[] | undefined;
        mode?: "allow" | "block" | undefined;
    } | undefined;
    ip_whitelist?: {
        enabled?: boolean | undefined;
        addresses?: string[] | undefined;
        admin_only?: boolean | undefined;
    } | undefined;
    ip_blacklist?: {
        enabled?: boolean | undefined;
        addresses?: string[] | undefined;
        auto_ban?: boolean | undefined;
        auto_ban_threshold?: number | undefined;
    } | undefined;
    admin_access?: {
        session_timeout?: number | undefined;
        allowed_ips?: string[] | undefined;
        ip_whitelist_only?: boolean | undefined;
        require_2fa?: boolean | undefined;
    } | undefined;
}>;
export declare const SecurityHeadersSchema: z.ZodObject<{
    hsts: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        max_age: z.ZodDefault<z.ZodNumber>;
        include_subdomains: z.ZodDefault<z.ZodBoolean>;
        preload: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        max_age: number;
        include_subdomains: boolean;
        preload: boolean;
    }, {
        enabled?: boolean | undefined;
        max_age?: number | undefined;
        include_subdomains?: boolean | undefined;
        preload?: boolean | undefined;
    }>>;
    csp: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        report_only: z.ZodDefault<z.ZodBoolean>;
        directives: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        report_only: boolean;
        directives: Record<string, string>;
    }, {
        enabled?: boolean | undefined;
        report_only?: boolean | undefined;
        directives?: Record<string, string> | undefined;
    }>>;
    other_headers: z.ZodDefault<z.ZodObject<{
        x_frame_options: z.ZodDefault<z.ZodEnum<["DENY", "SAMEORIGIN", "DISABLED"]>>;
        x_content_type_options: z.ZodDefault<z.ZodBoolean>;
        x_xss_protection: z.ZodDefault<z.ZodBoolean>;
        referrer_policy: z.ZodDefault<z.ZodEnum<["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin", "unsafe-url"]>>;
    }, "strip", z.ZodTypeAny, {
        x_frame_options: "DENY" | "SAMEORIGIN" | "DISABLED";
        x_content_type_options: boolean;
        x_xss_protection: boolean;
        referrer_policy: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
    }, {
        x_frame_options?: "DENY" | "SAMEORIGIN" | "DISABLED" | undefined;
        x_content_type_options?: boolean | undefined;
        x_xss_protection?: boolean | undefined;
        referrer_policy?: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    hsts: {
        enabled: boolean;
        max_age: number;
        include_subdomains: boolean;
        preload: boolean;
    };
    csp: {
        enabled: boolean;
        report_only: boolean;
        directives: Record<string, string>;
    };
    other_headers: {
        x_frame_options: "DENY" | "SAMEORIGIN" | "DISABLED";
        x_content_type_options: boolean;
        x_xss_protection: boolean;
        referrer_policy: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
    };
}, {
    hsts?: {
        enabled?: boolean | undefined;
        max_age?: number | undefined;
        include_subdomains?: boolean | undefined;
        preload?: boolean | undefined;
    } | undefined;
    csp?: {
        enabled?: boolean | undefined;
        report_only?: boolean | undefined;
        directives?: Record<string, string> | undefined;
    } | undefined;
    other_headers?: {
        x_frame_options?: "DENY" | "SAMEORIGIN" | "DISABLED" | undefined;
        x_content_type_options?: boolean | undefined;
        x_xss_protection?: boolean | undefined;
        referrer_policy?: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url" | undefined;
    } | undefined;
}>;
export declare const FeatureFlagsSchema: z.ZodObject<{
    server_transfers: z.ZodDefault<z.ZodBoolean>;
    server_backups: z.ZodDefault<z.ZodBoolean>;
    scheduled_tasks: z.ZodDefault<z.ZodBoolean>;
    api_access: z.ZodDefault<z.ZodBoolean>;
    file_manager: z.ZodDefault<z.ZodBoolean>;
    database_management: z.ZodDefault<z.ZodBoolean>;
    user_registration: z.ZodDefault<z.ZodBoolean>;
    server_creation: z.ZodDefault<z.ZodBoolean>;
    two_factor_auth: z.ZodDefault<z.ZodBoolean>;
    email_verification: z.ZodDefault<z.ZodBoolean>;
    recaptcha: z.ZodDefault<z.ZodBoolean>;
    advanced_analytics: z.ZodDefault<z.ZodBoolean>;
    server_monitoring: z.ZodDefault<z.ZodBoolean>;
    automated_backups: z.ZodDefault<z.ZodBoolean>;
    server_scaling: z.ZodDefault<z.ZodBoolean>;
    multi_node: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email_verification: boolean;
    server_transfers: boolean;
    server_backups: boolean;
    scheduled_tasks: boolean;
    api_access: boolean;
    file_manager: boolean;
    database_management: boolean;
    user_registration: boolean;
    server_creation: boolean;
    two_factor_auth: boolean;
    recaptcha: boolean;
    advanced_analytics: boolean;
    server_monitoring: boolean;
    automated_backups: boolean;
    server_scaling: boolean;
    multi_node: boolean;
}, {
    email_verification?: boolean | undefined;
    server_transfers?: boolean | undefined;
    server_backups?: boolean | undefined;
    scheduled_tasks?: boolean | undefined;
    api_access?: boolean | undefined;
    file_manager?: boolean | undefined;
    database_management?: boolean | undefined;
    user_registration?: boolean | undefined;
    server_creation?: boolean | undefined;
    two_factor_auth?: boolean | undefined;
    recaptcha?: boolean | undefined;
    advanced_analytics?: boolean | undefined;
    server_monitoring?: boolean | undefined;
    automated_backups?: boolean | undefined;
    server_scaling?: boolean | undefined;
    multi_node?: boolean | undefined;
}>;
export declare const EmailConfigSchema: z.ZodObject<{
    driver: z.ZodDefault<z.ZodEnum<["smtp", "mailgun", "ses", "postmark", "sendmail"]>>;
    from_address: z.ZodString;
    from_name: z.ZodString;
    reply_to: z.ZodOptional<z.ZodString>;
    encryption: z.ZodDefault<z.ZodEnum<["tls", "ssl", "none"]>>;
}, "strip", z.ZodTypeAny, {
    driver: "smtp" | "mailgun" | "ses" | "sendmail" | "postmark";
    from_address: string;
    from_name: string;
    encryption: "none" | "tls" | "ssl";
    reply_to?: string | undefined;
}, {
    from_address: string;
    from_name: string;
    driver?: "smtp" | "mailgun" | "ses" | "sendmail" | "postmark" | undefined;
    encryption?: "none" | "tls" | "ssl" | undefined;
    reply_to?: string | undefined;
}>;
export declare const SMTPSettingsSchema: z.ZodObject<{
    host: z.ZodString;
    port: z.ZodDefault<z.ZodNumber>;
    username: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    encryption: z.ZodDefault<z.ZodEnum<["tls", "ssl", "none"]>>;
    auth: z.ZodDefault<z.ZodBoolean>;
    timeout: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    timeout: number;
    host: string;
    port: number;
    encryption: "none" | "tls" | "ssl";
    auth: boolean;
    username?: string | undefined;
    password?: string | undefined;
}, {
    host: string;
    username?: string | undefined;
    password?: string | undefined;
    timeout?: number | undefined;
    port?: number | undefined;
    encryption?: "none" | "tls" | "ssl" | undefined;
    auth?: boolean | undefined;
}>;
export declare const MailgunSettingsSchema: z.ZodObject<{
    domain: z.ZodString;
    secret: z.ZodString;
    endpoint: z.ZodOptional<z.ZodString>;
    version: z.ZodDefault<z.ZodEnum<["v2", "v3"]>>;
}, "strip", z.ZodTypeAny, {
    version: "v2" | "v3";
    domain: string;
    secret: string;
    endpoint?: string | undefined;
}, {
    domain: string;
    secret: string;
    version?: "v2" | "v3" | undefined;
    endpoint?: string | undefined;
}>;
export declare const SESSettingsSchema: z.ZodObject<{
    key: z.ZodString;
    secret: z.ZodString;
    region: z.ZodDefault<z.ZodString>;
    configuration_set: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    secret: string;
    key: string;
    region: string;
    configuration_set?: string | undefined;
}, {
    secret: string;
    key: string;
    region?: string | undefined;
    configuration_set?: string | undefined;
}>;
export declare const PostmarkSettingsSchema: z.ZodObject<{
    token: z.ZodString;
    message_stream: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    token: string;
    message_stream: string;
}, {
    token: string;
    message_stream?: string | undefined;
}>;
export declare const DatabaseConfigSchema: z.ZodObject<{
    connection: z.ZodDefault<z.ZodEnum<["mysql", "postgresql", "sqlite", "mariadb"]>>;
    host: z.ZodString;
    port: z.ZodNumber;
    database: z.ZodString;
    username: z.ZodString;
    password: z.ZodString;
    charset: z.ZodDefault<z.ZodString>;
    collation: z.ZodDefault<z.ZodString>;
    prefix: z.ZodDefault<z.ZodString>;
    strict: z.ZodDefault<z.ZodBoolean>;
    engine: z.ZodOptional<z.ZodString>;
    options: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    options: Record<string, any>;
    username: string;
    password: string;
    host: string;
    port: number;
    database: string;
    strict: boolean;
    connection: "mysql" | "postgresql" | "sqlite" | "mariadb";
    charset: string;
    collation: string;
    prefix: string;
    engine?: string | undefined;
}, {
    username: string;
    password: string;
    host: string;
    port: number;
    database: string;
    options?: Record<string, any> | undefined;
    strict?: boolean | undefined;
    connection?: "mysql" | "postgresql" | "sqlite" | "mariadb" | undefined;
    charset?: string | undefined;
    collation?: string | undefined;
    prefix?: string | undefined;
    engine?: string | undefined;
}>;
export declare const CacheConfigSchema: z.ZodObject<{
    default: z.ZodDefault<z.ZodEnum<["file", "redis", "memcached", "database"]>>;
    connections: z.ZodDefault<z.ZodObject<{
        file: z.ZodOptional<z.ZodObject<{
            driver: z.ZodLiteral<"file">;
            path: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            path: string;
            driver: "file";
        }, {
            driver: "file";
            path?: string | undefined;
        }>>;
        redis: z.ZodOptional<z.ZodObject<{
            driver: z.ZodLiteral<"redis">;
            host: z.ZodDefault<z.ZodString>;
            port: z.ZodDefault<z.ZodNumber>;
            password: z.ZodOptional<z.ZodString>;
            database: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            driver: "redis";
            host: string;
            port: number;
            database: number;
            password?: string | undefined;
        }, {
            driver: "redis";
            password?: string | undefined;
            host?: string | undefined;
            port?: number | undefined;
            database?: number | undefined;
        }>>;
        memcached: z.ZodOptional<z.ZodObject<{
            driver: z.ZodLiteral<"memcached">;
            servers: z.ZodDefault<z.ZodArray<z.ZodObject<{
                host: z.ZodString;
                port: z.ZodNumber;
                weight: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                host: string;
                port: number;
                weight: number;
            }, {
                host: string;
                port: number;
                weight?: number | undefined;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            servers: {
                host: string;
                port: number;
                weight: number;
            }[];
            driver: "memcached";
        }, {
            driver: "memcached";
            servers?: {
                host: string;
                port: number;
                weight?: number | undefined;
            }[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        file?: {
            path: string;
            driver: "file";
        } | undefined;
        redis?: {
            driver: "redis";
            host: string;
            port: number;
            database: number;
            password?: string | undefined;
        } | undefined;
        memcached?: {
            servers: {
                host: string;
                port: number;
                weight: number;
            }[];
            driver: "memcached";
        } | undefined;
    }, {
        file?: {
            driver: "file";
            path?: string | undefined;
        } | undefined;
        redis?: {
            driver: "redis";
            password?: string | undefined;
            host?: string | undefined;
            port?: number | undefined;
            database?: number | undefined;
        } | undefined;
        memcached?: {
            driver: "memcached";
            servers?: {
                host: string;
                port: number;
                weight?: number | undefined;
            }[] | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    default: "database" | "file" | "redis" | "memcached";
    connections: {
        file?: {
            path: string;
            driver: "file";
        } | undefined;
        redis?: {
            driver: "redis";
            host: string;
            port: number;
            database: number;
            password?: string | undefined;
        } | undefined;
        memcached?: {
            servers: {
                host: string;
                port: number;
                weight: number;
            }[];
            driver: "memcached";
        } | undefined;
    };
}, {
    default?: "database" | "file" | "redis" | "memcached" | undefined;
    connections?: {
        file?: {
            driver: "file";
            path?: string | undefined;
        } | undefined;
        redis?: {
            driver: "redis";
            password?: string | undefined;
            host?: string | undefined;
            port?: number | undefined;
            database?: number | undefined;
        } | undefined;
        memcached?: {
            driver: "memcached";
            servers?: {
                host: string;
                port: number;
                weight?: number | undefined;
            }[] | undefined;
        } | undefined;
    } | undefined;
}>;
export declare const QueueConfigSchema: z.ZodObject<{
    default: z.ZodDefault<z.ZodEnum<["sync", "database", "redis", "sqs"]>>;
    connections: z.ZodDefault<z.ZodObject<{
        database: z.ZodOptional<z.ZodObject<{
            driver: z.ZodLiteral<"database">;
            table: z.ZodDefault<z.ZodString>;
            queue: z.ZodDefault<z.ZodString>;
            retry_after: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            driver: "database";
            queue: string;
            table: string;
            retry_after: number;
        }, {
            driver: "database";
            queue?: string | undefined;
            table?: string | undefined;
            retry_after?: number | undefined;
        }>>;
        redis: z.ZodOptional<z.ZodObject<{
            driver: z.ZodLiteral<"redis">;
            connection: z.ZodDefault<z.ZodString>;
            queue: z.ZodDefault<z.ZodString>;
            retry_after: z.ZodDefault<z.ZodNumber>;
            block_for: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            driver: "redis";
            queue: string;
            connection: string;
            retry_after: number;
            block_for: number;
        }, {
            driver: "redis";
            queue?: string | undefined;
            connection?: string | undefined;
            retry_after?: number | undefined;
            block_for?: number | undefined;
        }>>;
        sqs: z.ZodOptional<z.ZodObject<{
            driver: z.ZodLiteral<"sqs">;
            key: z.ZodString;
            secret: z.ZodString;
            prefix: z.ZodString;
            queue: z.ZodDefault<z.ZodString>;
            region: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            driver: "sqs";
            secret: string;
            key: string;
            region: string;
            queue: string;
            prefix: string;
        }, {
            driver: "sqs";
            secret: string;
            key: string;
            prefix: string;
            region?: string | undefined;
            queue?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        database?: {
            driver: "database";
            queue: string;
            table: string;
            retry_after: number;
        } | undefined;
        redis?: {
            driver: "redis";
            queue: string;
            connection: string;
            retry_after: number;
            block_for: number;
        } | undefined;
        sqs?: {
            driver: "sqs";
            secret: string;
            key: string;
            region: string;
            queue: string;
            prefix: string;
        } | undefined;
    }, {
        database?: {
            driver: "database";
            queue?: string | undefined;
            table?: string | undefined;
            retry_after?: number | undefined;
        } | undefined;
        redis?: {
            driver: "redis";
            queue?: string | undefined;
            connection?: string | undefined;
            retry_after?: number | undefined;
            block_for?: number | undefined;
        } | undefined;
        sqs?: {
            driver: "sqs";
            secret: string;
            key: string;
            prefix: string;
            region?: string | undefined;
            queue?: string | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    default: "database" | "redis" | "sync" | "sqs";
    connections: {
        database?: {
            driver: "database";
            queue: string;
            table: string;
            retry_after: number;
        } | undefined;
        redis?: {
            driver: "redis";
            queue: string;
            connection: string;
            retry_after: number;
            block_for: number;
        } | undefined;
        sqs?: {
            driver: "sqs";
            secret: string;
            key: string;
            region: string;
            queue: string;
            prefix: string;
        } | undefined;
    };
}, {
    default?: "database" | "redis" | "sync" | "sqs" | undefined;
    connections?: {
        database?: {
            driver: "database";
            queue?: string | undefined;
            table?: string | undefined;
            retry_after?: number | undefined;
        } | undefined;
        redis?: {
            driver: "redis";
            queue?: string | undefined;
            connection?: string | undefined;
            retry_after?: number | undefined;
            block_for?: number | undefined;
        } | undefined;
        sqs?: {
            driver: "sqs";
            secret: string;
            key: string;
            prefix: string;
            region?: string | undefined;
            queue?: string | undefined;
        } | undefined;
    } | undefined;
}>;
export declare const StorageConfigSchema: z.ZodObject<{
    default: z.ZodDefault<z.ZodEnum<["local", "s3", "gcs", "azure"]>>;
    disks: z.ZodDefault<z.ZodObject<{
        local: z.ZodOptional<z.ZodObject<{
            driver: z.ZodLiteral<"local">;
            root: z.ZodDefault<z.ZodString>;
            url: z.ZodOptional<z.ZodString>;
            visibility: z.ZodDefault<z.ZodEnum<["public", "private"]>>;
        }, "strip", z.ZodTypeAny, {
            driver: "local";
            root: string;
            visibility: "public" | "private";
            url?: string | undefined;
        }, {
            driver: "local";
            url?: string | undefined;
            root?: string | undefined;
            visibility?: "public" | "private" | undefined;
        }>>;
        s3: z.ZodOptional<z.ZodObject<{
            driver: z.ZodLiteral<"s3">;
            key: z.ZodString;
            secret: z.ZodString;
            region: z.ZodString;
            bucket: z.ZodString;
            url: z.ZodOptional<z.ZodString>;
            endpoint: z.ZodOptional<z.ZodString>;
            use_path_style_endpoint: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            driver: "s3";
            secret: string;
            key: string;
            region: string;
            bucket: string;
            use_path_style_endpoint: boolean;
            url?: string | undefined;
            endpoint?: string | undefined;
        }, {
            driver: "s3";
            secret: string;
            key: string;
            region: string;
            bucket: string;
            url?: string | undefined;
            endpoint?: string | undefined;
            use_path_style_endpoint?: boolean | undefined;
        }>>;
        gcs: z.ZodOptional<z.ZodObject<{
            driver: z.ZodLiteral<"gcs">;
            project_id: z.ZodString;
            key_file: z.ZodOptional<z.ZodString>;
            bucket: z.ZodString;
            path_prefix: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            driver: "gcs";
            bucket: string;
            project_id: string;
            key_file?: string | undefined;
            path_prefix?: string | undefined;
        }, {
            driver: "gcs";
            bucket: string;
            project_id: string;
            key_file?: string | undefined;
            path_prefix?: string | undefined;
        }>>;
        azure: z.ZodOptional<z.ZodObject<{
            driver: z.ZodLiteral<"azure">;
            name: z.ZodString;
            key: z.ZodString;
            container: z.ZodString;
            url: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            driver: "azure";
            key: string;
            container: string;
            url?: string | undefined;
        }, {
            name: string;
            driver: "azure";
            key: string;
            container: string;
            url?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        local?: {
            driver: "local";
            root: string;
            visibility: "public" | "private";
            url?: string | undefined;
        } | undefined;
        s3?: {
            driver: "s3";
            secret: string;
            key: string;
            region: string;
            bucket: string;
            use_path_style_endpoint: boolean;
            url?: string | undefined;
            endpoint?: string | undefined;
        } | undefined;
        gcs?: {
            driver: "gcs";
            bucket: string;
            project_id: string;
            key_file?: string | undefined;
            path_prefix?: string | undefined;
        } | undefined;
        azure?: {
            name: string;
            driver: "azure";
            key: string;
            container: string;
            url?: string | undefined;
        } | undefined;
    }, {
        local?: {
            driver: "local";
            url?: string | undefined;
            root?: string | undefined;
            visibility?: "public" | "private" | undefined;
        } | undefined;
        s3?: {
            driver: "s3";
            secret: string;
            key: string;
            region: string;
            bucket: string;
            url?: string | undefined;
            endpoint?: string | undefined;
            use_path_style_endpoint?: boolean | undefined;
        } | undefined;
        gcs?: {
            driver: "gcs";
            bucket: string;
            project_id: string;
            key_file?: string | undefined;
            path_prefix?: string | undefined;
        } | undefined;
        azure?: {
            name: string;
            driver: "azure";
            key: string;
            container: string;
            url?: string | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    default: "local" | "s3" | "gcs" | "azure";
    disks: {
        local?: {
            driver: "local";
            root: string;
            visibility: "public" | "private";
            url?: string | undefined;
        } | undefined;
        s3?: {
            driver: "s3";
            secret: string;
            key: string;
            region: string;
            bucket: string;
            use_path_style_endpoint: boolean;
            url?: string | undefined;
            endpoint?: string | undefined;
        } | undefined;
        gcs?: {
            driver: "gcs";
            bucket: string;
            project_id: string;
            key_file?: string | undefined;
            path_prefix?: string | undefined;
        } | undefined;
        azure?: {
            name: string;
            driver: "azure";
            key: string;
            container: string;
            url?: string | undefined;
        } | undefined;
    };
}, {
    default?: "local" | "s3" | "gcs" | "azure" | undefined;
    disks?: {
        local?: {
            driver: "local";
            url?: string | undefined;
            root?: string | undefined;
            visibility?: "public" | "private" | undefined;
        } | undefined;
        s3?: {
            driver: "s3";
            secret: string;
            key: string;
            region: string;
            bucket: string;
            url?: string | undefined;
            endpoint?: string | undefined;
            use_path_style_endpoint?: boolean | undefined;
        } | undefined;
        gcs?: {
            driver: "gcs";
            bucket: string;
            project_id: string;
            key_file?: string | undefined;
            path_prefix?: string | undefined;
        } | undefined;
        azure?: {
            name: string;
            driver: "azure";
            key: string;
            container: string;
            url?: string | undefined;
        } | undefined;
    } | undefined;
}>;
export declare const LoggingConfigSchema: z.ZodObject<{
    default: z.ZodDefault<z.ZodEnum<["stack", "single", "daily", "syslog", "errorlog"]>>;
    channels: z.ZodDefault<z.ZodObject<{
        stack: z.ZodOptional<z.ZodObject<{
            driver: z.ZodLiteral<"stack">;
            channels: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            driver: "stack";
            channels: string[];
        }, {
            driver: "stack";
            channels?: string[] | undefined;
        }>>;
        single: z.ZodOptional<z.ZodObject<{
            driver: z.ZodLiteral<"single">;
            path: z.ZodDefault<z.ZodString>;
            level: z.ZodDefault<z.ZodEnum<["emergency", "alert", "critical", "error", "warning", "notice", "info", "debug"]>>;
        }, "strip", z.ZodTypeAny, {
            path: string;
            level: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug";
            driver: "single";
        }, {
            driver: "single";
            path?: string | undefined;
            level?: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug" | undefined;
        }>>;
        daily: z.ZodOptional<z.ZodObject<{
            driver: z.ZodLiteral<"daily">;
            path: z.ZodDefault<z.ZodString>;
            level: z.ZodDefault<z.ZodEnum<["emergency", "alert", "critical", "error", "warning", "notice", "info", "debug"]>>;
            days: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            path: string;
            level: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug";
            driver: "daily";
            days: number;
        }, {
            driver: "daily";
            path?: string | undefined;
            level?: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug" | undefined;
            days?: number | undefined;
        }>>;
        syslog: z.ZodOptional<z.ZodObject<{
            driver: z.ZodLiteral<"syslog">;
            level: z.ZodDefault<z.ZodEnum<["emergency", "alert", "critical", "error", "warning", "notice", "info", "debug"]>>;
            facility: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            level: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug";
            driver: "syslog";
            facility: string;
        }, {
            driver: "syslog";
            level?: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug" | undefined;
            facility?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        stack?: {
            driver: "stack";
            channels: string[];
        } | undefined;
        single?: {
            path: string;
            level: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug";
            driver: "single";
        } | undefined;
        daily?: {
            path: string;
            level: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug";
            driver: "daily";
            days: number;
        } | undefined;
        syslog?: {
            level: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug";
            driver: "syslog";
            facility: string;
        } | undefined;
    }, {
        stack?: {
            driver: "stack";
            channels?: string[] | undefined;
        } | undefined;
        single?: {
            driver: "single";
            path?: string | undefined;
            level?: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug" | undefined;
        } | undefined;
        daily?: {
            driver: "daily";
            path?: string | undefined;
            level?: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug" | undefined;
            days?: number | undefined;
        } | undefined;
        syslog?: {
            driver: "syslog";
            level?: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug" | undefined;
            facility?: string | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    default: "stack" | "single" | "daily" | "syslog" | "errorlog";
    channels: {
        stack?: {
            driver: "stack";
            channels: string[];
        } | undefined;
        single?: {
            path: string;
            level: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug";
            driver: "single";
        } | undefined;
        daily?: {
            path: string;
            level: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug";
            driver: "daily";
            days: number;
        } | undefined;
        syslog?: {
            level: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug";
            driver: "syslog";
            facility: string;
        } | undefined;
    };
}, {
    default?: "stack" | "single" | "daily" | "syslog" | "errorlog" | undefined;
    channels?: {
        stack?: {
            driver: "stack";
            channels?: string[] | undefined;
        } | undefined;
        single?: {
            driver: "single";
            path?: string | undefined;
            level?: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug" | undefined;
        } | undefined;
        daily?: {
            driver: "daily";
            path?: string | undefined;
            level?: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug" | undefined;
            days?: number | undefined;
        } | undefined;
        syslog?: {
            driver: "syslog";
            level?: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug" | undefined;
            facility?: string | undefined;
        } | undefined;
    } | undefined;
}>;
export declare const SystemSettingsSchema: z.ZodObject<{
    panel: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        url: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        logo_url: z.ZodOptional<z.ZodString>;
        favicon_url: z.ZodOptional<z.ZodString>;
        timezone: z.ZodDefault<z.ZodString>;
        language: z.ZodDefault<z.ZodString>;
        theme: z.ZodDefault<z.ZodEnum<["light", "dark", "auto"]>>;
        maintenance_mode: z.ZodDefault<z.ZodBoolean>;
        maintenance_message: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        maintenance_mode: boolean;
        name: string;
        url: string;
        language: string;
        timezone: string;
        theme: "light" | "dark" | "auto";
        description?: string | undefined;
        logo_url?: string | undefined;
        favicon_url?: string | undefined;
        maintenance_message?: string | undefined;
    }, {
        name: string;
        url: string;
        maintenance_mode?: boolean | undefined;
        description?: string | undefined;
        logo_url?: string | undefined;
        favicon_url?: string | undefined;
        language?: string | undefined;
        timezone?: string | undefined;
        theme?: "light" | "dark" | "auto" | undefined;
        maintenance_message?: string | undefined;
    }>>;
    registration: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        email_verification: z.ZodDefault<z.ZodBoolean>;
        approval_required: z.ZodDefault<z.ZodBoolean>;
        allowed_domains: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
        blocked_domains: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        recaptcha_enabled: z.ZodDefault<z.ZodBoolean>;
        recaptcha_site_key: z.ZodOptional<z.ZodString>;
        recaptcha_secret_key: z.ZodOptional<z.ZodString>;
        terms_required: z.ZodDefault<z.ZodBoolean>;
        terms_url: z.ZodOptional<z.ZodString>;
        privacy_required: z.ZodDefault<z.ZodBoolean>;
        privacy_url: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        email_verification: boolean;
        approval_required: boolean;
        allowed_domains: string[];
        blocked_domains: string[];
        recaptcha_enabled: boolean;
        terms_required: boolean;
        privacy_required: boolean;
        recaptcha_site_key?: string | undefined;
        recaptcha_secret_key?: string | undefined;
        terms_url?: string | undefined;
        privacy_url?: string | undefined;
    }, {
        enabled?: boolean | undefined;
        email_verification?: boolean | undefined;
        approval_required?: boolean | undefined;
        allowed_domains?: string[] | undefined;
        blocked_domains?: string[] | undefined;
        recaptcha_enabled?: boolean | undefined;
        recaptcha_site_key?: string | undefined;
        recaptcha_secret_key?: string | undefined;
        terms_required?: boolean | undefined;
        terms_url?: string | undefined;
        privacy_required?: boolean | undefined;
        privacy_url?: string | undefined;
    }>>;
    limits: z.ZodOptional<z.ZodObject<{
        max_servers_per_user: z.ZodDefault<z.ZodNumber>;
        max_memory_per_server: z.ZodDefault<z.ZodNumber>;
        max_disk_per_server: z.ZodDefault<z.ZodNumber>;
        max_cpu_per_server: z.ZodDefault<z.ZodNumber>;
        max_databases_per_server: z.ZodDefault<z.ZodNumber>;
        max_allocations_per_server: z.ZodDefault<z.ZodNumber>;
        max_backups_per_server: z.ZodDefault<z.ZodNumber>;
        max_file_uploads_per_minute: z.ZodDefault<z.ZodNumber>;
        max_api_requests_per_minute: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        max_servers_per_user: number;
        max_memory_per_server: number;
        max_disk_per_server: number;
        max_cpu_per_server: number;
        max_backups_per_server: number;
        max_databases_per_server: number;
        max_allocations_per_server: number;
        max_file_uploads_per_minute: number;
        max_api_requests_per_minute: number;
    }, {
        max_servers_per_user?: number | undefined;
        max_memory_per_server?: number | undefined;
        max_disk_per_server?: number | undefined;
        max_cpu_per_server?: number | undefined;
        max_backups_per_server?: number | undefined;
        max_databases_per_server?: number | undefined;
        max_allocations_per_server?: number | undefined;
        max_file_uploads_per_minute?: number | undefined;
        max_api_requests_per_minute?: number | undefined;
    }>>;
    security: z.ZodOptional<z.ZodObject<{
        enforce_2fa: z.ZodDefault<z.ZodBoolean>;
        enforce_2fa_admin: z.ZodDefault<z.ZodBoolean>;
        session_timeout: z.ZodDefault<z.ZodNumber>;
        max_login_attempts: z.ZodDefault<z.ZodNumber>;
        lockout_duration: z.ZodDefault<z.ZodNumber>;
        password_requirements: z.ZodDefault<z.ZodObject<{
            min_length: z.ZodDefault<z.ZodNumber>;
            require_uppercase: z.ZodDefault<z.ZodBoolean>;
            require_lowercase: z.ZodDefault<z.ZodBoolean>;
            require_numbers: z.ZodDefault<z.ZodBoolean>;
            require_symbols: z.ZodDefault<z.ZodBoolean>;
            prevent_reuse: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            min_length: number;
            require_uppercase: boolean;
            require_lowercase: boolean;
            require_numbers: boolean;
            require_symbols: boolean;
            prevent_reuse: number;
        }, {
            min_length?: number | undefined;
            require_uppercase?: boolean | undefined;
            require_lowercase?: boolean | undefined;
            require_numbers?: boolean | undefined;
            require_symbols?: boolean | undefined;
            prevent_reuse?: number | undefined;
        }>>;
        session_security: z.ZodDefault<z.ZodObject<{
            secure_cookies: z.ZodDefault<z.ZodBoolean>;
            same_site: z.ZodDefault<z.ZodEnum<["strict", "lax", "none"]>>;
            remember_me_duration: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            secure_cookies: boolean;
            same_site: "none" | "strict" | "lax";
            remember_me_duration: number;
        }, {
            secure_cookies?: boolean | undefined;
            same_site?: "none" | "strict" | "lax" | undefined;
            remember_me_duration?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        enforce_2fa: boolean;
        session_timeout: number;
        max_login_attempts: number;
        lockout_duration: number;
        enforce_2fa_admin: boolean;
        password_requirements: {
            min_length: number;
            require_uppercase: boolean;
            require_lowercase: boolean;
            require_numbers: boolean;
            require_symbols: boolean;
            prevent_reuse: number;
        };
        session_security: {
            secure_cookies: boolean;
            same_site: "none" | "strict" | "lax";
            remember_me_duration: number;
        };
    }, {
        enforce_2fa?: boolean | undefined;
        session_timeout?: number | undefined;
        max_login_attempts?: number | undefined;
        lockout_duration?: number | undefined;
        enforce_2fa_admin?: boolean | undefined;
        password_requirements?: {
            min_length?: number | undefined;
            require_uppercase?: boolean | undefined;
            require_lowercase?: boolean | undefined;
            require_numbers?: boolean | undefined;
            require_symbols?: boolean | undefined;
            prevent_reuse?: number | undefined;
        } | undefined;
        session_security?: {
            secure_cookies?: boolean | undefined;
            same_site?: "none" | "strict" | "lax" | undefined;
            remember_me_duration?: number | undefined;
        } | undefined;
    }>>;
    rate_limiting: z.ZodOptional<z.ZodObject<{
        api_requests: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            requests_per_minute: z.ZodDefault<z.ZodNumber>;
            burst_limit: z.ZodDefault<z.ZodNumber>;
            window_minutes: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            window_minutes: number;
            requests_per_minute: number;
            burst_limit: number;
        }, {
            enabled?: boolean | undefined;
            window_minutes?: number | undefined;
            requests_per_minute?: number | undefined;
            burst_limit?: number | undefined;
        }>>;
        login_attempts: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            attempts_per_minute: z.ZodDefault<z.ZodNumber>;
            window_minutes: z.ZodDefault<z.ZodNumber>;
            progressive_delay: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            window_minutes: number;
            attempts_per_minute: number;
            progressive_delay: boolean;
        }, {
            enabled?: boolean | undefined;
            window_minutes?: number | undefined;
            attempts_per_minute?: number | undefined;
            progressive_delay?: boolean | undefined;
        }>>;
        registration_attempts: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            attempts_per_hour: z.ZodDefault<z.ZodNumber>;
            window_hours: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            attempts_per_hour: number;
            window_hours: number;
        }, {
            enabled?: boolean | undefined;
            attempts_per_hour?: number | undefined;
            window_hours?: number | undefined;
        }>>;
        password_reset: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            attempts_per_hour: z.ZodDefault<z.ZodNumber>;
            window_hours: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            attempts_per_hour: number;
            window_hours: number;
        }, {
            enabled?: boolean | undefined;
            attempts_per_hour?: number | undefined;
            window_hours?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        api_requests: {
            enabled: boolean;
            window_minutes: number;
            requests_per_minute: number;
            burst_limit: number;
        };
        login_attempts: {
            enabled: boolean;
            window_minutes: number;
            attempts_per_minute: number;
            progressive_delay: boolean;
        };
        registration_attempts: {
            enabled: boolean;
            attempts_per_hour: number;
            window_hours: number;
        };
        password_reset: {
            enabled: boolean;
            attempts_per_hour: number;
            window_hours: number;
        };
    }, {
        api_requests?: {
            enabled?: boolean | undefined;
            window_minutes?: number | undefined;
            requests_per_minute?: number | undefined;
            burst_limit?: number | undefined;
        } | undefined;
        login_attempts?: {
            enabled?: boolean | undefined;
            window_minutes?: number | undefined;
            attempts_per_minute?: number | undefined;
            progressive_delay?: boolean | undefined;
        } | undefined;
        registration_attempts?: {
            enabled?: boolean | undefined;
            attempts_per_hour?: number | undefined;
            window_hours?: number | undefined;
        } | undefined;
        password_reset?: {
            enabled?: boolean | undefined;
            attempts_per_hour?: number | undefined;
            window_hours?: number | undefined;
        } | undefined;
    }>>;
    access_control: z.ZodOptional<z.ZodObject<{
        ip_whitelist: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            addresses: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            admin_only: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            addresses: string[];
            admin_only: boolean;
        }, {
            enabled?: boolean | undefined;
            addresses?: string[] | undefined;
            admin_only?: boolean | undefined;
        }>>;
        ip_blacklist: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            addresses: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            auto_ban: z.ZodDefault<z.ZodBoolean>;
            auto_ban_threshold: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            addresses: string[];
            auto_ban: boolean;
            auto_ban_threshold: number;
        }, {
            enabled?: boolean | undefined;
            addresses?: string[] | undefined;
            auto_ban?: boolean | undefined;
            auto_ban_threshold?: number | undefined;
        }>>;
        country_restrictions: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            allowed_countries: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            blocked_countries: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            mode: z.ZodDefault<z.ZodEnum<["allow", "block"]>>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            allowed_countries: string[];
            blocked_countries: string[];
            mode: "allow" | "block";
        }, {
            enabled?: boolean | undefined;
            allowed_countries?: string[] | undefined;
            blocked_countries?: string[] | undefined;
            mode?: "allow" | "block" | undefined;
        }>>;
        admin_access: z.ZodDefault<z.ZodObject<{
            ip_whitelist_only: z.ZodDefault<z.ZodBoolean>;
            allowed_ips: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            require_2fa: z.ZodDefault<z.ZodBoolean>;
            session_timeout: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            session_timeout: number;
            allowed_ips: string[];
            ip_whitelist_only: boolean;
            require_2fa: boolean;
        }, {
            session_timeout?: number | undefined;
            allowed_ips?: string[] | undefined;
            ip_whitelist_only?: boolean | undefined;
            require_2fa?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        country_restrictions: {
            enabled: boolean;
            allowed_countries: string[];
            blocked_countries: string[];
            mode: "allow" | "block";
        };
        ip_whitelist: {
            enabled: boolean;
            addresses: string[];
            admin_only: boolean;
        };
        ip_blacklist: {
            enabled: boolean;
            addresses: string[];
            auto_ban: boolean;
            auto_ban_threshold: number;
        };
        admin_access: {
            session_timeout: number;
            allowed_ips: string[];
            ip_whitelist_only: boolean;
            require_2fa: boolean;
        };
    }, {
        country_restrictions?: {
            enabled?: boolean | undefined;
            allowed_countries?: string[] | undefined;
            blocked_countries?: string[] | undefined;
            mode?: "allow" | "block" | undefined;
        } | undefined;
        ip_whitelist?: {
            enabled?: boolean | undefined;
            addresses?: string[] | undefined;
            admin_only?: boolean | undefined;
        } | undefined;
        ip_blacklist?: {
            enabled?: boolean | undefined;
            addresses?: string[] | undefined;
            auto_ban?: boolean | undefined;
            auto_ban_threshold?: number | undefined;
        } | undefined;
        admin_access?: {
            session_timeout?: number | undefined;
            allowed_ips?: string[] | undefined;
            ip_whitelist_only?: boolean | undefined;
            require_2fa?: boolean | undefined;
        } | undefined;
    }>>;
    security_headers: z.ZodOptional<z.ZodObject<{
        hsts: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            max_age: z.ZodDefault<z.ZodNumber>;
            include_subdomains: z.ZodDefault<z.ZodBoolean>;
            preload: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            max_age: number;
            include_subdomains: boolean;
            preload: boolean;
        }, {
            enabled?: boolean | undefined;
            max_age?: number | undefined;
            include_subdomains?: boolean | undefined;
            preload?: boolean | undefined;
        }>>;
        csp: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            report_only: z.ZodDefault<z.ZodBoolean>;
            directives: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            report_only: boolean;
            directives: Record<string, string>;
        }, {
            enabled?: boolean | undefined;
            report_only?: boolean | undefined;
            directives?: Record<string, string> | undefined;
        }>>;
        other_headers: z.ZodDefault<z.ZodObject<{
            x_frame_options: z.ZodDefault<z.ZodEnum<["DENY", "SAMEORIGIN", "DISABLED"]>>;
            x_content_type_options: z.ZodDefault<z.ZodBoolean>;
            x_xss_protection: z.ZodDefault<z.ZodBoolean>;
            referrer_policy: z.ZodDefault<z.ZodEnum<["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin", "unsafe-url"]>>;
        }, "strip", z.ZodTypeAny, {
            x_frame_options: "DENY" | "SAMEORIGIN" | "DISABLED";
            x_content_type_options: boolean;
            x_xss_protection: boolean;
            referrer_policy: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
        }, {
            x_frame_options?: "DENY" | "SAMEORIGIN" | "DISABLED" | undefined;
            x_content_type_options?: boolean | undefined;
            x_xss_protection?: boolean | undefined;
            referrer_policy?: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url" | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        hsts: {
            enabled: boolean;
            max_age: number;
            include_subdomains: boolean;
            preload: boolean;
        };
        csp: {
            enabled: boolean;
            report_only: boolean;
            directives: Record<string, string>;
        };
        other_headers: {
            x_frame_options: "DENY" | "SAMEORIGIN" | "DISABLED";
            x_content_type_options: boolean;
            x_xss_protection: boolean;
            referrer_policy: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
        };
    }, {
        hsts?: {
            enabled?: boolean | undefined;
            max_age?: number | undefined;
            include_subdomains?: boolean | undefined;
            preload?: boolean | undefined;
        } | undefined;
        csp?: {
            enabled?: boolean | undefined;
            report_only?: boolean | undefined;
            directives?: Record<string, string> | undefined;
        } | undefined;
        other_headers?: {
            x_frame_options?: "DENY" | "SAMEORIGIN" | "DISABLED" | undefined;
            x_content_type_options?: boolean | undefined;
            x_xss_protection?: boolean | undefined;
            referrer_policy?: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url" | undefined;
        } | undefined;
    }>>;
    features: z.ZodOptional<z.ZodObject<{
        server_transfers: z.ZodDefault<z.ZodBoolean>;
        server_backups: z.ZodDefault<z.ZodBoolean>;
        scheduled_tasks: z.ZodDefault<z.ZodBoolean>;
        api_access: z.ZodDefault<z.ZodBoolean>;
        file_manager: z.ZodDefault<z.ZodBoolean>;
        database_management: z.ZodDefault<z.ZodBoolean>;
        user_registration: z.ZodDefault<z.ZodBoolean>;
        server_creation: z.ZodDefault<z.ZodBoolean>;
        two_factor_auth: z.ZodDefault<z.ZodBoolean>;
        email_verification: z.ZodDefault<z.ZodBoolean>;
        recaptcha: z.ZodDefault<z.ZodBoolean>;
        advanced_analytics: z.ZodDefault<z.ZodBoolean>;
        server_monitoring: z.ZodDefault<z.ZodBoolean>;
        automated_backups: z.ZodDefault<z.ZodBoolean>;
        server_scaling: z.ZodDefault<z.ZodBoolean>;
        multi_node: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        email_verification: boolean;
        server_transfers: boolean;
        server_backups: boolean;
        scheduled_tasks: boolean;
        api_access: boolean;
        file_manager: boolean;
        database_management: boolean;
        user_registration: boolean;
        server_creation: boolean;
        two_factor_auth: boolean;
        recaptcha: boolean;
        advanced_analytics: boolean;
        server_monitoring: boolean;
        automated_backups: boolean;
        server_scaling: boolean;
        multi_node: boolean;
    }, {
        email_verification?: boolean | undefined;
        server_transfers?: boolean | undefined;
        server_backups?: boolean | undefined;
        scheduled_tasks?: boolean | undefined;
        api_access?: boolean | undefined;
        file_manager?: boolean | undefined;
        database_management?: boolean | undefined;
        user_registration?: boolean | undefined;
        server_creation?: boolean | undefined;
        two_factor_auth?: boolean | undefined;
        recaptcha?: boolean | undefined;
        advanced_analytics?: boolean | undefined;
        server_monitoring?: boolean | undefined;
        automated_backups?: boolean | undefined;
        server_scaling?: boolean | undefined;
        multi_node?: boolean | undefined;
    }>>;
    email: z.ZodOptional<z.ZodObject<{
        driver: z.ZodDefault<z.ZodEnum<["smtp", "mailgun", "ses", "postmark", "sendmail"]>>;
        from_address: z.ZodString;
        from_name: z.ZodString;
        reply_to: z.ZodOptional<z.ZodString>;
        encryption: z.ZodDefault<z.ZodEnum<["tls", "ssl", "none"]>>;
    }, "strip", z.ZodTypeAny, {
        driver: "smtp" | "mailgun" | "ses" | "sendmail" | "postmark";
        from_address: string;
        from_name: string;
        encryption: "none" | "tls" | "ssl";
        reply_to?: string | undefined;
    }, {
        from_address: string;
        from_name: string;
        driver?: "smtp" | "mailgun" | "ses" | "sendmail" | "postmark" | undefined;
        encryption?: "none" | "tls" | "ssl" | undefined;
        reply_to?: string | undefined;
    }>>;
    smtp: z.ZodOptional<z.ZodObject<{
        host: z.ZodString;
        port: z.ZodDefault<z.ZodNumber>;
        username: z.ZodOptional<z.ZodString>;
        password: z.ZodOptional<z.ZodString>;
        encryption: z.ZodDefault<z.ZodEnum<["tls", "ssl", "none"]>>;
        auth: z.ZodDefault<z.ZodBoolean>;
        timeout: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        timeout: number;
        host: string;
        port: number;
        encryption: "none" | "tls" | "ssl";
        auth: boolean;
        username?: string | undefined;
        password?: string | undefined;
    }, {
        host: string;
        username?: string | undefined;
        password?: string | undefined;
        timeout?: number | undefined;
        port?: number | undefined;
        encryption?: "none" | "tls" | "ssl" | undefined;
        auth?: boolean | undefined;
    }>>;
    mailgun: z.ZodOptional<z.ZodObject<{
        domain: z.ZodString;
        secret: z.ZodString;
        endpoint: z.ZodOptional<z.ZodString>;
        version: z.ZodDefault<z.ZodEnum<["v2", "v3"]>>;
    }, "strip", z.ZodTypeAny, {
        version: "v2" | "v3";
        domain: string;
        secret: string;
        endpoint?: string | undefined;
    }, {
        domain: string;
        secret: string;
        version?: "v2" | "v3" | undefined;
        endpoint?: string | undefined;
    }>>;
    ses: z.ZodOptional<z.ZodObject<{
        key: z.ZodString;
        secret: z.ZodString;
        region: z.ZodDefault<z.ZodString>;
        configuration_set: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        secret: string;
        key: string;
        region: string;
        configuration_set?: string | undefined;
    }, {
        secret: string;
        key: string;
        region?: string | undefined;
        configuration_set?: string | undefined;
    }>>;
    postmark: z.ZodOptional<z.ZodObject<{
        token: z.ZodString;
        message_stream: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        token: string;
        message_stream: string;
    }, {
        token: string;
        message_stream?: string | undefined;
    }>>;
    database: z.ZodOptional<z.ZodObject<{
        connection: z.ZodDefault<z.ZodEnum<["mysql", "postgresql", "sqlite", "mariadb"]>>;
        host: z.ZodString;
        port: z.ZodNumber;
        database: z.ZodString;
        username: z.ZodString;
        password: z.ZodString;
        charset: z.ZodDefault<z.ZodString>;
        collation: z.ZodDefault<z.ZodString>;
        prefix: z.ZodDefault<z.ZodString>;
        strict: z.ZodDefault<z.ZodBoolean>;
        engine: z.ZodOptional<z.ZodString>;
        options: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        options: Record<string, any>;
        username: string;
        password: string;
        host: string;
        port: number;
        database: string;
        strict: boolean;
        connection: "mysql" | "postgresql" | "sqlite" | "mariadb";
        charset: string;
        collation: string;
        prefix: string;
        engine?: string | undefined;
    }, {
        username: string;
        password: string;
        host: string;
        port: number;
        database: string;
        options?: Record<string, any> | undefined;
        strict?: boolean | undefined;
        connection?: "mysql" | "postgresql" | "sqlite" | "mariadb" | undefined;
        charset?: string | undefined;
        collation?: string | undefined;
        prefix?: string | undefined;
        engine?: string | undefined;
    }>>;
    cache: z.ZodOptional<z.ZodObject<{
        default: z.ZodDefault<z.ZodEnum<["file", "redis", "memcached", "database"]>>;
        connections: z.ZodDefault<z.ZodObject<{
            file: z.ZodOptional<z.ZodObject<{
                driver: z.ZodLiteral<"file">;
                path: z.ZodDefault<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                path: string;
                driver: "file";
            }, {
                driver: "file";
                path?: string | undefined;
            }>>;
            redis: z.ZodOptional<z.ZodObject<{
                driver: z.ZodLiteral<"redis">;
                host: z.ZodDefault<z.ZodString>;
                port: z.ZodDefault<z.ZodNumber>;
                password: z.ZodOptional<z.ZodString>;
                database: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                driver: "redis";
                host: string;
                port: number;
                database: number;
                password?: string | undefined;
            }, {
                driver: "redis";
                password?: string | undefined;
                host?: string | undefined;
                port?: number | undefined;
                database?: number | undefined;
            }>>;
            memcached: z.ZodOptional<z.ZodObject<{
                driver: z.ZodLiteral<"memcached">;
                servers: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    host: z.ZodString;
                    port: z.ZodNumber;
                    weight: z.ZodDefault<z.ZodNumber>;
                }, "strip", z.ZodTypeAny, {
                    host: string;
                    port: number;
                    weight: number;
                }, {
                    host: string;
                    port: number;
                    weight?: number | undefined;
                }>, "many">>;
            }, "strip", z.ZodTypeAny, {
                servers: {
                    host: string;
                    port: number;
                    weight: number;
                }[];
                driver: "memcached";
            }, {
                driver: "memcached";
                servers?: {
                    host: string;
                    port: number;
                    weight?: number | undefined;
                }[] | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            file?: {
                path: string;
                driver: "file";
            } | undefined;
            redis?: {
                driver: "redis";
                host: string;
                port: number;
                database: number;
                password?: string | undefined;
            } | undefined;
            memcached?: {
                servers: {
                    host: string;
                    port: number;
                    weight: number;
                }[];
                driver: "memcached";
            } | undefined;
        }, {
            file?: {
                driver: "file";
                path?: string | undefined;
            } | undefined;
            redis?: {
                driver: "redis";
                password?: string | undefined;
                host?: string | undefined;
                port?: number | undefined;
                database?: number | undefined;
            } | undefined;
            memcached?: {
                driver: "memcached";
                servers?: {
                    host: string;
                    port: number;
                    weight?: number | undefined;
                }[] | undefined;
            } | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        default: "database" | "file" | "redis" | "memcached";
        connections: {
            file?: {
                path: string;
                driver: "file";
            } | undefined;
            redis?: {
                driver: "redis";
                host: string;
                port: number;
                database: number;
                password?: string | undefined;
            } | undefined;
            memcached?: {
                servers: {
                    host: string;
                    port: number;
                    weight: number;
                }[];
                driver: "memcached";
            } | undefined;
        };
    }, {
        default?: "database" | "file" | "redis" | "memcached" | undefined;
        connections?: {
            file?: {
                driver: "file";
                path?: string | undefined;
            } | undefined;
            redis?: {
                driver: "redis";
                password?: string | undefined;
                host?: string | undefined;
                port?: number | undefined;
                database?: number | undefined;
            } | undefined;
            memcached?: {
                driver: "memcached";
                servers?: {
                    host: string;
                    port: number;
                    weight?: number | undefined;
                }[] | undefined;
            } | undefined;
        } | undefined;
    }>>;
    queue: z.ZodOptional<z.ZodObject<{
        default: z.ZodDefault<z.ZodEnum<["sync", "database", "redis", "sqs"]>>;
        connections: z.ZodDefault<z.ZodObject<{
            database: z.ZodOptional<z.ZodObject<{
                driver: z.ZodLiteral<"database">;
                table: z.ZodDefault<z.ZodString>;
                queue: z.ZodDefault<z.ZodString>;
                retry_after: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                driver: "database";
                queue: string;
                table: string;
                retry_after: number;
            }, {
                driver: "database";
                queue?: string | undefined;
                table?: string | undefined;
                retry_after?: number | undefined;
            }>>;
            redis: z.ZodOptional<z.ZodObject<{
                driver: z.ZodLiteral<"redis">;
                connection: z.ZodDefault<z.ZodString>;
                queue: z.ZodDefault<z.ZodString>;
                retry_after: z.ZodDefault<z.ZodNumber>;
                block_for: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                driver: "redis";
                queue: string;
                connection: string;
                retry_after: number;
                block_for: number;
            }, {
                driver: "redis";
                queue?: string | undefined;
                connection?: string | undefined;
                retry_after?: number | undefined;
                block_for?: number | undefined;
            }>>;
            sqs: z.ZodOptional<z.ZodObject<{
                driver: z.ZodLiteral<"sqs">;
                key: z.ZodString;
                secret: z.ZodString;
                prefix: z.ZodString;
                queue: z.ZodDefault<z.ZodString>;
                region: z.ZodDefault<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                driver: "sqs";
                secret: string;
                key: string;
                region: string;
                queue: string;
                prefix: string;
            }, {
                driver: "sqs";
                secret: string;
                key: string;
                prefix: string;
                region?: string | undefined;
                queue?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            database?: {
                driver: "database";
                queue: string;
                table: string;
                retry_after: number;
            } | undefined;
            redis?: {
                driver: "redis";
                queue: string;
                connection: string;
                retry_after: number;
                block_for: number;
            } | undefined;
            sqs?: {
                driver: "sqs";
                secret: string;
                key: string;
                region: string;
                queue: string;
                prefix: string;
            } | undefined;
        }, {
            database?: {
                driver: "database";
                queue?: string | undefined;
                table?: string | undefined;
                retry_after?: number | undefined;
            } | undefined;
            redis?: {
                driver: "redis";
                queue?: string | undefined;
                connection?: string | undefined;
                retry_after?: number | undefined;
                block_for?: number | undefined;
            } | undefined;
            sqs?: {
                driver: "sqs";
                secret: string;
                key: string;
                prefix: string;
                region?: string | undefined;
                queue?: string | undefined;
            } | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        default: "database" | "redis" | "sync" | "sqs";
        connections: {
            database?: {
                driver: "database";
                queue: string;
                table: string;
                retry_after: number;
            } | undefined;
            redis?: {
                driver: "redis";
                queue: string;
                connection: string;
                retry_after: number;
                block_for: number;
            } | undefined;
            sqs?: {
                driver: "sqs";
                secret: string;
                key: string;
                region: string;
                queue: string;
                prefix: string;
            } | undefined;
        };
    }, {
        default?: "database" | "redis" | "sync" | "sqs" | undefined;
        connections?: {
            database?: {
                driver: "database";
                queue?: string | undefined;
                table?: string | undefined;
                retry_after?: number | undefined;
            } | undefined;
            redis?: {
                driver: "redis";
                queue?: string | undefined;
                connection?: string | undefined;
                retry_after?: number | undefined;
                block_for?: number | undefined;
            } | undefined;
            sqs?: {
                driver: "sqs";
                secret: string;
                key: string;
                prefix: string;
                region?: string | undefined;
                queue?: string | undefined;
            } | undefined;
        } | undefined;
    }>>;
    storage: z.ZodOptional<z.ZodObject<{
        default: z.ZodDefault<z.ZodEnum<["local", "s3", "gcs", "azure"]>>;
        disks: z.ZodDefault<z.ZodObject<{
            local: z.ZodOptional<z.ZodObject<{
                driver: z.ZodLiteral<"local">;
                root: z.ZodDefault<z.ZodString>;
                url: z.ZodOptional<z.ZodString>;
                visibility: z.ZodDefault<z.ZodEnum<["public", "private"]>>;
            }, "strip", z.ZodTypeAny, {
                driver: "local";
                root: string;
                visibility: "public" | "private";
                url?: string | undefined;
            }, {
                driver: "local";
                url?: string | undefined;
                root?: string | undefined;
                visibility?: "public" | "private" | undefined;
            }>>;
            s3: z.ZodOptional<z.ZodObject<{
                driver: z.ZodLiteral<"s3">;
                key: z.ZodString;
                secret: z.ZodString;
                region: z.ZodString;
                bucket: z.ZodString;
                url: z.ZodOptional<z.ZodString>;
                endpoint: z.ZodOptional<z.ZodString>;
                use_path_style_endpoint: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                driver: "s3";
                secret: string;
                key: string;
                region: string;
                bucket: string;
                use_path_style_endpoint: boolean;
                url?: string | undefined;
                endpoint?: string | undefined;
            }, {
                driver: "s3";
                secret: string;
                key: string;
                region: string;
                bucket: string;
                url?: string | undefined;
                endpoint?: string | undefined;
                use_path_style_endpoint?: boolean | undefined;
            }>>;
            gcs: z.ZodOptional<z.ZodObject<{
                driver: z.ZodLiteral<"gcs">;
                project_id: z.ZodString;
                key_file: z.ZodOptional<z.ZodString>;
                bucket: z.ZodString;
                path_prefix: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                driver: "gcs";
                bucket: string;
                project_id: string;
                key_file?: string | undefined;
                path_prefix?: string | undefined;
            }, {
                driver: "gcs";
                bucket: string;
                project_id: string;
                key_file?: string | undefined;
                path_prefix?: string | undefined;
            }>>;
            azure: z.ZodOptional<z.ZodObject<{
                driver: z.ZodLiteral<"azure">;
                name: z.ZodString;
                key: z.ZodString;
                container: z.ZodString;
                url: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                driver: "azure";
                key: string;
                container: string;
                url?: string | undefined;
            }, {
                name: string;
                driver: "azure";
                key: string;
                container: string;
                url?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            local?: {
                driver: "local";
                root: string;
                visibility: "public" | "private";
                url?: string | undefined;
            } | undefined;
            s3?: {
                driver: "s3";
                secret: string;
                key: string;
                region: string;
                bucket: string;
                use_path_style_endpoint: boolean;
                url?: string | undefined;
                endpoint?: string | undefined;
            } | undefined;
            gcs?: {
                driver: "gcs";
                bucket: string;
                project_id: string;
                key_file?: string | undefined;
                path_prefix?: string | undefined;
            } | undefined;
            azure?: {
                name: string;
                driver: "azure";
                key: string;
                container: string;
                url?: string | undefined;
            } | undefined;
        }, {
            local?: {
                driver: "local";
                url?: string | undefined;
                root?: string | undefined;
                visibility?: "public" | "private" | undefined;
            } | undefined;
            s3?: {
                driver: "s3";
                secret: string;
                key: string;
                region: string;
                bucket: string;
                url?: string | undefined;
                endpoint?: string | undefined;
                use_path_style_endpoint?: boolean | undefined;
            } | undefined;
            gcs?: {
                driver: "gcs";
                bucket: string;
                project_id: string;
                key_file?: string | undefined;
                path_prefix?: string | undefined;
            } | undefined;
            azure?: {
                name: string;
                driver: "azure";
                key: string;
                container: string;
                url?: string | undefined;
            } | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        default: "local" | "s3" | "gcs" | "azure";
        disks: {
            local?: {
                driver: "local";
                root: string;
                visibility: "public" | "private";
                url?: string | undefined;
            } | undefined;
            s3?: {
                driver: "s3";
                secret: string;
                key: string;
                region: string;
                bucket: string;
                use_path_style_endpoint: boolean;
                url?: string | undefined;
                endpoint?: string | undefined;
            } | undefined;
            gcs?: {
                driver: "gcs";
                bucket: string;
                project_id: string;
                key_file?: string | undefined;
                path_prefix?: string | undefined;
            } | undefined;
            azure?: {
                name: string;
                driver: "azure";
                key: string;
                container: string;
                url?: string | undefined;
            } | undefined;
        };
    }, {
        default?: "local" | "s3" | "gcs" | "azure" | undefined;
        disks?: {
            local?: {
                driver: "local";
                url?: string | undefined;
                root?: string | undefined;
                visibility?: "public" | "private" | undefined;
            } | undefined;
            s3?: {
                driver: "s3";
                secret: string;
                key: string;
                region: string;
                bucket: string;
                url?: string | undefined;
                endpoint?: string | undefined;
                use_path_style_endpoint?: boolean | undefined;
            } | undefined;
            gcs?: {
                driver: "gcs";
                bucket: string;
                project_id: string;
                key_file?: string | undefined;
                path_prefix?: string | undefined;
            } | undefined;
            azure?: {
                name: string;
                driver: "azure";
                key: string;
                container: string;
                url?: string | undefined;
            } | undefined;
        } | undefined;
    }>>;
    logging: z.ZodOptional<z.ZodObject<{
        default: z.ZodDefault<z.ZodEnum<["stack", "single", "daily", "syslog", "errorlog"]>>;
        channels: z.ZodDefault<z.ZodObject<{
            stack: z.ZodOptional<z.ZodObject<{
                driver: z.ZodLiteral<"stack">;
                channels: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                driver: "stack";
                channels: string[];
            }, {
                driver: "stack";
                channels?: string[] | undefined;
            }>>;
            single: z.ZodOptional<z.ZodObject<{
                driver: z.ZodLiteral<"single">;
                path: z.ZodDefault<z.ZodString>;
                level: z.ZodDefault<z.ZodEnum<["emergency", "alert", "critical", "error", "warning", "notice", "info", "debug"]>>;
            }, "strip", z.ZodTypeAny, {
                path: string;
                level: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug";
                driver: "single";
            }, {
                driver: "single";
                path?: string | undefined;
                level?: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug" | undefined;
            }>>;
            daily: z.ZodOptional<z.ZodObject<{
                driver: z.ZodLiteral<"daily">;
                path: z.ZodDefault<z.ZodString>;
                level: z.ZodDefault<z.ZodEnum<["emergency", "alert", "critical", "error", "warning", "notice", "info", "debug"]>>;
                days: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                path: string;
                level: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug";
                driver: "daily";
                days: number;
            }, {
                driver: "daily";
                path?: string | undefined;
                level?: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug" | undefined;
                days?: number | undefined;
            }>>;
            syslog: z.ZodOptional<z.ZodObject<{
                driver: z.ZodLiteral<"syslog">;
                level: z.ZodDefault<z.ZodEnum<["emergency", "alert", "critical", "error", "warning", "notice", "info", "debug"]>>;
                facility: z.ZodDefault<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                level: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug";
                driver: "syslog";
                facility: string;
            }, {
                driver: "syslog";
                level?: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug" | undefined;
                facility?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            stack?: {
                driver: "stack";
                channels: string[];
            } | undefined;
            single?: {
                path: string;
                level: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug";
                driver: "single";
            } | undefined;
            daily?: {
                path: string;
                level: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug";
                driver: "daily";
                days: number;
            } | undefined;
            syslog?: {
                level: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug";
                driver: "syslog";
                facility: string;
            } | undefined;
        }, {
            stack?: {
                driver: "stack";
                channels?: string[] | undefined;
            } | undefined;
            single?: {
                driver: "single";
                path?: string | undefined;
                level?: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug" | undefined;
            } | undefined;
            daily?: {
                driver: "daily";
                path?: string | undefined;
                level?: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug" | undefined;
                days?: number | undefined;
            } | undefined;
            syslog?: {
                driver: "syslog";
                level?: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug" | undefined;
                facility?: string | undefined;
            } | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        default: "stack" | "single" | "daily" | "syslog" | "errorlog";
        channels: {
            stack?: {
                driver: "stack";
                channels: string[];
            } | undefined;
            single?: {
                path: string;
                level: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug";
                driver: "single";
            } | undefined;
            daily?: {
                path: string;
                level: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug";
                driver: "daily";
                days: number;
            } | undefined;
            syslog?: {
                level: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug";
                driver: "syslog";
                facility: string;
            } | undefined;
        };
    }, {
        default?: "stack" | "single" | "daily" | "syslog" | "errorlog" | undefined;
        channels?: {
            stack?: {
                driver: "stack";
                channels?: string[] | undefined;
            } | undefined;
            single?: {
                driver: "single";
                path?: string | undefined;
                level?: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug" | undefined;
            } | undefined;
            daily?: {
                driver: "daily";
                path?: string | undefined;
                level?: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug" | undefined;
                days?: number | undefined;
            } | undefined;
            syslog?: {
                driver: "syslog";
                level?: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug" | undefined;
                facility?: string | undefined;
            } | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    email?: {
        driver: "smtp" | "mailgun" | "ses" | "sendmail" | "postmark";
        from_address: string;
        from_name: string;
        encryption: "none" | "tls" | "ssl";
        reply_to?: string | undefined;
    } | undefined;
    panel?: {
        maintenance_mode: boolean;
        name: string;
        url: string;
        language: string;
        timezone: string;
        theme: "light" | "dark" | "auto";
        description?: string | undefined;
        logo_url?: string | undefined;
        favicon_url?: string | undefined;
        maintenance_message?: string | undefined;
    } | undefined;
    registration?: {
        enabled: boolean;
        email_verification: boolean;
        approval_required: boolean;
        allowed_domains: string[];
        blocked_domains: string[];
        recaptcha_enabled: boolean;
        terms_required: boolean;
        privacy_required: boolean;
        recaptcha_site_key?: string | undefined;
        recaptcha_secret_key?: string | undefined;
        terms_url?: string | undefined;
        privacy_url?: string | undefined;
    } | undefined;
    limits?: {
        max_servers_per_user: number;
        max_memory_per_server: number;
        max_disk_per_server: number;
        max_cpu_per_server: number;
        max_backups_per_server: number;
        max_databases_per_server: number;
        max_allocations_per_server: number;
        max_file_uploads_per_minute: number;
        max_api_requests_per_minute: number;
    } | undefined;
    security?: {
        enforce_2fa: boolean;
        session_timeout: number;
        max_login_attempts: number;
        lockout_duration: number;
        enforce_2fa_admin: boolean;
        password_requirements: {
            min_length: number;
            require_uppercase: boolean;
            require_lowercase: boolean;
            require_numbers: boolean;
            require_symbols: boolean;
            prevent_reuse: number;
        };
        session_security: {
            secure_cookies: boolean;
            same_site: "none" | "strict" | "lax";
            remember_me_duration: number;
        };
    } | undefined;
    features?: {
        email_verification: boolean;
        server_transfers: boolean;
        server_backups: boolean;
        scheduled_tasks: boolean;
        api_access: boolean;
        file_manager: boolean;
        database_management: boolean;
        user_registration: boolean;
        server_creation: boolean;
        two_factor_auth: boolean;
        recaptcha: boolean;
        advanced_analytics: boolean;
        server_monitoring: boolean;
        automated_backups: boolean;
        server_scaling: boolean;
        multi_node: boolean;
    } | undefined;
    smtp?: {
        timeout: number;
        host: string;
        port: number;
        encryption: "none" | "tls" | "ssl";
        auth: boolean;
        username?: string | undefined;
        password?: string | undefined;
    } | undefined;
    mailgun?: {
        version: "v2" | "v3";
        domain: string;
        secret: string;
        endpoint?: string | undefined;
    } | undefined;
    ses?: {
        secret: string;
        key: string;
        region: string;
        configuration_set?: string | undefined;
    } | undefined;
    access_control?: {
        country_restrictions: {
            enabled: boolean;
            allowed_countries: string[];
            blocked_countries: string[];
            mode: "allow" | "block";
        };
        ip_whitelist: {
            enabled: boolean;
            addresses: string[];
            admin_only: boolean;
        };
        ip_blacklist: {
            enabled: boolean;
            addresses: string[];
            auto_ban: boolean;
            auto_ban_threshold: number;
        };
        admin_access: {
            session_timeout: number;
            allowed_ips: string[];
            ip_whitelist_only: boolean;
            require_2fa: boolean;
        };
    } | undefined;
    security_headers?: {
        hsts: {
            enabled: boolean;
            max_age: number;
            include_subdomains: boolean;
            preload: boolean;
        };
        csp: {
            enabled: boolean;
            report_only: boolean;
            directives: Record<string, string>;
        };
        other_headers: {
            x_frame_options: "DENY" | "SAMEORIGIN" | "DISABLED";
            x_content_type_options: boolean;
            x_xss_protection: boolean;
            referrer_policy: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
        };
    } | undefined;
    database?: {
        options: Record<string, any>;
        username: string;
        password: string;
        host: string;
        port: number;
        database: string;
        strict: boolean;
        connection: "mysql" | "postgresql" | "sqlite" | "mariadb";
        charset: string;
        collation: string;
        prefix: string;
        engine?: string | undefined;
    } | undefined;
    cache?: {
        default: "database" | "file" | "redis" | "memcached";
        connections: {
            file?: {
                path: string;
                driver: "file";
            } | undefined;
            redis?: {
                driver: "redis";
                host: string;
                port: number;
                database: number;
                password?: string | undefined;
            } | undefined;
            memcached?: {
                servers: {
                    host: string;
                    port: number;
                    weight: number;
                }[];
                driver: "memcached";
            } | undefined;
        };
    } | undefined;
    storage?: {
        default: "local" | "s3" | "gcs" | "azure";
        disks: {
            local?: {
                driver: "local";
                root: string;
                visibility: "public" | "private";
                url?: string | undefined;
            } | undefined;
            s3?: {
                driver: "s3";
                secret: string;
                key: string;
                region: string;
                bucket: string;
                use_path_style_endpoint: boolean;
                url?: string | undefined;
                endpoint?: string | undefined;
            } | undefined;
            gcs?: {
                driver: "gcs";
                bucket: string;
                project_id: string;
                key_file?: string | undefined;
                path_prefix?: string | undefined;
            } | undefined;
            azure?: {
                name: string;
                driver: "azure";
                key: string;
                container: string;
                url?: string | undefined;
            } | undefined;
        };
    } | undefined;
    queue?: {
        default: "database" | "redis" | "sync" | "sqs";
        connections: {
            database?: {
                driver: "database";
                queue: string;
                table: string;
                retry_after: number;
            } | undefined;
            redis?: {
                driver: "redis";
                queue: string;
                connection: string;
                retry_after: number;
                block_for: number;
            } | undefined;
            sqs?: {
                driver: "sqs";
                secret: string;
                key: string;
                region: string;
                queue: string;
                prefix: string;
            } | undefined;
        };
    } | undefined;
    postmark?: {
        token: string;
        message_stream: string;
    } | undefined;
    rate_limiting?: {
        api_requests: {
            enabled: boolean;
            window_minutes: number;
            requests_per_minute: number;
            burst_limit: number;
        };
        login_attempts: {
            enabled: boolean;
            window_minutes: number;
            attempts_per_minute: number;
            progressive_delay: boolean;
        };
        registration_attempts: {
            enabled: boolean;
            attempts_per_hour: number;
            window_hours: number;
        };
        password_reset: {
            enabled: boolean;
            attempts_per_hour: number;
            window_hours: number;
        };
    } | undefined;
    logging?: {
        default: "stack" | "single" | "daily" | "syslog" | "errorlog";
        channels: {
            stack?: {
                driver: "stack";
                channels: string[];
            } | undefined;
            single?: {
                path: string;
                level: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug";
                driver: "single";
            } | undefined;
            daily?: {
                path: string;
                level: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug";
                driver: "daily";
                days: number;
            } | undefined;
            syslog?: {
                level: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug";
                driver: "syslog";
                facility: string;
            } | undefined;
        };
    } | undefined;
}, {
    email?: {
        from_address: string;
        from_name: string;
        driver?: "smtp" | "mailgun" | "ses" | "sendmail" | "postmark" | undefined;
        encryption?: "none" | "tls" | "ssl" | undefined;
        reply_to?: string | undefined;
    } | undefined;
    panel?: {
        name: string;
        url: string;
        maintenance_mode?: boolean | undefined;
        description?: string | undefined;
        logo_url?: string | undefined;
        favicon_url?: string | undefined;
        language?: string | undefined;
        timezone?: string | undefined;
        theme?: "light" | "dark" | "auto" | undefined;
        maintenance_message?: string | undefined;
    } | undefined;
    registration?: {
        enabled?: boolean | undefined;
        email_verification?: boolean | undefined;
        approval_required?: boolean | undefined;
        allowed_domains?: string[] | undefined;
        blocked_domains?: string[] | undefined;
        recaptcha_enabled?: boolean | undefined;
        recaptcha_site_key?: string | undefined;
        recaptcha_secret_key?: string | undefined;
        terms_required?: boolean | undefined;
        terms_url?: string | undefined;
        privacy_required?: boolean | undefined;
        privacy_url?: string | undefined;
    } | undefined;
    limits?: {
        max_servers_per_user?: number | undefined;
        max_memory_per_server?: number | undefined;
        max_disk_per_server?: number | undefined;
        max_cpu_per_server?: number | undefined;
        max_backups_per_server?: number | undefined;
        max_databases_per_server?: number | undefined;
        max_allocations_per_server?: number | undefined;
        max_file_uploads_per_minute?: number | undefined;
        max_api_requests_per_minute?: number | undefined;
    } | undefined;
    security?: {
        enforce_2fa?: boolean | undefined;
        session_timeout?: number | undefined;
        max_login_attempts?: number | undefined;
        lockout_duration?: number | undefined;
        enforce_2fa_admin?: boolean | undefined;
        password_requirements?: {
            min_length?: number | undefined;
            require_uppercase?: boolean | undefined;
            require_lowercase?: boolean | undefined;
            require_numbers?: boolean | undefined;
            require_symbols?: boolean | undefined;
            prevent_reuse?: number | undefined;
        } | undefined;
        session_security?: {
            secure_cookies?: boolean | undefined;
            same_site?: "none" | "strict" | "lax" | undefined;
            remember_me_duration?: number | undefined;
        } | undefined;
    } | undefined;
    features?: {
        email_verification?: boolean | undefined;
        server_transfers?: boolean | undefined;
        server_backups?: boolean | undefined;
        scheduled_tasks?: boolean | undefined;
        api_access?: boolean | undefined;
        file_manager?: boolean | undefined;
        database_management?: boolean | undefined;
        user_registration?: boolean | undefined;
        server_creation?: boolean | undefined;
        two_factor_auth?: boolean | undefined;
        recaptcha?: boolean | undefined;
        advanced_analytics?: boolean | undefined;
        server_monitoring?: boolean | undefined;
        automated_backups?: boolean | undefined;
        server_scaling?: boolean | undefined;
        multi_node?: boolean | undefined;
    } | undefined;
    smtp?: {
        host: string;
        username?: string | undefined;
        password?: string | undefined;
        timeout?: number | undefined;
        port?: number | undefined;
        encryption?: "none" | "tls" | "ssl" | undefined;
        auth?: boolean | undefined;
    } | undefined;
    mailgun?: {
        domain: string;
        secret: string;
        version?: "v2" | "v3" | undefined;
        endpoint?: string | undefined;
    } | undefined;
    ses?: {
        secret: string;
        key: string;
        region?: string | undefined;
        configuration_set?: string | undefined;
    } | undefined;
    access_control?: {
        country_restrictions?: {
            enabled?: boolean | undefined;
            allowed_countries?: string[] | undefined;
            blocked_countries?: string[] | undefined;
            mode?: "allow" | "block" | undefined;
        } | undefined;
        ip_whitelist?: {
            enabled?: boolean | undefined;
            addresses?: string[] | undefined;
            admin_only?: boolean | undefined;
        } | undefined;
        ip_blacklist?: {
            enabled?: boolean | undefined;
            addresses?: string[] | undefined;
            auto_ban?: boolean | undefined;
            auto_ban_threshold?: number | undefined;
        } | undefined;
        admin_access?: {
            session_timeout?: number | undefined;
            allowed_ips?: string[] | undefined;
            ip_whitelist_only?: boolean | undefined;
            require_2fa?: boolean | undefined;
        } | undefined;
    } | undefined;
    security_headers?: {
        hsts?: {
            enabled?: boolean | undefined;
            max_age?: number | undefined;
            include_subdomains?: boolean | undefined;
            preload?: boolean | undefined;
        } | undefined;
        csp?: {
            enabled?: boolean | undefined;
            report_only?: boolean | undefined;
            directives?: Record<string, string> | undefined;
        } | undefined;
        other_headers?: {
            x_frame_options?: "DENY" | "SAMEORIGIN" | "DISABLED" | undefined;
            x_content_type_options?: boolean | undefined;
            x_xss_protection?: boolean | undefined;
            referrer_policy?: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url" | undefined;
        } | undefined;
    } | undefined;
    database?: {
        username: string;
        password: string;
        host: string;
        port: number;
        database: string;
        options?: Record<string, any> | undefined;
        strict?: boolean | undefined;
        connection?: "mysql" | "postgresql" | "sqlite" | "mariadb" | undefined;
        charset?: string | undefined;
        collation?: string | undefined;
        prefix?: string | undefined;
        engine?: string | undefined;
    } | undefined;
    cache?: {
        default?: "database" | "file" | "redis" | "memcached" | undefined;
        connections?: {
            file?: {
                driver: "file";
                path?: string | undefined;
            } | undefined;
            redis?: {
                driver: "redis";
                password?: string | undefined;
                host?: string | undefined;
                port?: number | undefined;
                database?: number | undefined;
            } | undefined;
            memcached?: {
                driver: "memcached";
                servers?: {
                    host: string;
                    port: number;
                    weight?: number | undefined;
                }[] | undefined;
            } | undefined;
        } | undefined;
    } | undefined;
    storage?: {
        default?: "local" | "s3" | "gcs" | "azure" | undefined;
        disks?: {
            local?: {
                driver: "local";
                url?: string | undefined;
                root?: string | undefined;
                visibility?: "public" | "private" | undefined;
            } | undefined;
            s3?: {
                driver: "s3";
                secret: string;
                key: string;
                region: string;
                bucket: string;
                url?: string | undefined;
                endpoint?: string | undefined;
                use_path_style_endpoint?: boolean | undefined;
            } | undefined;
            gcs?: {
                driver: "gcs";
                bucket: string;
                project_id: string;
                key_file?: string | undefined;
                path_prefix?: string | undefined;
            } | undefined;
            azure?: {
                name: string;
                driver: "azure";
                key: string;
                container: string;
                url?: string | undefined;
            } | undefined;
        } | undefined;
    } | undefined;
    queue?: {
        default?: "database" | "redis" | "sync" | "sqs" | undefined;
        connections?: {
            database?: {
                driver: "database";
                queue?: string | undefined;
                table?: string | undefined;
                retry_after?: number | undefined;
            } | undefined;
            redis?: {
                driver: "redis";
                queue?: string | undefined;
                connection?: string | undefined;
                retry_after?: number | undefined;
                block_for?: number | undefined;
            } | undefined;
            sqs?: {
                driver: "sqs";
                secret: string;
                key: string;
                prefix: string;
                region?: string | undefined;
                queue?: string | undefined;
            } | undefined;
        } | undefined;
    } | undefined;
    postmark?: {
        token: string;
        message_stream?: string | undefined;
    } | undefined;
    rate_limiting?: {
        api_requests?: {
            enabled?: boolean | undefined;
            window_minutes?: number | undefined;
            requests_per_minute?: number | undefined;
            burst_limit?: number | undefined;
        } | undefined;
        login_attempts?: {
            enabled?: boolean | undefined;
            window_minutes?: number | undefined;
            attempts_per_minute?: number | undefined;
            progressive_delay?: boolean | undefined;
        } | undefined;
        registration_attempts?: {
            enabled?: boolean | undefined;
            attempts_per_hour?: number | undefined;
            window_hours?: number | undefined;
        } | undefined;
        password_reset?: {
            enabled?: boolean | undefined;
            attempts_per_hour?: number | undefined;
            window_hours?: number | undefined;
        } | undefined;
    } | undefined;
    logging?: {
        default?: "stack" | "single" | "daily" | "syslog" | "errorlog" | undefined;
        channels?: {
            stack?: {
                driver: "stack";
                channels?: string[] | undefined;
            } | undefined;
            single?: {
                driver: "single";
                path?: string | undefined;
                level?: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug" | undefined;
            } | undefined;
            daily?: {
                driver: "daily";
                path?: string | undefined;
                level?: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug" | undefined;
                days?: number | undefined;
            } | undefined;
            syslog?: {
                driver: "syslog";
                level?: "warning" | "critical" | "info" | "error" | "emergency" | "alert" | "notice" | "debug" | undefined;
                facility?: string | undefined;
            } | undefined;
        } | undefined;
    } | undefined;
}>;
export declare const EmailTestSchema: z.ZodObject<{
    recipient: z.ZodString;
    test_type: z.ZodDefault<z.ZodEnum<["basic", "template", "attachment"]>>;
    template: z.ZodOptional<z.ZodString>;
    variables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    recipient: string;
    test_type: "basic" | "template" | "attachment";
    template?: string | undefined;
    variables?: Record<string, any> | undefined;
}, {
    recipient: string;
    template?: string | undefined;
    test_type?: "basic" | "template" | "attachment" | undefined;
    variables?: Record<string, any> | undefined;
}>;
export declare const ConfigBackupSchema: z.ZodObject<{
    include_sections: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    exclude_sensitive: z.ZodDefault<z.ZodBoolean>;
    format: z.ZodDefault<z.ZodEnum<["json", "yaml", "env"]>>;
    compress: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    format: "json" | "yaml" | "env";
    exclude_sensitive: boolean;
    compress: boolean;
    include_sections?: string[] | undefined;
}, {
    format?: "json" | "yaml" | "env" | undefined;
    include_sections?: string[] | undefined;
    exclude_sensitive?: boolean | undefined;
    compress?: boolean | undefined;
}>;
export declare const ConfigRestoreSchema: z.ZodObject<{
    backup_data: z.ZodString;
    format: z.ZodEnum<["json", "yaml", "env"]>;
    merge_mode: z.ZodDefault<z.ZodEnum<["replace", "merge", "overlay"]>>;
    validate_only: z.ZodDefault<z.ZodBoolean>;
    backup_current: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    format: "json" | "yaml" | "env";
    backup_data: string;
    merge_mode: "replace" | "merge" | "overlay";
    validate_only: boolean;
    backup_current: boolean;
}, {
    format: "json" | "yaml" | "env";
    backup_data: string;
    merge_mode?: "replace" | "merge" | "overlay" | undefined;
    validate_only?: boolean | undefined;
    backup_current?: boolean | undefined;
}>;
export declare function validateEmailDriver(driver: string, settings: any): boolean;
export declare function validatePasswordRequirements(password: string, requirements: any): {
    valid: boolean;
    errors: string[];
};
export declare function sanitizeConfigForExport(config: any, excludeSensitive?: boolean): any;
//# sourceMappingURL=settings.d.ts.map