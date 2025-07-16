import { sql } from 'drizzle-orm';
import { 
  sqliteTable, 
  integer, 
  text, 
  primaryKey,
  uniqueIndex,
  index
} from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid', { length: 36 }).notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  rememberToken: text('remember_token'),
  language: text('language', { length: 5 }).notNull().default('en'),
  rootAdmin: integer('root_admin').notNull().default(0),
  useTotp: integer('use_totp').notNull().default(0),
  totpSecret: text('totp_secret', { length: 16 }),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  // Additional fields from later migrations
  firstName: text('first_name'),
  lastName: text('last_name'),
  externalId: text('external_id'),
}, (table) => ({
  emailIdx: uniqueIndex('users_email_unique').on(table.email),
  uuidIdx: uniqueIndex('users_uuid_unique').on(table.uuid),
  externalIdIdx: index('users_external_id_idx').on(table.externalId),
}));

// Locations table
export const locations = sqliteTable('locations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  short: text('short').notNull().unique(),
  long: text('long').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  shortIdx: uniqueIndex('locations_short_unique').on(table.short),
}));

// Nodes table
export const nodes = sqliteTable('nodes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid', { length: 36 }).notNull().unique(),
  public: integer('public').notNull().default(1),
  name: text('name').notNull(),
  locationId: integer('location_id').notNull().references(() => locations.id),
  fqdn: text('fqdn').notNull(),
  scheme: text('scheme').notNull().default('https'),
  behindProxy: integer('behind_proxy').notNull().default(0),
  publicKey: text('public_key'),
  memory: integer('memory').notNull(),
  memoryOverallocate: integer('memory_overallocate').default(0),
  disk: integer('disk').notNull(),
  diskOverallocate: integer('disk_overallocate').default(0),
  uploadSize: integer('upload_size').notNull().default(100),
  daemonListen: integer('daemon_listen').notNull().default(8080),
  daemonSftp: integer('daemon_sftp').notNull().default(2022),
  daemonBase: text('daemon_base').notNull().default('/var/lib/pterodactyl/volumes'),
  maintenance: integer('maintenance').notNull().default(0),
  description: text('description'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  uuidIdx: uniqueIndex('nodes_uuid_unique').on(table.uuid),
  fqdnIdx: index('nodes_fqdn_idx').on(table.fqdn),
  locationIdx: index('nodes_location_idx').on(table.locationId),
}));

// Servers table
export const servers = sqliteTable('servers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  externalId: text('external_id'),
  uuid: text('uuid', { length: 36 }).notNull().unique(),
  uuidShort: text('uuid_short', { length: 8 }).notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull().default('installing'),
  skipScripts: integer('skip_scripts').notNull().default(0),
  suspended: integer('suspended').notNull().default(0),
  ownerId: integer('owner_id').notNull().references(() => users.id),
  memory: integer('memory').notNull(),
  swap: integer('swap').notNull().default(0),
  disk: integer('disk').notNull(),
  io: integer('io').notNull().default(500),
  cpu: integer('cpu').notNull().default(0),
  threads: text('threads'),
  oomDisabled: integer('oom_disabled').notNull().default(0),
  allocationId: integer('allocation_id'),
  nestId: integer('nest_id').notNull(),
  eggId: integer('egg_id').notNull(),
  startup: text('startup').notNull(),
  image: text('image').notNull(),
  installedAt: text('installed_at'),
  nodeId: integer('node_id').notNull().references(() => nodes.id),
  allocationLimit: integer('allocation_limit'),
  databaseLimit: integer('database_limit').notNull().default(0),
  backupLimit: integer('backup_limit').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  uuidIdx: uniqueIndex('servers_uuid_unique').on(table.uuid),
  uuidShortIdx: uniqueIndex('servers_uuid_short_unique').on(table.uuidShort),
  ownerIdx: index('servers_owner_idx').on(table.ownerId),
  nodeIdx: index('servers_node_idx').on(table.nodeId),
  externalIdIdx: index('servers_external_id_idx').on(table.externalId),
}));

// Databases table
export const databases = sqliteTable('databases', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  serverId: integer('server_id').notNull().references(() => servers.id),
  databaseHostId: integer('database_host_id').notNull(),
  database: text('database').notNull(),
  username: text('username').notNull(),
  remote: text('remote').notNull().default('%'),
  password: text('password').notNull(),
  maxConnections: integer('max_connections'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  serverDatabaseIdx: uniqueIndex('databases_server_database_unique').on(table.serverId, table.database),
  serverIdx: index('databases_server_idx').on(table.serverId),
}));

// API Keys table
export const apiKeys = sqliteTable('api_keys', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  keyType: integer('key_type').notNull().default(0), // 0 = account, 1 = application
  identifier: text('identifier', { length: 16 }).notNull().unique(),
  token: text('token').notNull(),
  allowedIps: text('allowed_ips'), // JSON array
  memo: text('memo'),
  lastUsedAt: text('last_used_at'),
  expiresAt: text('expires_at'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  identifierIdx: uniqueIndex('api_keys_identifier_unique').on(table.identifier),
  userIdx: index('api_keys_user_idx').on(table.userId),
  tokenIdx: index('api_keys_token_idx').on(table.token),
}));

// Allocations table (for server IP/port assignments)
export const allocations = sqliteTable('allocations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nodeId: integer('node_id').notNull().references(() => nodes.id),
  ip: text('ip').notNull(),
  ipAlias: text('ip_alias'),
  port: integer('port').notNull(),
  serverId: integer('server_id').references(() => servers.id),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  nodeIpPortIdx: uniqueIndex('allocations_node_ip_port_unique').on(table.nodeId, table.ip, table.port),
  serverIdx: index('allocations_server_idx').on(table.serverId),
  nodeIdx: index('allocations_node_idx').on(table.nodeId),
}));

// User sessions table
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  ipAddress: text('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  payload: text('payload').notNull(),
  lastActivity: integer('last_activity').notNull(),
});

// Activity logs table (for audit trails)
export const activityLogs = sqliteTable('activity_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  batch: text('batch', { length: 36 }),
  event: text('event').notNull(),
  ip: text('ip').notNull(),
  description: text('description'),
  actorId: integer('actor_id').references(() => users.id),
  actorType: text('actor_type'),
  properties: text('properties'), // JSON
  timestamp: text('timestamp').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  eventIdx: index('activity_logs_event_idx').on(table.event),
  actorIdx: index('activity_logs_actor_idx').on(table.actorId),
  ipIdx: index('activity_logs_ip_idx').on(table.ip),
}));

// Export all tables for use in relations
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;
export type Node = typeof nodes.$inferSelect;
export type NewNode = typeof nodes.$inferInsert;
export type Server = typeof servers.$inferSelect;
export type NewServer = typeof servers.$inferInsert;
export type Database = typeof databases.$inferSelect;
export type NewDatabase = typeof databases.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
export type Allocation = typeof allocations.$inferSelect;
export type NewAllocation = typeof allocations.$inferInsert;