# Database Schema Documentation

This document describes the database schema for the serverless Pterodactyl Panel using Cloudflare D1 (SQLite).

## Overview

The schema has been migrated from the original Laravel/MySQL structure to work with SQLite while maintaining compatibility with existing Pterodactyl data structures.

## Core Tables

### Users (`users`)

Stores user account information and authentication data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PRIMARY KEY | Auto-incrementing user ID |
| `uuid` | TEXT(36) UNIQUE | RFC 4122 UUID for user |
| `email` | TEXT UNIQUE | User's email address |
| `password` | TEXT | Bcrypt hashed password |
| `remember_token` | TEXT | Remember me token |
| `language` | TEXT(5) | User's language preference (default: 'en') |
| `root_admin` | INTEGER | Admin flag (0=user, 1=admin) |
| `use_totp` | INTEGER | 2FA enabled flag |
| `totp_secret` | TEXT(16) | TOTP secret key |
| `first_name` | TEXT | User's first name |
| `last_name` | TEXT | User's last name |
| `external_id` | TEXT | External system ID |
| `created_at` | TEXT | Creation timestamp |
| `updated_at` | TEXT | Last update timestamp |

### Locations (`locations`)

Geographic locations for organizing nodes.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PRIMARY KEY | Auto-incrementing location ID |
| `short` | TEXT UNIQUE | Short location code (e.g., 'us-east-1') |
| `long` | TEXT | Full location name (e.g., 'US East 1') |
| `created_at` | TEXT | Creation timestamp |
| `updated_at` | TEXT | Last update timestamp |

### Nodes (`nodes`)

Physical or virtual machines that host game servers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PRIMARY KEY | Auto-incrementing node ID |
| `uuid` | TEXT(36) UNIQUE | RFC 4122 UUID for node |
| `public` | INTEGER | Public visibility flag |
| `name` | TEXT | Node display name |
| `location_id` | INTEGER | Foreign key to locations table |
| `fqdn` | TEXT | Fully qualified domain name |
| `scheme` | TEXT | Protocol scheme (http/https) |
| `behind_proxy` | INTEGER | Proxy configuration flag |
| `public_key` | TEXT | SSH public key for authentication |
| `memory` | INTEGER | Total memory in MB |
| `memory_overallocate` | INTEGER | Memory overallocation percentage |
| `disk` | INTEGER | Total disk space in MB |
| `disk_overallocate` | INTEGER | Disk overallocation percentage |
| `upload_size` | INTEGER | Max file upload size in MB |
| `daemon_listen` | INTEGER | Daemon listening port |
| `daemon_sftp` | INTEGER | SFTP port |
| `daemon_base` | TEXT | Base directory for servers |
| `maintenance` | INTEGER | Maintenance mode flag |
| `description` | TEXT | Node description |
| `created_at` | TEXT | Creation timestamp |
| `updated_at` | TEXT | Last update timestamp |

### Servers (`servers`)

Game server instances managed by the panel.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PRIMARY KEY | Auto-incrementing server ID |
| `external_id` | TEXT | External system ID |
| `uuid` | TEXT(36) UNIQUE | RFC 4122 UUID for server |
| `uuid_short` | TEXT(8) UNIQUE | 8-character short UUID |
| `name` | TEXT | Server display name |
| `description` | TEXT | Server description |
| `status` | TEXT | Server status (installing, running, etc.) |
| `skip_scripts` | INTEGER | Skip egg scripts flag |
| `suspended` | INTEGER | Suspension status |
| `owner_id` | INTEGER | Foreign key to users table |
| `memory` | INTEGER | Allocated memory in MB |
| `swap` | INTEGER | Allocated swap in MB |
| `disk` | INTEGER | Allocated disk space in MB |
| `io` | INTEGER | IO weight |
| `cpu` | INTEGER | CPU limit percentage |
| `threads` | TEXT | CPU thread specification |
| `oom_disabled` | INTEGER | Out-of-memory killer disabled flag |
| `allocation_id` | INTEGER | Primary allocation ID |
| `nest_id` | INTEGER | Nest/category ID |
| `egg_id` | INTEGER | Egg/template ID |
| `startup` | TEXT | Server startup command |
| `image` | TEXT | Docker image |
| `installed_at` | TEXT | Installation completion timestamp |
| `node_id` | INTEGER | Foreign key to nodes table |
| `allocation_limit` | INTEGER | Max allocations allowed |
| `database_limit` | INTEGER | Max databases allowed |
| `backup_limit` | INTEGER | Max backups allowed |
| `created_at` | TEXT | Creation timestamp |
| `updated_at` | TEXT | Last update timestamp |

### Databases (`databases`)

Database instances created for servers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PRIMARY KEY | Auto-incrementing database ID |
| `server_id` | INTEGER | Foreign key to servers table |
| `database_host_id` | INTEGER | Database host ID |
| `database` | TEXT | Database name |
| `username` | TEXT | Database username |
| `remote` | TEXT | Remote access pattern |
| `password` | TEXT | Database password |
| `max_connections` | INTEGER | Maximum connections limit |
| `created_at` | TEXT | Creation timestamp |
| `updated_at` | TEXT | Last update timestamp |

