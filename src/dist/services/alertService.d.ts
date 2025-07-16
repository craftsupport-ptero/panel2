/**
 * Alert Service
 * Handles system alerts, notifications, and alert management
 */
export interface Alert {
    id: string;
    level: 'info' | 'warning' | 'error' | 'critical';
    title: string;
    message: string;
    source: string;
    timestamp: Date;
    resolved: boolean;
    resolved_at?: Date;
    resolved_by?: string;
    metadata?: Record<string, any>;
    actions?: AlertAction[];
}
export interface AlertAction {
    id: string;
    label: string;
    action: string;
    parameters?: Record<string, any>;
}
export interface AlertRule {
    id: string;
    name: string;
    condition: string;
    threshold: number;
    metric: string;
    enabled: boolean;
    notification_channels: string[];
}
export interface NotificationChannel {
    id: string;
    name: string;
    type: 'email' | 'webhook' | 'slack' | 'discord';
    configuration: Record<string, any>;
    enabled: boolean;
}
export declare class AlertService {
    private readonly ALERT_CACHE_TTL;
    /**
     * Create a new alert
     */
    createAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'resolved'>): Promise<Alert>;
    /**
     * Get active alerts
     */
    getActiveAlerts(limit?: number): Promise<Alert[]>;
    /**
     * Get alert history
     */
    getAlertHistory(page?: number, perPage?: number): Promise<{
        alerts: Alert[];
        pagination: any;
    }>;
    /**
     * Resolve an alert
     */
    resolveAlert(alertId: string, resolvedBy: string, reason?: string): Promise<Alert>;
    /**
     * Execute alert action
     */
    executeAlertAction(alertId: string, actionId: string, executedBy: string): Promise<void>;
    /**
     * Create system health alerts based on metrics
     */
    checkSystemHealth(): Promise<Alert[]>;
    /**
     * Get alert statistics
     */
    getAlertStatistics(timeframe?: string): Promise<{
        total_alerts: number;
        by_level: Record<string, number>;
        by_source: Record<string, number>;
        resolution_rate: number;
        avg_resolution_time: number;
    }>;
    /**
     * Configure alert rules
     */
    createAlertRule(rule: Omit<AlertRule, 'id'>): Promise<AlertRule>;
    /**
     * Get all alert rules
     */
    getAlertRules(): Promise<AlertRule[]>;
    /**
     * Send test notification
     */
    sendTestNotification(channelId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private generateAlertId;
    private generateRuleId;
    private saveAlert;
    private updateAlert;
    private getAlertById;
    private sendNotifications;
    private sendNotificationToChannel;
    private sendEmailNotification;
    private sendWebhookNotification;
    private sendSlackNotification;
    private sendDiscordNotification;
    private performAction;
    private getSystemMetrics;
    private getUnhealthyNodes;
    private getNotificationChannelsForAlert;
    private getNotificationChannel;
    private saveAlertRule;
    private getMockAlerts;
}
//# sourceMappingURL=alertService.d.ts.map