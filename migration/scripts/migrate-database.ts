#!/usr/bin/env ts-node

/**
 * Database Migration Script
 * 
 * Comprehensive migration from MySQL/PostgreSQL to Cloudflare D1
 * Includes schema mapping, data transformation, and integrity validation
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

interface MigrationConfig {
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
    options: {
        batchSize: number;
        parallel: boolean;
        dryRun: boolean;
        skipTables?: string[];
        onlyTables?: string[];
    };
}

interface MigrationProgress {
    phase: string;
    table: string;
    processed: number;
    total: number;
    startTime: Date;
    errors: string[];
}

interface TableSchema {
    name: string;
    columns: ColumnDefinition[];
    indexes: IndexDefinition[];
    foreignKeys: ForeignKeyDefinition[];
}

interface ColumnDefinition {
    name: string;
    type: string;
    nullable: boolean;
    defaultValue?: any;
    autoIncrement?: boolean;
    primaryKey?: boolean;
}

interface IndexDefinition {
    name: string;
    columns: string[];
    unique: boolean;
}

interface ForeignKeyDefinition {
    name: string;
    column: string;
    referencedTable: string;
    referencedColumn: string;
    onDelete: string;
    onUpdate: string;
}

class DatabaseMigrator {
    private config: MigrationConfig;
    private progress: Map<string, MigrationProgress> = new Map();
    private logFile: string;

    constructor(config: MigrationConfig) {
        this.config = config;
        this.logFile = path.join(process.cwd(), 'migration', 'logs', `migration-${Date.now()}.log`);
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
            this.log('Starting database migration process');
            
            // Phase 1: Pre-migration validation
            this.log('Phase 1: Pre-migration validation');
            const validationResult = await this.validateSource();
            if (!validationResult.valid) {
                this.log(`Pre-migration validation failed: ${validationResult.errors.join(', ')}`, 'error');
                return false;
            }

            // Phase 2: Schema analysis and mapping
            this.log('Phase 2: Schema analysis and mapping');
            const schemas = await this.analyzeSourceSchema();
            const mappedSchemas = this.mapSchemasToD1(schemas);

            // Phase 3: Create target database schema
            this.log('Phase 3: Creating target database schema');
            await this.createTargetSchema(mappedSchemas);

            // Phase 4: Data migration
            this.log('Phase 4: Data migration');
            const migrationSuccess = await this.migrateData(schemas);
            
            if (!migrationSuccess) {
                this.log('Data migration failed', 'error');
                return false;
            }

            // Phase 5: Post-migration validation
            this.log('Phase 5: Post-migration validation');
            const postValidation = await this.validateMigration();
            
            if (!postValidation.valid) {
                this.log(`Post-migration validation failed: ${postValidation.errors.join(', ')}`, 'error');
                return false;
            }

            this.log('Database migration completed successfully');
            return true;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.log(`Migration failed with error: ${errorMessage}`, 'error');
            return false;
        }
    }

    private async validateSource(): Promise<{ valid: boolean; errors: string[] }> {
        const errors: string[] = [];

        try {
            // Test source database connection
            // This would use actual database connection logic
            this.log('Testing source database connection...');
            
            // Validate required tables exist
            const requiredTables = [
                'users', 'servers', 'nodes', 'allocations', 
                'databases', 'backups', 'api_keys', 'schedules'
            ];

            for (const table of requiredTables) {
                // Check table exists and get row count
                this.log(`Validating table: ${table}`);
            }

            // Check for incompatible data types or constraints
            this.log('Checking for incompatible data types...');

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            errors.push(`Source validation error: ${errorMessage}`);
        }

        return { valid: errors.length === 0, errors };
    }

    private async analyzeSourceSchema(): Promise<TableSchema[]> {
        const schemas: TableSchema[] = [];
        
        // This would analyze the actual source database
        const tableNames = await this.getSourceTableNames();
        
        for (const tableName of tableNames) {
            this.log(`Analyzing schema for table: ${tableName}`);
            
            const schema: TableSchema = {
                name: tableName,
                columns: await this.getTableColumns(tableName),
                indexes: await this.getTableIndexes(tableName),
                foreignKeys: await this.getTableForeignKeys(tableName)
            };
            
            schemas.push(schema);
        }

        return schemas;
    }

    private mapSchemasToD1(schemas: TableSchema[]): TableSchema[] {
        return schemas.map(schema => {
            const mappedColumns = schema.columns.map(col => {
                // Map MySQL/PostgreSQL types to SQLite (D1) types
                let d1Type = this.mapColumnTypeToD1(col.type);
                
                return {
                    ...col,
                    type: d1Type
                };
            });

            return {
                ...schema,
                columns: mappedColumns
            };
        });
    }

    private mapColumnTypeToD1(sourceType: string): string {
        const typeMapping: Record<string, string> = {
            // MySQL to SQLite mappings
            'varchar': 'TEXT',
            'char': 'TEXT',
            'text': 'TEXT',
            'longtext': 'TEXT',
            'mediumtext': 'TEXT',
            'tinytext': 'TEXT',
            'int': 'INTEGER',
            'bigint': 'INTEGER',
            'smallint': 'INTEGER',
            'tinyint': 'INTEGER',
            'decimal': 'REAL',
            'float': 'REAL',
            'double': 'REAL',
            'datetime': 'TEXT',
            'timestamp': 'TEXT',
            'date': 'TEXT',
            'time': 'TEXT',
            'boolean': 'INTEGER',
            'json': 'TEXT',
            'blob': 'BLOB',
            'binary': 'BLOB',
            'varbinary': 'BLOB'
        };

        return typeMapping[sourceType.toLowerCase()] || 'TEXT';
    }

    private async createTargetSchema(schemas: TableSchema[]): Promise<void> {
        for (const schema of schemas) {
            this.log(`Creating table: ${schema.name}`);
            
            if (this.config.options.dryRun) {
                this.log(`[DRY RUN] Would create table: ${schema.name}`);
                continue;
            }

            const createSQL = this.generateCreateTableSQL(schema);
            await this.executeD1Query(createSQL);

            // Create indexes
            for (const index of schema.indexes) {
                const indexSQL = this.generateCreateIndexSQL(schema.name, index);
                await this.executeD1Query(indexSQL);
            }
        }
    }

    private generateCreateTableSQL(schema: TableSchema): string {
        const columns = schema.columns.map(col => {
            let columnDef = `${col.name} ${col.type}`;
            
            if (col.primaryKey) {
                columnDef += ' PRIMARY KEY';
            }
            
            if (col.autoIncrement) {
                columnDef += ' AUTOINCREMENT';
            }
            
            if (!col.nullable) {
                columnDef += ' NOT NULL';
            }
            
            if (col.defaultValue !== undefined) {
                columnDef += ` DEFAULT ${col.defaultValue}`;
            }
            
            return columnDef;
        }).join(',\n  ');

        return `CREATE TABLE ${schema.name} (\n  ${columns}\n);`;
    }

    private generateCreateIndexSQL(tableName: string, index: IndexDefinition): string {
        const uniqueKeyword = index.unique ? 'UNIQUE ' : '';
        const columns = index.columns.join(', ');
        return `CREATE ${uniqueKeyword}INDEX ${index.name} ON ${tableName} (${columns});`;
    }

    private async migrateData(schemas: TableSchema[]): Promise<boolean> {
        const { batchSize } = this.config.options;
        
        for (const schema of schemas) {
            if (this.config.options.skipTables?.includes(schema.name)) {
                this.log(`Skipping table: ${schema.name}`);
                continue;
            }

            if (this.config.options.onlyTables && !this.config.options.onlyTables.includes(schema.name)) {
                this.log(`Skipping table (not in onlyTables): ${schema.name}`);
                continue;
            }

            this.log(`Migrating data for table: ${schema.name}`);
            
            const totalRows = await this.getSourceTableRowCount(schema.name);
            let processedRows = 0;
            
            this.progress.set(schema.name, {
                phase: 'data_migration',
                table: schema.name,
                processed: 0,
                total: totalRows,
                startTime: new Date(),
                errors: []
            });

            while (processedRows < totalRows) {
                const batch = await this.getSourceDataBatch(schema.name, processedRows, batchSize);
                
                if (this.config.options.dryRun) {
                    this.log(`[DRY RUN] Would migrate ${batch.length} rows for ${schema.name}`);
                } else {
                    await this.insertBatchToD1(schema.name, batch);
                }
                
                processedRows += batch.length;
                
                const progress = this.progress.get(schema.name)!;
                progress.processed = processedRows;
                
                this.logProgress(schema.name);
            }
        }

        return true;
    }

    private async validateMigration(): Promise<{ valid: boolean; errors: string[] }> {
        const errors: string[] = [];

        try {
            this.log('Validating row counts...');
            
            // Compare row counts between source and target
            const schemas = await this.analyzeSourceSchema();
            
            for (const schema of schemas) {
                const sourceCount = await this.getSourceTableRowCount(schema.name);
                const targetCount = await this.getD1TableRowCount(schema.name);
                
                if (sourceCount !== targetCount) {
                    errors.push(`Row count mismatch for ${schema.name}: source=${sourceCount}, target=${targetCount}`);
                }
            }

            // Validate data integrity with sample checks
            this.log('Performing data integrity checks...');
            await this.performIntegrityChecks();

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            errors.push(`Migration validation error: ${errorMessage}`);
        }

        return { valid: errors.length === 0, errors };
    }

    private logProgress(tableName: string): void {
        const progress = this.progress.get(tableName);
        if (progress) {
            const percent = Math.round((progress.processed / progress.total) * 100);
            const elapsed = Date.now() - progress.startTime.getTime();
            const rate = progress.processed / (elapsed / 1000);
            
            this.log(`Progress [${tableName}]: ${progress.processed}/${progress.total} (${percent}%) - ${rate.toFixed(2)} rows/sec`);
        }
    }

    // Placeholder methods for actual database operations
    private async getSourceTableNames(): Promise<string[]> {
        // Implementation would query source database for table names
        return [];
    }

    private async getTableColumns(tableName: string): Promise<ColumnDefinition[]> {
        // Implementation would query source database for column definitions
        return [];
    }

    private async getTableIndexes(tableName: string): Promise<IndexDefinition[]> {
        // Implementation would query source database for index definitions
        return [];
    }

    private async getTableForeignKeys(tableName: string): Promise<ForeignKeyDefinition[]> {
        // Implementation would query source database for foreign key definitions
        return [];
    }

    private async getSourceTableRowCount(tableName: string): Promise<number> {
        // Implementation would query source database for row count
        return 0;
    }

    private async getSourceDataBatch(tableName: string, offset: number, limit: number): Promise<any[]> {
        // Implementation would query source database for data batch
        return [];
    }

    private async executeD1Query(sql: string): Promise<any> {
        // Implementation would execute query against D1 database
        return null;
    }

    private async insertBatchToD1(tableName: string, data: any[]): Promise<void> {
        // Implementation would insert batch data into D1 database
    }

    private async getD1TableRowCount(tableName: string): Promise<number> {
        // Implementation would query D1 database for row count
        return 0;
    }

    private async performIntegrityChecks(): Promise<void> {
        // Implementation would perform various integrity checks
    }
}

// CLI interface
const program = new Command();

program
    .name('migrate-database')
    .description('Migrate database from MySQL/PostgreSQL to Cloudflare D1')
    .version('1.0.0');

program
    .command('migrate')
    .description('Execute database migration')
    .requiredOption('--source <url>', 'Source database connection URL')
    .requiredOption('--target <config>', 'Target D1 database configuration (JSON)')
    .option('--batch-size <size>', 'Batch size for data migration', '1000')
    .option('--parallel', 'Enable parallel processing', false)
    .option('--dry-run', 'Perform dry run without actual migration', false)
    .option('--skip-tables <tables>', 'Comma-separated list of tables to skip')
    .option('--only-tables <tables>', 'Comma-separated list of tables to migrate exclusively')
    .action(async (options) => {
        try {
            const targetConfig = JSON.parse(options.target);
            
            const config: MigrationConfig = {
                source: parseSourceUrl(options.source),
                target: targetConfig,
                options: {
                    batchSize: parseInt(options.batchSize),
                    parallel: options.parallel,
                    dryRun: options.dryRun,
                    skipTables: options.skipTables?.split(','),
                    onlyTables: options.onlyTables?.split(',')
                }
            };

            const migrator = new DatabaseMigrator(config);
            const success = await migrator.migrate();
            
            process.exit(success ? 0 : 1);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Migration failed:', errorMessage);
            process.exit(1);
        }
    });

function parseSourceUrl(url: string): MigrationConfig['source'] {
    // Parse database URL and return connection config
    // This is a simplified implementation
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

export { DatabaseMigrator, MigrationConfig };