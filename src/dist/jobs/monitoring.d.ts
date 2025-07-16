/**
 * Monitoring Jobs
 * System health monitoring and alerting jobs
 */
export interface MonitoringConfig {
    enabled: boolean;
    interval: number;
    thresholds: {
        cpu_warning: number;
        cpu_critical: number;
        memory_warning: number;
        memory_critical: number;
        disk_warning: number;
        disk_critical: number;
        response_time_warning: number;
        response_time_critical: number;
    };
    notifications: {
        channels: string[];
        cooldown: number;
    };
}
export interface MonitoringResult {
    timestamp: Date;
    checks: MonitoringCheck[];
    overall_status: 'healthy' | 'warning' | 'critical';
    alerts_triggered: number;
    duration: number;
}
export interface MonitoringCheck {
    name: string;
    type: 'system' | 'application' | 'database' | 'network' | 'external';
    status: 'healthy' | 'warning' | 'critical' | 'unknown';
    value?: number;
    unit?: string;
    threshold?: number;
    message: string;
    details?: Record<string, any>;
    response_time?: number;
}
export interface NodeHealthStatus {
    node_id: number;
    name: string;
    status: 'online' | 'offline' | 'maintenance' | 'degraded';
    last_heartbeat: Date;
    metrics: {
        cpu_usage: number;
        memory_usage: number;
        disk_usage: number;
        network_in: number;
        network_out: number;
        load_average: number;
    };
    services: {
        daemon: 'running' | 'stopped' | 'error';
        docker: 'running' | 'stopped' | 'error';
        network: 'healthy' | 'degraded' | 'error';
    };
    alerts: string[];
}
export declare class MonitoringJobs {
    private readonly config;
    private lastAlerts;
    /**
     * Run comprehensive system health check
     */
    runHealthCheck(): Promise<MonitoringResult>;
    /**
     * Monitor specific node health
     */
    monitorNodeHealth(nodeId: number): Promise<NodeHealthStatus>;
    /**
     * Check for performance degradation
     */
    checkPerformanceDegradation(): Promise<MonitoringCheck[]>;
    /**
     * Monitor security events
     */
    monitorSecurityEvents(): Promise<MonitoringCheck[]>;
    /**
     * Get monitoring statistics
     */
    getMonitoringStatistics(timeframe?: string): Promise<{
        total_checks: number;
        successful_checks: number;
        failed_checks: number;
        avg_response_time: number;
        uptime_percentage: number;
        alerts_by_severity: Record<string, number>;
        top_issues: Array<{
            issue: string;
            count: number;
        }>;
    }>;
    private checkSystemResources;
    private checkDatabaseHealth;
    private checkApplicationHealth;
    private checkNodeHealth;
    private checkExternalServices;
    private checkNetworkConnectivity;
    private processAlerts;
    private getThresholdStatus;
    private getCpuUsage;
    private getMemoryUsage;
    private getDiskUsage;
    private testDatabaseConnection;
    private testDatabaseQuery;
    private checkEndpoint;
    private getNodeInfo;
    private getNodeMetrics;
    private checkNodeServices;
    private determineNodeStatus;
    private generateNodeAlerts;
    private checkApiPerformance;
    private checkDatabasePerformance;
    private checkFileSystemPerformance;
    private checkNetworkLatency;
    private checkFailedLogins;
    private checkSuspiciousActivities;
    private checkSecurityPolicyViolations;
    private pingHost;
    private sendAlert;
    private logMonitoringResult;
    private sleep;
}
//# sourceMappingURL=monitoring.d.ts.map