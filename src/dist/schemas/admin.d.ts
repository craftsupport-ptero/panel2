import { z } from 'zod';
export declare const DashboardMetricsSchema: z.ZodObject<{
    timeframe: z.ZodDefault<z.ZodEnum<["1h", "6h", "24h", "7d", "30d"]>>;
    granularity: z.ZodDefault<z.ZodEnum<["minute", "hour", "day"]>>;
}, "strip", z.ZodTypeAny, {
    timeframe: "1h" | "6h" | "24h" | "7d" | "30d";
    granularity: "minute" | "hour" | "day";
}, {
    timeframe?: "1h" | "6h" | "24h" | "7d" | "30d" | undefined;
    granularity?: "minute" | "hour" | "day" | undefined;
}>;
export declare const SystemHealthSchema: z.ZodObject<{
    component: z.ZodOptional<z.ZodEnum<["database", "cache", "storage", "nodes", "overall"]>>;
    include_details: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    include_details: boolean;
    component?: "database" | "cache" | "storage" | "nodes" | "overall" | undefined;
}, {
    component?: "database" | "cache" | "storage" | "nodes" | "overall" | undefined;
    include_details?: boolean | undefined;
}>;
export declare const UserSearchSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["active", "suspended", "banned", "all"]>>;
    sort: z.ZodDefault<z.ZodEnum<["created", "updated", "username", "email", "last_login"]>>;
    direction: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    per_page: z.ZodDefault<z.ZodNumber>;
    created_after: z.ZodOptional<z.ZodString>;
    created_before: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    sort: "created" | "updated" | "username" | "email" | "last_login";
    status: "active" | "suspended" | "all" | "banned";
    direction: "asc" | "desc";
    page: number;
    per_page: number;
    query?: string | undefined;
    role?: string | undefined;
    created_after?: string | undefined;
    created_before?: string | undefined;
}, {
    sort?: "created" | "updated" | "username" | "email" | "last_login" | undefined;
    status?: "active" | "suspended" | "all" | "banned" | undefined;
    query?: string | undefined;
    role?: string | undefined;
    direction?: "asc" | "desc" | undefined;
    page?: number | undefined;
    per_page?: number | undefined;
    created_after?: string | undefined;
    created_before?: string | undefined;
}>;
export declare const BulkUserCreateSchema: z.ZodObject<{
    users: z.ZodArray<z.ZodObject<{
        username: z.ZodString;
        email: z.ZodString;
        password: z.ZodOptional<z.ZodString>;
        first_name: z.ZodString;
        last_name: z.ZodString;
        role: z.ZodOptional<z.ZodString>;
        send_email: z.ZodDefault<z.ZodBoolean>;
        language: z.ZodOptional<z.ZodString>;
        timezone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        send_email: boolean;
        role?: string | undefined;
        password?: string | undefined;
        language?: string | undefined;
        timezone?: string | undefined;
    }, {
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        role?: string | undefined;
        password?: string | undefined;
        send_email?: boolean | undefined;
        language?: string | undefined;
        timezone?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    users: {
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        send_email: boolean;
        role?: string | undefined;
        password?: string | undefined;
        language?: string | undefined;
        timezone?: string | undefined;
    }[];
}, {
    users: {
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        role?: string | undefined;
        password?: string | undefined;
        send_email?: boolean | undefined;
        language?: string | undefined;
        timezone?: string | undefined;
    }[];
}>;
export declare const BulkUserUpdateSchema: z.ZodObject<{
    user_ids: z.ZodArray<z.ZodNumber, "many">;
    updates: z.ZodEffects<z.ZodObject<{
        role: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<["active", "suspended", "banned"]>>;
        max_servers: z.ZodOptional<z.ZodNumber>;
        max_memory: z.ZodOptional<z.ZodNumber>;
        max_disk: z.ZodOptional<z.ZodNumber>;
        language: z.ZodOptional<z.ZodString>;
        timezone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status?: "active" | "suspended" | "banned" | undefined;
        role?: string | undefined;
        max_servers?: number | undefined;
        max_memory?: number | undefined;
        max_disk?: number | undefined;
        language?: string | undefined;
        timezone?: string | undefined;
    }, {
        status?: "active" | "suspended" | "banned" | undefined;
        role?: string | undefined;
        max_servers?: number | undefined;
        max_memory?: number | undefined;
        max_disk?: number | undefined;
        language?: string | undefined;
        timezone?: string | undefined;
    }>, {
        status?: "active" | "suspended" | "banned" | undefined;
        role?: string | undefined;
        max_servers?: number | undefined;
        max_memory?: number | undefined;
        max_disk?: number | undefined;
        language?: string | undefined;
        timezone?: string | undefined;
    }, {
        status?: "active" | "suspended" | "banned" | undefined;
        role?: string | undefined;
        max_servers?: number | undefined;
        max_memory?: number | undefined;
        max_disk?: number | undefined;
        language?: string | undefined;
        timezone?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    user_ids: number[];
    updates: {
        status?: "active" | "suspended" | "banned" | undefined;
        role?: string | undefined;
        max_servers?: number | undefined;
        max_memory?: number | undefined;
        max_disk?: number | undefined;
        language?: string | undefined;
        timezone?: string | undefined;
    };
}, {
    user_ids: number[];
    updates: {
        status?: "active" | "suspended" | "banned" | undefined;
        role?: string | undefined;
        max_servers?: number | undefined;
        max_memory?: number | undefined;
        max_disk?: number | undefined;
        language?: string | undefined;
        timezone?: string | undefined;
    };
}>;
export declare const BulkUserDeleteSchema: z.ZodObject<{
    user_ids: z.ZodArray<z.ZodNumber, "many">;
    transfer_servers_to: z.ZodOptional<z.ZodNumber>;
    delete_servers: z.ZodDefault<z.ZodBoolean>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    user_ids: number[];
    delete_servers: boolean;
    reason?: string | undefined;
    transfer_servers_to?: number | undefined;
}, {
    user_ids: number[];
    reason?: string | undefined;
    transfer_servers_to?: number | undefined;
    delete_servers?: boolean | undefined;
}>;
export declare const UserImportSchema: z.ZodObject<{
    format: z.ZodEnum<["csv", "json"]>;
    options: z.ZodOptional<z.ZodObject<{
        skip_duplicates: z.ZodDefault<z.ZodBoolean>;
        send_welcome_emails: z.ZodDefault<z.ZodBoolean>;
        default_role: z.ZodOptional<z.ZodString>;
        validate_emails: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        skip_duplicates: boolean;
        send_welcome_emails: boolean;
        validate_emails: boolean;
        default_role?: string | undefined;
    }, {
        skip_duplicates?: boolean | undefined;
        send_welcome_emails?: boolean | undefined;
        default_role?: string | undefined;
        validate_emails?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    format: "csv" | "json";
    options?: {
        skip_duplicates: boolean;
        send_welcome_emails: boolean;
        validate_emails: boolean;
        default_role?: string | undefined;
    } | undefined;
}, {
    format: "csv" | "json";
    options?: {
        skip_duplicates?: boolean | undefined;
        send_welcome_emails?: boolean | undefined;
        default_role?: string | undefined;
        validate_emails?: boolean | undefined;
    } | undefined;
}>;
export declare const BulkServerActionSchema: z.ZodObject<{
    action: z.ZodEnum<["start", "stop", "restart", "kill", "backup", "reinstall", "suspend", "unsuspend"]>;
    filters: z.ZodOptional<z.ZodObject<{
        node_id: z.ZodOptional<z.ZodNumber>;
        user_id: z.ZodOptional<z.ZodNumber>;
        status: z.ZodOptional<z.ZodEnum<["running", "stopped", "starting", "stopping", "installing", "suspended"]>>;
        server_ids: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        game_type: z.ZodOptional<z.ZodString>;
        created_after: z.ZodOptional<z.ZodString>;
        created_before: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status?: "running" | "stopped" | "installing" | "suspended" | "starting" | "stopping" | undefined;
        created_after?: string | undefined;
        created_before?: string | undefined;
        node_id?: number | undefined;
        user_id?: number | undefined;
        server_ids?: number[] | undefined;
        game_type?: string | undefined;
    }, {
        status?: "running" | "stopped" | "installing" | "suspended" | "starting" | "stopping" | undefined;
        created_after?: string | undefined;
        created_before?: string | undefined;
        node_id?: number | undefined;
        user_id?: number | undefined;
        server_ids?: number[] | undefined;
        game_type?: string | undefined;
    }>>;
    options: z.ZodOptional<z.ZodObject<{
        delay: z.ZodDefault<z.ZodNumber>;
        batch_size: z.ZodDefault<z.ZodNumber>;
        force: z.ZodDefault<z.ZodBoolean>;
        skip_errors: z.ZodDefault<z.ZodBoolean>;
        timeout: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        delay: number;
        batch_size: number;
        force: boolean;
        timeout: number;
        skip_errors: boolean;
    }, {
        delay?: number | undefined;
        batch_size?: number | undefined;
        force?: boolean | undefined;
        timeout?: number | undefined;
        skip_errors?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    action: "start" | "stop" | "restart" | "kill" | "backup" | "reinstall" | "suspend" | "unsuspend";
    options?: {
        delay: number;
        batch_size: number;
        force: boolean;
        timeout: number;
        skip_errors: boolean;
    } | undefined;
    filters?: {
        status?: "running" | "stopped" | "installing" | "suspended" | "starting" | "stopping" | undefined;
        created_after?: string | undefined;
        created_before?: string | undefined;
        node_id?: number | undefined;
        user_id?: number | undefined;
        server_ids?: number[] | undefined;
        game_type?: string | undefined;
    } | undefined;
}, {
    action: "start" | "stop" | "restart" | "kill" | "backup" | "reinstall" | "suspend" | "unsuspend";
    options?: {
        delay?: number | undefined;
        batch_size?: number | undefined;
        force?: boolean | undefined;
        timeout?: number | undefined;
        skip_errors?: boolean | undefined;
    } | undefined;
    filters?: {
        status?: "running" | "stopped" | "installing" | "suspended" | "starting" | "stopping" | undefined;
        created_after?: string | undefined;
        created_before?: string | undefined;
        node_id?: number | undefined;
        user_id?: number | undefined;
        server_ids?: number[] | undefined;
        game_type?: string | undefined;
    } | undefined;
}>;
export declare const ServerMigrationSchema: z.ZodObject<{
    server_id: z.ZodNumber;
    target_node_id: z.ZodNumber;
    options: z.ZodOptional<z.ZodObject<{
        keep_backups: z.ZodDefault<z.ZodBoolean>;
        compress_transfer: z.ZodDefault<z.ZodBoolean>;
        verify_transfer: z.ZodDefault<z.ZodBoolean>;
        downtime_window: z.ZodOptional<z.ZodString>;
        force: z.ZodDefault<z.ZodBoolean>;
        timeout: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        force: boolean;
        keep_backups: boolean;
        compress_transfer: boolean;
        verify_transfer: boolean;
        timeout: number;
        downtime_window?: string | undefined;
    }, {
        force?: boolean | undefined;
        keep_backups?: boolean | undefined;
        compress_transfer?: boolean | undefined;
        verify_transfer?: boolean | undefined;
        downtime_window?: string | undefined;
        timeout?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    server_id: number;
    target_node_id: number;
    options?: {
        force: boolean;
        keep_backups: boolean;
        compress_transfer: boolean;
        verify_transfer: boolean;
        timeout: number;
        downtime_window?: string | undefined;
    } | undefined;
}, {
    server_id: number;
    target_node_id: number;
    options?: {
        force?: boolean | undefined;
        keep_backups?: boolean | undefined;
        compress_transfer?: boolean | undefined;
        verify_transfer?: boolean | undefined;
        downtime_window?: string | undefined;
        timeout?: number | undefined;
    } | undefined;
}>;
export declare const ServerOptimizationSchema: z.ZodObject<{
    server_ids: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    node_id: z.ZodOptional<z.ZodNumber>;
    optimization_type: z.ZodDefault<z.ZodEnum<["memory", "cpu", "disk", "all"]>>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    dry_run: boolean;
    optimization_type: "all" | "memory" | "cpu" | "disk";
    node_id?: number | undefined;
    server_ids?: number[] | undefined;
}, {
    node_id?: number | undefined;
    server_ids?: number[] | undefined;
    dry_run?: boolean | undefined;
    optimization_type?: "all" | "memory" | "cpu" | "disk" | undefined;
}>;
export declare const ServerBackupSchema: z.ZodObject<{
    server_ids: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    options: z.ZodOptional<z.ZodObject<{
        compression: z.ZodDefault<z.ZodEnum<["none", "gzip", "lz4", "bzip2"]>>;
        exclude_logs: z.ZodDefault<z.ZodBoolean>;
        exclude_cache: z.ZodDefault<z.ZodBoolean>;
        priority: z.ZodDefault<z.ZodEnum<["low", "normal", "high"]>>;
        batch_size: z.ZodDefault<z.ZodNumber>;
        retention_days: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        batch_size: number;
        compression: "none" | "gzip" | "lz4" | "bzip2";
        exclude_logs: boolean;
        priority: "high" | "low" | "normal";
        exclude_cache: boolean;
        retention_days: number;
    }, {
        batch_size?: number | undefined;
        compression?: "none" | "gzip" | "lz4" | "bzip2" | undefined;
        exclude_logs?: boolean | undefined;
        priority?: "high" | "low" | "normal" | undefined;
        exclude_cache?: boolean | undefined;
        retention_days?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    options?: {
        batch_size: number;
        compression: "none" | "gzip" | "lz4" | "bzip2";
        exclude_logs: boolean;
        priority: "high" | "low" | "normal";
        exclude_cache: boolean;
        retention_days: number;
    } | undefined;
    server_ids?: number[] | undefined;
}, {
    options?: {
        batch_size?: number | undefined;
        compression?: "none" | "gzip" | "lz4" | "bzip2" | undefined;
        exclude_logs?: boolean | undefined;
        priority?: "high" | "low" | "normal" | undefined;
        exclude_cache?: boolean | undefined;
        retention_days?: number | undefined;
    } | undefined;
    server_ids?: number[] | undefined;
}>;
export declare const NodeMaintenanceSchema: z.ZodObject<{
    node_id: z.ZodNumber;
    maintenance_mode: z.ZodBoolean;
    reason: z.ZodOptional<z.ZodString>;
    estimated_duration: z.ZodOptional<z.ZodNumber>;
    allow_new_servers: z.ZodDefault<z.ZodBoolean>;
    notify_users: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    node_id: number;
    maintenance_mode: boolean;
    allow_new_servers: boolean;
    notify_users: boolean;
    reason?: string | undefined;
    estimated_duration?: number | undefined;
}, {
    node_id: number;
    maintenance_mode: boolean;
    reason?: string | undefined;
    estimated_duration?: number | undefined;
    allow_new_servers?: boolean | undefined;
    notify_users?: boolean | undefined;
}>;
export declare const NodeDrainSchema: z.ZodObject<{
    node_id: z.ZodNumber;
    target_nodes: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    options: z.ZodOptional<z.ZodObject<{
        graceful: z.ZodDefault<z.ZodBoolean>;
        timeout: z.ZodDefault<z.ZodNumber>;
        backup_before_move: z.ZodDefault<z.ZodBoolean>;
        verify_after_move: z.ZodDefault<z.ZodBoolean>;
        batch_size: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        batch_size: number;
        graceful: boolean;
        timeout: number;
        backup_before_move: boolean;
        verify_after_move: boolean;
    }, {
        batch_size?: number | undefined;
        graceful?: boolean | undefined;
        timeout?: number | undefined;
        backup_before_move?: boolean | undefined;
        verify_after_move?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    node_id: number;
    options?: {
        batch_size: number;
        graceful: boolean;
        timeout: number;
        backup_before_move: boolean;
        verify_after_move: boolean;
    } | undefined;
    target_nodes?: number[] | undefined;
}, {
    node_id: number;
    options?: {
        batch_size?: number | undefined;
        graceful?: boolean | undefined;
        timeout?: number | undefined;
        backup_before_move?: boolean | undefined;
        verify_after_move?: boolean | undefined;
    } | undefined;
    target_nodes?: number[] | undefined;
}>;
export declare const NodeOptimizationSchema: z.ZodObject<{
    node_ids: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    strategy: z.ZodDefault<z.ZodEnum<["balanced", "performance", "cost", "geographic"]>>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
    max_migrations: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    strategy: "balanced" | "performance" | "cost" | "geographic";
    dry_run: boolean;
    max_migrations: number;
    node_ids?: number[] | undefined;
}, {
    strategy?: "balanced" | "performance" | "cost" | "geographic" | undefined;
    dry_run?: boolean | undefined;
    node_ids?: number[] | undefined;
    max_migrations?: number | undefined;
}>;
export declare const AnalyticsQuerySchema: z.ZodObject<{
    timeframe: z.ZodDefault<z.ZodEnum<["1h", "6h", "24h", "7d", "30d", "90d"]>>;
    granularity: z.ZodDefault<z.ZodEnum<["minute", "hour", "day"]>>;
    metrics: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    filters: z.ZodOptional<z.ZodObject<{
        user_id: z.ZodOptional<z.ZodNumber>;
        node_id: z.ZodOptional<z.ZodNumber>;
        server_id: z.ZodOptional<z.ZodNumber>;
        game_type: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        node_id?: number | undefined;
        user_id?: number | undefined;
        server_id?: number | undefined;
        game_type?: string | undefined;
    }, {
        node_id?: number | undefined;
        user_id?: number | undefined;
        server_id?: number | undefined;
        game_type?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    timeframe: "1h" | "6h" | "24h" | "7d" | "30d" | "90d";
    granularity: "minute" | "hour" | "day";
    filters?: {
        node_id?: number | undefined;
        user_id?: number | undefined;
        server_id?: number | undefined;
        game_type?: string | undefined;
    } | undefined;
    metrics?: string[] | undefined;
}, {
    filters?: {
        node_id?: number | undefined;
        user_id?: number | undefined;
        server_id?: number | undefined;
        game_type?: string | undefined;
    } | undefined;
    timeframe?: "1h" | "6h" | "24h" | "7d" | "30d" | "90d" | undefined;
    granularity?: "minute" | "hour" | "day" | undefined;
    metrics?: string[] | undefined;
}>;
export declare const AnalyticsExportSchema: z.ZodObject<{
    format: z.ZodDefault<z.ZodEnum<["csv", "json", "pdf", "xlsx"]>>;
    timeframe: z.ZodString;
    metrics: z.ZodArray<z.ZodString, "many">;
    filters: z.ZodOptional<z.ZodObject<{
        user_id: z.ZodOptional<z.ZodNumber>;
        node_id: z.ZodOptional<z.ZodNumber>;
        server_id: z.ZodOptional<z.ZodNumber>;
        game_type: z.ZodOptional<z.ZodString>;
        start_date: z.ZodOptional<z.ZodString>;
        end_date: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        node_id?: number | undefined;
        user_id?: number | undefined;
        server_id?: number | undefined;
        game_type?: string | undefined;
        start_date?: string | undefined;
        end_date?: string | undefined;
    }, {
        node_id?: number | undefined;
        user_id?: number | undefined;
        server_id?: number | undefined;
        game_type?: string | undefined;
        start_date?: string | undefined;
        end_date?: string | undefined;
    }>>;
    options: z.ZodOptional<z.ZodObject<{
        include_charts: z.ZodDefault<z.ZodBoolean>;
        include_summary: z.ZodDefault<z.ZodBoolean>;
        compression: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        compression: boolean;
        include_charts: boolean;
        include_summary: boolean;
    }, {
        compression?: boolean | undefined;
        include_charts?: boolean | undefined;
        include_summary?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    format: "csv" | "json" | "pdf" | "xlsx";
    timeframe: string;
    metrics: string[];
    options?: {
        compression: boolean;
        include_charts: boolean;
        include_summary: boolean;
    } | undefined;
    filters?: {
        node_id?: number | undefined;
        user_id?: number | undefined;
        server_id?: number | undefined;
        game_type?: string | undefined;
        start_date?: string | undefined;
        end_date?: string | undefined;
    } | undefined;
}, {
    timeframe: string;
    metrics: string[];
    options?: {
        compression?: boolean | undefined;
        include_charts?: boolean | undefined;
        include_summary?: boolean | undefined;
    } | undefined;
    format?: "csv" | "json" | "pdf" | "xlsx" | undefined;
    filters?: {
        node_id?: number | undefined;
        user_id?: number | undefined;
        server_id?: number | undefined;
        game_type?: string | undefined;
        start_date?: string | undefined;
        end_date?: string | undefined;
    } | undefined;
}>;
export declare const MaintenanceTaskSchema: z.ZodObject<{
    task: z.ZodEnum<["cleanup", "optimize", "backup", "migrate", "update"]>;
    options: z.ZodOptional<z.ZodObject<{
        force: z.ZodDefault<z.ZodBoolean>;
        dry_run: z.ZodDefault<z.ZodBoolean>;
        target: z.ZodOptional<z.ZodString>;
        schedule: z.ZodOptional<z.ZodString>;
        timeout: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        force: boolean;
        dry_run: boolean;
        timeout?: number | undefined;
        target?: string | undefined;
        schedule?: string | undefined;
    }, {
        force?: boolean | undefined;
        timeout?: number | undefined;
        dry_run?: boolean | undefined;
        target?: string | undefined;
        schedule?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    task: "backup" | "cleanup" | "optimize" | "migrate" | "update";
    options?: {
        force: boolean;
        dry_run: boolean;
        timeout?: number | undefined;
        target?: string | undefined;
        schedule?: string | undefined;
    } | undefined;
}, {
    task: "backup" | "cleanup" | "optimize" | "migrate" | "update";
    options?: {
        force?: boolean | undefined;
        timeout?: number | undefined;
        dry_run?: boolean | undefined;
        target?: string | undefined;
        schedule?: string | undefined;
    } | undefined;
}>;
export declare const CleanupOptionsSchema: z.ZodObject<{
    sessions: z.ZodDefault<z.ZodBoolean>;
    logs: z.ZodDefault<z.ZodBoolean>;
    temp_files: z.ZodDefault<z.ZodBoolean>;
    cache: z.ZodDefault<z.ZodBoolean>;
    orphaned_files: z.ZodDefault<z.ZodBoolean>;
    old_backups: z.ZodDefault<z.ZodBoolean>;
    retention_days: z.ZodDefault<z.ZodNumber>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    dry_run: boolean;
    cache: boolean;
    retention_days: number;
    sessions: boolean;
    logs: boolean;
    temp_files: boolean;
    orphaned_files: boolean;
    old_backups: boolean;
}, {
    dry_run?: boolean | undefined;
    cache?: boolean | undefined;
    retention_days?: number | undefined;
    sessions?: boolean | undefined;
    logs?: boolean | undefined;
    temp_files?: boolean | undefined;
    orphaned_files?: boolean | undefined;
    old_backups?: boolean | undefined;
}>;
export declare const DatabaseOptimizationSchema: z.ZodObject<{
    tables: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    operations: z.ZodOptional<z.ZodObject<{
        analyze: z.ZodDefault<z.ZodBoolean>;
        optimize: z.ZodDefault<z.ZodBoolean>;
        repair: z.ZodDefault<z.ZodBoolean>;
        update_statistics: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        optimize: boolean;
        analyze: boolean;
        repair: boolean;
        update_statistics: boolean;
    }, {
        optimize?: boolean | undefined;
        analyze?: boolean | undefined;
        repair?: boolean | undefined;
        update_statistics?: boolean | undefined;
    }>>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    dry_run: boolean;
    tables?: string[] | undefined;
    operations?: {
        optimize: boolean;
        analyze: boolean;
        repair: boolean;
        update_statistics: boolean;
    } | undefined;
}, {
    dry_run?: boolean | undefined;
    tables?: string[] | undefined;
    operations?: {
        optimize?: boolean | undefined;
        analyze?: boolean | undefined;
        repair?: boolean | undefined;
        update_statistics?: boolean | undefined;
    } | undefined;
}>;
export declare const SystemBackupSchema: z.ZodObject<{
    include_database: z.ZodDefault<z.ZodBoolean>;
    include_files: z.ZodDefault<z.ZodBoolean>;
    include_logs: z.ZodDefault<z.ZodBoolean>;
    include_config: z.ZodDefault<z.ZodBoolean>;
    compression: z.ZodDefault<z.ZodEnum<["none", "gzip", "lz4", "bzip2"]>>;
    encryption: z.ZodDefault<z.ZodBoolean>;
    encryption_key: z.ZodOptional<z.ZodString>;
    destination: z.ZodDefault<z.ZodEnum<["local", "s3", "ftp", "sftp"]>>;
    retention_count: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    compression: "none" | "gzip" | "lz4" | "bzip2";
    encryption: boolean;
    include_database: boolean;
    include_files: boolean;
    include_logs: boolean;
    include_config: boolean;
    destination: "local" | "s3" | "ftp" | "sftp";
    retention_count: number;
    encryption_key?: string | undefined;
}, {
    compression?: "none" | "gzip" | "lz4" | "bzip2" | undefined;
    encryption?: boolean | undefined;
    include_database?: boolean | undefined;
    include_files?: boolean | undefined;
    include_logs?: boolean | undefined;
    include_config?: boolean | undefined;
    encryption_key?: string | undefined;
    destination?: "local" | "s3" | "ftp" | "sftp" | undefined;
    retention_count?: number | undefined;
}>;
export declare const MigrationOptionsSchema: z.ZodObject<{
    force: z.ZodDefault<z.ZodBoolean>;
    rollback_on_error: z.ZodDefault<z.ZodBoolean>;
    backup_before: z.ZodDefault<z.ZodBoolean>;
    timeout: z.ZodDefault<z.ZodNumber>;
    batch_size: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    batch_size: number;
    force: boolean;
    timeout: number;
    rollback_on_error: boolean;
    backup_before: boolean;
}, {
    batch_size?: number | undefined;
    force?: boolean | undefined;
    timeout?: number | undefined;
    rollback_on_error?: boolean | undefined;
    backup_before?: boolean | undefined;
}>;
export declare const AlertRuleSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    metric: z.ZodString;
    condition: z.ZodEnum<[">", "<", ">=", "<=", "==", "!="]>;
    threshold: z.ZodNumber;
    timeframe: z.ZodDefault<z.ZodNumber>;
    severity: z.ZodDefault<z.ZodEnum<["info", "warning", "error", "critical"]>>;
    enabled: z.ZodDefault<z.ZodBoolean>;
    notification_channels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    timeframe: number;
    name: string;
    enabled: boolean;
    metric: string;
    condition: ">" | "<" | ">=" | "<=" | "==" | "!=";
    threshold: number;
    severity: "warning" | "critical" | "info" | "error";
    description?: string | undefined;
    notification_channels?: string[] | undefined;
}, {
    name: string;
    metric: string;
    condition: ">" | "<" | ">=" | "<=" | "==" | "!=";
    threshold: number;
    timeframe?: number | undefined;
    description?: string | undefined;
    enabled?: boolean | undefined;
    notification_channels?: string[] | undefined;
    severity?: "warning" | "critical" | "info" | "error" | undefined;
}>;
export declare const NotificationChannelSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["email", "webhook", "slack", "discord", "teams"]>;
    configuration: z.ZodRecord<z.ZodString, z.ZodAny>;
    enabled: z.ZodDefault<z.ZodBoolean>;
    filters: z.ZodOptional<z.ZodObject<{
        severity: z.ZodOptional<z.ZodArray<z.ZodEnum<["info", "warning", "error", "critical"]>, "many">>;
        sources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        severity?: ("warning" | "critical" | "info" | "error")[] | undefined;
        sources?: string[] | undefined;
    }, {
        severity?: ("warning" | "critical" | "info" | "error")[] | undefined;
        sources?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "email" | "webhook" | "slack" | "discord" | "teams";
    name: string;
    enabled: boolean;
    configuration: Record<string, any>;
    filters?: {
        severity?: ("warning" | "critical" | "info" | "error")[] | undefined;
        sources?: string[] | undefined;
    } | undefined;
}, {
    type: "email" | "webhook" | "slack" | "discord" | "teams";
    name: string;
    configuration: Record<string, any>;
    filters?: {
        severity?: ("warning" | "critical" | "info" | "error")[] | undefined;
        sources?: string[] | undefined;
    } | undefined;
    enabled?: boolean | undefined;
}>;
export declare const AdminPermissionSchema: z.ZodObject<{
    permission: z.ZodString;
    required_permissions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    permission: string;
    required_permissions: string[];
}, {
    permission: string;
    required_permissions?: string[] | undefined;
}>;
export declare const PaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    per_page: z.ZodDefault<z.ZodNumber>;
    sort: z.ZodOptional<z.ZodString>;
    direction: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    direction: "asc" | "desc";
    page: number;
    per_page: number;
    sort?: string | undefined;
}, {
    sort?: string | undefined;
    direction?: "asc" | "desc" | undefined;
    page?: number | undefined;
    per_page?: number | undefined;
}>;
export declare const DateRangeSchema: z.ZodEffects<z.ZodObject<{
    start_date: z.ZodOptional<z.ZodString>;
    end_date: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    start_date?: string | undefined;
    end_date?: string | undefined;
}, {
    start_date?: string | undefined;
    end_date?: string | undefined;
}>, {
    start_date?: string | undefined;
    end_date?: string | undefined;
}, {
    start_date?: string | undefined;
    end_date?: string | undefined;
}>;
export declare const IdListSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    ids: number[];
}, {
    ids: number[];
}>;
export declare function validateAdminPermission(permission: string, userPermissions: string[]): boolean;
export declare function validateBulkOperation(itemCount: number, maxItems?: number): boolean;
export declare function validateTimeframe(timeframe: string): boolean;
export declare function validateCronExpression(expression: string): boolean;
export declare class AdminValidationError extends Error {
    field: string;
    code: string;
    constructor(field: string, code: string, message: string);
}
export declare class PermissionError extends Error {
    permission: string;
    constructor(permission: string, message: string);
}
//# sourceMappingURL=admin.d.ts.map