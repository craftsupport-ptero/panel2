import { sql } from 'drizzle-orm';
import {
  sqliteTable,
  text,
  integer,
  blob,
  primaryKey,
  uniqueIndex,
  index,
} from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable(
  'users',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid', { length: 36 }).notNull().unique(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    rememberToken: text('remember_token'),
    language: text('language', { length: 5 }).default('en'),
    rootAdmin: integer('root_admin', { mode: 'boolean' }).default(false),
    useTotp: integer('use_totp', { mode: 'boolean' }).default(false),
    totpSecret: text('totp_secret', { length: 16 }),
    firstName: text('first_name'),
    lastName: text('last_name'),
    username: text('username').unique(),
    externalId: text('external_id').unique(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_unique').on(table.email),
    uuidIdx: uniqueIndex('users_uuid_unique').on(table.uuid),
  })
);

// Nodes table
export const nodes = sqliteTable(
  'nodes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid', { length: 36 }).notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    locationId: integer('location_id').notNull(),
    fqdn: text('fqdn').notNull(),
    scheme: text('scheme').default('https'),
    behindProxy: integer('behind_proxy', { mode: 'boolean' }).default(false),
    maintenanceMode: integer('maintenance_mode', { mode: 'boolean' }).default(false),
    memory: integer('memory').notNull(),
    memoryOverallocate: integer('memory_overallocate').default(0),
    disk: integer('disk').notNull(),
    diskOverallocate: integer('disk_overallocate').default(0),
    uploadSize: integer('upload_size').default(100),
    daemonListen: integer('daemon_listen').default(8080),
    daemonSftp: integer('daemon_sftp').default(2022),
    daemonBase: text('daemon_base').default('/var/lib/pterodactyl/volumes'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    uuidIdx: uniqueIndex('nodes_uuid_unique').on(table.uuid),
    locationIdx: index('nodes_location_id_index').on(table.locationId),
  })
);

// Locations table
export const locations = sqliteTable(
  'locations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    short: text('short').notNull().unique(),
    long: text('long'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    shortIdx: uniqueIndex('locations_short_unique').on(table.short),
  })
);

// Servers table
export const servers = sqliteTable(
  'servers',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid', { length: 36 }).notNull().unique(),
    uuidShort: text('uuid_short', { length: 8 }).notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    status: text('status').default('installing'),
    skipScripts: integer('skip_scripts', { mode: 'boolean' }).default(false),
    suspended: integer('suspended', { mode: 'boolean' }).default(false),
    ownerId: integer('owner_id').notNull(),
    memory: integer('memory').notNull(),
    swap: integer('swap').notNull(),
    disk: integer('disk').notNull(),
    io: integer('io').notNull(),
    cpu: integer('cpu').notNull(),
    threads: text('threads'),
    oomDisabled: integer('oom_disabled', { mode: 'boolean' }).default(false),
    allocationId: integer('allocation_id'),
    nestId: integer('nest_id').notNull(),
    eggId: integer('egg_id').notNull(),
    startup: text('startup').notNull(),
    image: text('image').notNull(),
    installed: integer('installed', { mode: 'boolean' }).default(false),
    installedAt: integer('installed_at', { mode: 'timestamp' }),
    databaseLimit: integer('database_limit').default(0),
    allocationLimit: integer('allocation_limit'),
    backupLimit: integer('backup_limit').default(0),
    externalId: text('external_id').unique(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    uuidIdx: uniqueIndex('servers_uuid_unique').on(table.uuid),
    uuidShortIdx: uniqueIndex('servers_uuid_short_unique').on(table.uuidShort),
    ownerIdx: index('servers_owner_id_index').on(table.ownerId),
    nestIdx: index('servers_nest_id_index').on(table.nestId),
    eggIdx: index('servers_egg_id_index').on(table.eggId),
  })
);

// Allocations table
export const allocations = sqliteTable(
  'allocations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nodeId: integer('node_id').notNull(),
    ip: text('ip').notNull(),
    ipAlias: text('ip_alias'),
    port: integer('port').notNull(),
    notes: text('notes'),
    serverId: integer('server_id'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    nodeIdx: index('allocations_node_id_index').on(table.nodeId),
    serverIdx: index('allocations_server_id_index').on(table.serverId),
    uniqueAllocation: uniqueIndex('allocations_node_ip_port_unique').on(table.nodeId, table.ip, table.port),
  })
);

// Nests table
export const nests = sqliteTable(
  'nests',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid', { length: 36 }).notNull().unique(),
    author: text('author').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    uuidIdx: uniqueIndex('nests_uuid_unique').on(table.uuid),
  })
);

