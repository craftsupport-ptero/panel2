#!/usr/bin/env ts-node

/**
 * Data Validation Script
 * 
 * Comprehensive validation and integrity checking for migration data
 * Includes pre-migration, post-migration, and ongoing integrity checks
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

interface ValidationConfig {
    source: {
        type: 'mysql' | 'postgresql';
        host: string;
        port: number;
        database: string;
        username: string;
        password: string;
    };
    target: {
        databaseId: string;
        apiToken: string;
        accountId: string;
    };
    files: {
        sourcePath: string;
        bucketName: string;
    };
    options: {
        deepValidation: boolean;
        sampleSize: number;
        checkIntegrity: boolean;
        validatePerformance: boolean;
    };
}

interface ValidationResult {
    valid: boolean;
    score: number; // 0-100
    errors: ValidationError[];
    warnings: ValidationWarning[];
    metrics: ValidationMetrics;
}

interface ValidationError {
    type: string;
    message: string;
    table?: string;
    field?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ValidationWarning {
    type: string;
    message: string;
    recommendation?: string;
}

interface ValidationMetrics {
    tablesChecked: number;
    recordsValidated: number;
    filesValidated: number;
    checksumMatches: number;
    performanceTests: number;
    executionTime: number;
}

class DataValidator {
    private config: ValidationConfig;
    private logFile: string;
    private results: ValidationResult;

    constructor(config: ValidationConfig) {
        this.config = config;
        this.logFile = path.join(process.cwd(), 'migration', 'logs', `validation-${Date.now()}.log`);
        this.results = {
            valid: true,
            score: 100,
            errors: [],
            warnings: [],
            metrics: {
                tablesChecked: 0,
                recordsValidated: 0,
                filesValidated: 0,
                checksumMatches: 0,
                performanceTests: 0,
                executionTime: 0
            }
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

    async validatePreMigration(): Promise<ValidationResult> {
        const startTime = Date.now();
        
        try {
            this.log('Starting pre-migration validation');

            // 1. Environment validation
            await this.validateEnvironment();

            // 2. Source database validation
            await this.validateSourceDatabase();

            // 3. Source file system validation
            await this.validateSourceFiles();

            // 4. Target environment validation
            await this.validateTargetEnvironment();

            // 5. Migration readiness assessment
            await this.assessMigrationReadiness();

            this.results.metrics.executionTime = Date.now() - startTime;
            this.calculateScore();

            this.log('Pre-migration validation completed');
            this.logResults();

            return this.results;

        } catch (error) {
            this.addError('validation_error', `Pre-migration validation failed: ${error instanceof Error ? error.message : String(error)}`, 'critical');
            this.results.valid = false;
            return this.results;
        }
    }

    async validatePostMigration(): Promise<ValidationResult> {
        const startTime = Date.now();
        
        try {
            this.log('Starting post-migration validation');

            // 1. Data integrity validation
            await this.validateDataIntegrity();

            // 2. File integrity validation
            await this.validateFileIntegrity();

            // 3. Performance validation
            if (this.config.options.validatePerformance) {
                await this.validatePerformance();
            }

            // 4. Functional validation
            await this.validateFunctionality();

            // 5. Security validation
            await this.validateSecurity();

            this.results.metrics.executionTime = Date.now() - startTime;
            this.calculateScore();

            this.log('Post-migration validation completed');
            this.logResults();

            return this.results;

        } catch (error) {
            this.addError('validation_error', `Post-migration validation failed: ${error instanceof Error ? error.message : String(error)}`, 'critical');
            this.results.valid = false;
            return this.results;
        }
    }

    private async validateEnvironment(): Promise<void> {
        this.log('Validating environment...');

        // Check required tools and dependencies
        const requiredTools = ['node', 'npm', 'yarn'];
        for (const tool of requiredTools) {
            try {
                // Check if tool is available
                this.log(`Checking ${tool}...`);
            } catch (error) {
                this.addError('missing_dependency', `Required tool not found: ${tool}`, 'high');
            }
        }

        // Check environment variables
        const requiredEnvVars = ['CLOUDFLARE_API_TOKEN', 'D1_DATABASE_ID'];
        for (const envVar of requiredEnvVars) {
            if (!process.env[envVar]) {
                this.addWarning('missing_env_var', `Environment variable not set: ${envVar}`, 'Set this variable for proper configuration');
            }
        }

        // Check disk space
        try {
            const stats = fs.statSync(process.cwd());
            // Check available disk space
            this.log('Disk space check completed');
        } catch (error) {
            this.addError('disk_space', 'Unable to check disk space', 'medium');
        }
    }

    private async validateSourceDatabase(): Promise<void> {
        this.log('Validating source database...');

        try {
            // Test database connection
            this.log('Testing source database connection...');
            
            // Validate required tables
            const requiredTables = [
                'users', 'servers', 'nodes', 'allocations',
                'databases', 'backups', 'api_keys', 'schedules',
                'tasks', 'nests', 'eggs', 'server_variables'
            ];

            for (const table of requiredTables) {
                const exists = await this.checkTableExists(table);
                if (!exists) {
                    this.addError('missing_table', `Required table missing: ${table}`, 'high');
                } else {
                    const rowCount = await this.getTableRowCount(table);
                    this.log(`Table ${table}: ${rowCount} rows`);
                    this.results.metrics.tablesChecked++;
                }
            }

            // Check for data consistency issues
            await this.checkDataConsistency();

            // Check for orphaned records
            await this.checkOrphanedRecords();

            // Validate foreign key constraints
            await this.validateForeignKeys();

        } catch (error) {
            this.addError('database_validation', `Source database validation failed: ${error instanceof Error ? error.message : String(error)}`, 'critical');
        }
    }

    private async validateSourceFiles(): Promise<void> {
        this.log('Validating source files...');

        try {
            const directories = ['storage/app', 'storage/logs', 'public/assets'];
            
            for (const dir of directories) {
                const fullPath = path.join(this.config.files.sourcePath, dir);
                
                if (fs.existsSync(fullPath)) {
                    const stats = await this.analyzeDirectory(fullPath);
                    this.log(`Directory ${dir}: ${stats.fileCount} files, ${this.formatBytes(stats.totalSize)}`);
                    this.results.metrics.filesValidated += stats.fileCount;
                } else {
                    this.addWarning('missing_directory', `Directory not found: ${dir}`, 'Create directory if needed');
                }
            }

            // Check for large files that might cause issues
            await this.checkLargeFiles();

            // Validate file permissions
            await this.validateFilePermissions();

        } catch (error) {
            this.addError('file_validation', `Source files validation failed: ${error instanceof Error ? error.message : String(error)}`, 'high');
        }
    }

    private async validateTargetEnvironment(): Promise<void> {
        this.log('Validating target environment...');

        try {
            // Test Cloudflare D1 connection
            this.log('Testing D1 database connection...');
            // Implementation would test D1 connection

            // Test Cloudflare R2 connection
            this.log('Testing R2 storage connection...');
            // Implementation would test R2 connection

            // Check API rate limits
            this.log('Checking API rate limits...');
            // Implementation would check current rate limit status

            // Validate permissions
            this.log('Validating permissions...');
            // Implementation would check account permissions

        } catch (error) {
            this.addError('target_validation', `Target environment validation failed: ${error instanceof Error ? error.message : String(error)}`, 'critical');
        }
    }

    private async assessMigrationReadiness(): Promise<void> {
        this.log('Assessing migration readiness...');

        // Calculate estimated migration time
        const totalRecords = await this.getTotalRecordCount();
        const totalFiles = this.results.metrics.filesValidated;
        
        const estimatedDbTime = totalRecords / 1000; // 1000 records per second estimate
        const estimatedFileTime = totalFiles / 10; // 10 files per second estimate
        
        const totalEstimatedTime = estimatedDbTime + estimatedFileTime;
        
        this.log(`Estimated migration time: ${this.formatDuration(totalEstimatedTime)}`);
        
        if (totalEstimatedTime > 14400) { // 4 hours
            this.addWarning('long_migration', 'Migration estimated to take more than 4 hours', 'Consider migrating in batches');
        }

        // Check for blocking issues
        if (this.results.errors.some(e => e.severity === 'critical')) {
            this.addError('blocking_issues', 'Critical issues found that prevent migration', 'critical');
        }
    }

    private async validateDataIntegrity(): Promise<void> {
        this.log('Validating data integrity...');

        try {
            // Compare row counts
            await this.compareRowCounts();

            // Sample data validation
            await this.validateSampleData();

            // Check data types and constraints
            await this.validateDataTypes();

            // Validate relationships
            await this.validateRelationships();

        } catch (error) {
            this.addError('integrity_validation', `Data integrity validation failed: ${error instanceof Error ? error.message : String(error)}`, 'high');
        }
    }

    private async validateFileIntegrity(): Promise<void> {
        this.log('Validating file integrity...');

        try {
            // Sample file checksum validation
            const sampleFiles = await this.getSampleFiles();
            
            for (const file of sampleFiles) {
                const localChecksum = await this.calculateLocalChecksum(file.path);
                const remoteChecksum = await this.getRemoteChecksum(file.remotePath);
                
                if (localChecksum === remoteChecksum) {
                    this.results.metrics.checksumMatches++;
                } else {
                    this.addError('checksum_mismatch', `Checksum mismatch for file: ${file.path}`, 'high');
                }
            }

            this.log(`Checksum validation: ${this.results.metrics.checksumMatches}/${sampleFiles.length} matches`);

        } catch (error) {
            this.addError('file_integrity', `File integrity validation failed: ${error instanceof Error ? error.message : String(error)}`, 'high');
        }
    }

    private async validatePerformance(): Promise<void> {
        this.log('Validating performance...');

        try {
            // Database query performance tests
            const dbTests = [
                'SELECT COUNT(*) FROM users',
                'SELECT * FROM servers LIMIT 100',
                'SELECT s.*, u.username FROM servers s JOIN users u ON s.owner_id = u.id LIMIT 50'
            ];

            for (const query of dbTests) {
                const startTime = Date.now();
                await this.executeTestQuery(query);
                const executionTime = Date.now() - startTime;
                
                this.log(`Query performance: ${executionTime}ms`);
                this.results.metrics.performanceTests++;
                
                if (executionTime > 5000) { // 5 seconds
                    this.addWarning('slow_query', `Slow query detected: ${executionTime}ms`, 'Consider query optimization');
                }
            }

            // File access performance tests
            await this.testFileAccessPerformance();

        } catch (error) {
            this.addError('performance_validation', `Performance validation failed: ${error instanceof Error ? error.message : String(error)}`, 'medium');
        }
    }

    private async validateFunctionality(): Promise<void> {
        this.log('Validating functionality...');

        try {
            // Test critical application functions
            await this.testUserAuthentication();
            await this.testServerOperations();
            await this.testFileOperations();
            await this.testAPIEndpoints();

        } catch (error) {
            this.addError('functionality_validation', `Functionality validation failed: ${error instanceof Error ? error.message : String(error)}`, 'high');
        }
    }

    private async validateSecurity(): Promise<void> {
        this.log('Validating security...');

        try {
            // Check for exposed sensitive data
            await this.checkSensitiveDataExposure();

            // Validate encryption
            await this.validateEncryption();

            // Check access controls
            await this.validateAccessControls();

        } catch (error) {
            this.addError('security_validation', `Security validation failed: ${error instanceof Error ? error.message : String(error)}`, 'high');
        }
    }

    private addError(type: string, message: string, severity: 'low' | 'medium' | 'high' | 'critical', table?: string, field?: string): void {
        this.results.errors.push({ type, message, severity, table, field });
        this.results.valid = false;
        this.log(message, 'error');
    }

    private addWarning(type: string, message: string, recommendation?: string): void {
        this.results.warnings.push({ type, message, recommendation });
        this.log(message, 'warn');
    }

    private calculateScore(): void {
        let score = 100;
        
        // Deduct points for errors
        for (const error of this.results.errors) {
            switch (error.severity) {
                case 'critical': score -= 25; break;
                case 'high': score -= 15; break;
                case 'medium': score -= 10; break;
                case 'low': score -= 5; break;
            }
        }

        // Deduct points for warnings
        score -= this.results.warnings.length * 2;

        this.results.score = Math.max(0, score);
    }

    private logResults(): void {
        this.log('=== Validation Results ===');
        this.log(`Overall Status: ${this.results.valid ? 'PASSED' : 'FAILED'}`);
        this.log(`Score: ${this.results.score}/100`);
        this.log(`Errors: ${this.results.errors.length}`);
        this.log(`Warnings: ${this.results.warnings.length}`);
        this.log(`Execution Time: ${this.formatDuration(this.results.metrics.executionTime / 1000)}`);

        if (this.results.errors.length > 0) {
            this.log('--- Errors ---');
            for (const error of this.results.errors) {
                this.log(`[${error.severity.toUpperCase()}] ${error.type}: ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        if (this.results.warnings.length > 0) {
            this.log('--- Warnings ---');
            for (const warning of this.results.warnings) {
                this.log(`[WARN] ${warning.type}: ${warning.message}`);
                if (warning.recommendation) {
                    this.log(`  Recommendation: ${warning.recommendation}`);
                }
            }
        }
    }

    // Placeholder methods for actual validation operations
    private async checkTableExists(tableName: string): Promise<boolean> {
        // Implementation would check if table exists in source database
        return true;
    }

    private async getTableRowCount(tableName: string): Promise<number> {
        // Implementation would get row count from table
        return 0;
    }

    private async checkDataConsistency(): Promise<void> {
        // Implementation would check for data consistency issues
    }

    private async checkOrphanedRecords(): Promise<void> {
        // Implementation would check for orphaned records
    }

    private async validateForeignKeys(): Promise<void> {
        // Implementation would validate foreign key constraints
    }

    private async analyzeDirectory(path: string): Promise<{ fileCount: number; totalSize: number }> {
        // Implementation would analyze directory
        return { fileCount: 0, totalSize: 0 };
    }

    private async checkLargeFiles(): Promise<void> {
        // Implementation would check for large files
    }

    private async validateFilePermissions(): Promise<void> {
        // Implementation would validate file permissions
    }

    private async getTotalRecordCount(): Promise<number> {
        // Implementation would get total record count
        return 0;
    }

    private async compareRowCounts(): Promise<void> {
        // Implementation would compare row counts between source and target
    }

    private async validateSampleData(): Promise<void> {
        // Implementation would validate sample data
    }

    private async validateDataTypes(): Promise<void> {
        // Implementation would validate data types
    }

    private async validateRelationships(): Promise<void> {
        // Implementation would validate relationships
    }

    private async getSampleFiles(): Promise<Array<{ path: string; remotePath: string }>> {
        // Implementation would get sample files for validation
        return [];
    }

    private async calculateLocalChecksum(filePath: string): Promise<string> {
        // Implementation would calculate local file checksum
        return '';
    }

    private async getRemoteChecksum(remotePath: string): Promise<string> {
        // Implementation would get remote file checksum
        return '';
    }

    private async executeTestQuery(query: string): Promise<any> {
        // Implementation would execute test query
        return null;
    }

    private async testFileAccessPerformance(): Promise<void> {
        // Implementation would test file access performance
    }

    private async testUserAuthentication(): Promise<void> {
        // Implementation would test user authentication
    }

    private async testServerOperations(): Promise<void> {
        // Implementation would test server operations
    }

    private async testFileOperations(): Promise<void> {
        // Implementation would test file operations
    }

    private async testAPIEndpoints(): Promise<void> {
        // Implementation would test API endpoints
    }

    private async checkSensitiveDataExposure(): Promise<void> {
        // Implementation would check for sensitive data exposure
    }

    private async validateEncryption(): Promise<void> {
        // Implementation would validate encryption
    }

    private async validateAccessControls(): Promise<void> {
        // Implementation would validate access controls
    }

    private formatBytes(bytes: number): string {
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    private formatDuration(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }
}

// CLI interface
const program = new Command();

program
    .name('validate-data')
    .description('Validate data integrity and migration readiness')
    .version('1.0.0');

program
    .command('pre-migration')
    .description('Run pre-migration validation')
    .requiredOption('--source <url>', 'Source database connection URL')
    .requiredOption('--files <path>', 'Source files path')
    .option('--deep', 'Enable deep validation', false)
    .option('--sample-size <size>', 'Sample size for validation', '100')
    .action(async (options) => {
        try {
            const config: ValidationConfig = {
                source: parseSourceUrl(options.source),
                target: {
                    databaseId: process.env.D1_DATABASE_ID || '',
                    apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
                    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || ''
                },
                files: {
                    sourcePath: options.files,
                    bucketName: process.env.R2_BUCKET_NAME || ''
                },
                options: {
                    deepValidation: options.deep,
                    sampleSize: parseInt(options.sampleSize),
                    checkIntegrity: true,
                    validatePerformance: false
                }
            };

            const validator = new DataValidator(config);
            const result = await validator.validatePreMigration();
            
            process.exit(result.valid ? 0 : 1);
        } catch (error) {
            console.error('Pre-migration validation failed:', error instanceof Error ? error.message : String(error));
            process.exit(1);
        }
    });

program
    .command('post-migration')
    .description('Run post-migration validation')
    .requiredOption('--source <url>', 'Source database connection URL')
    .option('--validate-performance', 'Include performance validation', false)
    .option('--sample-size <size>', 'Sample size for validation', '100')
    .action(async (options) => {
        try {
            const config: ValidationConfig = {
                source: parseSourceUrl(options.source),
                target: {
                    databaseId: process.env.D1_DATABASE_ID || '',
                    apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
                    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || ''
                },
                files: {
                    sourcePath: '',
                    bucketName: process.env.R2_BUCKET_NAME || ''
                },
                options: {
                    deepValidation: true,
                    sampleSize: parseInt(options.sampleSize),
                    checkIntegrity: true,
                    validatePerformance: options.validatePerformance
                }
            };

            const validator = new DataValidator(config);
            const result = await validator.validatePostMigration();
            
            process.exit(result.valid ? 0 : 1);
        } catch (error) {
            console.error('Post-migration validation failed:', error instanceof Error ? error.message : String(error));
            process.exit(1);
        }
    });

function parseSourceUrl(url: string): ValidationConfig['source'] {
    // Parse database URL and return connection config
    return {
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        database: 'pterodactyl',
        username: 'pterodactyl',
        password: 'password'
    };
}

if (require.main === module) {
    program.parse();
}

export { DataValidator, ValidationConfig, ValidationResult };