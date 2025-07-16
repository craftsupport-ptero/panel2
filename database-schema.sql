-- Database schema for Pterodactyl Panel Serverless API
-- This should be used with Cloudflare D1 or compatible SQLite database

-- Users table (enhanced from existing structure)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id VARCHAR(255) NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email_verified_at DATETIME NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    root_admin BOOLEAN NOT NULL DEFAULT FALSE,
    use_totp BOOLEAN NOT NULL DEFAULT FALSE,
    gravatar BOOLEAN NOT NULL DEFAULT TRUE,
    avatar_url VARCHAR(500) NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    suspended_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_external_id ON users(external_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_suspended_at ON users(suspended_at);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    permissions TEXT NOT NULL, -- JSON array of permission names
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for roles table
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL
);

-- Create indexes for permissions table
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource);
CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON permissions(resource, action);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id INTEGER PRIMARY KEY,
    theme VARCHAR(20) NOT NULL DEFAULT 'light',
    notifications BOOLEAN NOT NULL DEFAULT TRUE,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User activities table for logging
CREATE TABLE IF NOT EXISTS user_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for user_activities table
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_action ON user_activities(action);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at);

-- API keys table (for future phases)
CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    key_id VARCHAR(16) NOT NULL UNIQUE,
    token VARCHAR(255) NOT NULL UNIQUE,
    allowed_ips TEXT NULL, -- JSON array of allowed IP addresses
    memo TEXT NULL,
    last_used_at DATETIME NULL,
    expires_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for api_keys table
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_id ON api_keys(key_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_token ON api_keys(token);

-- Servers table (for future phases)
CREATE TABLE IF NOT EXISTS servers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id VARCHAR(255) NULL UNIQUE,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    uuidShort VARCHAR(8) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    skip_scripts BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NULL,
    owner_id INTEGER NOT NULL,
    node_id INTEGER NOT NULL,
    allocation_id INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Create indexes for servers table
CREATE INDEX IF NOT EXISTS idx_servers_owner_id ON servers(owner_id);
CREATE INDEX IF NOT EXISTS idx_servers_uuid ON servers(uuid);
CREATE INDEX IF NOT EXISTS idx_servers_uuidShort ON servers(uuidShort);
CREATE INDEX IF NOT EXISTS idx_servers_external_id ON servers(external_id);

-- Nodes table (for future phases)
CREATE TABLE IF NOT EXISTS nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    public BOOLEAN NOT NULL DEFAULT TRUE,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    location_id INTEGER NOT NULL,
    fqdn VARCHAR(255) NOT NULL,
    scheme VARCHAR(5) NOT NULL DEFAULT 'https',
    behind_proxy BOOLEAN NOT NULL DEFAULT FALSE,
    maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
    memory INTEGER NOT NULL,
    memory_overallocate INTEGER NOT NULL DEFAULT 0,
    disk INTEGER NOT NULL,
    disk_overallocate INTEGER NOT NULL DEFAULT 0,
    upload_size INTEGER NOT NULL DEFAULT 100,
    daemon_token_id VARCHAR(16) NOT NULL,
    daemon_token VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for nodes table
CREATE INDEX IF NOT EXISTS idx_nodes_location_id ON nodes(location_id);
CREATE INDEX IF NOT EXISTS idx_nodes_fqdn ON nodes(fqdn);

-- Locations table (for future phases)
CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short VARCHAR(60) NOT NULL UNIQUE,
    long TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for locations table
CREATE INDEX IF NOT EXISTS idx_locations_short ON locations(short);

-- Insert default system roles
INSERT OR IGNORE INTO roles (name, description, permissions) VALUES 
('admin', 'Administrator', '["users.view","users.create","users.edit","users.delete","users.manage_roles","users.view_activity","profile.edit","profile.change_password","profile.upload_avatar","profile.view_settings","profile.edit_settings","servers.view","servers.create","servers.edit","servers.delete","servers.manage","servers.console","servers.files","servers.databases","servers.schedules","servers.backups","nodes.view","nodes.create","nodes.edit","nodes.delete","nodes.manage","nodes.allocations","admin.view","admin.settings","admin.users","admin.servers","admin.nodes","admin.activity","admin.api"]'),
('moderator', 'Moderator', '["users.view","users.edit","users.view_activity","profile.edit","profile.change_password","profile.upload_avatar","profile.view_settings","profile.edit_settings","servers.view","servers.edit","servers.console","servers.files","servers.databases","servers.schedules","servers.backups","nodes.view"]'),
('user', 'User', '["profile.edit","profile.change_password","profile.upload_avatar","profile.view_settings","profile.edit_settings","servers.view","servers.console","servers.files","servers.databases","servers.schedules","servers.backups"]');

-- Insert default system permissions
INSERT OR IGNORE INTO permissions (name, description, resource, action) VALUES 
-- User management permissions
('users.view', 'View user information', 'users', 'view'),
('users.create', 'Create new users', 'users', 'create'),
('users.edit', 'Edit user information', 'users', 'edit'),
('users.delete', 'Delete users', 'users', 'delete'),
('users.manage_roles', 'Manage user roles and permissions', 'users', 'manage_roles'),
('users.view_activity', 'View user activity logs', 'users', 'view_activity'),

-- Profile management permissions
('profile.edit', 'Edit own profile', 'profile', 'edit'),
('profile.change_password', 'Change own password', 'profile', 'change_password'),
('profile.upload_avatar', 'Upload profile avatar', 'profile', 'upload_avatar'),
('profile.view_settings', 'View profile settings', 'profile', 'view_settings'),
('profile.edit_settings', 'Edit profile settings', 'profile', 'edit_settings'),

-- Server management permissions (for future phases)
('servers.view', 'View servers', 'servers', 'view'),
('servers.create', 'Create servers', 'servers', 'create'),
('servers.edit', 'Edit server settings', 'servers', 'edit'),
('servers.delete', 'Delete servers', 'servers', 'delete'),
('servers.manage', 'Full server management', 'servers', 'manage'),
('servers.console', 'Access server console', 'servers', 'console'),
('servers.files', 'Manage server files', 'servers', 'files'),
('servers.databases', 'Manage server databases', 'servers', 'databases'),
('servers.schedules', 'Manage server schedules', 'servers', 'schedules'),
('servers.backups', 'Manage server backups', 'servers', 'backups'),

-- Node management permissions (for future phases)
('nodes.view', 'View nodes', 'nodes', 'view'),
('nodes.create', 'Create nodes', 'nodes', 'create'),
('nodes.edit', 'Edit node settings', 'nodes', 'edit'),
('nodes.delete', 'Delete nodes', 'nodes', 'delete'),
('nodes.manage', 'Full node management', 'nodes', 'manage'),
('nodes.allocations', 'Manage node allocations', 'nodes', 'allocations'),

-- Administrative permissions
('admin.view', 'View administrative interface', 'admin', 'view'),
('admin.settings', 'Manage system settings', 'admin', 'settings'),
('admin.users', 'Administrative user management', 'admin', 'users'),
('admin.servers', 'Administrative server management', 'admin', 'servers'),
('admin.nodes', 'Administrative node management', 'admin', 'nodes'),
('admin.activity', 'View system activity logs', 'admin', 'activity'),
('admin.api', 'Manage API keys and access', 'admin', 'api');