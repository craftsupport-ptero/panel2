#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

const inputFile = process.env.INPUT_FILE || 'pterodactyl_export.json';
const databaseName = process.env.DB_NAME || 'pterodactyl_panel';

async function importToD1() {
  console.log('🚀 Starting data import to Cloudflare D1...');
  
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Input file ${inputFile} not found`);
    console.log('Please run export-data.js first or specify a valid input file');
    process.exit(1);
  }
  
  try {
    // Read exported data
    const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    console.log('✅ Loaded export data');
    
    // Create temporary SQL file
    const sqlFile = '/tmp/import.sql';
    let sql = '-- Pterodactyl Panel D1 Import\n\n';
    
    // Disable foreign key checks during import
    sql += 'PRAGMA foreign_keys = OFF;\n\n';
    
    // Import users
    console.log('📋 Processing users...');
    if (data.users && data.users.length > 0) {
      for (const user of data.users) {
        sql += `INSERT OR REPLACE INTO users (
          id, uuid, email, password, first_name, last_name, username,
          language, root_admin, use_totp, totp_secret, external_id,
          created_at, updated_at
        ) VALUES (
          ${user.id}, '${user.uuid}', '${user.email.replace(/'/g, "''")}', 
          '${user.password.replace(/'/g, "''")}', ${user.firstName ? `'${user.firstName.replace(/'/g, "''")}'` : 'NULL'},
          ${user.lastName ? `'${user.lastName.replace(/'/g, "''")}'` : 'NULL'}, 
          ${user.username ? `'${user.username.replace(/'/g, "''")}'` : 'NULL'},
          '${user.language}', ${user.rootAdmin ? 1 : 0}, ${user.useTotp ? 1 : 0},
          ${user.totpSecret ? `'${user.totpSecret}'` : 'NULL'},
          ${user.externalId ? `'${user.externalId}'` : 'NULL'},
          ${user.createdAt ? `'${user.createdAt}'` : 'NULL'},
          ${user.updatedAt ? `'${user.updatedAt}'` : 'NULL'}
        );\n`;
      }
      console.log(`✅ Processed ${data.users.length} users`);
    }
    
    // Import locations
    console.log('📋 Processing locations...');
    if (data.locations && data.locations.length > 0) {
      for (const location of data.locations) {
        sql += `INSERT OR REPLACE INTO locations (
          id, short, long, created_at, updated_at
        ) VALUES (
          ${location.id}, '${location.short}', 
          ${location.long ? `'${location.long.replace(/'/g, "''")}'` : 'NULL'},
          ${location.createdAt ? `'${location.createdAt}'` : 'NULL'},
          ${location.updatedAt ? `'${location.updatedAt}'` : 'NULL'}
        );\n`;
      }
      console.log(`✅ Processed ${data.locations.length} locations`);
    }
    
    // Import nodes
    console.log('📋 Processing nodes...');
    if (data.nodes && data.nodes.length > 0) {
      for (const node of data.nodes) {
        sql += `INSERT OR REPLACE INTO nodes (
          id, uuid, name, description, location_id, fqdn, scheme,
          behind_proxy, maintenance_mode, memory, memory_overallocate,
          disk, disk_overallocate, upload_size, daemon_listen,
          daemon_sftp, daemon_base, created_at, updated_at
        ) VALUES (
          ${node.id}, '${node.uuid}', '${node.name.replace(/'/g, "''")}',
          ${node.description ? `'${node.description.replace(/'/g, "''")}'` : 'NULL'},
          ${node.locationId}, '${node.fqdn}', '${node.scheme}',
          ${node.behindProxy ? 1 : 0}, ${node.maintenanceMode ? 1 : 0},
          ${node.memory}, ${node.memoryOverallocate}, ${node.disk},
          ${node.diskOverallocate}, ${node.uploadSize}, ${node.daemonListen},
          ${node.daemonSftp}, '${node.daemonBase}',
          ${node.createdAt ? `'${node.createdAt}'` : 'NULL'},
          ${node.updatedAt ? `'${node.updatedAt}'` : 'NULL'}
        );\n`;
      }
      console.log(`✅ Processed ${data.nodes.length} nodes`);
    }
    
    // Import nests
    console.log('📋 Processing nests...');
    if (data.nests && data.nests.length > 0) {
      for (const nest of data.nests) {
        sql += `INSERT OR REPLACE INTO nests (
          id, uuid, author, name, description, created_at, updated_at
        ) VALUES (
          ${nest.id}, '${nest.uuid}', '${nest.author.replace(/'/g, "''")}',
          '${nest.name.replace(/'/g, "''")}',
          ${nest.description ? `'${nest.description.replace(/'/g, "''")}'` : 'NULL'},
          ${nest.createdAt ? `'${nest.createdAt}'` : 'NULL'},
          ${nest.updatedAt ? `'${nest.updatedAt}'` : 'NULL'}
        );\n`;
      }
      console.log(`✅ Processed ${data.nests.length} nests`);
    }
    
    // Import eggs
    console.log('📋 Processing eggs...');
    if (data.eggs && data.eggs.length > 0) {
      for (const egg of data.eggs) {
        const dockerImages = typeof egg.dockerImages === 'string' ? 
          egg.dockerImages : JSON.stringify(egg.dockerImages);
        
        sql += `INSERT OR REPLACE INTO eggs (
          id, uuid, nest_id, author, name, description, features,
          docker_images, config_files, config_startup, config_stop,
          config_from, startup, script_container, copy_script_from,
          script_entry, script_is_privileged, script_install,
          file_denylist, force_outgoing_ip, created_at, updated_at
        ) VALUES (
          ${egg.id}, '${egg.uuid}', ${egg.nestId}, '${egg.author.replace(/'/g, "''")}',
          '${egg.name.replace(/'/g, "''")}',
          ${egg.description ? `'${egg.description.replace(/'/g, "''")}'` : 'NULL'},
          ${egg.features ? `'${JSON.stringify(egg.features).replace(/'/g, "''")}'` : 'NULL'},
          '${dockerImages.replace(/'/g, "''")}',
          ${egg.configFiles ? `'${JSON.stringify(egg.configFiles).replace(/'/g, "''")}'` : 'NULL'},
          ${egg.configStartup ? `'${JSON.stringify(egg.configStartup).replace(/'/g, "''")}'` : 'NULL'},
          ${egg.configStop ? `'${egg.configStop.replace(/'/g, "''")}'` : 'NULL'},
          ${egg.configFrom || 'NULL'}, 
          ${egg.startup ? `'${egg.startup.replace(/'/g, "''")}'` : 'NULL'},
          '${egg.scriptContainer}', ${egg.copyScriptFrom || 'NULL'},
          '${egg.scriptEntry}', ${egg.scriptIsPrivileged ? 1 : 0},
          ${egg.scriptInstall ? `'${egg.scriptInstall.replace(/'/g, "''")}'` : 'NULL'},
          ${egg.fileDenylist ? `'${JSON.stringify(egg.fileDenylist).replace(/'/g, "''")}'` : 'NULL'},
          ${egg.forceOutgoingIp ? 1 : 0},
          ${egg.createdAt ? `'${egg.createdAt}'` : 'NULL'},
          ${egg.updatedAt ? `'${egg.updatedAt}'` : 'NULL'}
        );\n`;
      }
      console.log(`✅ Processed ${data.eggs.length} eggs`);
    }
    
    // Import allocations
    console.log('📋 Processing allocations...');
    if (data.allocations && data.allocations.length > 0) {
      for (const allocation of data.allocations) {
        sql += `INSERT OR REPLACE INTO allocations (
          id, node_id, ip, ip_alias, port, notes, server_id,
          created_at, updated_at
        ) VALUES (
          ${allocation.id}, ${allocation.nodeId}, '${allocation.ip}',
          ${allocation.ipAlias ? `'${allocation.ipAlias}'` : 'NULL'},
          ${allocation.port}, ${allocation.notes ? `'${allocation.notes.replace(/'/g, "''")}'` : 'NULL'},
          ${allocation.serverId || 'NULL'},
          ${allocation.createdAt ? `'${allocation.createdAt}'` : 'NULL'},
          ${allocation.updatedAt ? `'${allocation.updatedAt}'` : 'NULL'}
        );\n`;
      }
      console.log(`✅ Processed ${data.allocations.length} allocations`);
    }
    
    // Import servers
    console.log('📋 Processing servers...');
    if (data.servers && data.servers.length > 0) {
      for (const server of data.servers) {
        sql += `INSERT OR REPLACE INTO servers (
          id, uuid, uuid_short, name, description, status, skip_scripts,
          suspended, owner_id, memory, swap, disk, io, cpu, threads,
          oom_disabled, allocation_id, nest_id, egg_id, startup, image,
          installed, installed_at, database_limit, allocation_limit,
          backup_limit, external_id, created_at, updated_at
        ) VALUES (
          ${server.id}, '${server.uuid}', '${server.uuidShort}',
          '${server.name.replace(/'/g, "''")}',
          ${server.description ? `'${server.description.replace(/'/g, "''")}'` : 'NULL'},
          '${server.status}', ${server.skipScripts ? 1 : 0},
          ${server.suspended ? 1 : 0}, ${server.ownerId}, ${server.memory},
          ${server.swap}, ${server.disk}, ${server.io}, ${server.cpu},
          ${server.threads ? `'${server.threads}'` : 'NULL'},
          ${server.oomDisabled ? 1 : 0}, ${server.allocationId || 'NULL'},
          ${server.nestId}, ${server.eggId}, '${server.startup.replace(/'/g, "''")}',
          '${server.image}', ${server.installed ? 1 : 0},
          ${server.installedAt ? `'${server.installedAt}'` : 'NULL'},
          ${server.databaseLimit}, ${server.allocationLimit || 'NULL'},
          ${server.backupLimit}, ${server.externalId ? `'${server.externalId}'` : 'NULL'},
          ${server.createdAt ? `'${server.createdAt}'` : 'NULL'},
          ${server.updatedAt ? `'${server.updatedAt}'` : 'NULL'}
        );\n`;
      }
      console.log(`✅ Processed ${data.servers.length} servers`);
    }
    
    // Re-enable foreign key checks
    sql += '\nPRAGMA foreign_keys = ON;\n';
    
    // Write SQL file
    fs.writeFileSync(sqlFile, sql);
    console.log('✅ Generated SQL import file');
    
    // Execute import
    console.log('📦 Importing data to D1...');
    execSync(`wrangler d1 execute ${databaseName} --file=${sqlFile}`, { 
      stdio: 'inherit' 
    });
    
    // Clean up
    fs.unlinkSync(sqlFile);
    
    console.log('🎉 Import completed successfully!');
    
    // Summary
    console.log('\n📊 Import Summary:');
    if (data.users) console.log(`Users: ${data.users.length}`);
    if (data.locations) console.log(`Locations: ${data.locations.length}`);
    if (data.nodes) console.log(`Nodes: ${data.nodes.length}`);
    if (data.nests) console.log(`Nests: ${data.nests.length}`);
    if (data.eggs) console.log(`Eggs: ${data.eggs.length}`);
    if (data.servers) console.log(`Servers: ${data.servers.length}`);
    if (data.allocations) console.log(`Allocations: ${data.allocations.length}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run import
if (require.main === module) {
  importToD1();
}

module.exports = { importToD1 };