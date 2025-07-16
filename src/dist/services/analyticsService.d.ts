/**
 * Analytics Service
 * Handles data collection, processing, and reporting for administrative analytics
 */
export interface AnalyticsMetric {
    name: string;
    value: number;
    timestamp: Date;
    metadata?: Record<string, any>;
}
export interface TimeSeriesData {
    timestamp: string;
    values: Record<string, number>;
}
export interface AnalyticsQuery {
    metrics: string[];
    timeframe: string;
    granularity: 'minute' | 'hour' | 'day';
    filters?: Record<string, any>;
}
export declare class AnalyticsService {
    /**
     * Collect and store analytics metrics
     */
    recordMetric(metric: AnalyticsMetric): Promise<void>;
    /**
     * Get user analytics data
     */
    getUserAnalytics(query: AnalyticsQuery): Promise<any>;
    /**
     * Get server analytics data
     */
    getServerAnalytics(query: AnalyticsQuery): Promise<any>;
    /**
     * Get resource utilization analytics
     */
    getResourceAnalytics(query: AnalyticsQuery): Promise<any>;
    /**
     * Get system performance metrics
     */
    getPerformanceMetrics(query: AnalyticsQuery): Promise<any>;
    /**
     * Export analytics data in various formats
     */
    exportData(format: 'csv' | 'json' | 'pdf', query: AnalyticsQuery): Promise<string>;
    private getTotalUsers;
    private getActiveUsers;
    private getNewRegistrations;
    private calculateGrowthRate;
    private getTimeSeriesData;
    private generateMockValues;
    private getUserDemographics;
    private getUserActivityPatterns;
    private getTotalServers;
    private getAverageUptime;
    private getAverageCpuUsage;
    private getAverageMemoryUsage;
    private getServersByGameType;
    private getServerPerformanceMetrics;
    private getResourceSummary;
    private getResourcesByNode;
    private getWasteAnalysis;
    private getPerformanceSummary;
    private getErrorAnalysis;
    private identifyBottlenecks;
    private getAnalyticsData;
    private convertToCSV;
    private generatePDFReport;
}
//# sourceMappingURL=analyticsService.d.ts.map