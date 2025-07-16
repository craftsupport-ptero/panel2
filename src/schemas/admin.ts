import { z } from 'zod';

// Admin operation validation schemas

// Dashboard related schemas
export const DashboardMetricsSchema = z.object({
  timeframe: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h'),
  granularity: z.enum(['minute', 'hour', 'day']).default('hour')
});

export const SystemHealthSchema = z.object({
  component: z.enum(['database', 'cache', 'storage', 'nodes', 'overall']).optional(),
  include_details: z.boolean().default(false)
});

// User management schemas
export const UserSearchSchema = z.object({
  query: z.string().min(1).max(255).optional(),
  role: z.string().optional(),
  status: z.enum(['active', 'suspended', 'banned', 'all']).default('all'),
  sort: z.enum(['created', 'updated', 'username', 'email', 'last_login']).default('created'),
  direction: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  per_page: z.number().min(1).max(100).default(25),
  created_after: z.string().datetime().optional(),
  created_before: z.string().datetime().optional()
});

export const BulkUserCreateSchema = z.object({
  users: z.array(z.object({
    username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_-]+$/),
    email: z.string().email(),
    password: z.string().min(8).optional(),
    first_name: z.string().min(1).max(255),
    last_name: z.string().min(1).max(255),
    role: z.string().optional(),
    send_email: z.boolean().default(true),
    language: z.string().optional(),
    timezone: z.string().optional()
  })).min(1).max(100)
});

export const BulkUserUpdateSchema = z.object({
  user_ids: z.array(z.number().positive()).min(1).max(100),
  updates: z.object({
    role: z.string().optional(),
    status: z.enum(['active', 'suspended', 'banned']).optional(),
    max_servers: z.number().min(0).optional(),
    max_memory: z.number().min(0).optional(),
    max_disk: z.number().min(0).optional(),
    language: z.string().optional(),
    timezone: z.string().optional()
  }).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be updated"
  })
});

export const BulkUserDeleteSchema = z.object({
  user_ids: z.array(z.number().positive()).min(1).max(100),
  transfer_servers_to: z.number().positive().optional(),
  delete_servers: z.boolean().default(false),
  reason: z.string().max(500).optional()
});

export const UserImportSchema = z.object({
  format: z.enum(['csv', 'json']),
  options: z.object({
    skip_duplicates: z.boolean().default(true),
    send_welcome_emails: z.boolean().default(false),
    default_role: z.string().optional(),
    validate_emails: z.boolean().default(true)
  }).optional()
});

// Server management schemas
export const BulkServerActionSchema = z.object({
  action: z.enum(['start', 'stop', 'restart', 'kill', 'backup', 'reinstall', 'suspend', 'unsuspend']),
  filters: z.object({
    node_id: z.number().positive().optional(),
    user_id: z.number().positive().optional(),
    status: z.enum(['running', 'stopped', 'starting', 'stopping', 'installing', 'suspended']).optional(),
    server_ids: z.array(z.number().positive()).optional(),
    game_type: z.string().optional(),
    created_after: z.string().datetime().optional(),
    created_before: z.string().datetime().optional()
  }).optional(),
  options: z.object({
    delay: z.number().min(0).max(3600).default(30),
    batch_size: z.number().min(1).max(50).default(10),
    force: z.boolean().default(false),
    skip_errors: z.boolean().default(false),
    timeout: z.number().min(30).max(600).default(300)
  }).optional()
});

export const ServerMigrationSchema = z.object({
  server_id: z.number().positive(),
  target_node_id: z.number().positive(),
  options: z.object({
    keep_backups: z.boolean().default(true),
    compress_transfer: z.boolean().default(true),
    verify_transfer: z.boolean().default(true),
    downtime_window: z.string().optional(),
    force: z.boolean().default(false),
    timeout: z.number().min(300).max(7200).default(1800)
  }).optional()
});

export const ServerOptimizationSchema = z.object({
  server_ids: z.array(z.number().positive()).optional(),
  node_id: z.number().positive().optional(),
  optimization_type: z.enum(['memory', 'cpu', 'disk', 'all']).default('all'),
  dry_run: z.boolean().default(true)
});

export const ServerBackupSchema = z.object({
  server_ids: z.array(z.number().positive()).optional(),
  options: z.object({
    compression: z.enum(['none', 'gzip', 'lz4', 'bzip2']).default('gzip'),
    exclude_logs: z.boolean().default(true),
    exclude_cache: z.boolean().default(true),
    priority: z.enum(['low', 'normal', 'high']).default('normal'),
    batch_size: z.number().min(1).max(20).default(5),
    retention_days: z.number().min(1).max(365).default(30)
  }).optional()
});

// Node management schemas
export const NodeMaintenanceSchema = z.object({
  node_id: z.number().positive(),
  maintenance_mode: z.boolean(),
  reason: z.string().max(500).optional(),
  estimated_duration: z.number().min(1).max(1440).optional(), // minutes
  allow_new_servers: z.boolean().default(false),
  notify_users: z.boolean().default(true)
});

export const NodeDrainSchema = z.object({
  node_id: z.number().positive(),
  target_nodes: z.array(z.number().positive()).optional(),
  options: z.object({
    graceful: z.boolean().default(true),
    timeout: z.number().min(60).max(3600).default(300),
    backup_before_move: z.boolean().default(true),
    verify_after_move: z.boolean().default(true),
    batch_size: z.number().min(1).max(20).default(5)
  }).optional()
});

export const NodeOptimizationSchema = z.object({
  node_ids: z.array(z.number().positive()).optional(),
  strategy: z.enum(['balanced', 'performance', 'cost', 'geographic']).default('balanced'),
  dry_run: z.boolean().default(true),
  max_migrations: z.number().min(1).max(50).default(10)
});

