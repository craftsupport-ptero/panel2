"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionError = exports.AdminValidationError = exports.IdListSchema = exports.DateRangeSchema = exports.PaginationSchema = exports.AdminPermissionSchema = exports.NotificationChannelSchema = exports.AlertRuleSchema = exports.MigrationOptionsSchema = exports.SystemBackupSchema = exports.DatabaseOptimizationSchema = exports.CleanupOptionsSchema = exports.MaintenanceTaskSchema = exports.AnalyticsExportSchema = exports.AnalyticsQuerySchema = exports.NodeOptimizationSchema = exports.NodeDrainSchema = exports.NodeMaintenanceSchema = exports.ServerBackupSchema = exports.ServerOptimizationSchema = exports.ServerMigrationSchema = exports.BulkServerActionSchema = exports.UserImportSchema = exports.BulkUserDeleteSchema = exports.BulkUserUpdateSchema = exports.BulkUserCreateSchema = exports.UserSearchSchema = exports.SystemHealthSchema = exports.DashboardMetricsSchema = void 0;
exports.validateAdminPermission = validateAdminPermission;
exports.validateBulkOperation = validateBulkOperation;
exports.validateTimeframe = validateTimeframe;
exports.validateCronExpression = validateCronExpression;
const zod_1 = require("zod");
// Admin operation validation schemas
// Dashboard related schemas
exports.DashboardMetricsSchema = zod_1.z.object({
    timeframe: zod_1.z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h'),
    granularity: zod_1.z.enum(['minute', 'hour', 'day']).default('hour')
});
exports.SystemHealthSchema = zod_1.z.object({
    component: zod_1.z.enum(['database', 'cache', 'storage', 'nodes', 'overall']).optional(),
    include_details: zod_1.z.boolean().default(false)
});
// User management schemas
exports.UserSearchSchema = zod_1.z.object({
    query: zod_1.z.string().min(1).max(255).optional(),
    role: zod_1.z.string().optional(),
    status: zod_1.z.enum(['active', 'suspended', 'banned', 'all']).default('all'),
    sort: zod_1.z.enum(['created', 'updated', 'username', 'email', 'last_login']).default('created'),
    direction: zod_1.z.enum(['asc', 'desc']).default('desc'),
    page: zod_1.z.number().min(1).default(1),
    per_page: zod_1.z.number().min(1).max(100).default(25),
    created_after: zod_1.z.string().datetime().optional(),
    created_before: zod_1.z.string().datetime().optional()
});
exports.BulkUserCreateSchema = zod_1.z.object({
    users: zod_1.z.array(zod_1.z.object({
        username: zod_1.z.string().min(3).max(32).regex(/^[a-zA-Z0-9_-]+$/),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8).optional(),
        first_name: zod_1.z.string().min(1).max(255),
        last_name: zod_1.z.string().min(1).max(255),
        role: zod_1.z.string().optional(),
        send_email: zod_1.z.boolean().default(true),
        language: zod_1.z.string().optional(),
        timezone: zod_1.z.string().optional()
    })).min(1).max(100)
});
exports.BulkUserUpdateSchema = zod_1.z.object({
    user_ids: zod_1.z.array(zod_1.z.number().positive()).min(1).max(100),
    updates: zod_1.z.object({
        role: zod_1.z.string().optional(),
        status: zod_1.z.enum(['active', 'suspended', 'banned']).optional(),
        max_servers: zod_1.z.number().min(0).optional(),
        max_memory: zod_1.z.number().min(0).optional(),
        max_disk: zod_1.z.number().min(0).optional(),
        language: zod_1.z.string().optional(),
        timezone: zod_1.z.string().optional()
    }).refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be updated"
    })
});
exports.BulkUserDeleteSchema = zod_1.z.object({
    user_ids: zod_1.z.array(zod_1.z.number().positive()).min(1).max(100),
    transfer_servers_to: zod_1.z.number().positive().optional(),
    delete_servers: zod_1.z.boolean().default(false),
    reason: zod_1.z.string().max(500).optional()
});
exports.UserImportSchema = zod_1.z.object({
    format: zod_1.z.enum(['csv', 'json']),
    options: zod_1.z.object({
        skip_duplicates: zod_1.z.boolean().default(true),
        send_welcome_emails: zod_1.z.boolean().default(false),
        default_role: zod_1.z.string().optional(),
        validate_emails: zod_1.z.boolean().default(true)
    }).optional()
});
// Server management schemas
exports.BulkServerActionSchema = zod_1.z.object({
    action: zod_1.z.enum(['start', 'stop', 'restart', 'kill', 'backup', 'reinstall', 'suspend', 'unsuspend']),
    filters: zod_1.z.object({
        node_id: zod_1.z.number().positive().optional(),
        user_id: zod_1.z.number().positive().optional(),
        status: zod_1.z.enum(['running', 'stopped', 'starting', 'stopping', 'installing', 'suspended']).optional(),
        server_ids: zod_1.z.array(zod_1.z.number().positive()).optional(),
        game_type: zod_1.z.string().optional(),
        created_after: zod_1.z.string().datetime().optional(),
        created_before: zod_1.z.string().datetime().optional()
    }).optional(),
    options: zod_1.z.object({
        delay: zod_1.z.number().min(0).max(3600).default(30),
        batch_size: zod_1.z.number().min(1).max(50).default(10),
        force: zod_1.z.boolean().default(false),
        skip_errors: zod_1.z.boolean().default(false),
        timeout: zod_1.z.number().min(30).max(600).default(300)
    }).optional()
});
exports.ServerMigrationSchema = zod_1.z.object({
    server_id: zod_1.z.number().positive(),
    target_node_id: zod_1.z.number().positive(),
    options: zod_1.z.object({
        keep_backups: zod_1.z.boolean().default(true),
        compress_transfer: zod_1.z.boolean().default(true),
        verify_transfer: zod_1.z.boolean().default(true),
        downtime_window: zod_1.z.string().optional(),
        force: zod_1.z.boolean().default(false),
        timeout: zod_1.z.number().min(300).max(7200).default(1800)
    }).optional()
});
exports.ServerOptimizationSchema = zod_1.z.object({
    server_ids: zod_1.z.array(zod_1.z.number().positive()).optional(),
    node_id: zod_1.z.number().positive().optional(),
    optimization_type: zod_1.z.enum(['memory', 'cpu', 'disk', 'all']).default('all'),
    dry_run: zod_1.z.boolean().default(true)
});
exports.ServerBackupSchema = zod_1.z.object({
    server_ids: zod_1.z.array(zod_1.z.number().positive()).optional(),
    options: zod_1.z.object({
        compression: zod_1.z.enum(['none', 'gzip', 'lz4', 'bzip2']).default('gzip'),
        exclude_logs: zod_1.z.boolean().default(true),
        exclude_cache: zod_1.z.boolean().default(true),
        priority: zod_1.z.enum(['low', 'normal', 'high']).default('normal'),
        batch_size: zod_1.z.number().min(1).max(20).default(5),
        retention_days: zod_1.z.number().min(1).max(365).default(30)
    }).optional()
});
// Node management schemas
exports.NodeMaintenanceSchema = zod_1.z.object({
    node_id: zod_1.z.number().positive(),
    maintenance_mode: zod_1.z.boolean(),
    reason: zod_1.z.string().max(500).optional(),
    estimated_duration: zod_1.z.number().min(1).max(1440).optional(), // minutes
    allow_new_servers: zod_1.z.boolean().default(false),
    notify_users: zod_1.z.boolean().default(true)
});
exports.NodeDrainSchema = zod_1.z.object({
    node_id: zod_1.z.number().positive(),
    target_nodes: zod_1.z.array(zod_1.z.number().positive()).optional(),
    options: zod_1.z.object({
        graceful: zod_1.z.boolean().default(true),
        timeout: zod_1.z.number().min(60).max(3600).default(300),
        backup_before_move: zod_1.z.boolean().default(true),
        verify_after_move: zod_1.z.boolean().default(true),
        batch_size: zod_1.z.number().min(1).max(20).default(5)
    }).optional()
});
exports.NodeOptimizationSchema = zod_1.z.object({
    node_ids: zod_1.z.array(zod_1.z.number().positive()).optional(),
    strategy: zod_1.z.enum(['balanced', 'performance', 'cost', 'geographic']).default('balanced'),
    dry_run: zod_1.z.boolean().default(true),
    max_migrations: zod_1.z.number().min(1).max(50).default(10)
});
// Analytics schemas
exports.AnalyticsQuerySchema = zod_1.z.object({
    timeframe: zod_1.z.enum(['1h', '6h', '24h', '7d', '30d', '90d']).default('24h'),
    granularity: zod_1.z.enum(['minute', 'hour', 'day']).default('hour'),
    metrics: zod_1.z.array(zod_1.z.string()).optional(),
    filters: zod_1.z.object({
        user_id: zod_1.z.number().positive().optional(),
        node_id: zod_1.z.number().positive().optional(),
        server_id: zod_1.z.number().positive().optional(),
        game_type: zod_1.z.string().optional()
    }).optional()
});
exports.AnalyticsExportSchema = zod_1.z.object({
    format: zod_1.z.enum(['csv', 'json', 'pdf', 'xlsx']).default('csv'),
    timeframe: zod_1.z.string(),
    metrics: zod_1.z.array(zod_1.z.string()).min(1),
    filters: zod_1.z.object({
        user_id: zod_1.z.number().positive().optional(),
        node_id: zod_1.z.number().positive().optional(),
        server_id: zod_1.z.number().positive().optional(),
        game_type: zod_1.z.string().optional(),
        start_date: zod_1.z.string().datetime().optional(),
        end_date: zod_1.z.string().datetime().optional()
    }).optional(),
    options: zod_1.z.object({
        include_charts: zod_1.z.boolean().default(false),
        include_summary: zod_1.z.boolean().default(true),
        compression: zod_1.z.boolean().default(false)
    }).optional()
});
// Maintenance schemas
exports.MaintenanceTaskSchema = zod_1.z.object({
    task: zod_1.z.enum(['cleanup', 'optimize', 'backup', 'migrate', 'update']),
    options: zod_1.z.object({
        force: zod_1.z.boolean().default(false),
        dry_run: zod_1.z.boolean().default(false),
        target: zod_1.z.string().optional(),
        schedule: zod_1.z.string().optional(), // cron expression
        timeout: zod_1.z.number().min(60).max(7200).optional()
    }).optional()
});
exports.CleanupOptionsSchema = zod_1.z.object({
    sessions: zod_1.z.boolean().default(true),
    logs: zod_1.z.boolean().default(true),
    temp_files: zod_1.z.boolean().default(true),
    cache: zod_1.z.boolean().default(true),
    orphaned_files: zod_1.z.boolean().default(true),
    old_backups: zod_1.z.boolean().default(false),
    retention_days: zod_1.z.number().min(1).max(365).default(30),
    dry_run: zod_1.z.boolean().default(false)
});
exports.DatabaseOptimizationSchema = zod_1.z.object({
    tables: zod_1.z.array(zod_1.z.string()).optional(),
    operations: zod_1.z.object({
        analyze: zod_1.z.boolean().default(true),
        optimize: zod_1.z.boolean().default(true),
        repair: zod_1.z.boolean().default(false),
        update_statistics: zod_1.z.boolean().default(true)
    }).optional(),
    dry_run: zod_1.z.boolean().default(false)
});
exports.SystemBackupSchema = zod_1.z.object({
    include_database: zod_1.z.boolean().default(true),
    include_files: zod_1.z.boolean().default(true),
    include_logs: zod_1.z.boolean().default(false),
    include_config: zod_1.z.boolean().default(true),
    compression: zod_1.z.enum(['none', 'gzip', 'lz4', 'bzip2']).default('gzip'),
    encryption: zod_1.z.boolean().default(false),
    encryption_key: zod_1.z.string().optional(),
    destination: zod_1.z.enum(['local', 's3', 'ftp', 'sftp']).default('local'),
    retention_count: zod_1.z.number().min(1).max(50).default(10)
});
exports.MigrationOptionsSchema = zod_1.z.object({
    force: zod_1.z.boolean().default(false),
    rollback_on_error: zod_1.z.boolean().default(true),
    backup_before: zod_1.z.boolean().default(true),
    timeout: zod_1.z.number().min(60).max(3600).default(300),
    batch_size: zod_1.z.number().min(1).max(100).default(20)
});
// Alert and notification schemas
exports.AlertRuleSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().max(1000).optional(),
    metric: zod_1.z.string().min(1),
    condition: zod_1.z.enum(['>', '<', '>=', '<=', '==', '!=']),
    threshold: zod_1.z.number(),
    timeframe: zod_1.z.number().min(60).max(3600).default(300), // seconds
    severity: zod_1.z.enum(['info', 'warning', 'error', 'critical']).default('warning'),
    enabled: zod_1.z.boolean().default(true),
    notification_channels: zod_1.z.array(zod_1.z.string()).optional()
});
exports.NotificationChannelSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
    type: zod_1.z.enum(['email', 'webhook', 'slack', 'discord', 'teams']),
    configuration: zod_1.z.record(zod_1.z.any()),
    enabled: zod_1.z.boolean().default(true),
    filters: zod_1.z.object({
        severity: zod_1.z.array(zod_1.z.enum(['info', 'warning', 'error', 'critical'])).optional(),
        sources: zod_1.z.array(zod_1.z.string()).optional()
    }).optional()
});
// Permission validation schemas
exports.AdminPermissionSchema = zod_1.z.object({
    permission: zod_1.z.string().min(1),
    required_permissions: zod_1.z.array(zod_1.z.string()).default([])
});
// Common validation helpers
exports.PaginationSchema = zod_1.z.object({
    page: zod_1.z.number().min(1).default(1),
    per_page: zod_1.z.number().min(1).max(100).default(25),
    sort: zod_1.z.string().optional(),
    direction: zod_1.z.enum(['asc', 'desc']).default('desc')
});
exports.DateRangeSchema = zod_1.z.object({
    start_date: zod_1.z.string().datetime().optional(),
    end_date: zod_1.z.string().datetime().optional()
}).refine(data => {
    if (data.start_date && data.end_date) {
        return new Date(data.start_date) <= new Date(data.end_date);
    }
    return true;
}, {
    message: "Start date must be before or equal to end date"
});
exports.IdListSchema = zod_1.z.object({
    ids: zod_1.z.array(zod_1.z.number().positive()).min(1).max(1000)
});
// Export validation functions
function validateAdminPermission(permission, userPermissions) {
    // Basic permission check - can be enhanced with hierarchy
    return userPermissions.includes(permission) || userPermissions.includes('admin.*');
}
function validateBulkOperation(itemCount, maxItems = 100) {
    return itemCount > 0 && itemCount <= maxItems;
}
function validateTimeframe(timeframe) {
    const validTimeframes = ['1h', '6h', '24h', '7d', '30d', '90d', '1y'];
    return validTimeframes.includes(timeframe);
}
function validateCronExpression(expression) {
    // Basic cron validation - should be enhanced with proper cron parser
    const parts = expression.split(' ');
    return parts.length === 5 || parts.length === 6;
}
// Custom validation error types
class AdminValidationError extends Error {
    constructor(field, code, message) {
        super(message);
        this.field = field;
        this.code = code;
        this.name = 'AdminValidationError';
    }
}
exports.AdminValidationError = AdminValidationError;
class PermissionError extends Error {
    constructor(permission, message) {
        super(message);
        this.permission = permission;
        this.name = 'PermissionError';
    }
}
exports.PermissionError = PermissionError;
//# sourceMappingURL=admin.js.map