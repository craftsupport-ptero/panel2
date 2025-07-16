#!/usr/bin/env node

/**
 * Export existing data from Laravel/MySQL database for migration to D1
 * This script connects to the existing Pterodactyl database and exports data
 * in a format suitable for importing into Cloudflare D1
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Configuration (should be loaded from environment)
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'pterodactyl',
};

const OUTPUT_DIR = path.join(__dirname, '../migration-data');

// Tables to export in order (respecting foreign keys)
const TABLES_TO_EXPORT = [
  'locations',
  'users',
  'nodes', 
  'nests',
  'eggs',
  'allocations',
  'servers',
  'database_hosts',
  'databases',
  'api_keys',
  'user_ssh_keys',
  'backups',
  'activity_logs'
];

async function createOutputDirectory() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

async function exportTable(connection, tableName) {
  console.log(`Exporting table: ${tableName}`);
  
  try {
    const [rows] = await connection.execute(`SELECT * FROM ${tableName}`);
    
    if (rows.length === 0) {
      console.log(`  No data found in ${tableName}`);
      return;
    }

    const filename = path.join(OUTPUT_DIR, `${tableName}.json`);
    fs.writeFileSync(filename, JSON.stringify(rows, null, 2));
    
    console.log(`  Exported ${rows.length} rows to ${filename}`);
  } catch (error) {
    console.error(`  Error exporting ${tableName}:`, error.message);
  }
}

async function exportSchema(connection) {
  console.log('Exporting database schema...');
  
  try {
    const [tables] = await connection.execute(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        COLUMN_KEY,
        EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `, [DB_CONFIG.database]);

    const filename = path.join(OUTPUT_DIR, 'schema.json');
    fs.writeFileSync(filename, JSON.stringify(tables, null, 2));
    
    console.log(`  Schema exported to ${filename}`);
  } catch (error) {
    console.error('  Error exporting schema:', error.message);
  }
}

async function exportStats(connection) {
  console.log('Gathering export statistics...');
  
  const stats = {};
  
  for (const tableName of TABLES_TO_EXPORT) {
    try {
      const [result] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
      stats[tableName] = result[0].count;
    } catch (error) {
      stats[tableName] = `Error: ${error.message}`;
    }
  }

  const filename = path.join(OUTPUT_DIR, 'export-stats.json');
  fs.writeFileSync(filename, JSON.stringify({
    timestamp: new Date().toISOString(),
    database: DB_CONFIG.database,
    host: DB_CONFIG.host,
    tables: stats
  }, null, 2));
  
  console.log(`  Statistics exported to ${filename}`);
  console.log('\nExport Summary:');
  Object.entries(stats).forEach(([table, count]) => {
    console.log(`  ${table}: ${count} rows`);
  });
}

async function main() {
  console.log('Starting Pterodactyl data export...');
  console.log(`Database: ${DB_CONFIG.database}@${DB_CONFIG.host}:${DB_CONFIG.port}`);
  
  await createOutputDirectory();

  let connection;
  try {
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('Connected to database successfully');

    await exportSchema(connection);
    
    for (const tableName of TABLES_TO_EXPORT) {
      await exportTable(connection, tableName);
    }
    
    await exportStats(connection);
    
    console.log('\n✅ Export completed successfully!');
    console.log(`📁 Data exported to: ${OUTPUT_DIR}`);
    console.log('\nNext steps:');
    console.log('1. Review the exported data files');
    console.log('2. Run the import script: node scripts/import-to-d1.js');
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check database connection settings');
    console.log('2. Ensure the database exists and is accessible');
    console.log('3. Verify database user has SELECT permissions');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, exportTable, exportSchema };