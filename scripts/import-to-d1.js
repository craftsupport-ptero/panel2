#!/usr/bin/env node

/**
 * Import exported data to Cloudflare D1 database
 * This script takes the exported JSON files and imports them into D1
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MIGRATION_DATA_DIR = path.join(__dirname, '../migration-data');
const WRANGLER_CONFIG = path.join(__dirname, '../wrangler.toml');

// Tables to import in order (respecting foreign keys)
const TABLES_TO_IMPORT = [
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

// Field mappings from MySQL/Laravel to D1/SQLite naming
const FIELD_MAPPINGS = {
  users: {
    first_name: 'firstName',
    last_name: 'lastName',
    email_verified_at: 'emailVerifiedAt',
    root_admin: 'rootAdmin',
    use_totp: 'useTotp',
    totp_secret: 'totpSecret',
    totp_authenticated_at: 'totpAuthenticatedAt',
    external_id: 'externalId',
    created_at: 'createdAt',
    updated_at: 'updatedAt'
  },
  nodes: {
    location_id: 'locationId',
    behind_proxy: 'behindProxy',
    maintenance_mode: 'maintenanceMode',
    memory_overallocate: 'memoryOverallocate',
    disk_overallocate: 'diskOverallocate',
    upload_size: 'uploadSize',
    daemon_listen: 'daemonListenPort',
    daemon_sftp: 'daemonSftpPort',
    daemon_base: 'daemonBase',
    created_at: 'createdAt',
    updated_at: 'updatedAt'
  },
  servers: {
    external_id: 'externalId',
    uuid_short: 'uuidShort',
    skip_scripts: 'skipScripts',
    owner_id: 'ownerId',
    oom_disabled: 'oomDisabled',
    allocation_id: 'allocationId',
    nest_id: 'nestId',
    egg_id: 'eggId',
    node_id: 'nodeId',
    allocation_limit: 'allocationLimit',
    database_limit: 'databaseLimit',
    backup_limit: 'backupLimit',
    installed_at: 'installedAt',
    created_at: 'createdAt',
    updated_at: 'updatedAt'
  },
  allocations: {
    node_id: 'nodeId',
    ip_alias: 'ipAlias',
    server_id: 'serverId',
    created_at: 'createdAt',
    updated_at: 'updatedAt'
  }
};

function checkPrerequisites() {
  console.log('Checking prerequisites...');
  
  // Check if migration data exists
  if (!fs.existsSync(MIGRATION_DATA_DIR)) {
    throw new Error(`Migration data directory not found: ${MIGRATION_DATA_DIR}\nRun 'node scripts/export-data.js' first`);
  }

  // Check if wrangler is available
  try {
    execSync('wrangler --version', { stdio: 'pipe' });
  } catch (error) {
    throw new Error('Wrangler CLI not found. Please install with: npm install -g wrangler');
  }

  // Check if wrangler.toml exists
  if (!fs.existsSync(WRANGLER_CONFIG)) {
    throw new Error(`Wrangler config not found: ${WRANGLER_CONFIG}`);
  }

  console.log('✅ Prerequisites check passed');
}

function transformRecord(tableName, record) {
  const mapping = FIELD_MAPPINGS[tableName];
  if (!mapping) return record;

  const transformed = { ...record };
  
  Object.entries(mapping).forEach(([oldField, newField]) => {
    if (transformed[oldField] !== undefined) {
      transformed[newField] = transformed[oldField];
      delete transformed[oldField];
    }
  });

  return transformed;
}

function generateInsertSQL(tableName, records) {
  if (!records || records.length === 0) {
    return null;
  }

  const transformedRecords = records.map(record => transformRecord(tableName, record));
  const fields = Object.keys(transformedRecords[0]);
  
  const values = transformedRecords.map(record => {
    const recordValues = fields.map(field => {
      const value = record[field];
      if (value === null || value === undefined) {
        return 'NULL';
      }
      if (typeof value === 'string') {
        return `'${value.replace(/'/g, "''")}'`; // Escape single quotes
      }
      if (typeof value === 'boolean') {
        return value ? '1' : '0';
      }
      return value;
    });
    return `(${recordValues.join(', ')})`;
  }).join(',\n    ');

  return `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES\n    ${values};`;
}

async function importTable(tableName) {
  const dataFile = path.join(MIGRATION_DATA_DIR, `${tableName}.json`);
  
  if (!fs.existsSync(dataFile)) {
    console.log(`⚠️  No data file found for ${tableName}, skipping...`);
    return;
  }

  console.log(`📥 Importing ${tableName}...`);
  
  try {
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    if (!data || data.length === 0) {
      console.log(`  No data to import for ${tableName}`);
      return;
    }

    const sql = generateInsertSQL(tableName, data);
    
    if (!sql) {
      console.log(`  No valid data to import for ${tableName}`);
      return;
    }

    // Write SQL to temporary file
    const tempSqlFile = path.join(__dirname, `temp-${tableName}.sql`);
    fs.writeFileSync(tempSqlFile, sql);

    // Execute using wrangler d1 execute
    const command = `wrangler d1 execute pterodactyl --file="${tempSqlFile}" --local`;
    
    try {
      execSync(command, { stdio: 'pipe' });
      console.log(`  ✅ Imported ${data.length} records`);
    } catch (error) {
      console.error(`  ❌ Failed to import ${tableName}:`, error.message);
      console.log(`  SQL file saved for debugging: ${tempSqlFile}`);
      return; // Don't delete the temp file on error
    }

    // Clean up temp file
    fs.unlinkSync(tempSqlFile);
    
  } catch (error) {
    console.error(`❌ Error processing ${tableName}:`, error.message);
  }
}

async function verifyImport() {
  console.log('\n🔍 Verifying import...');
  
  const stats = {};
  
  for (const tableName of TABLES_TO_IMPORT) {
    try {
      const result = execSync(
        `wrangler d1 execute pterodactyl --command="SELECT COUNT(*) as count FROM ${tableName}" --local`,
        { encoding: 'utf8' }
      );
      
      // Parse the result (wrangler output format may vary)
      const lines = result.split('\n').filter(line => line.trim());
      const dataLine = lines.find(line => line.includes('count'));
      
      if (dataLine) {
        const match = dataLine.match(/(\d+)/);
        stats[tableName] = match ? parseInt(match[1]) : 'Unknown';
      } else {
        stats[tableName] = 'Unknown';
      }
    } catch (error) {
      stats[tableName] = `Error: ${error.message}`;
    }
  }

  console.log('\nImport Summary:');
  Object.entries(stats).forEach(([table, count]) => {
    console.log(`  ${table}: ${count} rows`);
  });

  // Save import summary
  const summaryFile = path.join(MIGRATION_DATA_DIR, 'import-summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    tables: stats
  }, null, 2));
  
  console.log(`\n📊 Import summary saved to: ${summaryFile}`);
}

async function main() {
  console.log('🚀 Starting Pterodactyl data import to D1...\n');

  try {
    checkPrerequisites();

    // Create the database if it doesn't exist
    console.log('🗄️  Setting up D1 database...');
    try {
      execSync('wrangler d1 create pterodactyl', { stdio: 'pipe' });
    } catch (error) {
      // Database might already exist, that's okay
      console.log('  Database already exists or created');
    }

    // Run migrations to create tables
    console.log('📋 Running database migrations...');
    try {
      execSync('npm run db:generate', { stdio: 'inherit' });
      execSync('npm run db:migrate', { stdio: 'inherit' });
    } catch (error) {
      console.log('  Note: Migration commands may need to be run manually');
    }

    // Import data table by table
    console.log('\n📥 Starting data import...');
    for (const tableName of TABLES_TO_IMPORT) {
      await importTable(tableName);
    }

    await verifyImport();

    console.log('\n🎉 Import completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test the serverless API: npm run dev');
    console.log('2. Deploy to production: npm run deploy');
    
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Ensure you have run the export script first');
    console.log('2. Check wrangler authentication: wrangler auth list');
    console.log('3. Verify database name in wrangler.toml');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, importTable, transformRecord };