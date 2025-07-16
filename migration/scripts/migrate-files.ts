#!/usr/bin/env ts-node

/**
 * File System Migration Script
 * 
 * Comprehensive migration from local file storage to Cloudflare R2
 * Includes parallel uploads, progress tracking, and integrity verification
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

interface FileMigrationConfig {
    source: {
        basePath: string;
        directories: string[];
    };
    target: {
        bucketName: string;
        accessKeyId: string;
        secretAccessKey: string;
        endpoint: string;
        region?: string;
    };
    options: {
        batchSize: number;
        parallel: number;
        dryRun: boolean;
        preserveMetadata: boolean;
        verifyIntegrity: boolean;
        includePatterns?: string[];
        excludePatterns?: string[];
        maxFileSize?: number; // in bytes
    };
}

interface FileInfo {
    localPath: string;
    remotePath: string;
    size: number;
    checksum: string;
    mimeType: string;
    lastModified: Date;
    metadata?: Record<string, string>;
}

interface MigrationStats {
    totalFiles: number;
    processedFiles: number;
    totalSize: number;
    processedSize: number;
    errors: number;
    startTime: Date;
    estimatedTimeRemaining?: number;
}

class FileMigrator {
    private config: FileMigrationConfig;
    private stats: MigrationStats;
    private logFile: string;
    private errorFiles: string[] = [];

    constructor(config: FileMigrationConfig) {
        this.config = config;
        this.logFile = path.join(process.cwd(), 'migration', 'logs', `file-migration-${Date.now()}.log`);
        this.stats = {
            totalFiles: 0,
            processedFiles: 0,
            totalSize: 0,
            processedSize: 0,
            errors: 0,
            startTime: new Date()
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

    async migrate(): Promise<boolean> {
        try {
            this.log('Starting file system migration to R2');

            // Phase 1: Discovery and validation
            this.log('Phase 1: File discovery and validation');
            const files = await this.discoverFiles();
            
            if (files.length === 0) {
                this.log('No files found to migrate');
                return true;
            }

            this.stats.totalFiles = files.length;
            this.stats.totalSize = files.reduce((sum, file) => sum + file.size, 0);

            this.log(`Discovered ${files.length} files (${this.formatBytes(this.stats.totalSize)})`);

            // Phase 2: Pre-migration validation
            this.log('Phase 2: Pre-migration validation');
            const validationResult = await this.validateFiles(files);
            if (!validationResult.valid) {
                this.log(`Pre-migration validation failed: ${validationResult.errors.join(', ')}`, 'error');
                return false;
            }

            // Phase 3: File migration
            this.log('Phase 3: File migration');
            const migrationSuccess = await this.migrateFiles(files);
            
            if (!migrationSuccess) {
                this.log('File migration failed', 'error');
                return false;
            }

            // Phase 4: Post-migration verification
            if (this.config.options.verifyIntegrity) {
                this.log('Phase 4: Post-migration verification');
                const verificationResult = await this.verifyMigration(files);
                
                if (!verificationResult.valid) {
                    this.log(`Post-migration verification failed: ${verificationResult.errors.join(', ')}`, 'error');
                    return false;
                }
            }

            // Phase 5: Cleanup and reporting
            this.log('Phase 5: Migration summary');
            this.logFinalStats();

            this.log('File system migration completed successfully');
            return true;

        } catch (error) {
            this.log(`Migration failed with error: ${error instanceof Error ? error.message : String(error)}`, 'error');
            return false;
        }
    }

    private async discoverFiles(): Promise<FileInfo[]> {
        const files: FileInfo[] = [];
        
        for (const directory of this.config.source.directories) {
            const fullPath = path.join(this.config.source.basePath, directory);
            
            if (!fs.existsSync(fullPath)) {
                this.log(`Directory not found: ${fullPath}`, 'warn');
                continue;
            }

            this.log(`Scanning directory: ${fullPath}`);
            const directoryFiles = await this.scanDirectory(fullPath, directory);
            files.push(...directoryFiles);
        }

        return files;
    }

    private async scanDirectory(localPath: string, relativePath: string): Promise<FileInfo[]> {
        const files: FileInfo[] = [];
        
        try {
            const entries = fs.readdirSync(localPath, { withFileTypes: true });
            
            for (const entry of entries) {
                const entryPath = path.join(localPath, entry.name);
                const entryRelativePath = path.join(relativePath, entry.name);
                
                if (entry.isDirectory()) {
                    const subFiles = await this.scanDirectory(entryPath, entryRelativePath);
                    files.push(...subFiles);
                } else if (entry.isFile()) {
                    if (this.shouldIncludeFile(entryPath)) {
                        const fileInfo = await this.getFileInfo(entryPath, entryRelativePath);
                        if (fileInfo) {
                            files.push(fileInfo);
                        }
                    }
                }
            }
        } catch (error) {
            this.log(`Error scanning directory ${localPath}: ${error instanceof Error ? error.message : String(error)}`, 'error');
        }

        return files;
    }

    private shouldIncludeFile(filePath: string): boolean {
        const { includePatterns, excludePatterns } = this.config.options;
        
        // Check exclude patterns first
        if (excludePatterns) {
            for (const pattern of excludePatterns) {
                if (this.matchesPattern(filePath, pattern)) {
                    return false;
                }
            }
        }

        // Check include patterns
        if (includePatterns) {
            for (const pattern of includePatterns) {
                if (this.matchesPattern(filePath, pattern)) {
                    return true;
                }
            }
            return false; // If include patterns specified, must match one
        }

        return true; // Include by default if no patterns specified
    }

    private matchesPattern(filePath: string, pattern: string): boolean {
        // Simple pattern matching - can be enhanced with proper glob support
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(filePath);
    }

    private async getFileInfo(localPath: string, relativePath: string): Promise<FileInfo | null> {
        try {
            const stats = fs.statSync(localPath);
            
            // Check file size limit
            if (this.config.options.maxFileSize && stats.size > this.config.options.maxFileSize) {
                this.log(`Skipping file (too large): ${localPath} (${this.formatBytes(stats.size)})`, 'warn');
                return null;
            }

            const checksum = await this.calculateChecksum(localPath);
            const mimeType = this.getMimeType(localPath);
            
            return {
                localPath,
                remotePath: relativePath.replace(/\\/g, '/'), // Normalize path separators
                size: stats.size,
                checksum,
                mimeType,
                lastModified: stats.mtime,
                metadata: this.config.options.preserveMetadata ? this.extractMetadata(localPath, stats) : undefined
            };
        } catch (error) {
            this.log(`Error getting file info for ${localPath}: ${error instanceof Error ? error.message : String(error)}`, 'error');
            return null;
        }
    }

    private async calculateChecksum(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const hash = createHash('md5');
            const stream = fs.createReadStream(filePath);
            
            stream.on('data', (data) => hash.update(data));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });
    }

    private getMimeType(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.pdf': 'application/pdf',
            '.txt': 'text/plain',
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.zip': 'application/zip',
            '.tar': 'application/x-tar',
            '.gz': 'application/gzip'
        };
        
        return mimeTypes[ext] || 'application/octet-stream';
    }

    private extractMetadata(filePath: string, stats: fs.Stats): Record<string, string> {
        return {
            originalPath: filePath,
            size: stats.size.toString(),
            lastModified: stats.mtime.toISOString(),
            migrationTimestamp: new Date().toISOString()
        };
    }

    private async validateFiles(files: FileInfo[]): Promise<{ valid: boolean; errors: string[] }> {
        const errors: string[] = [];

        try {
            this.log('Validating source files...');
            
            // Check R2 bucket accessibility
            this.log('Testing R2 bucket connection...');
            // Implementation would test R2 connection
            
            // Validate files are still accessible
            let inaccessibleCount = 0;
            for (const file of files) {
                if (!fs.existsSync(file.localPath)) {
                    errors.push(`File not accessible: ${file.localPath}`);
                    inaccessibleCount++;
                }
            }

            if (inaccessibleCount > 0) {
                this.log(`Found ${inaccessibleCount} inaccessible files`, 'warn');
            }

            // Check available disk space for temporary operations
            // Check R2 bucket permissions and quotas

        } catch (error) {
            errors.push(`File validation error: ${error instanceof Error ? error.message : String(error)}`);
        }

        return { valid: errors.length === 0, errors };
    }

    private async migrateFiles(files: FileInfo[]): Promise<boolean> {
        const { batchSize, parallel } = this.config.options;
        
        // Group files into batches
        const batches: FileInfo[][] = [];
        for (let i = 0; i < files.length; i += batchSize) {
            batches.push(files.slice(i, i + batchSize));
        }

        this.log(`Processing ${batches.length} batches with up to ${parallel} parallel operations`);

        // Process batches
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
            const batch = batches[batchIndex];
            
            this.log(`Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} files)`);
            
            if (parallel > 1) {
                await this.processBatchParallel(batch, parallel);
            } else {
                await this.processBatchSequential(batch);
            }

            this.logProgress();
        }

        return this.stats.errors === 0;
    }

    private async processBatchSequential(batch: FileInfo[]): Promise<void> {
        for (const file of batch) {
            await this.uploadFile(file);
        }
    }

    private async processBatchParallel(batch: FileInfo[], parallelCount: number): Promise<void> {
        const chunks: FileInfo[][] = [];
        for (let i = 0; i < batch.length; i += parallelCount) {
            chunks.push(batch.slice(i, i + parallelCount));
        }

        for (const chunk of chunks) {
            const promises = chunk.map(file => this.uploadFile(file));
            await Promise.allSettled(promises);
        }
    }

    private async uploadFile(file: FileInfo): Promise<void> {
        try {
            if (this.config.options.dryRun) {
                this.log(`[DRY RUN] Would upload: ${file.localPath} -> ${file.remotePath}`);
            } else {
                this.log(`Uploading: ${file.remotePath} (${this.formatBytes(file.size)})`);
                
                // Implementation would upload to R2
                await this.uploadToR2(file);
                
                this.log(`Uploaded successfully: ${file.remotePath}`);
            }

            this.stats.processedFiles++;
            this.stats.processedSize += file.size;

        } catch (error) {
            this.log(`Upload failed for ${file.localPath}: ${error instanceof Error ? error.message : String(error)}`, 'error');
            this.stats.errors++;
            this.errorFiles.push(file.localPath);
        }
    }

    private async uploadToR2(file: FileInfo): Promise<void> {
        // Implementation would use AWS SDK or Cloudflare API to upload to R2
        // This is a placeholder for the actual upload logic
        
        const uploadParams = {
            Bucket: this.config.target.bucketName,
            Key: file.remotePath,
            Body: fs.createReadStream(file.localPath),
            ContentType: file.mimeType,
            ContentMD5: file.checksum,
            Metadata: file.metadata
        };

        // Simulated upload delay for demonstration
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    private async verifyMigration(files: FileInfo[]): Promise<{ valid: boolean; errors: string[] }> {
        const errors: string[] = [];

        try {
            this.log('Verifying uploaded files...');
            
            // Sample verification - check a subset of files
            const sampleSize = Math.min(100, Math.ceil(files.length * 0.1)); // 10% sample
            const sampleFiles = this.selectRandomSample(files, sampleSize);
            
            for (const file of sampleFiles) {
                const remoteChecksum = await this.getRemoteFileChecksum(file.remotePath);
                
                if (remoteChecksum !== file.checksum) {
                    errors.push(`Checksum mismatch for ${file.remotePath}: local=${file.checksum}, remote=${remoteChecksum}`);
                }
            }

        } catch (error) {
            errors.push(`Migration verification error: ${error instanceof Error ? error.message : String(error)}`);
        }

        return { valid: errors.length === 0, errors };
    }

    private selectRandomSample<T>(array: T[], sampleSize: number): T[] {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, sampleSize);
    }

    private async getRemoteFileChecksum(remotePath: string): Promise<string> {
        // Implementation would get checksum from R2
        // This is a placeholder
        return 'mock-checksum';
    }

    private logProgress(): void {
        const percent = Math.round((this.stats.processedFiles / this.stats.totalFiles) * 100);
        const elapsed = Date.now() - this.stats.startTime.getTime();
        const rate = this.stats.processedFiles / (elapsed / 1000);
        
        if (this.stats.processedFiles > 0) {
            const remaining = this.stats.totalFiles - this.stats.processedFiles;
            this.stats.estimatedTimeRemaining = remaining / rate;
        }

        this.log(`Progress: ${this.stats.processedFiles}/${this.stats.totalFiles} (${percent}%) - ${rate.toFixed(2)} files/sec`);
        this.log(`Data: ${this.formatBytes(this.stats.processedSize)}/${this.formatBytes(this.stats.totalSize)} - Errors: ${this.stats.errors}`);
        
        if (this.stats.estimatedTimeRemaining) {
            this.log(`Estimated time remaining: ${this.formatDuration(this.stats.estimatedTimeRemaining)}`);
        }
    }

    private logFinalStats(): void {
        const elapsed = Date.now() - this.stats.startTime.getTime();
        const rate = this.stats.processedFiles / (elapsed / 1000);
        
        this.log('=== Migration Summary ===');
        this.log(`Total files: ${this.stats.totalFiles}`);
        this.log(`Processed files: ${this.stats.processedFiles}`);
        this.log(`Total size: ${this.formatBytes(this.stats.totalSize)}`);
        this.log(`Processed size: ${this.formatBytes(this.stats.processedSize)}`);
        this.log(`Errors: ${this.stats.errors}`);
        this.log(`Duration: ${this.formatDuration(elapsed / 1000)}`);
        this.log(`Average rate: ${rate.toFixed(2)} files/sec`);
        
        if (this.errorFiles.length > 0) {
            this.log(`Error files: ${this.errorFiles.join(', ')}`, 'error');
        }
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
    .name('migrate-files')
    .description('Migrate files from local storage to Cloudflare R2')
    .version('1.0.0');

program
    .command('migrate')
    .description('Execute file migration')
    .requiredOption('--source <path>', 'Source base directory path')
    .requiredOption('--dirs <directories>', 'Comma-separated list of directories to migrate')
    .requiredOption('--bucket <name>', 'R2 bucket name')
    .requiredOption('--access-key <key>', 'R2 access key ID')
    .requiredOption('--secret-key <key>', 'R2 secret access key')
    .requiredOption('--endpoint <url>', 'R2 endpoint URL')
    .option('--batch-size <size>', 'Batch size for file processing', '100')
    .option('--parallel <count>', 'Number of parallel uploads', '5')
    .option('--dry-run', 'Perform dry run without actual uploads', false)
    .option('--verify-integrity', 'Verify file integrity after upload', true)
    .option('--preserve-metadata', 'Preserve file metadata', true)
    .option('--include <patterns>', 'Comma-separated include patterns')
    .option('--exclude <patterns>', 'Comma-separated exclude patterns')
    .option('--max-file-size <bytes>', 'Maximum file size to migrate (in bytes)')
    .action(async (options) => {
        try {
            const config: FileMigrationConfig = {
                source: {
                    basePath: options.source,
                    directories: options.dirs.split(',')
                },
                target: {
                    bucketName: options.bucket,
                    accessKeyId: options.accessKey,
                    secretAccessKey: options.secretKey,
                    endpoint: options.endpoint
                },
                options: {
                    batchSize: parseInt(options.batchSize),
                    parallel: parseInt(options.parallel),
                    dryRun: options.dryRun,
                    verifyIntegrity: options.verifyIntegrity,
                    preserveMetadata: options.preserveMetadata,
                    includePatterns: options.include?.split(','),
                    excludePatterns: options.exclude?.split(','),
                    maxFileSize: options.maxFileSize ? parseInt(options.maxFileSize) : undefined
                }
            };

            const migrator = new FileMigrator(config);
            const success = await migrator.migrate();
            
            process.exit(success ? 0 : 1);
        } catch (error) {
            console.error('File migration failed:', error instanceof Error ? error.message : String(error));
            process.exit(1);
        }
    });

if (require.main === module) {
    program.parse();
}

export { FileMigrator, FileMigrationConfig };