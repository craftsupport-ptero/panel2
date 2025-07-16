/**
 * Migration Service
 * Handles server migration between nodes with zero downtime
 */
export interface MigrationJob {
    id: string;
    server_id: number;
    source_node: number;
    target_node: number;
    status: 'preparing' | 'backing_up' | 'transferring' | 'verifying' | 'completing' | 'completed' | 'failed';
    progress: number;
    steps: MigrationStep[];
    options: MigrationOptions;
    started_at: Date;
    completed_at?: Date;
    error?: string;
    metadata: Record<string, any>;
}
export interface MigrationStep {
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress?: number;
    started_at?: Date;
    completed_at?: Date;
    error?: string;
    output?: string[];
}
export interface MigrationOptions {
    keep_backups: boolean;
    compress_transfer: boolean;
    verify_transfer: boolean;
    downtime_window?: string;
    force: boolean;
}
export interface MigrationValidation {
    valid: boolean;
    errors: string[];
    warnings: string[];
    estimated_duration: number;
    estimated_downtime: number;
    resource_requirements: {
        disk_space: number;
        network_bandwidth: number;
        memory: number;
    };
}
export declare class MigrationService {
    private readonly MIGRATION_TIMEOUT;
    private readonly activeMigrations;
    /**
     * Validate server migration feasibility
     */
    validateMigration(serverId: number, targetNodeId: number): Promise<MigrationValidation>;
    /**
     * Start server migration
     */
    startMigration(serverId: number, targetNodeId: number, options?: MigrationOptions): Promise<MigrationJob>;
    /**
     * Get migration status
     */
    getMigrationStatus(migrationId: string): Promise<MigrationJob | null>;
    /**
     * Cancel migration
     */
    cancelMigration(migrationId: string, reason: string): Promise<void>;
    /**
     * Get migration history
     */
    getMigrationHistory(serverId?: number, limit?: number): Promise<MigrationJob[]>;
    /**
     * Get migration statistics
     */
    getMigrationStatistics(timeframe?: string): Promise<{
        total_migrations: number;
        successful_migrations: number;
        failed_migrations: number;
        average_duration: number;
        average_downtime: number;
        by_node: Record<string, number>;
    }>;
    private executeMigration;
    private executeStep;
    private createMigrationSteps;
    private getDefaultOptions;
    private generateMigrationId;
    private getServerDetails;
    private getNodeDetails;
    private checkNodeCapacity;
    private validateMigrationContext;
    private createMigrationBackup;
    private stopServer;
    private transferServerData;
    private verifyDataTransfer;
    private updateServerConfiguration;
    private startServerOnTargetNode;
    private cleanupSourceNode;
    private rollbackMigration;
    private getMigrationFromDatabase;
}
//# sourceMappingURL=migrationService.d.ts.map