CREATE TABLE IF NOT EXISTS `activity_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`batch` text(36),
	`event` text NOT NULL,
	`ip` text NOT NULL,
	`description` text,
	`actor_id` integer,
	`actor_type` text,
	`api_key_id` integer,
	`subject_id` integer,
	`subject_type` text,
	`properties` text NOT NULL,
	`timestamp` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `allocations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`node_id` integer NOT NULL,
	`ip` text NOT NULL,
	`ip_alias` text,
	`port` integer NOT NULL,
	`notes` text,
	`server_id` integer,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `api_keys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`key_type` integer NOT NULL,
	`identifier` text(16) NOT NULL,
	`token` text NOT NULL,
	`allowed_ips` text,
	`memo` text,
	`last_used_at` integer,
	`expires_at` integer,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `backups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`server_id` integer NOT NULL,
	`uuid` text(36) NOT NULL,
	`name` text NOT NULL,
	`ignored_files` text NOT NULL,
	`disk` text NOT NULL,
	`sha256_hash` text,
	`bytes` integer DEFAULT 0,
	`upload_id` text,
	`successful` integer DEFAULT false,
	`locked` integer DEFAULT false,
	`checksum` text,
	`completed_at` integer,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `database_hosts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`host` text NOT NULL,
	`port` integer NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`max_databases` integer,
	`node_id` integer,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `databases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`server_id` integer NOT NULL,
	`database_host_id` integer NOT NULL,
	`database` text NOT NULL,
	`username` text NOT NULL,
	`remote` text DEFAULT '%',
	`password` text NOT NULL,
	`max_connections` integer DEFAULT 0,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `eggs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text(36) NOT NULL,
	`nest_id` integer NOT NULL,
	`author` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`features` text,
	`docker_images` text NOT NULL,
	`config_files` text,
	`config_startup` text,
	`config_stop` text,
	`config_from` integer,
	`startup` text,
	`script_container` text DEFAULT 'alpine:3.4',
	`copy_script_from` integer,
	`script_entry` text DEFAULT 'ash',
	`script_is_privileged` integer DEFAULT true,
	`script_install` text,
	`file_denylist` text,
	`force_outgoing_ip` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`short` text NOT NULL,
	`long` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `nests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text(36) NOT NULL,
	`author` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `nodes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text(36) NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`location_id` integer NOT NULL,
	`fqdn` text NOT NULL,
	`scheme` text DEFAULT 'https',
	`behind_proxy` integer DEFAULT false,
	`maintenance_mode` integer DEFAULT false,
	`memory` integer NOT NULL,
	`memory_overallocate` integer DEFAULT 0,
	`disk` integer NOT NULL,
	`disk_overallocate` integer DEFAULT 0,
	`upload_size` integer DEFAULT 100,
	`daemon_listen` integer DEFAULT 8080,
	`daemon_sftp` integer DEFAULT 2022,
	`daemon_base` text DEFAULT '/var/lib/pterodactyl/volumes',
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `servers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text(36) NOT NULL,
	`uuid_short` text(8) NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'installing',
	`skip_scripts` integer DEFAULT false,
	`suspended` integer DEFAULT false,
	`owner_id` integer NOT NULL,
	`memory` integer NOT NULL,
	`swap` integer NOT NULL,
	`disk` integer NOT NULL,
	`io` integer NOT NULL,
	`cpu` integer NOT NULL,
	`threads` text,
	`oom_disabled` integer DEFAULT false,
	`allocation_id` integer,
	`nest_id` integer NOT NULL,
	`egg_id` integer NOT NULL,
	`startup` text NOT NULL,
	`image` text NOT NULL,
	`installed` integer DEFAULT false,
	`installed_at` integer,
	`database_limit` integer DEFAULT 0,
	`allocation_limit` integer,
	`backup_limit` integer DEFAULT 0,
	`external_id` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer,
	`ip_address` text,
	`user_agent` text,
	`payload` text NOT NULL,
	`last_activity` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text(36) NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`remember_token` text,
	`language` text(5) DEFAULT 'en',
	`root_admin` integer DEFAULT false,
	`use_totp` integer DEFAULT false,
	`totp_secret` text(16),
	`first_name` text,
	`last_name` text,
	`username` text,
	`external_id` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `activity_logs_actor_index` ON `activity_logs` (`actor_type`,`actor_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `activity_logs_subject_index` ON `activity_logs` (`subject_type`,`subject_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `activity_logs_event_index` ON `activity_logs` (`event`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `allocations_node_id_index` ON `allocations` (`node_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `allocations_server_id_index` ON `allocations` (`server_id`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `allocations_node_ip_port_unique` ON `allocations` (`node_id`,`ip`,`port`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `api_keys_user_id_index` ON `api_keys` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `api_keys_identifier_unique` ON `api_keys` (`identifier`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `backups_server_id_index` ON `backups` (`server_id`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `backups_uuid_unique` ON `backups` (`uuid`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `database_hosts_node_id_index` ON `database_hosts` (`node_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `databases_server_id_index` ON `databases` (`server_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `databases_database_host_id_index` ON `databases` (`database_host_id`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `databases_server_database_unique` ON `databases` (`server_id`,`database`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `eggs_uuid_unique` ON `eggs` (`uuid`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `eggs_nest_id_index` ON `eggs` (`nest_id`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `locations_short_unique` ON `locations` (`short`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `nests_uuid_unique` ON `nests` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `nodes_uuid_unique` ON `nodes` (`uuid`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `nodes_location_id_index` ON `nodes` (`location_id`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `servers_uuid_unique` ON `servers` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `servers_uuid_short_unique` ON `servers` (`uuid_short`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `servers_owner_id_index` ON `servers` (`owner_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `servers_nest_id_index` ON `servers` (`nest_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `servers_egg_id_index` ON `servers` (`egg_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `sessions_user_id_index` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `sessions_last_activity_index` ON `sessions` (`last_activity`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `users_uuid_unique` ON `users` (`uuid`);