// Eggs table
export const eggs = sqliteTable(
  'eggs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid: text('uuid', { length: 36 }).notNull().unique(),
    nestId: integer('nest_id').notNull(),
    author: text('author').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    features: text('features', { mode: 'json' }),
    dockerImages: text('docker_images', { mode: 'json' }).notNull(),
    configFiles: text('config_files', { mode: 'json' }),
    configStartup: text('config_startup', { mode: 'json' }),
    configStop: text('config_stop'),
    configFrom: integer('config_from'),
    startup: text('startup'),
    scriptContainer: text('script_container').default('alpine:3.4'),
    copyScriptFrom: integer('copy_script_from'),
    scriptEntry: text('script_entry').default('ash'),
    scriptIsPrivileged: integer('script_is_privileged', { mode: 'boolean' }).default(true),
    scriptInstall: text('script_install'),
    fileDenylist: text('file_denylist', { mode: 'json' }),
    forceOutgoingIp: integer('force_outgoing_ip', { mode: 'boolean' }).default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    uuidIdx: uniqueIndex('eggs_uuid_unique').on(table.uuid),
    nestIdx: index('eggs_nest_id_index').on(table.nestId),
  })
);

// API Keys table
export const apiKeys = sqliteTable(
  'api_keys',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id').notNull(),
    keyType: integer('key_type').notNull(),
    identifier: text('identifier', { length: 16 }).notNull().unique(),
    token: text('token').notNull(),
    allowedIps: text('allowed_ips', { mode: 'json' }),
    memo: text('memo'),
    lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
    expiresAt: integer('expires_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    userIdx: index('api_keys_user_id_index').on(table.userId),
    identifierIdx: uniqueIndex('api_keys_identifier_unique').on(table.identifier),
  })
);

// Databases table
export const databases = sqliteTable(
  'databases',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    serverId: integer('server_id').notNull(),
    databaseHostId: integer('database_host_id').notNull(),
    database: text('database').notNull(),
    username: text('username').notNull(),
    remote: text('remote').default('%'),
    password: text('password').notNull(),
    maxConnections: integer('max_connections').default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    serverIdx: index('databases_server_id_index').on(table.serverId),
    hostIdx: index('databases_database_host_id_index').on(table.databaseHostId),
    uniqueDb: uniqueIndex('databases_server_database_unique').on(table.serverId, table.database),
  })
);

// Database Hosts table
export const databaseHosts = sqliteTable(
  'database_hosts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    host: text('host').notNull(),
    port: integer('port').notNull(),
    username: text('username').notNull(),
    password: text('password').notNull(),
    maxDatabases: integer('max_databases'),
    nodeId: integer('node_id'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    nodeIdx: index('database_hosts_node_id_index').on(table.nodeId),
  })
);

// Backups table
export const backups = sqliteTable(
  'backups',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    serverId: integer('server_id').notNull(),
    uuid: text('uuid', { length: 36 }).notNull().unique(),
    name: text('name').notNull(),
    ignoredFiles: text('ignored_files', { mode: 'json' }).notNull(),
    disk: text('disk').notNull(),
    sha256Hash: text('sha256_hash'),
    bytes: integer('bytes').default(0),
    uploadId: text('upload_id'),
    successful: integer('successful', { mode: 'boolean' }).default(false),
    locked: integer('locked', { mode: 'boolean' }).default(false),
    checksum: text('checksum'),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    serverIdx: index('backups_server_id_index').on(table.serverId),
    uuidIdx: uniqueIndex('backups_uuid_unique').on(table.uuid),
  })
);

// Sessions table for JWT session tracking
export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: integer('user_id'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    payload: text('payload').notNull(),
    lastActivity: integer('last_activity', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    userIdx: index('sessions_user_id_index').on(table.userId),
    lastActivityIdx: index('sessions_last_activity_index').on(table.lastActivity),
  })
);

// Activity logs table
export const activityLogs = sqliteTable(
  'activity_logs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    batch: text('batch', { length: 36 }),
    event: text('event').notNull(),
    ip: text('ip').notNull(),
    description: text('description'),
    actorId: integer('actor_id'),
    actorType: text('actor_type'),
    apiKeyId: integer('api_key_id'),
    subjectId: integer('subject_id'),
    subjectType: text('subject_type'),
    properties: text('properties', { mode: 'json' }).notNull(),
    timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    actorIdx: index('activity_logs_actor_index').on(table.actorType, table.actorId),
    subjectIdx: index('activity_logs_subject_index').on(table.subjectType, table.subjectId),
    eventIdx: index('activity_logs_event_index').on(table.event),
  })
);

// Export types for use in the application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Server = typeof servers.$inferSelect;
export type NewServer = typeof servers.$inferInsert;
export type Node = typeof nodes.$inferSelect;
export type NewNode = typeof nodes.$inferInsert;
export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;
export type Allocation = typeof allocations.$inferSelect;
export type NewAllocation = typeof allocations.$inferInsert;
export type Database = typeof databases.$inferSelect;
export type NewDatabase = typeof databases.$inferInsert;
export type Backup = typeof backups.$inferSelect;
export type NewBackup = typeof backups.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;