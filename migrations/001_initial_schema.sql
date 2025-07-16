-- Initial schema migration for Pterodactyl Panel serverless architecture
-- Creates all core tables for D1 database

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT(36) NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    remember_token TEXT,
    language TEXT(5) NOT NULL DEFAULT 'en',
    root_admin INTEGER NOT NULL DEFAULT 0,
    use_totp INTEGER NOT NULL DEFAULT 0,
    totp_secret TEXT(16),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    first_name TEXT,
    last_name TEXT,
    external_id TEXT
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short TEXT NOT NULL UNIQUE,
    long TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Nodes table
CREATE TABLE IF NOT EXISTS nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT(36) NOT NULL UNIQUE,
    public INTEGER NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    location_id INTEGER NOT NULL REFERENCES locations(id),
    fqdn TEXT NOT NULL,
    scheme TEXT NOT NULL DEFAULT 'https',
    behind_proxy INTEGER NOT NULL DEFAULT 0,
    public_key TEXT,
    memory INTEGER NOT NULL,
    memory_overallocate INTEGER DEFAULT 0,
    disk INTEGER NOT NULL,
    disk_overallocate INTEGER DEFAULT 0,
    upload_size INTEGER NOT NULL DEFAULT 100,
    daemon_listen INTEGER NOT NULL DEFAULT 8080,
    daemon_sftp INTEGER NOT NULL DEFAULT 2022,
    daemon_base TEXT NOT NULL DEFAULT '/var/lib/pterodactyl/volumes',
    maintenance INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Servers table
CREATE TABLE IF NOT EXISTS servers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id TEXT,
    uuid TEXT(36) NOT NULL UNIQUE,
    uuid_short TEXT(8) NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'installing',
    skip_scripts INTEGER NOT NULL DEFAULT 0,
    suspended INTEGER NOT NULL DEFAULT 0,
    owner_id INTEGER NOT NULL REFERENCES users(id),
    memory INTEGER NOT NULL,
    swap INTEGER NOT NULL DEFAULT 0,
    disk INTEGER NOT NULL,
    io INTEGER NOT NULL DEFAULT 500,
    cpu INTEGER NOT NULL DEFAULT 0,
    threads TEXT,
    oom_disabled INTEGER NOT NULL DEFAULT 0,
    allocation_id INTEGER,
    nest_id INTEGER NOT NULL,
    egg_id INTEGER NOT NULL,
    startup TEXT NOT NULL,
    image TEXT NOT NULL,
    installed_at TEXT,
    node_id INTEGER NOT NULL REFERENCES nodes(id),
    allocation_limit INTEGER,
    database_limit INTEGER NOT NULL DEFAULT 0,
    backup_limit INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Databases table
CREATE TABLE IF NOT EXISTS databases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id INTEGER NOT NULL REFERENCES servers(id),
    database_host_id INTEGER NOT NULL,
    database TEXT NOT NULL,
    username TEXT NOT NULL,
    remote TEXT NOT NULL DEFAULT '%',
    password TEXT NOT NULL,
    max_connections INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    key_type INTEGER NOT NULL DEFAULT 0,
    identifier TEXT(16) NOT NULL UNIQUE,
    token TEXT NOT NULL,
    allowed_ips TEXT,
    memo TEXT,
    last_used_at TEXT,
    expires_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Allocations table
CREATE TABLE IF NOT EXISTS allocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id INTEGER NOT NULL REFERENCES nodes(id),
    ip TEXT NOT NULL,
    ip_alias TEXT,
    port INTEGER NOT NULL,
    server_id INTEGER REFERENCES servers(id),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    ip_address TEXT(45),
    user_agent TEXT,
    payload TEXT NOT NULL,
    last_activity INTEGER NOT NULL
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch TEXT(36),
    event TEXT NOT NULL,
    ip TEXT NOT NULL,
    description TEXT,
    actor_id INTEGER REFERENCES users(id),
    actor_type TEXT,
    properties TEXT,
    timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS users_uuid_unique ON users(uuid);
CREATE INDEX IF NOT EXISTS users_external_id_idx ON users(external_id);

CREATE UNIQUE INDEX IF NOT EXISTS locations_short_unique ON locations(short);

CREATE UNIQUE INDEX IF NOT EXISTS nodes_uuid_unique ON nodes(uuid);
CREATE INDEX IF NOT EXISTS nodes_fqdn_idx ON nodes(fqdn);
CREATE INDEX IF NOT EXISTS nodes_location_idx ON nodes(location_id);

CREATE UNIQUE INDEX IF NOT EXISTS servers_uuid_unique ON servers(uuid);
CREATE UNIQUE INDEX IF NOT EXISTS servers_uuid_short_unique ON servers(uuid_short);
CREATE INDEX IF NOT EXISTS servers_owner_idx ON servers(owner_id);
CREATE INDEX IF NOT EXISTS servers_node_idx ON servers(node_id);
CREATE INDEX IF NOT EXISTS servers_external_id_idx ON servers(external_id);

CREATE UNIQUE INDEX IF NOT EXISTS databases_server_database_unique ON databases(server_id, database);
CREATE INDEX IF NOT EXISTS databases_server_idx ON databases(server_id);

CREATE UNIQUE INDEX IF NOT EXISTS api_keys_identifier_unique ON api_keys(identifier);
CREATE INDEX IF NOT EXISTS api_keys_user_idx ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS api_keys_token_idx ON api_keys(token);

CREATE UNIQUE INDEX IF NOT EXISTS allocations_node_ip_port_unique ON allocations(node_id, ip, port);
CREATE INDEX IF NOT EXISTS allocations_server_idx ON allocations(server_id);
CREATE INDEX IF NOT EXISTS allocations_node_idx ON allocations(node_id);

CREATE INDEX IF NOT EXISTS activity_logs_event_idx ON activity_logs(event);
CREATE INDEX IF NOT EXISTS activity_logs_actor_idx ON activity_logs(actor_id);
CREATE INDEX IF NOT EXISTS activity_logs_ip_idx ON activity_logs(ip);