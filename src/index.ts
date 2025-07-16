/**
 * Pterodactyl Panel Admin API
 * Serverless administrative functionality for Pterodactyl Panel
 */

// Route exports
export * from './routes/admin/dashboard';
export * from './routes/admin/users';
export * from './routes/admin/servers';
export * from './routes/admin/nodes';
export * from './routes/admin/analytics';
export * from './routes/admin/settings';
export * from './routes/admin/maintenance';

// Service exports
export * from './services/analyticsService';
export * from './services/configService';
export * from './services/alertService';
export * from './services/migrationService';
export * from './services/maintenanceService';

// Schema exports - specific imports to avoid conflicts
export {
  DashboardMetricsSchema,
  SystemHealthSchema,
  UserSearchSchema,
  BulkUserCreateSchema,
  BulkUserUpdateSchema,
  BulkUserDeleteSchema,
  UserImportSchema,
  BulkServerActionSchema,
  ServerMigrationSchema,
  ServerOptimizationSchema,
  NodeMaintenanceSchema,
  NodeDrainSchema,
  NodeOptimizationSchema,
  MaintenanceTaskSchema,
  CleanupOptionsSchema,
  DatabaseOptimizationSchema,
  SystemBackupSchema,
  MigrationOptionsSchema,
  AlertRuleSchema,
  NotificationChannelSchema,
  AdminPermissionSchema,
  PaginationSchema,
  DateRangeSchema,
  IdListSchema,
  validateAdminPermission,
  validateBulkOperation,
  validateTimeframe,
  validateCronExpression,
  AdminValidationError,
  PermissionError
} from './schemas/admin';

export {
  PanelSettingsSchema,
  RegistrationSettingsSchema,
  UserLimitsSchema,
  SecuritySettingsSchema,
  RateLimitingSchema,
  AccessControlSchema,
  SecurityHeadersSchema,
  FeatureFlagsSchema,
  EmailConfigSchema,
  SMTPSettingsSchema,
  MailgunSettingsSchema,
  SESSettingsSchema,
  PostmarkSettingsSchema,
  DatabaseConfigSchema,
  CacheConfigSchema,
  QueueConfigSchema,
  StorageConfigSchema,
  LoggingConfigSchema,
  SystemSettingsSchema,
  EmailTestSchema,
  ConfigBackupSchema,
  ConfigRestoreSchema,
  validateEmailDriver,
  validatePasswordRequirements,
  sanitizeConfigForExport
} from './schemas/settings';

export {
  TimeSeriesDataSchema,
  TimeSeriesQuerySchema,
  UserAnalyticsSchema,
  ServerAnalyticsSchema,
  ResourceAnalyticsSchema,
  PerformanceAnalyticsSchema,
  FinancialAnalyticsSchema,
  AnalyticsExportSchema as AnalyticsExportSchemaV2,
  DashboardWidgetSchema,
  DashboardLayoutSchema,
  AnalyticsAlertSchema,
  RealTimeMetricSchema,
  RealTimeUpdateSchema,
  ComparisonAnalyticsSchema,
  QueryFilterSchema,
  AnalyticsQuerySchema as AnalyticsQuerySchemaV2,
  CohortAnalysisSchema,
  FunnelAnalysisSchema,
  validateMetricName,
  validateTimeRange,
  validateAggregationMethod,
  calculatePercentageChange,
  determineSignificance
} from './schemas/analytics';

// Job exports
export * from './jobs/cleanup';
export * from './jobs/monitoring';
export * from './jobs/reporting';

// Type exports
export * from './types';

// Main application entry point
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 8787;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.'
  }
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0-serverless'
  });
});

// API routes would be mounted here
// Example: app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Start server only if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Pterodactyl Admin API running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

export default app;