/**
 * Maintenance Service
 * Handles system maintenance tasks, cleanup operations, and optimization
 */
export interface MaintenanceTask {
    id: string;
    type: 'cleanup' | 'optimize' | 'backup' | 'update' | 'migration';
    name: string;
    description: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    started_at?: Date;
    completed_at?: Date;
    estimated_duration?: number;
    actual_duration?: number;
    result?: any;
    error?: string;
    options: Record<string, any>;
}
export interface MaintenanceSchedule {
    id: string;
    task_type: string;
    cron_expression: string;
    enabled: boolean;
    next_run: Date;
    last_run?: Date;
    options: Record<string, any>;
}
export declare class MaintenanceService {
    private readonly activeTasks;
    private readonly taskQueue;
    /**
     * Get system maintenance status
     */
    getMaintenanceStatus(): Promise<{
        system_status: string;
        maintenance_mode: boolean;
        scheduled_maintenance: any;
        running_tasks: MaintenanceTask[];
        completed_tasks: MaintenanceTask[];
        system_health: Record<string, string>;
        last_maintenance: Date;
        next_scheduled: Date;
    }>;
    /**
     * Run cleanup tasks
     */
    runCleanupTasks(options?: {
        dry_run?: boolean;
        force?: boolean;
        target?: string;
    }): Promise<MaintenanceTask>;
    /**
     * Optimize database
     */
    optimizeDatabase(options?: {
        dry_run?: boolean;
        force?: boolean;
        tables?: string[];
    }): Promise<MaintenanceTask>;
    /**
     * Create system backup
     */
    createSystemBackup(options?: {
        include_database?: boolean;
        include_files?: boolean;
        include_logs?: boolean;
        compression?: string;
        encryption?: boolean;
    }): Promise<MaintenanceTask>;
    /**
     * Run database migrations
     */
    runDatabaseMigrations(options?: {
        force?: boolean;
        rollback_on_error?: boolean;
        backup_before?: boolean;
    }): Promise<MaintenanceTask>;
    /**
     * Get maintenance logs
     */
    getMaintenanceLogs(filters?: {
        page?: number;
        per_page?: number;
        level?: string;
        task_type?: string;
        start_date?: Date;
        end_date?: Date;
    }): Promise<{
        data: any[];
        pagination: any;
    }>;
    /**
     * Schedule maintenance task
     */
    scheduleMaintenanceTask(schedule: Omit<MaintenanceSchedule, 'id' | 'next_run'>): Promise<MaintenanceSchedule>;
    /**
     * Get scheduled maintenance tasks
     */
    getScheduledTasks(): Promise<MaintenanceSchedule[]>;
    /**
     * Cancel maintenance task
     */
    cancelTask(taskId: string, reason?: string): Promise<void>;
    /**
     * Get task status
     */
    getTaskStatus(taskId: string): Promise<MaintenanceTask | null>;
    private executeCleanupTask;
    private executeDatabaseOptimization;
    private executeSystemBackup;
    private executeDatabaseMigrations;
    private cleanupSessions;
    private rotateLogs;
    private cleanupTempFiles;
    private optimizeCache;
    private cleanupDatabase;
    private analyzeTables;
    private optimizeIndexes;
    private updateStatistics;
    private defragmentTables;
    private backupDatabase;
    private backupFiles;
    private backupLogs;
    private backupConfiguration;
    private getPendingMigrations;
    private createPreMigrationBackup;
    private executeMigration;
    private verifyMigrations;
    private rollbackMigrations;
    private generateTaskId;
    private generateScheduleId;
    private calculateNextRun;
    private getSystemHealth;
    private getScheduledMaintenance;
    private getRecentCompletedTasks;
    private saveMaintenanceSchedule;
    private logMaintenanceEvent;
    private getTaskFromDatabase;
    private sleep;
}
//# sourceMappingURL=maintenanceService.d.ts.map