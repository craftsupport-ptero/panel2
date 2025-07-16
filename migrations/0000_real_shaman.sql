CREATE TABLE `activity_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`batch` text,
	`event` text NOT NULL,
	`ip` text NOT NULL,
	`description` text,
	`actor_id` integer,
	`actor_type` text,
	`properties` text,
	`timestamp` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `allocations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`node_id` integer NOT NULL,
	`ip` text NOT NULL,
	`ip_alias` text,
	`port` integer NOT NULL,
	`server_id` integer,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`key_type` integer DEFAULT 0 NOT NULL,
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`allowed_ips` text,
	`memo` text,
	`last_used_at` text,
	`expires_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_keys_identifier_unique` ON `api_keys` (`identifier`);--> statement-breakpoint
CREATE TABLE `backups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`server_id` integer NOT NULL,
	`uuid` text NOT NULL,
	`is_successful` integer DEFAULT false NOT NULL,
	`is_locked` integer DEFAULT false NOT NULL,
	`name` text NOT NULL,
	`ignored_files` text NOT NULL,
	`disk` text NOT NULL,
	`checksum` text,
	`bytes` integer DEFAULT 0 NOT NULL,
	`upload_id` text,
	`completed_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `backups_uuid_unique` ON `backups` (`uuid`);--> statement-breakpoint
CREATE TABLE `database_hosts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`host` text NOT NULL,
	`port` integer NOT NULL,
	`username` text NOT NULL,
	`password` text,
	`max_databases` integer,
	`node_id` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `databases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`server_id` integer NOT NULL,
	`database_host_id` integer NOT NULL,
	`database` text NOT NULL,
	`username` text NOT NULL,
	`remote` text DEFAULT '%' NOT NULL,
	`password` text,
	`max_connections` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `eggs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`nest_id` integer NOT NULL,
	`author` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`features` text,
	`docker_images` text NOT NULL,
	`config` text,
	`startup` text NOT NULL,
	`config_startup` text,
	`config_files` text,
	`config_logs` text,
	`config_stop` text,
	`script_container` text NOT NULL,
	`copy_script_from` integer,
	`script_entry` text NOT NULL,
	`script_is_privileged` integer DEFAULT true NOT NULL,
	`script_install` text,
	`force_outgoing_ip` integer DEFAULT false NOT NULL,
	`file_denylist` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `eggs_uuid_unique` ON `eggs` (`uuid`);--> statement-breakpoint
CREATE TABLE `locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`short` text NOT NULL,
	`long` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `locations_short_unique` ON `locations` (`short`);--> statement-breakpoint
CREATE TABLE `nests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`author` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `nests_uuid_unique` ON `nests` (`uuid`);--> statement-breakpoint
CREATE TABLE `nodes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`public` integer DEFAULT true NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`location_id` integer NOT NULL,
	`fqdn` text NOT NULL,
	`scheme` text DEFAULT 'https' NOT NULL,
	`behind_proxy` integer DEFAULT false NOT NULL,
	`maintenance_mode` integer DEFAULT false NOT NULL,
	`memory` integer NOT NULL,
	`memory_overallocate` integer DEFAULT 0 NOT NULL,
	`disk` integer NOT NULL,
	`disk_overallocate` integer DEFAULT 0 NOT NULL,
	`upload_size` integer DEFAULT 100 NOT NULL,
	`daemon_listen` integer DEFAULT 8080 NOT NULL,
	`daemon_sftp` integer DEFAULT 2022 NOT NULL,
	`daemon_base` text DEFAULT '/var/lib/pterodactyl/volumes' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `nodes_uuid_unique` ON `nodes` (`uuid`);--> statement-breakpoint
CREATE TABLE `servers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`external_id` text,
	`uuid` text NOT NULL,
	`uuid_short` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text,
	`skip_scripts` integer DEFAULT false NOT NULL,
	`suspended` integer DEFAULT false NOT NULL,
	`owner_id` integer NOT NULL,
	`memory` integer NOT NULL,
	`swap` integer NOT NULL,
	`disk` integer NOT NULL,
	`io` integer NOT NULL,
	`cpu` integer NOT NULL,
	`threads` text,
	`oom_disabled` integer DEFAULT true NOT NULL,
	`allocation_id` integer,
	`nest_id` integer NOT NULL,
	`egg_id` integer NOT NULL,
	`startup` text NOT NULL,
	`image` text NOT NULL,
	`node_id` integer NOT NULL,
	`allocation_limit` integer,
	`database_limit` integer DEFAULT 0 NOT NULL,
	`backup_limit` integer DEFAULT 0 NOT NULL,
	`installed_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `servers_uuid_unique` ON `servers` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `servers_uuid_short_unique` ON `servers` (`uuid_short`);--> statement-breakpoint
CREATE TABLE `user_ssh_keys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`fingerprint` text NOT NULL,
	`public_key` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`email_verified_at` text,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`password` text NOT NULL,
	`language` text DEFAULT 'en' NOT NULL,
	`root_admin` integer DEFAULT false NOT NULL,
	`use_totp` integer DEFAULT false NOT NULL,
	`totp_secret` text,
	`totp_authenticated_at` text,
	`gravatar` integer DEFAULT true NOT NULL,
	`external_id` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_uuid_unique` ON `users` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);