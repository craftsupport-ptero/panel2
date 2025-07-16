import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').notNull().unique(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  emailVerifiedAt: text('email_verified_at'),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  password: text('password').notNull(),
  language: text('language').notNull().default('en'),
  rootAdmin: integer('root_admin', { mode: 'boolean' }).notNull().default(false),
  useTotp: integer('use_totp', { mode: 'boolean' }).notNull().default(false),
  totpSecret: text('totp_secret'),
  totpAuthenticatedAt: text('totp_authenticated_at'),
  gravatar: integer('gravatar', { mode: 'boolean' }).notNull().default(true),
  externalId: text('external_id'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// Nodes table
export const nodes = sqliteTable('nodes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').notNull().unique(),
  public: integer('public', { mode: 'boolean' }).notNull().default(true),
  name: text('name').notNull(),
  description: text('description'),
  locationId: integer('location_id').notNull(),
  fqdn: text('fqdn').notNull(),
  scheme: text('scheme').notNull().default('https'),
  behindProxy: integer('behind_proxy', { mode: 'boolean' }).notNull().default(false),
  maintenanceMode: integer('maintenance_mode', { mode: 'boolean' }).notNull().default(false),
  memory: integer('memory').notNull(),
  memoryOverallocate: integer('memory_overallocate').notNull().default(0),
  disk: integer('disk').notNull(),
  diskOverallocate: integer('disk_overallocate').notNull().default(0),
  uploadSize: integer('upload_size').notNull().default(100),
  daemonListenPort: integer('daemon_listen').notNull().default(8080),
  daemonSftpPort: integer('daemon_sftp').notNull().default(2022),
  daemonBase: text('daemon_base').notNull().default('/var/lib/pterodactyl/volumes'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// Locations table
export const locations = sqliteTable('locations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  short: text('short').notNull().unique(),
  long: text('long'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// Servers table
export const servers = sqliteTable('servers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  externalId: text('external_id'),
  uuid: text('uuid').notNull().unique(),
  uuidShort: text('uuid_short').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status'),
  skipScripts: integer('skip_scripts', { mode: 'boolean' }).notNull().default(false),
  suspended: integer('suspended', { mode: 'boolean' }).notNull().default(false),
  ownerId: integer('owner_id').notNull(),
  memory: integer('memory').notNull(),
  swap: integer('swap').notNull(),
  disk: integer('disk').notNull(),
  io: integer('io').notNull(),
  cpu: integer('cpu').notNull(),
  threads: text('threads'),
  oomDisabled: integer('oom_disabled', { mode: 'boolean' }).notNull().default(true),
  allocationId: integer('allocation_id'),
  nestId: integer('nest_id').notNull(),
  eggId: integer('egg_id').notNull(),
  startup: text('startup').notNull(),
  image: text('image').notNull(),
  nodeId: integer('node_id').notNull(),
  allocationLimit: integer('allocation_limit'),
  databaseLimit: integer('database_limit').notNull().default(0),
  backupLimit: integer('backup_limit').notNull().default(0),
  installedAt: text('installed_at'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// Allocations table
export const allocations = sqliteTable('allocations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nodeId: integer('node_id').notNull(),
  ip: text('ip').notNull(),
  ipAlias: text('ip_alias'),
  port: integer('port').notNull(),
  serverId: integer('server_id'),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// Nests table
export const nests = sqliteTable('nests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').notNull().unique(),
  author: text('author').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// Eggs table
export const eggs = sqliteTable('eggs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').notNull().unique(),
  nestId: integer('nest_id').notNull(),
  author: text('author').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  features: text('features'), // JSON
  dockerImages: text('docker_images').notNull(), // JSON
  config: text('config'), // JSON
  startup: text('startup').notNull(),
  configStartup: text('config_startup'), // JSON
  configFiles: text('config_files'), // JSON
  configLogs: text('config_logs'), // JSON
  configStop: text('config_stop'),
  scriptContainer: text('script_container').notNull(),
  copyScriptFrom: integer('copy_script_from'),
  scriptEntry: text('script_entry').notNull(),
  scriptIsPrivileged: integer('script_is_privileged', { mode: 'boolean' }).notNull().default(true),
  scriptInstall: text('script_install'),
  forceOutgoingIp: integer('force_outgoing_ip', { mode: 'boolean' }).notNull().default(false),
  fileDenylist: text('file_denylist'), // JSON
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// Database hosts table
export const databaseHosts = sqliteTable('database_hosts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  host: text('host').notNull(),
  port: integer('port').notNull(),
  username: text('username').notNull(),
  password: text('password'),
  maxDatabases: integer('max_databases'),
  nodeId: integer('node_id'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// Databases table
export const databases = sqliteTable('databases', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  serverId: integer('server_id').notNull(),
  databaseHostId: integer('database_host_id').notNull(),
  database: text('database').notNull(),
  username: text('username').notNull(),
  remoteAccessHost: text('remote').notNull().default('%'),
  password: text('password'),
  maxConnections: integer('max_connections').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// API keys table
export const apiKeys = sqliteTable('api_keys', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  keyType: integer('key_type').notNull().default(0),
  identifier: text('identifier').notNull().unique(),
  token: text('token').notNull(),
  allowedIps: text('allowed_ips'), // JSON
  memo: text('memo'),
  lastUsedAt: text('last_used_at'),
  expiresAt: text('expires_at'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// User SSH keys table
export const userSshKeys = sqliteTable('user_ssh_keys', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  name: text('name').notNull(),
  fingerprint: text('fingerprint').notNull(),
  publicKey: text('public_key').notNull(),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// Backups table
export const backups = sqliteTable('backups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  serverId: integer('server_id').notNull(),
  uuid: text('uuid').notNull().unique(),
  isSuccessful: integer('is_successful', { mode: 'boolean' }).notNull().default(false),
  isLocked: integer('is_locked', { mode: 'boolean' }).notNull().default(false),
  name: text('name').notNull(),
  ignoredFiles: text('ignored_files').notNull(),
  disk: text('disk').notNull(),
  checksum: text('checksum'),
  bytes: integer('bytes').notNull().default(0),
  uploadId: text('upload_id'),
  completedAt: text('completed_at'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// Activity logs table
export const activityLogs = sqliteTable('activity_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  batch: text('batch'),
  event: text('event').notNull(),
  ip: text('ip').notNull(),
  description: text('description'),
  actorId: integer('actor_id'),
  actorType: text('actor_type'),
  properties: text('properties'), // JSON
  timestamp: text('timestamp').notNull().default(sql`(datetime('now'))`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Server = typeof servers.$inferSelect;
export type NewServer = typeof servers.$inferInsert;
export type Node = typeof nodes.$inferSelect;
export type NewNode = typeof nodes.$inferInsert;
export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;