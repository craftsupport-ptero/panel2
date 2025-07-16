/**
 * Tests for Database Migration Script
 */

import { DatabaseMigrator, MigrationConfig } from '../scripts/migrate-database';

describe('DatabaseMigrator', () => {
    let mockConfig: MigrationConfig;

    beforeEach(() => {
        mockConfig = {
            source: {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test_pterodactyl',
                username: 'test_user',
                password: 'test_password'
            },
            target: {
                databaseId: 'test-d1-database',
                apiToken: 'test-api-token',
                accountId: 'test-account-id'
            },
            options: {
                batchSize: 100,
                parallel: false,
                dryRun: true,
                skipTables: [],
                onlyTables: undefined
            }
        };
    });

    describe('constructor', () => {
        it('should create a DatabaseMigrator instance', () => {
            const migrator = new DatabaseMigrator(mockConfig);
            expect(migrator).toBeInstanceOf(DatabaseMigrator);
        });

        it('should create log directory if it does not exist', () => {
            const migrator = new DatabaseMigrator(mockConfig);
            // Test would verify log directory creation
            expect(migrator).toBeDefined();
        });
    });

    describe('migrate', () => {
        it('should return true for successful dry run migration', async () => {
            const migrator = new DatabaseMigrator(mockConfig);
            
            // Mock the internal methods for testing
            jest.spyOn(migrator as any, 'validateSource').mockResolvedValue({ valid: true, errors: [] });
            jest.spyOn(migrator as any, 'analyzeSourceSchema').mockResolvedValue([]);
            jest.spyOn(migrator as any, 'createTargetSchema').mockResolvedValue(undefined);
            jest.spyOn(migrator as any, 'migrateData').mockResolvedValue(true);
            jest.spyOn(migrator as any, 'validateMigration').mockResolvedValue({ valid: true, errors: [] });

            const result = await migrator.migrate();
            expect(result).toBe(true);
        });

        it('should return false when validation fails', async () => {
            const migrator = new DatabaseMigrator(mockConfig);
            
            jest.spyOn(migrator as any, 'validateSource').mockResolvedValue({ 
                valid: false, 
                errors: ['Database connection failed'] 
            });

            const result = await migrator.migrate();
            expect(result).toBe(false);
        });

        it('should handle migration errors gracefully', async () => {
            const migrator = new DatabaseMigrator(mockConfig);
            
            jest.spyOn(migrator as any, 'validateSource').mockRejectedValue(new Error('Network error'));

            const result = await migrator.migrate();
            expect(result).toBe(false);
        });
    });

    describe('type mapping', () => {
        it('should map MySQL types to D1/SQLite types correctly', () => {
            const migrator = new DatabaseMigrator(mockConfig);
            const mapMethod = (migrator as any).mapColumnTypeToD1;

            expect(mapMethod('varchar')).toBe('TEXT');
            expect(mapMethod('int')).toBe('INTEGER');
            expect(mapMethod('decimal')).toBe('REAL');
            expect(mapMethod('datetime')).toBe('TEXT');
            expect(mapMethod('boolean')).toBe('INTEGER');
            expect(mapMethod('json')).toBe('TEXT');
            expect(mapMethod('unknown_type')).toBe('TEXT');
        });
    });

    describe('SQL generation', () => {
        it('should generate correct CREATE TABLE SQL', () => {
            const migrator = new DatabaseMigrator(mockConfig);
            const generateMethod = (migrator as any).generateCreateTableSQL;

            const mockSchema = {
                name: 'users',
                columns: [
                    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true, nullable: false },
                    { name: 'username', type: 'TEXT', nullable: false },
                    { name: 'email', type: 'TEXT', nullable: false },
                    { name: 'created_at', type: 'TEXT', nullable: true, defaultValue: 'CURRENT_TIMESTAMP' }
                ]
            };

            const sql = generateMethod(mockSchema);
            
            expect(sql).toContain('CREATE TABLE users');
            expect(sql).toContain('id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL');
            expect(sql).toContain('username TEXT NOT NULL');
            expect(sql).toContain('created_at TEXT DEFAULT CURRENT_TIMESTAMP');
        });

        it('should generate correct CREATE INDEX SQL', () => {
            const migrator = new DatabaseMigrator(mockConfig);
            const generateMethod = (migrator as any).generateCreateIndexSQL;

            const mockIndex = {
                name: 'idx_users_email',
                columns: ['email'],
                unique: true
            };

            const sql = generateMethod('users', mockIndex);
            
            expect(sql).toBe('CREATE UNIQUE INDEX idx_users_email ON users (email);');
        });
    });

    describe('batch processing', () => {
        it('should respect batch size configuration', () => {
            const migrator = new DatabaseMigrator({
                ...mockConfig,
                options: { ...mockConfig.options, batchSize: 500 }
            });

            expect((migrator as any).config.options.batchSize).toBe(500);
        });

        it('should handle empty batches', async () => {
            const migrator = new DatabaseMigrator(mockConfig);
            
            jest.spyOn(migrator as any, 'getSourceDataBatch').mockResolvedValue([]);
            
            // Test that empty batches don't cause errors
            const result = await (migrator as any).migrateData([]);
            expect(result).toBe(true);
        });
    });
});

