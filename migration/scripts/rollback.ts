#!/usr/bin/env ts-node

/**
 * Migration Rollback Script
 * 
 * Safe rollback procedures for database and file migrations
 * Includes incremental rollback, data restoration, and safety checks
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

interface RollbackConfig {
    backup: {
        databaseBackupPath: string;
        filesBackupPath: string;
        metadataPath: string;
    };
    target: {
        databaseUrl: string;
        filesPath: string;
    };
    cloudflare: {
        databaseId: string;
        bucketName: string;
        apiToken: string;
        accountId: string;
    };
    options: {
        partial: boolean;
        dryRun: boolean;
        verifyBackup: boolean;
        createCheckpoint: boolean;
        rollbackTables?: string[];
        rollbackFiles?: boolean;
    };
}

interface MigrationMetadata {
    timestamp: string;
    sourceInfo: {
        database: DatabaseInfo;
        files: FileInfo[];
    };
    migrationSteps: MigrationStep[];
    checkpoints: Checkpoint[];
}

interface DatabaseInfo {
    tables: TableInfo[];
    version: string;
    charset: string;
}

interface TableInfo {
    name: string;
    rowCount: number;
    checksum: string;
    lastModified: string;
}

interface FileInfo {
    path: string;
    size: number;
    checksum: string;
    lastModified: string;
}

interface MigrationStep {
    id: string;
    type: 'database' | 'files' | 'validation';
    description: string;
    timestamp: string;
    status: 'completed' | 'failed' | 'rolled_back';
    rollbackProcedure?: string;
}

interface Checkpoint {
    id: string;
    timestamp: string;
    description: string;
    dataHash: string;
}

interface RollbackProgress {
    phase: string;
    step: string;
    progress: number;
    total: number;
    errors: string[];
}

class MigrationRollback {
    private config: RollbackConfig;
    private metadata: MigrationMetadata;
    private logFile: string;
    private progress: RollbackProgress;

    constructor(config: RollbackConfig) {
        this.config = config;
        this.logFile = path.join(process.cwd(), 'migration', 'logs', `rollback-${Date.now()}.log`);
        this.progress = {
            phase: 'initialization',
            step: 'starting',
            progress: 0,
            total: 0,
            errors: []
        };
        this.ensureLogDirectory();
    }

    private ensureLogDirectory(): void {
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    private log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
        
        console.log(logMessage.trim());
        fs.appendFileSync(this.logFile, logMessage);
    }

    async executeRollback(): Promise<boolean> {
        try {
            this.log('Starting migration rollback process');
            
            // Phase 1: Preparation and validation
            this.updateProgress('preparation', 'Loading migration metadata', 0, 6);
            await this.loadMigrationMetadata();
            
            this.updateProgress('preparation', 'Validating backup integrity', 1, 6);
            if (this.config.options.verifyBackup) {
                const backupValid = await this.validateBackupIntegrity();
                if (!backupValid) {
                    this.log('Backup validation failed. Aborting rollback.', 'error');
                    return false;
                }
            }

            this.updateProgress('preparation', 'Creating safety checkpoint', 2, 6);
            if (this.config.options.createCheckpoint) {
                await this.createCurrentStateCheckpoint();
            }

            // Phase 2: Pre-rollback safety checks
            this.updateProgress('safety_checks', 'Performing pre-rollback checks', 3, 6);
            const safetyChecksPassed = await this.performSafetyChecks();
            if (!safetyChecksPassed) {
                this.log('Safety checks failed. Aborting rollback.', 'error');
                return false;
            }

            // Phase 3: Database rollback
            if (this.shouldRollbackDatabase()) {
                this.updateProgress('database_rollback', 'Rolling back database', 4, 6);
                const dbRollbackSuccess = await this.rollbackDatabase();
                if (!dbRollbackSuccess) {
                    this.log('Database rollback failed', 'error');
                    return false;
                }
            }

            // Phase 4: File rollback
            if (this.config.options.rollbackFiles) {
                this.updateProgress('file_rollback', 'Rolling back files', 5, 6);
                const fileRollbackSuccess = await this.rollbackFiles();
                if (!fileRollbackSuccess) {
                    this.log('File rollback failed', 'error');
                    return false;
                }
            }

            // Phase 5: Post-rollback validation
            this.updateProgress('validation', 'Validating rollback', 6, 6);
            const validationSuccess = await this.validateRollback();
            if (!validationSuccess) {
                this.log('Rollback validation failed', 'error');
                return false;
            }

            // Phase 6: Cleanup
            await this.performCleanup();

            this.log('Migration rollback completed successfully');
            return true;

        } catch (error) {
            this.log(`Rollback failed with error: ${error instanceof Error ? error.message : String(error)}`, 'error');
            this.progress.errors.push(error instanceof Error ? error.message : String(error));
            return false;
        }
    }

    private async loadMigrationMetadata(): Promise<void> {
        try {
            const metadataPath = this.config.backup.metadataPath;
            
            if (!fs.existsSync(metadataPath)) {
                throw new Error(`Migration metadata not found: ${metadataPath}`);
            }

            const metadataContent = fs.readFileSync(metadataPath, 'utf8');
            this.metadata = JSON.parse(metadataContent);
            
            this.log(`Loaded migration metadata from ${metadataPath}`);
            this.log(`Migration timestamp: ${this.metadata.timestamp}`);
            this.log(`Migration steps: ${this.metadata.migrationSteps.length}`);
            this.log(`Checkpoints: ${this.metadata.checkpoints.length}`);

        } catch (error) {
            throw new Error(`Failed to load migration metadata: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async validateBackupIntegrity(): Promise<boolean> {
        this.log('Validating backup integrity...');

        try {
            // Validate database backup
            if (this.shouldRollbackDatabase()) {
                const dbBackupValid = await this.validateDatabaseBackup();
                if (!dbBackupValid) {
                    this.log('Database backup validation failed', 'error');
                    return false;
                }
            }

            // Validate file backup
            if (this.config.options.rollbackFiles) {
                const fileBackupValid = await this.validateFileBackup();
                if (!fileBackupValid) {
                    this.log('File backup validation failed', 'error');
                    return false;
                }
            }

            this.log('Backup integrity validation passed');
            return true;

        } catch (error) {
            this.log(`Backup validation error: ${error instanceof Error ? error.message : String(error)}`, 'error');
            return false;
        }
    }

    private async createCurrentStateCheckpoint(): Promise<void> {
        this.log('Creating current state checkpoint...');

        try {
            const checkpoint: Checkpoint = {
                id: `pre-rollback-${Date.now()}`,
                timestamp: new Date().toISOString(),
                description: 'State before rollback execution',
                dataHash: await this.calculateCurrentStateHash()
            };

            const checkpointPath = path.join(
                path.dirname(this.config.backup.metadataPath),
                `checkpoint-${checkpoint.id}.json`
            );

            fs.writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2));
            this.log(`Created checkpoint: ${checkpointPath}`);

        } catch (error) {
            this.log(`Failed to create checkpoint: ${error instanceof Error ? error.message : String(error)}`, 'warn');
        }
    }

    private async performSafetyChecks(): Promise<boolean> {
        this.log('Performing safety checks...');

        try {
            // Check if system is in a safe state for rollback
            const activeConnections = await this.checkActiveConnections();
            if (activeConnections > 0) {
                this.log(`Warning: ${activeConnections} active connections detected`, 'warn');
                
                if (!this.config.options.partial) {
                    this.log('Consider using --partial flag or stopping services first', 'warn');
                }
            }

            // Check disk space
            const diskSpaceOk = await this.checkDiskSpace();
            if (!diskSpaceOk) {
                this.log('Insufficient disk space for rollback', 'error');
                return false;
            }

            // Check backup completeness
            const backupComplete = await this.checkBackupCompleteness();
            if (!backupComplete) {
                this.log('Backup appears incomplete', 'error');
                return false;
            }

            // Check for conflicting processes
            const noConflicts = await this.checkForConflictingProcesses();
            if (!noConflicts) {
                this.log('Conflicting processes detected', 'error');
                return false;
            }

            this.log('Safety checks passed');
            return true;

        } catch (error) {
            this.log(`Safety check error: ${error instanceof Error ? error.message : String(error)}`, 'error');
            return false;
        }
    }

    private shouldRollbackDatabase(): boolean {
        return !this.config.options.rollbackTables || this.config.options.rollbackTables.length > 0;
    }

    private async rollbackDatabase(): Promise<boolean> {
        this.log('Starting database rollback...');

        try {
            if (this.config.options.dryRun) {
                this.log('[DRY RUN] Would restore database from backup');
                return true;
            }

            // Stop applications to prevent data corruption
            await this.stopApplications();

            if (this.config.options.partial && this.config.options.rollbackTables) {
                // Partial rollback - specific tables only
                await this.rollbackSpecificTables(this.config.options.rollbackTables);
            } else {
                // Full database rollback
                await this.rollbackFullDatabase();
            }

            // Restart applications
            await this.startApplications();

            this.log('Database rollback completed');
            return true;

        } catch (error) {
            this.log(`Database rollback failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
            
            // Attempt to restart applications even if rollback failed
            try {
                await this.startApplications();
            } catch (startError) {
                this.log(`Failed to restart applications: ${startError.message}`, 'error');
            }
            
            return false;
        }
    }

    private async rollbackSpecificTables(tables: string[]): Promise<void> {
        this.log(`Rolling back specific tables: ${tables.join(', ')}`);

        for (const tableName of tables) {
            this.log(`Rolling back table: ${tableName}`);
            
            try {
                // Create backup of current table state
                await this.backupCurrentTable(tableName);
                
                // Restore table from backup
                await this.restoreTableFromBackup(tableName);
                
                this.log(`Table rollback completed: ${tableName}`);
                
            } catch (error) {
                this.log(`Table rollback failed for ${tableName}: ${error instanceof Error ? error.message : String(error)}`, 'error');
                throw error;
            }
        }
    }

    private async rollbackFullDatabase(): Promise<void> {
        this.log('Performing full database rollback...');

        try {
            // Create backup of current state
            await this.backupCurrentDatabase();
            
            // Restore full database from backup
            await this.restoreFullDatabaseFromBackup();
            
            this.log('Full database rollback completed');
            
        } catch (error) {
            this.log(`Full database rollback failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
            throw error;
        }
    }

    private async rollbackFiles(): Promise<boolean> {
        this.log('Starting file rollback...');

        try {
            if (this.config.options.dryRun) {
                this.log('[DRY RUN] Would restore files from backup');
                return true;
            }

            // Restore files from backup
            await this.restoreFilesFromBackup();

            // Clean up any Cloudflare R2 uploaded files if needed
            await this.cleanupCloudflareFiles();

            this.log('File rollback completed');
            return true;

        } catch (error) {
            this.log(`File rollback failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
            return false;
        }
    }

    private async validateRollback(): Promise<boolean> {
        this.log('Validating rollback...');

        try {
            // Validate database integrity
            if (this.shouldRollbackDatabase()) {
                const dbValid = await this.validateDatabaseRollback();
                if (!dbValid) {
                    this.log('Database rollback validation failed', 'error');
                    return false;
                }
            }

            // Validate file restoration
            if (this.config.options.rollbackFiles) {
                const filesValid = await this.validateFileRollback();
                if (!filesValid) {
                    this.log('File rollback validation failed', 'error');
                    return false;
                }
            }

            // Test basic functionality
            const functionalityOk = await this.testBasicFunctionality();
            if (!functionalityOk) {
                this.log('Basic functionality test failed', 'error');
                return false;
            }

            this.log('Rollback validation passed');
            return true;

        } catch (error) {
            this.log(`Rollback validation error: ${error instanceof Error ? error.message : String(error)}`, 'error');
            return false;
        }
    }

    private async performCleanup(): Promise<void> {
        this.log('Performing cleanup...');

        try {
            // Clean up temporary files
            await this.cleanupTemporaryFiles();

            // Update migration metadata to reflect rollback
            await this.updateMigrationMetadata();

            // Generate rollback report
            await this.generateRollbackReport();

            this.log('Cleanup completed');

        } catch (error) {
            this.log(`Cleanup error: ${error instanceof Error ? error.message : String(error)}`, 'warn');
        }
    }

    private updateProgress(phase: string, step: string, progress: number, total: number): void {
        this.progress.phase = phase;
        this.progress.step = step;
        this.progress.progress = progress;
        this.progress.total = total;

        const percent = Math.round((progress / total) * 100);
        this.log(`Progress: ${phase} - ${step} (${progress}/${total} - ${percent}%)`);
    }

    // Placeholder methods for actual rollback operations
    private async validateDatabaseBackup(): Promise<boolean> {
        // Implementation would validate database backup integrity
        return true;
    }

    private async validateFileBackup(): Promise<boolean> {
        // Implementation would validate file backup integrity
        return true;
    }

    private async calculateCurrentStateHash(): Promise<string> {
        // Implementation would calculate hash of current state
        return 'mock-hash';
    }

    private async checkActiveConnections(): Promise<number> {
        // Implementation would check for active database connections
        return 0;
    }

    private async checkDiskSpace(): Promise<boolean> {
        // Implementation would check available disk space
        return true;
    }

    private async checkBackupCompleteness(): Promise<boolean> {
        // Implementation would verify backup completeness
        return true;
    }

    private async checkForConflictingProcesses(): Promise<boolean> {
        // Implementation would check for conflicting processes
        return true;
    }

    private async stopApplications(): Promise<void> {
        // Implementation would stop applications
        this.log('Stopping applications...');
    }

    private async startApplications(): Promise<void> {
        // Implementation would start applications
        this.log('Starting applications...');
    }

    private async backupCurrentTable(tableName: string): Promise<void> {
        // Implementation would backup current table
        this.log(`Creating backup of current table: ${tableName}`);
    }

    private async restoreTableFromBackup(tableName: string): Promise<void> {
        // Implementation would restore table from backup
        this.log(`Restoring table from backup: ${tableName}`);
    }

    private async backupCurrentDatabase(): Promise<void> {
        // Implementation would backup current database
        this.log('Creating backup of current database state...');
    }

    private async restoreFullDatabaseFromBackup(): Promise<void> {
        // Implementation would restore full database
        this.log('Restoring full database from backup...');
    }

    private async restoreFilesFromBackup(): Promise<void> {
        // Implementation would restore files from backup
        this.log('Restoring files from backup...');
    }

    private async cleanupCloudflareFiles(): Promise<void> {
        // Implementation would cleanup Cloudflare R2 files
        this.log('Cleaning up Cloudflare R2 files...');
    }

    private async validateDatabaseRollback(): Promise<boolean> {
        // Implementation would validate database rollback
        return true;
    }

    private async validateFileRollback(): Promise<boolean> {
        // Implementation would validate file rollback
        return true;
    }

    private async testBasicFunctionality(): Promise<boolean> {
        // Implementation would test basic application functionality
        return true;
    }

    private async cleanupTemporaryFiles(): Promise<void> {
        // Implementation would cleanup temporary files
        this.log('Cleaning up temporary files...');
    }

    private async updateMigrationMetadata(): Promise<void> {
        // Implementation would update migration metadata
        this.log('Updating migration metadata...');
    }

    private async generateRollbackReport(): Promise<void> {
        // Implementation would generate rollback report
        const reportPath = path.join(
            path.dirname(this.logFile),
            `rollback-report-${Date.now()}.json`
        );

        const report = {
            timestamp: new Date().toISOString(),
            success: this.progress.errors.length === 0,
            errors: this.progress.errors,
            duration: Date.now() - Date.parse(this.metadata.timestamp),
            steps: this.metadata.migrationSteps.length,
            rollbackType: this.config.options.partial ? 'partial' : 'full'
        };

        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        this.log(`Rollback report generated: ${reportPath}`);
    }
}

// CLI interface
const program = new Command();

program
    .name('rollback')
    .description('Rollback migration to previous state')
    .version('1.0.0');

program
    .command('execute')
    .description('Execute migration rollback')
    .requiredOption('--backup-db <path>', 'Database backup file path')
    .requiredOption('--backup-files <path>', 'Files backup directory path')
    .requiredOption('--metadata <path>', 'Migration metadata file path')
    .requiredOption('--target-db <url>', 'Target database connection URL')
    .requiredOption('--target-files <path>', 'Target files directory path')
    .option('--partial', 'Perform partial rollback', false)
    .option('--dry-run', 'Perform dry run without actual rollback', false)
    .option('--verify-backup', 'Verify backup integrity before rollback', true)
    .option('--create-checkpoint', 'Create checkpoint before rollback', true)
    .option('--rollback-tables <tables>', 'Comma-separated list of tables to rollback (for partial rollback)')
    .option('--rollback-files', 'Include files in rollback', true)
    .action(async (options) => {
        try {
            const config: RollbackConfig = {
                backup: {
                    databaseBackupPath: options.backupDb,
                    filesBackupPath: options.backupFiles,
                    metadataPath: options.metadata
                },
                target: {
                    databaseUrl: options.targetDb,
                    filesPath: options.targetFiles
                },
                cloudflare: {
                    databaseId: process.env.D1_DATABASE_ID || '',
                    bucketName: process.env.R2_BUCKET_NAME || '',
                    apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
                    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || ''
                },
                options: {
                    partial: options.partial,
                    dryRun: options.dryRun,
                    verifyBackup: options.verifyBackup,
                    createCheckpoint: options.createCheckpoint,
                    rollbackTables: options.rollbackTables?.split(','),
                    rollbackFiles: options.rollbackFiles
                }
            };

            const rollback = new MigrationRollback(config);
            const success = await rollback.executeRollback();
            
            process.exit(success ? 0 : 1);
        } catch (error) {
            console.error('Rollback failed:', error instanceof Error ? error.message : String(error));
            process.exit(1);
        }
    });

if (require.main === module) {
    program.parse();
}

export { MigrationRollback, RollbackConfig };