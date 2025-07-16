export interface CleanupJobConfig {
    schedule: string;
    enabled: boolean;
    options: {
        dry_run: boolean;
        retention_days: number;
        batch_size: number;
        max_execution_time: number;
    };
}
export interface CleanupResult {
    job_id: string;
    type: string;
    started_at: Date;
    completed_at?: Date;
    status: 'running' | 'completed' | 'failed';
    items_processed: number;
    items_removed: number;
    space_freed: number;
    errors: string[];
    duration: number;
}
export declare class CleanupJobs {
    private readonly jobConfigs;
    /**
     * Clean up expired sessions
     */
    cleanupExpiredSessions(): Promise<CleanupResult>;
    /**
     * Clean up old log files
     */
    cleanupOldLogs(): Promise<CleanupResult>;
    /**
     * Clean up temporary files
     */
    cleanupTempFiles(): Promise<CleanupResult>;
    /**
     * Clean up orphaned files
     */
    cleanupOrphanedFiles(): Promise<CleanupResult>;
    /**
     * Clean up old backups
     */
    cleanupOldBackups(): Promise<CleanupResult>;
    /**
     * Clean up database records
     */
    cleanupDatabaseRecords(): Promise<CleanupResult>;
    /**
     * Run all scheduled cleanup jobs
     */
    runScheduledCleanup(): Promise<CleanupResult[]>;
    /**
     * Get cleanup job configuration
     */
    getJobConfig(jobType: string): CleanupJobConfig | null;
    /**
     * Update cleanup job configuration
     */
    updateJobConfig(jobType: string, config: Partial<CleanupJobConfig>): Promise<void>;
    private generateJobId;
    private getJobsToRun;
    private performSessionCleanup;
    private performLogCleanup;
    private performTempFileCleanup;
    private performOrphanedFileCleanup;
    private performBackupCleanup;
    private performDatabaseCleanup;
    private logCleanupResult;
    private sleep;
}
//# sourceMappingURL=cleanup.d.ts.map