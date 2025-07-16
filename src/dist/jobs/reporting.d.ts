/**
 * Reporting Jobs
 * Automated report generation and distribution jobs
 */
export interface ReportConfig {
    id: string;
    name: string;
    type: 'usage' | 'performance' | 'financial' | 'security' | 'custom';
    schedule: string;
    enabled: boolean;
    format: 'pdf' | 'html' | 'csv' | 'json';
    template?: string;
    recipients: string[];
    parameters: Record<string, any>;
    retention_days: number;
}
export interface ReportJob {
    id: string;
    config_id: string;
    status: 'pending' | 'generating' | 'completed' | 'failed' | 'cancelled';
    started_at: Date;
    completed_at?: Date;
    duration?: number;
    file_path?: string;
    file_size?: number;
    error_message?: string;
    metadata: Record<string, any>;
}
export interface ReportData {
    title: string;
    description?: string;
    generated_at: Date;
    period: {
        start: Date;
        end: Date;
    };
    sections: ReportSection[];
    summary: Record<string, any>;
    charts?: ReportChart[];
    tables?: ReportTable[];
}
export interface ReportSection {
    title: string;
    content: string;
    data?: any;
    charts?: string[];
    tables?: string[];
}
export interface ReportChart {
    id: string;
    title: string;
    type: 'line' | 'bar' | 'pie' | 'area' | 'gauge';
    data: any;
    options?: any;
}
export interface ReportTable {
    id: string;
    title: string;
    headers: string[];
    rows: any[][];
    total_rows?: number;
}
export declare class ReportingJobs {
    private readonly reportConfigs;
    private readonly activeJobs;
    constructor();
    /**
     * Generate daily usage report
     */
    generateDailyUsageReport(): Promise<ReportJob>;
    /**
     * Generate weekly performance report
     */
    generateWeeklyPerformanceReport(): Promise<ReportJob>;
    /**
     * Generate monthly financial report
     */
    generateMonthlyFinancialReport(): Promise<ReportJob>;
    /**
     * Generate custom report
     */
    generateCustomReport(configId: string, parameters?: Record<string, any>): Promise<ReportJob>;
    /**
     * Get job status
     */
    getJobStatus(jobId: string): ReportJob | null;
    /**
     * Cancel report job
     */
    cancelJob(jobId: string): Promise<void>;
    /**
     * Get report configurations
     */
    getReportConfigs(): ReportConfig[];
    /**
     * Add or update report configuration
     */
    setReportConfig(config: ReportConfig): void;
    /**
     * Delete report configuration
     */
    deleteReportConfig(configId: string): void;
    /**
     * Run scheduled reports
     */
    runScheduledReports(): Promise<ReportJob[]>;
    /**
     * Cleanup old reports
     */
    cleanupOldReports(): Promise<{
        deleted_files: number;
        space_freed: number;
    }>;
    private initializeDefaultReports;
    private generateUsageReportData;
    private generatePerformanceReportData;
    private generateFinancialReportData;
    private generateSecurityReportData;
    private createReportFile;
    private distributeReport;
    private generateJobId;
    private getDateString;
    private getWeekString;
    private getMonthString;
    private getPeriodStart;
    private generateTimeSeriesData;
    private generateBarChartData;
    private getReportsToRun;
    private findOldReports;
    private getFileSize;
    private deleteFile;
    private generatePDF;
    private generateHTML;
    private generateCSV;
    private generateJSON;
    private sendReportEmail;
    private sleep;
}
//# sourceMappingURL=reporting.d.ts.map