#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'panel',
};

const outputFile = process.env.OUTPUT_FILE || 'pterodactyl_export.json';

async function exportData() {
  console.log('🚀 Starting Pterodactyl Panel data export...');
  
  let connection;
  
  try {
    // Connect to MySQL
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to MySQL database');
    
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        source: config.database,
        version: '1.0.0',
      },
      users: [],
      locations: [],
      nodes: [],
      nests: [],
      eggs: [],
      servers: [],
      allocations: [],
      databaseHosts: [],
      databases: [],
      backups: [],
      apiKeys: [],
    };
    
    // Export users
    console.log('📋 Exporting users...');
    const [users] = await connection.execute('SELECT * FROM users ORDER BY id');
    exportData.users = users.map(user => ({
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      password: user.password,
      firstName: user.name_first,
      lastName: user.name_last,
      username: user.username,
      language: user.language,
      rootAdmin: user.root_admin === 1,
      useTotp: user.use_totp === 1,
      totpSecret: user.totp_secret,
      externalId: user.external_id,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }));
    console.log(`✅ Exported ${exportData.users.length} users`);
    
    // Export locations
    console.log('📋 Exporting locations...');
    const [locations] = await connection.execute('SELECT * FROM locations ORDER BY id');
    exportData.locations = locations.map(location => ({
      id: location.id,
      short: location.short,
      long: location.long,
      createdAt: location.created_at,
      updatedAt: location.updated_at,
    }));
    console.log(`✅ Exported ${exportData.locations.length} locations`);
    
    // Export nodes
    console.log('📋 Exporting nodes...');
    const [nodes] = await connection.execute('SELECT * FROM nodes ORDER BY id');
    exportData.nodes = nodes.map(node => ({
      id: node.id,
      uuid: node.uuid,
      name: node.name,
      description: node.description,
      locationId: node.location_id,
      fqdn: node.fqdn,
      scheme: node.scheme,
      behindProxy: node.behind_proxy === 1,
      maintenanceMode: node.maintenance_mode === 1,
      memory: node.memory,
      memoryOverallocate: node.memory_overallocate,
      disk: node.disk,
      diskOverallocate: node.disk_overallocate,
      uploadSize: node.upload_size,
      daemonListen: node.daemon_listen,
      daemonSftp: node.daemon_sftp,
      daemonBase: node.daemon_base,
      createdAt: node.created_at,
      updatedAt: node.updated_at,
    }));
    console.log(`✅ Exported ${exportData.nodes.length} nodes`);
    
    // Export nests (formerly services)
    console.log('📋 Exporting nests...');
    const [nests] = await connection.execute('SELECT * FROM nests ORDER BY id');
    exportData.nests = nests.map(nest => ({
      id: nest.id,
      uuid: nest.uuid,
      author: nest.author,
      name: nest.name,
      description: nest.description,
      createdAt: nest.created_at,
      updatedAt: nest.updated_at,
    }));
    console.log(`✅ Exported ${exportData.nests.length} nests`);
    
    // Export eggs (formerly service options)
    console.log('📋 Exporting eggs...');
    const [eggs] = await connection.execute('SELECT * FROM eggs ORDER BY id');
    exportData.eggs = eggs.map(egg => ({
      id: egg.id,
      uuid: egg.uuid,
      nestId: egg.nest_id,
      author: egg.author,
      name: egg.name,
      description: egg.description,
      features: egg.features,
      dockerImages: egg.docker_images,
      configFiles: egg.config_files,
      configStartup: egg.config_startup,
      configStop: egg.config_stop,
      configFrom: egg.config_from,
      startup: egg.startup,
      scriptContainer: egg.script_container,
      copyScriptFrom: egg.copy_script_from,
      scriptEntry: egg.script_entry,
      scriptIsPrivileged: egg.script_is_privileged === 1,
      scriptInstall: egg.script_install,
      fileDenylist: egg.file_denylist,
      forceOutgoingIp: egg.force_outgoing_ip === 1,
      createdAt: egg.created_at,
      updatedAt: egg.updated_at,
    }));
    console.log(`✅ Exported ${exportData.eggs.length} eggs`);
    
    // Export servers
    console.log('📋 Exporting servers...');
    const [servers] = await connection.execute('SELECT * FROM servers ORDER BY id');
    exportData.servers = servers.map(server => ({
      id: server.id,
      uuid: server.uuid,
      uuidShort: server.uuidShort,
      name: server.name,
      description: server.description,
      status: server.status,
      skipScripts: server.skip_scripts === 1,
      suspended: server.suspended === 1,
      ownerId: server.owner_id,
      memory: server.memory,
      swap: server.swap,
      disk: server.disk,
      io: server.io,
      cpu: server.cpu,
      threads: server.threads,
      oomDisabled: server.oom_disabled === 1,
      allocationId: server.allocation_id,
      nestId: server.nest_id,
      eggId: server.egg_id,
      startup: server.startup,
      image: server.image,
      installed: server.installed === 1,
      installedAt: server.installed_at,
      databaseLimit: server.database_limit,
      allocationLimit: server.allocation_limit,
      backupLimit: server.backup_limit,
      externalId: server.external_id,
      createdAt: server.created_at,
      updatedAt: server.updated_at,
    }));
    console.log(`✅ Exported ${exportData.servers.length} servers`);
    
    // Export allocations
    console.log('📋 Exporting allocations...');
    const [allocations] = await connection.execute('SELECT * FROM allocations ORDER BY id');
    exportData.allocations = allocations.map(allocation => ({
      id: allocation.id,
      nodeId: allocation.node_id,
      ip: allocation.ip,
      ipAlias: allocation.ip_alias,
      port: allocation.port,
      notes: allocation.notes,
      serverId: allocation.server_id,
      createdAt: allocation.created_at,
      updatedAt: allocation.updated_at,
    }));
    console.log(`✅ Exported ${exportData.allocations.length} allocations`);
    
    // Export database hosts
    console.log('📋 Exporting database hosts...');
    const [dbHosts] = await connection.execute('SELECT * FROM database_hosts ORDER BY id');
    exportData.databaseHosts = dbHosts.map(host => ({
      id: host.id,
      name: host.name,
      host: host.host,
      port: host.port,
      username: host.username,
      password: host.password,
      maxDatabases: host.max_databases,
      nodeId: host.node_id,
      createdAt: host.created_at,
      updatedAt: host.updated_at,
    }));
    console.log(`✅ Exported ${exportData.databaseHosts.length} database hosts`);
    
    // Export databases
    console.log('📋 Exporting databases...');
    const [databases] = await connection.execute('SELECT * FROM databases ORDER BY id');
    exportData.databases = databases.map(db => ({
      id: db.id,
      serverId: db.server_id,
      databaseHostId: db.database_host_id,
      database: db.database,
      username: db.username,
      remote: db.remote,
      password: db.password,
      maxConnections: db.max_connections,
      createdAt: db.created_at,
      updatedAt: db.updated_at,
    }));
    console.log(`✅ Exported ${exportData.databases.length} databases`);
    
    // Export backups
    console.log('📋 Exporting backups...');
    const [backups] = await connection.execute('SELECT * FROM backups ORDER BY id');
    exportData.backups = backups.map(backup => ({
      id: backup.id,
      serverId: backup.server_id,
      uuid: backup.uuid,
      name: backup.name,
      ignoredFiles: backup.ignored_files,
      disk: backup.disk,
      sha256Hash: backup.sha256_hash,
      bytes: backup.bytes,
      uploadId: backup.upload_id,
      successful: backup.successful === 1,
      locked: backup.locked === 1,
      checksum: backup.checksum,
      completedAt: backup.completed_at,
      createdAt: backup.created_at,
      updatedAt: backup.updated_at,
    }));
    console.log(`✅ Exported ${exportData.backups.length} backups`);
    
    // Export API keys
    console.log('📋 Exporting API keys...');
    const [apiKeys] = await connection.execute('SELECT * FROM api_keys ORDER BY id');
    exportData.apiKeys = apiKeys.map(key => ({
      id: key.id,
      userId: key.user_id,
      keyType: key.key_type,
      identifier: key.identifier,
      token: key.token,
      allowedIps: key.allowed_ips,
      memo: key.memo,
      lastUsedAt: key.last_used_at,
      expiresAt: key.expires_at,
      createdAt: key.created_at,
      updatedAt: key.updated_at,
    }));
    console.log(`✅ Exported ${exportData.apiKeys.length} API keys`);
    
    // Write to file
    fs.writeFileSync(outputFile, JSON.stringify(exportData, null, 2));
    console.log(`✅ Data exported to ${outputFile}`);
    
    // Summary
    console.log('\n📊 Export Summary:');
    console.log(`Users: ${exportData.users.length}`);
    console.log(`Locations: ${exportData.locations.length}`);
    console.log(`Nodes: ${exportData.nodes.length}`);
    console.log(`Nests: ${exportData.nests.length}`);
    console.log(`Eggs: ${exportData.eggs.length}`);
    console.log(`Servers: ${exportData.servers.length}`);
    console.log(`Allocations: ${exportData.allocations.length}`);
    console.log(`Database Hosts: ${exportData.databaseHosts.length}`);
    console.log(`Databases: ${exportData.databases.length}`);
    console.log(`Backups: ${exportData.backups.length}`);
    console.log(`API Keys: ${exportData.apiKeys.length}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run export
if (require.main === module) {
  exportData().then(() => {
    console.log('🎉 Export completed successfully!');
    process.exit(0);
  });
}

module.exports = { exportData };