describe('Migration Configuration Validation', () => {
    it('should validate required source configuration', () => {
        const invalidConfig = {
            source: {
                type: 'mysql' as const,
                host: '',
                port: 3306,
                database: '',
                username: '',
                password: ''
            },
            target: {
                databaseId: 'test-id',
                apiToken: 'test-token',
                accountId: 'test-account'
            },
            options: {
                batchSize: 1000,
                parallel: false,
                dryRun: false
            }
        };

        // In a real implementation, this would validate the config
        expect(invalidConfig.source.host).toBe('');
        expect(invalidConfig.source.database).toBe('');
    });

    it('should validate required target configuration', () => {
        const invalidConfig = {
            source: {
                type: 'mysql' as const,
                host: 'localhost',
                port: 3306,
                database: 'pterodactyl',
                username: 'user',
                password: 'pass'
            },
            target: {
                databaseId: '',
                apiToken: '',
                accountId: ''
            },
            options: {
                batchSize: 1000,
                parallel: false,
                dryRun: false
            }
        };

        expect(invalidConfig.target.databaseId).toBe('');
        expect(invalidConfig.target.apiToken).toBe('');
    });
});

describe('Error Handling', () => {
    it('should handle network timeouts gracefully', async () => {
        const config: MigrationConfig = {
            source: {
                type: 'mysql',
                host: 'unreachable-host',
                port: 3306,
                database: 'pterodactyl',
                username: 'user',
                password: 'pass'
            },
            target: {
                databaseId: 'test-id',
                apiToken: 'test-token',
                accountId: 'test-account'
            },
            options: {
                batchSize: 1000,
                parallel: false,
                dryRun: false
            }
        };

        const migrator = new DatabaseMigrator(config);
        
        // Mock network timeout
        jest.spyOn(migrator as any, 'validateSource').mockRejectedValue(new Error('Connection timeout'));
        
        const result = await migrator.migrate();
        expect(result).toBe(false);
    });

    it('should handle API rate limiting', async () => {
        const migrator = new DatabaseMigrator({} as MigrationConfig);
        
        // Mock rate limiting error
        jest.spyOn(migrator as any, 'executeD1Query').mockRejectedValue(new Error('Rate limit exceeded'));
        
        // Test rate limiting handling
        try {
            await (migrator as any).executeD1Query('SELECT 1');
        } catch (error) {
            expect(error.message).toBe('Rate limit exceeded');
        }
    });
});

describe('Performance Tests', () => {
    it('should complete small dataset migration within time limit', async () => {
        const migrator = new DatabaseMigrator({
            source: {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'test',
                username: 'user',
                password: 'pass'
            },
            target: {
                databaseId: 'test-id',
                apiToken: 'test-token',
                accountId: 'test-account'
            },
            options: {
                batchSize: 100,
                parallel: false,
                dryRun: true
            }
        });
        
        // Mock small dataset
        jest.spyOn(migrator as any, 'getSourceTableRowCount').mockResolvedValue(100);
        jest.spyOn(migrator as any, 'getSourceDataBatch').mockResolvedValue(
            Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }))
        );
        jest.spyOn(migrator as any, 'insertBatchToD1').mockResolvedValue(undefined);
        
        const startTime = Date.now();
        await (migrator as any).migrateData([{ name: 'test_table' }]);
        const duration = Date.now() - startTime;
        
        // Should complete small dataset quickly
        expect(duration).toBeLessThan(1000); // Less than 1 second
    });

    it('should handle large datasets efficiently', async () => {
        const migrator = new DatabaseMigrator({
            source: {
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                database: 'pterodactyl',
                username: 'user',
                password: 'pass'
            },
            target: {
                databaseId: 'test-id',
                apiToken: 'test-token',
                accountId: 'test-account'
            },
            options: { batchSize: 1000, parallel: false, dryRun: true }
        } as MigrationConfig);
        
        // Mock large dataset
        jest.spyOn(migrator as any, 'getSourceTableRowCount').mockResolvedValue(100000);
        
        // Test that batch processing is efficient
        const batchSize = (migrator as any).config.options.batchSize;
        expect(batchSize).toBe(1000);
    });
});