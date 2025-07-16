"use strict";
/**
 * Pterodactyl Panel Admin API
 * Serverless administrative functionality for Pterodactyl Panel
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailTestSchema = exports.SystemSettingsSchema = exports.LoggingConfigSchema = exports.StorageConfigSchema = exports.QueueConfigSchema = exports.CacheConfigSchema = exports.DatabaseConfigSchema = exports.PostmarkSettingsSchema = exports.SESSettingsSchema = exports.MailgunSettingsSchema = exports.SMTPSettingsSchema = exports.EmailConfigSchema = exports.FeatureFlagsSchema = exports.SecurityHeadersSchema = exports.AccessControlSchema = exports.RateLimitingSchema = exports.SecuritySettingsSchema = exports.UserLimitsSchema = exports.RegistrationSettingsSchema = exports.PanelSettingsSchema = exports.PermissionError = exports.AdminValidationError = exports.validateCronExpression = exports.validateTimeframe = exports.validateBulkOperation = exports.validateAdminPermission = exports.IdListSchema = exports.DateRangeSchema = exports.PaginationSchema = exports.AdminPermissionSchema = exports.NotificationChannelSchema = exports.AlertRuleSchema = exports.MigrationOptionsSchema = exports.SystemBackupSchema = exports.DatabaseOptimizationSchema = exports.CleanupOptionsSchema = exports.MaintenanceTaskSchema = exports.NodeOptimizationSchema = exports.NodeDrainSchema = exports.NodeMaintenanceSchema = exports.ServerOptimizationSchema = exports.ServerMigrationSchema = exports.BulkServerActionSchema = exports.UserImportSchema = exports.BulkUserDeleteSchema = exports.BulkUserUpdateSchema = exports.BulkUserCreateSchema = exports.UserSearchSchema = exports.SystemHealthSchema = exports.DashboardMetricsSchema = void 0;
exports.determineSignificance = exports.calculatePercentageChange = exports.validateAggregationMethod = exports.validateTimeRange = exports.validateMetricName = exports.FunnelAnalysisSchema = exports.CohortAnalysisSchema = exports.AnalyticsQuerySchemaV2 = exports.QueryFilterSchema = exports.ComparisonAnalyticsSchema = exports.RealTimeUpdateSchema = exports.RealTimeMetricSchema = exports.AnalyticsAlertSchema = exports.DashboardLayoutSchema = exports.DashboardWidgetSchema = exports.AnalyticsExportSchemaV2 = exports.FinancialAnalyticsSchema = exports.PerformanceAnalyticsSchema = exports.ResourceAnalyticsSchema = exports.ServerAnalyticsSchema = exports.UserAnalyticsSchema = exports.TimeSeriesQuerySchema = exports.TimeSeriesDataSchema = exports.sanitizeConfigForExport = exports.validatePasswordRequirements = exports.validateEmailDriver = exports.ConfigRestoreSchema = exports.ConfigBackupSchema = void 0;
// Route exports
__exportStar(require("./routes/admin/dashboard"), exports);
__exportStar(require("./routes/admin/users"), exports);
__exportStar(require("./routes/admin/servers"), exports);
__exportStar(require("./routes/admin/nodes"), exports);
__exportStar(require("./routes/admin/analytics"), exports);
__exportStar(require("./routes/admin/settings"), exports);
__exportStar(require("./routes/admin/maintenance"), exports);
// Service exports
__exportStar(require("./services/analyticsService"), exports);
__exportStar(require("./services/configService"), exports);
__exportStar(require("./services/alertService"), exports);
__exportStar(require("./services/migrationService"), exports);
__exportStar(require("./services/maintenanceService"), exports);
// Schema exports - specific imports to avoid conflicts
var admin_1 = require("./schemas/admin");
Object.defineProperty(exports, "DashboardMetricsSchema", { enumerable: true, get: function () { return admin_1.DashboardMetricsSchema; } });
Object.defineProperty(exports, "SystemHealthSchema", { enumerable: true, get: function () { return admin_1.SystemHealthSchema; } });
Object.defineProperty(exports, "UserSearchSchema", { enumerable: true, get: function () { return admin_1.UserSearchSchema; } });
Object.defineProperty(exports, "BulkUserCreateSchema", { enumerable: true, get: function () { return admin_1.BulkUserCreateSchema; } });
Object.defineProperty(exports, "BulkUserUpdateSchema", { enumerable: true, get: function () { return admin_1.BulkUserUpdateSchema; } });
Object.defineProperty(exports, "BulkUserDeleteSchema", { enumerable: true, get: function () { return admin_1.BulkUserDeleteSchema; } });
Object.defineProperty(exports, "UserImportSchema", { enumerable: true, get: function () { return admin_1.UserImportSchema; } });
Object.defineProperty(exports, "BulkServerActionSchema", { enumerable: true, get: function () { return admin_1.BulkServerActionSchema; } });
Object.defineProperty(exports, "ServerMigrationSchema", { enumerable: true, get: function () { return admin_1.ServerMigrationSchema; } });
Object.defineProperty(exports, "ServerOptimizationSchema", { enumerable: true, get: function () { return admin_1.ServerOptimizationSchema; } });
Object.defineProperty(exports, "NodeMaintenanceSchema", { enumerable: true, get: function () { return admin_1.NodeMaintenanceSchema; } });
Object.defineProperty(exports, "NodeDrainSchema", { enumerable: true, get: function () { return admin_1.NodeDrainSchema; } });
Object.defineProperty(exports, "NodeOptimizationSchema", { enumerable: true, get: function () { return admin_1.NodeOptimizationSchema; } });
Object.defineProperty(exports, "MaintenanceTaskSchema", { enumerable: true, get: function () { return admin_1.MaintenanceTaskSchema; } });
Object.defineProperty(exports, "CleanupOptionsSchema", { enumerable: true, get: function () { return admin_1.CleanupOptionsSchema; } });
Object.defineProperty(exports, "DatabaseOptimizationSchema", { enumerable: true, get: function () { return admin_1.DatabaseOptimizationSchema; } });
Object.defineProperty(exports, "SystemBackupSchema", { enumerable: true, get: function () { return admin_1.SystemBackupSchema; } });
Object.defineProperty(exports, "MigrationOptionsSchema", { enumerable: true, get: function () { return admin_1.MigrationOptionsSchema; } });
Object.defineProperty(exports, "AlertRuleSchema", { enumerable: true, get: function () { return admin_1.AlertRuleSchema; } });
Object.defineProperty(exports, "NotificationChannelSchema", { enumerable: true, get: function () { return admin_1.NotificationChannelSchema; } });
Object.defineProperty(exports, "AdminPermissionSchema", { enumerable: true, get: function () { return admin_1.AdminPermissionSchema; } });
Object.defineProperty(exports, "PaginationSchema", { enumerable: true, get: function () { return admin_1.PaginationSchema; } });
Object.defineProperty(exports, "DateRangeSchema", { enumerable: true, get: function () { return admin_1.DateRangeSchema; } });
Object.defineProperty(exports, "IdListSchema", { enumerable: true, get: function () { return admin_1.IdListSchema; } });
Object.defineProperty(exports, "validateAdminPermission", { enumerable: true, get: function () { return admin_1.validateAdminPermission; } });
Object.defineProperty(exports, "validateBulkOperation", { enumerable: true, get: function () { return admin_1.validateBulkOperation; } });
Object.defineProperty(exports, "validateTimeframe", { enumerable: true, get: function () { return admin_1.validateTimeframe; } });
Object.defineProperty(exports, "validateCronExpression", { enumerable: true, get: function () { return admin_1.validateCronExpression; } });
Object.defineProperty(exports, "AdminValidationError", { enumerable: true, get: function () { return admin_1.AdminValidationError; } });
Object.defineProperty(exports, "PermissionError", { enumerable: true, get: function () { return admin_1.PermissionError; } });
var settings_1 = require("./schemas/settings");
Object.defineProperty(exports, "PanelSettingsSchema", { enumerable: true, get: function () { return settings_1.PanelSettingsSchema; } });
Object.defineProperty(exports, "RegistrationSettingsSchema", { enumerable: true, get: function () { return settings_1.RegistrationSettingsSchema; } });
Object.defineProperty(exports, "UserLimitsSchema", { enumerable: true, get: function () { return settings_1.UserLimitsSchema; } });
Object.defineProperty(exports, "SecuritySettingsSchema", { enumerable: true, get: function () { return settings_1.SecuritySettingsSchema; } });
Object.defineProperty(exports, "RateLimitingSchema", { enumerable: true, get: function () { return settings_1.RateLimitingSchema; } });
Object.defineProperty(exports, "AccessControlSchema", { enumerable: true, get: function () { return settings_1.AccessControlSchema; } });
Object.defineProperty(exports, "SecurityHeadersSchema", { enumerable: true, get: function () { return settings_1.SecurityHeadersSchema; } });
Object.defineProperty(exports, "FeatureFlagsSchema", { enumerable: true, get: function () { return settings_1.FeatureFlagsSchema; } });
Object.defineProperty(exports, "EmailConfigSchema", { enumerable: true, get: function () { return settings_1.EmailConfigSchema; } });
Object.defineProperty(exports, "SMTPSettingsSchema", { enumerable: true, get: function () { return settings_1.SMTPSettingsSchema; } });
Object.defineProperty(exports, "MailgunSettingsSchema", { enumerable: true, get: function () { return settings_1.MailgunSettingsSchema; } });
Object.defineProperty(exports, "SESSettingsSchema", { enumerable: true, get: function () { return settings_1.SESSettingsSchema; } });
Object.defineProperty(exports, "PostmarkSettingsSchema", { enumerable: true, get: function () { return settings_1.PostmarkSettingsSchema; } });
Object.defineProperty(exports, "DatabaseConfigSchema", { enumerable: true, get: function () { return settings_1.DatabaseConfigSchema; } });
Object.defineProperty(exports, "CacheConfigSchema", { enumerable: true, get: function () { return settings_1.CacheConfigSchema; } });
Object.defineProperty(exports, "QueueConfigSchema", { enumerable: true, get: function () { return settings_1.QueueConfigSchema; } });
Object.defineProperty(exports, "StorageConfigSchema", { enumerable: true, get: function () { return settings_1.StorageConfigSchema; } });
Object.defineProperty(exports, "LoggingConfigSchema", { enumerable: true, get: function () { return settings_1.LoggingConfigSchema; } });
Object.defineProperty(exports, "SystemSettingsSchema", { enumerable: true, get: function () { return settings_1.SystemSettingsSchema; } });
Object.defineProperty(exports, "EmailTestSchema", { enumerable: true, get: function () { return settings_1.EmailTestSchema; } });
Object.defineProperty(exports, "ConfigBackupSchema", { enumerable: true, get: function () { return settings_1.ConfigBackupSchema; } });
Object.defineProperty(exports, "ConfigRestoreSchema", { enumerable: true, get: function () { return settings_1.ConfigRestoreSchema; } });
Object.defineProperty(exports, "validateEmailDriver", { enumerable: true, get: function () { return settings_1.validateEmailDriver; } });
Object.defineProperty(exports, "validatePasswordRequirements", { enumerable: true, get: function () { return settings_1.validatePasswordRequirements; } });
Object.defineProperty(exports, "sanitizeConfigForExport", { enumerable: true, get: function () { return settings_1.sanitizeConfigForExport; } });
var analytics_1 = require("./schemas/analytics");
Object.defineProperty(exports, "TimeSeriesDataSchema", { enumerable: true, get: function () { return analytics_1.TimeSeriesDataSchema; } });
Object.defineProperty(exports, "TimeSeriesQuerySchema", { enumerable: true, get: function () { return analytics_1.TimeSeriesQuerySchema; } });
Object.defineProperty(exports, "UserAnalyticsSchema", { enumerable: true, get: function () { return analytics_1.UserAnalyticsSchema; } });
Object.defineProperty(exports, "ServerAnalyticsSchema", { enumerable: true, get: function () { return analytics_1.ServerAnalyticsSchema; } });
Object.defineProperty(exports, "ResourceAnalyticsSchema", { enumerable: true, get: function () { return analytics_1.ResourceAnalyticsSchema; } });
Object.defineProperty(exports, "PerformanceAnalyticsSchema", { enumerable: true, get: function () { return analytics_1.PerformanceAnalyticsSchema; } });
Object.defineProperty(exports, "FinancialAnalyticsSchema", { enumerable: true, get: function () { return analytics_1.FinancialAnalyticsSchema; } });
Object.defineProperty(exports, "AnalyticsExportSchemaV2", { enumerable: true, get: function () { return analytics_1.AnalyticsExportSchema; } });
Object.defineProperty(exports, "DashboardWidgetSchema", { enumerable: true, get: function () { return analytics_1.DashboardWidgetSchema; } });
Object.defineProperty(exports, "DashboardLayoutSchema", { enumerable: true, get: function () { return analytics_1.DashboardLayoutSchema; } });
Object.defineProperty(exports, "AnalyticsAlertSchema", { enumerable: true, get: function () { return analytics_1.AnalyticsAlertSchema; } });
Object.defineProperty(exports, "RealTimeMetricSchema", { enumerable: true, get: function () { return analytics_1.RealTimeMetricSchema; } });
Object.defineProperty(exports, "RealTimeUpdateSchema", { enumerable: true, get: function () { return analytics_1.RealTimeUpdateSchema; } });
Object.defineProperty(exports, "ComparisonAnalyticsSchema", { enumerable: true, get: function () { return analytics_1.ComparisonAnalyticsSchema; } });
Object.defineProperty(exports, "QueryFilterSchema", { enumerable: true, get: function () { return analytics_1.QueryFilterSchema; } });
Object.defineProperty(exports, "AnalyticsQuerySchemaV2", { enumerable: true, get: function () { return analytics_1.AnalyticsQuerySchema; } });
Object.defineProperty(exports, "CohortAnalysisSchema", { enumerable: true, get: function () { return analytics_1.CohortAnalysisSchema; } });
Object.defineProperty(exports, "FunnelAnalysisSchema", { enumerable: true, get: function () { return analytics_1.FunnelAnalysisSchema; } });
Object.defineProperty(exports, "validateMetricName", { enumerable: true, get: function () { return analytics_1.validateMetricName; } });
Object.defineProperty(exports, "validateTimeRange", { enumerable: true, get: function () { return analytics_1.validateTimeRange; } });
Object.defineProperty(exports, "validateAggregationMethod", { enumerable: true, get: function () { return analytics_1.validateAggregationMethod; } });
Object.defineProperty(exports, "calculatePercentageChange", { enumerable: true, get: function () { return analytics_1.calculatePercentageChange; } });
Object.defineProperty(exports, "determineSignificance", { enumerable: true, get: function () { return analytics_1.determineSignificance; } });
// Job exports
__exportStar(require("./jobs/cleanup"), exports);
__exportStar(require("./jobs/monitoring"), exports);
__exportStar(require("./jobs/reporting"), exports);
// Type exports
__exportStar(require("./types"), exports);
// Main application entry point
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8787;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
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
app.use((err, req, res, next) => {
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
exports.default = app;
//# sourceMappingURL=index.js.map