### API Keys (`api_keys`)

API authentication tokens for users and applications.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PRIMARY KEY | Auto-incrementing key ID |
| `user_id` | INTEGER | Foreign key to users table |
| `key_type` | INTEGER | Key type (0=account, 1=application) |
| `identifier` | TEXT(16) UNIQUE | Public key identifier |
| `token` | TEXT | Hashed API token |
| `allowed_ips` | TEXT | JSON array of allowed IP addresses |
| `memo` | TEXT | User-provided description |
| `last_used_at` | TEXT | Last usage timestamp |
| `expires_at` | TEXT | Expiration timestamp |
| `created_at` | TEXT | Creation timestamp |
| `updated_at` | TEXT | Last update timestamp |

### Allocations (`allocations`)

IP address and port assignments for servers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PRIMARY KEY | Auto-incrementing allocation ID |
| `node_id` | INTEGER | Foreign key to nodes table |
| `ip` | TEXT | IP address |
| `ip_alias` | TEXT | IP address alias |
| `port` | INTEGER | Port number |
| `server_id` | INTEGER | Foreign key to servers table (if assigned) |
| `notes` | TEXT | Allocation notes |
| `created_at` | TEXT | Creation timestamp |
| `updated_at` | TEXT | Last update timestamp |

## Support Tables

### Sessions (`sessions`)

User session data for authentication.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PRIMARY KEY | Session ID |
| `user_id` | INTEGER | Foreign key to users table |
| `ip_address` | TEXT(45) | Client IP address |
| `user_agent` | TEXT | Client user agent |
| `payload` | TEXT | Serialized session data |
| `last_activity` | INTEGER | Unix timestamp of last activity |

### Activity Logs (`activity_logs`)

Audit trail for user and system actions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PRIMARY KEY | Auto-incrementing log ID |
| `batch` | TEXT(36) | Batch UUID for grouped actions |
| `event` | TEXT | Event type/name |
| `ip` | TEXT | Source IP address |
| `description` | TEXT | Human-readable description |
| `actor_id` | INTEGER | Foreign key to users table |
| `actor_type` | TEXT | Actor type (user, system, etc.) |
| `properties` | TEXT | JSON metadata |
| `timestamp` | TEXT | Event timestamp |

## Indexes

The schema includes several indexes for performance optimization:

### Users
- `users_email_unique` - Unique index on email
- `users_uuid_unique` - Unique index on UUID
- `users_external_id_idx` - Index on external_id

### Locations
- `locations_short_unique` - Unique index on short code

### Nodes
- `nodes_uuid_unique` - Unique index on UUID
- `nodes_fqdn_idx` - Index on FQDN
- `nodes_location_idx` - Index on location_id

### Servers
- `servers_uuid_unique` - Unique index on UUID
- `servers_uuid_short_unique` - Unique index on short UUID
- `servers_owner_idx` - Index on owner_id
- `servers_node_idx` - Index on node_id
- `servers_external_id_idx` - Index on external_id

### Databases
- `databases_server_database_unique` - Unique index on (server_id, database)
- `databases_server_idx` - Index on server_id

### API Keys
- `api_keys_identifier_unique` - Unique index on identifier
- `api_keys_user_idx` - Index on user_id
- `api_keys_token_idx` - Index on token

### Allocations
- `allocations_node_ip_port_unique` - Unique index on (node_id, ip, port)
- `allocations_server_idx` - Index on server_id
- `allocations_node_idx` - Index on node_id

### Activity Logs
- `activity_logs_event_idx` - Index on event
- `activity_logs_actor_idx` - Index on actor_id
- `activity_logs_ip_idx` - Index on ip

## Data Types

### SQLite Compatibility

All timestamps are stored as TEXT in ISO 8601 format for SQLite compatibility. The Drizzle ORM handles conversion between JavaScript Date objects and these TEXT fields.

### JSON Fields

Fields that store JSON data (like `allowed_ips` in api_keys and `properties` in activity_logs) are stored as TEXT and parsed/stringified by the application layer.

### UUID Fields

UUIDs are stored as TEXT(36) to accommodate the full RFC 4122 format including hyphens.

## Migration Strategy

The initial migration creates all tables with their indexes. Future migrations will be additive to maintain data integrity and support zero-downtime deployments.

## Performance Considerations

- All foreign key relationships are indexed
- Unique constraints are enforced at the database level
- Query-heavy fields (UUIDs, emails, etc.) have dedicated indexes
- JSON fields are indexed where needed for common queries

## Security Notes

- Passwords are bcrypt hashed with configurable rounds
- API tokens are hashed before storage
- Sensitive fields (passwords, tokens) should never be returned in API responses
- All user input should be validated against the Zod schemas before database operations