// Analytics schemas
export const AnalyticsQuerySchema = z.object({
  timeframe: z.enum(['1h', '6h', '24h', '7d', '30d', '90d']).default('24h'),
  granularity: z.enum(['minute', 'hour', 'day']).default('hour'),
  metrics: z.array(z.string()).optional(),
  filters: z.object({
    user_id: z.number().positive().optional(),
    node_id: z.number().positive().optional(),
    server_id: z.number().positive().optional(),
    game_type: z.string().optional()
  }).optional()
});

export const AnalyticsExportSchema = z.object({
  format: z.enum(['csv', 'json', 'pdf', 'xlsx']).default('csv'),
  timeframe: z.string(),
  metrics: z.array(z.string()).min(1),
  filters: z.object({
    user_id: z.number().positive().optional(),
    node_id: z.number().positive().optional(),
    server_id: z.number().positive().optional(),
    game_type: z.string().optional(),
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional()
  }).optional(),
  options: z.object({
    include_charts: z.boolean().default(false),
    include_summary: z.boolean().default(true),
    compression: z.boolean().default(false)
  }).optional()
});

// Maintenance schemas
export const MaintenanceTaskSchema = z.object({
  task: z.enum(['cleanup', 'optimize', 'backup', 'migrate', 'update']),
  options: z.object({
    force: z.boolean().default(false),
    dry_run: z.boolean().default(false),
    target: z.string().optional(),
    schedule: z.string().optional(), // cron expression
    timeout: z.number().min(60).max(7200).optional()
  }).optional()
});

export const CleanupOptionsSchema = z.object({
  sessions: z.boolean().default(true),
  logs: z.boolean().default(true),
  temp_files: z.boolean().default(true),
  cache: z.boolean().default(true),
  orphaned_files: z.boolean().default(true),
  old_backups: z.boolean().default(false),
  retention_days: z.number().min(1).max(365).default(30),
  dry_run: z.boolean().default(false)
});

export const DatabaseOptimizationSchema = z.object({
  tables: z.array(z.string()).optional(),
  operations: z.object({
    analyze: z.boolean().default(true),
    optimize: z.boolean().default(true),
    repair: z.boolean().default(false),
    update_statistics: z.boolean().default(true)
  }).optional(),
  dry_run: z.boolean().default(false)
});

export const SystemBackupSchema = z.object({
  include_database: z.boolean().default(true),
  include_files: z.boolean().default(true),
  include_logs: z.boolean().default(false),
  include_config: z.boolean().default(true),
  compression: z.enum(['none', 'gzip', 'lz4', 'bzip2']).default('gzip'),
  encryption: z.boolean().default(false),
  encryption_key: z.string().optional(),
  destination: z.enum(['local', 's3', 'ftp', 'sftp']).default('local'),
  retention_count: z.number().min(1).max(50).default(10)
});

export const MigrationOptionsSchema = z.object({
  force: z.boolean().default(false),
  rollback_on_error: z.boolean().default(true),
  backup_before: z.boolean().default(true),
  timeout: z.number().min(60).max(3600).default(300),
  batch_size: z.number().min(1).max(100).default(20)
});

// Alert and notification schemas
export const AlertRuleSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  metric: z.string().min(1),
  condition: z.enum(['>', '<', '>=', '<=', '==', '!=']),
  threshold: z.number(),
  timeframe: z.number().min(60).max(3600).default(300), // seconds
  severity: z.enum(['info', 'warning', 'error', 'critical']).default('warning'),
  enabled: z.boolean().default(true),
  notification_channels: z.array(z.string()).optional()
});

export const NotificationChannelSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['email', 'webhook', 'slack', 'discord', 'teams']),
  configuration: z.record(z.any()),
  enabled: z.boolean().default(true),
  filters: z.object({
    severity: z.array(z.enum(['info', 'warning', 'error', 'critical'])).optional(),
    sources: z.array(z.string()).optional()
  }).optional()
});

// Permission validation schemas
export const AdminPermissionSchema = z.object({
  permission: z.string().min(1),
  required_permissions: z.array(z.string()).default([])
});

// Common validation helpers
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  per_page: z.number().min(1).max(100).default(25),
  sort: z.string().optional(),
  direction: z.enum(['asc', 'desc']).default('desc')
});

export const DateRangeSchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional()
}).refine(data => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date);
  }
  return true;
}, {
  message: "Start date must be before or equal to end date"
});

export const IdListSchema = z.object({
  ids: z.array(z.number().positive()).min(1).max(1000)
});

// Export validation functions
export function validateAdminPermission(permission: string, userPermissions: string[]): boolean {
  // Basic permission check - can be enhanced with hierarchy
  return userPermissions.includes(permission) || userPermissions.includes('admin.*');
}

export function validateBulkOperation(itemCount: number, maxItems: number = 100): boolean {
  return itemCount > 0 && itemCount <= maxItems;
}

export function validateTimeframe(timeframe: string): boolean {
  const validTimeframes = ['1h', '6h', '24h', '7d', '30d', '90d', '1y'];
  return validTimeframes.includes(timeframe);
}

export function validateCronExpression(expression: string): boolean {
  // Basic cron validation - should be enhanced with proper cron parser
  const parts = expression.split(' ');
  return parts.length === 5 || parts.length === 6;
}

// Custom validation error types
export class AdminValidationError extends Error {
  constructor(public field: string, public code: string, message: string) {
    super(message);
    this.name = 'AdminValidationError';
  }
}

export class PermissionError extends Error {
  constructor(public permission: string, message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}