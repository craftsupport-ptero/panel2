import { z } from 'zod';
export declare const TimeSeriesDataSchema: z.ZodObject<{
    timestamp: z.ZodString;
    values: z.ZodRecord<z.ZodString, z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    values: Record<string, number>;
    timestamp: string;
    metadata?: Record<string, any> | undefined;
}, {
    values: Record<string, number>;
    timestamp: string;
    metadata?: Record<string, any> | undefined;
}>;
export declare const TimeSeriesQuerySchema: z.ZodObject<{
    metric: z.ZodString;
    timeframe: z.ZodEnum<["1h", "6h", "24h", "7d", "30d", "90d", "1y"]>;
    granularity: z.ZodEnum<["minute", "hour", "day", "week", "month"]>;
    start_time: z.ZodOptional<z.ZodString>;
    end_time: z.ZodOptional<z.ZodString>;
    aggregation: z.ZodDefault<z.ZodEnum<["avg", "sum", "min", "max", "count"]>>;
    fill_missing: z.ZodDefault<z.ZodBoolean>;
    filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    timeframe: "1h" | "6h" | "24h" | "7d" | "30d" | "90d" | "1y";
    granularity: "minute" | "hour" | "day" | "week" | "month";
    metric: string;
    aggregation: "avg" | "sum" | "min" | "max" | "count";
    fill_missing: boolean;
    filters?: Record<string, any> | undefined;
    start_time?: string | undefined;
    end_time?: string | undefined;
}, {
    timeframe: "1h" | "6h" | "24h" | "7d" | "30d" | "90d" | "1y";
    granularity: "minute" | "hour" | "day" | "week" | "month";
    metric: string;
    filters?: Record<string, any> | undefined;
    start_time?: string | undefined;
    end_time?: string | undefined;
    aggregation?: "avg" | "sum" | "min" | "max" | "count" | undefined;
    fill_missing?: boolean | undefined;
}>;
export declare const UserAnalyticsSchema: z.ZodObject<{
    timeframe: z.ZodString;
    granularity: z.ZodString;
    summary: z.ZodObject<{
        total_users: z.ZodNumber;
        active_users: z.ZodNumber;
        new_registrations: z.ZodNumber;
        user_growth_rate: z.ZodNumber;
        retention_rate: z.ZodOptional<z.ZodNumber>;
        churn_rate: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        active_users: number;
        new_registrations: number;
        total_users: number;
        user_growth_rate: number;
        retention_rate?: number | undefined;
        churn_rate?: number | undefined;
    }, {
        active_users: number;
        new_registrations: number;
        total_users: number;
        user_growth_rate: number;
        retention_rate?: number | undefined;
        churn_rate?: number | undefined;
    }>;
    time_series: z.ZodArray<z.ZodObject<{
        timestamp: z.ZodString;
        values: z.ZodRecord<z.ZodString, z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        values: Record<string, number>;
        timestamp: string;
        metadata?: Record<string, any> | undefined;
    }, {
        values: Record<string, number>;
        timestamp: string;
        metadata?: Record<string, any> | undefined;
    }>, "many">;
    demographics: z.ZodObject<{
        by_region: z.ZodArray<z.ZodObject<{
            region: z.ZodString;
            users: z.ZodNumber;
            percentage: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            users: number;
            region: string;
            percentage: number;
        }, {
            users: number;
            region: string;
            percentage: number;
        }>, "many">;
        by_plan: z.ZodArray<z.ZodObject<{
            plan: z.ZodString;
            users: z.ZodNumber;
            percentage: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            users: number;
            percentage: number;
            plan: string;
        }, {
            users: number;
            percentage: number;
            plan: string;
        }>, "many">;
        by_registration_method: z.ZodOptional<z.ZodArray<z.ZodObject<{
            method: z.ZodString;
            users: z.ZodNumber;
            percentage: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            users: number;
            percentage: number;
            method: string;
        }, {
            users: number;
            percentage: number;
            method: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        by_region: {
            users: number;
            region: string;
            percentage: number;
        }[];
        by_plan: {
            users: number;
            percentage: number;
            plan: string;
        }[];
        by_registration_method?: {
            users: number;
            percentage: number;
            method: string;
        }[] | undefined;
    }, {
        by_region: {
            users: number;
            region: string;
            percentage: number;
        }[];
        by_plan: {
            users: number;
            percentage: number;
            plan: string;
        }[];
        by_registration_method?: {
            users: number;
            percentage: number;
            method: string;
        }[] | undefined;
    }>;
    activity_patterns: z.ZodObject<{
        peak_hours: z.ZodArray<z.ZodNumber, "many">;
        most_active_day: z.ZodString;
        avg_session_duration: z.ZodNumber;
        actions_per_session: z.ZodOptional<z.ZodNumber>;
        bounce_rate: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        peak_hours: number[];
        most_active_day: string;
        avg_session_duration: number;
        actions_per_session?: number | undefined;
        bounce_rate?: number | undefined;
    }, {
        peak_hours: number[];
        most_active_day: string;
        avg_session_duration: number;
        actions_per_session?: number | undefined;
        bounce_rate?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    timeframe: string;
    granularity: string;
    summary: {
        active_users: number;
        new_registrations: number;
        total_users: number;
        user_growth_rate: number;
        retention_rate?: number | undefined;
        churn_rate?: number | undefined;
    };
    time_series: {
        values: Record<string, number>;
        timestamp: string;
        metadata?: Record<string, any> | undefined;
    }[];
    demographics: {
        by_region: {
            users: number;
            region: string;
            percentage: number;
        }[];
        by_plan: {
            users: number;
            percentage: number;
            plan: string;
        }[];
        by_registration_method?: {
            users: number;
            percentage: number;
            method: string;
        }[] | undefined;
    };
    activity_patterns: {
        peak_hours: number[];
        most_active_day: string;
        avg_session_duration: number;
        actions_per_session?: number | undefined;
        bounce_rate?: number | undefined;
    };
}, {
    timeframe: string;
    granularity: string;
    summary: {
        active_users: number;
        new_registrations: number;
        total_users: number;
        user_growth_rate: number;
        retention_rate?: number | undefined;
        churn_rate?: number | undefined;
    };
    time_series: {
        values: Record<string, number>;
        timestamp: string;
        metadata?: Record<string, any> | undefined;
    }[];
    demographics: {
        by_region: {
            users: number;
            region: string;
            percentage: number;
        }[];
        by_plan: {
            users: number;
            percentage: number;
            plan: string;
        }[];
        by_registration_method?: {
            users: number;
            percentage: number;
            method: string;
        }[] | undefined;
    };
    activity_patterns: {
        peak_hours: number[];
        most_active_day: string;
        avg_session_duration: number;
        actions_per_session?: number | undefined;
        bounce_rate?: number | undefined;
    };
}>;
export declare const ServerAnalyticsSchema: z.ZodObject<{
    timeframe: z.ZodString;
    granularity: z.ZodString;
    summary: z.ZodObject<{
        total_servers: z.ZodNumber;
        avg_uptime: z.ZodNumber;
        avg_cpu_usage: z.ZodNumber;
        avg_memory_usage: z.ZodNumber;
        avg_disk_usage: z.ZodNumber;
        total_restarts: z.ZodNumber;
        total_crashes: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        total_servers: number;
        avg_uptime: number;
        avg_cpu_usage: number;
        avg_memory_usage: number;
        avg_disk_usage: number;
        total_restarts: number;
        total_crashes?: number | undefined;
    }, {
        total_servers: number;
        avg_uptime: number;
        avg_cpu_usage: number;
        avg_memory_usage: number;
        avg_disk_usage: number;
        total_restarts: number;
        total_crashes?: number | undefined;
    }>;
    time_series: z.ZodArray<z.ZodObject<{
        timestamp: z.ZodString;
        values: z.ZodRecord<z.ZodString, z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        values: Record<string, number>;
        timestamp: string;
        metadata?: Record<string, any> | undefined;
    }, {
        values: Record<string, number>;
        timestamp: string;
        metadata?: Record<string, any> | undefined;
    }>, "many">;
    by_game_type: z.ZodArray<z.ZodObject<{
        game: z.ZodString;
        count: z.ZodNumber;
        avg_cpu: z.ZodNumber;
        avg_memory: z.ZodNumber;
        avg_players: z.ZodNumber;
        avg_uptime: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        count: number;
        game: string;
        avg_cpu: number;
        avg_memory: number;
        avg_players: number;
        avg_uptime?: number | undefined;
    }, {
        count: number;
        game: string;
        avg_cpu: number;
        avg_memory: number;
        avg_players: number;
        avg_uptime?: number | undefined;
    }>, "many">;
    by_node: z.ZodOptional<z.ZodArray<z.ZodObject<{
        node_id: z.ZodNumber;
        node_name: z.ZodString;
        server_count: z.ZodNumber;
        avg_cpu: z.ZodNumber;
        avg_memory: z.ZodNumber;
        avg_disk: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        node_id: number;
        avg_cpu: number;
        avg_memory: number;
        node_name: string;
        server_count: number;
        avg_disk: number;
    }, {
        node_id: number;
        avg_cpu: number;
        avg_memory: number;
        node_name: string;
        server_count: number;
        avg_disk: number;
    }>, "many">>;
    performance_metrics: z.ZodObject<{
        top_performing: z.ZodArray<z.ZodObject<{
            server_id: z.ZodNumber;
            name: z.ZodString;
            uptime: z.ZodNumber;
            avg_cpu: z.ZodNumber;
            score: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            uptime: number;
            server_id: number;
            name: string;
            avg_cpu: number;
            score?: number | undefined;
        }, {
            uptime: number;
            server_id: number;
            name: string;
            avg_cpu: number;
            score?: number | undefined;
        }>, "many">;
        problematic: z.ZodArray<z.ZodObject<{
            server_id: z.ZodNumber;
            name: z.ZodString;
            issues: z.ZodArray<z.ZodString, "many">;
            severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
            last_issue: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            issues: string[];
            server_id: number;
            name: string;
            severity: "critical" | "medium" | "high" | "low";
            last_issue?: string | undefined;
        }, {
            issues: string[];
            server_id: number;
            name: string;
            severity: "critical" | "medium" | "high" | "low";
            last_issue?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        top_performing: {
            uptime: number;
            server_id: number;
            name: string;
            avg_cpu: number;
            score?: number | undefined;
        }[];
        problematic: {
            issues: string[];
            server_id: number;
            name: string;
            severity: "critical" | "medium" | "high" | "low";
            last_issue?: string | undefined;
        }[];
    }, {
        top_performing: {
            uptime: number;
            server_id: number;
            name: string;
            avg_cpu: number;
            score?: number | undefined;
        }[];
        problematic: {
            issues: string[];
            server_id: number;
            name: string;
            severity: "critical" | "medium" | "high" | "low";
            last_issue?: string | undefined;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    timeframe: string;
    granularity: string;
    summary: {
        total_servers: number;
        avg_uptime: number;
        avg_cpu_usage: number;
        avg_memory_usage: number;
        avg_disk_usage: number;
        total_restarts: number;
        total_crashes?: number | undefined;
    };
    time_series: {
        values: Record<string, number>;
        timestamp: string;
        metadata?: Record<string, any> | undefined;
    }[];
    by_game_type: {
        count: number;
        game: string;
        avg_cpu: number;
        avg_memory: number;
        avg_players: number;
        avg_uptime?: number | undefined;
    }[];
    performance_metrics: {
        top_performing: {
            uptime: number;
            server_id: number;
            name: string;
            avg_cpu: number;
            score?: number | undefined;
        }[];
        problematic: {
            issues: string[];
            server_id: number;
            name: string;
            severity: "critical" | "medium" | "high" | "low";
            last_issue?: string | undefined;
        }[];
    };
    by_node?: {
        node_id: number;
        avg_cpu: number;
        avg_memory: number;
        node_name: string;
        server_count: number;
        avg_disk: number;
    }[] | undefined;
}, {
    timeframe: string;
    granularity: string;
    summary: {
        total_servers: number;
        avg_uptime: number;
        avg_cpu_usage: number;
        avg_memory_usage: number;
        avg_disk_usage: number;
        total_restarts: number;
        total_crashes?: number | undefined;
    };
    time_series: {
        values: Record<string, number>;
        timestamp: string;
        metadata?: Record<string, any> | undefined;
    }[];
    by_game_type: {
        count: number;
        game: string;
        avg_cpu: number;
        avg_memory: number;
        avg_players: number;
        avg_uptime?: number | undefined;
    }[];
    performance_metrics: {
        top_performing: {
            uptime: number;
            server_id: number;
            name: string;
            avg_cpu: number;
            score?: number | undefined;
        }[];
        problematic: {
            issues: string[];
            server_id: number;
            name: string;
            severity: "critical" | "medium" | "high" | "low";
            last_issue?: string | undefined;
        }[];
    };
    by_node?: {
        node_id: number;
        avg_cpu: number;
        avg_memory: number;
        node_name: string;
        server_count: number;
        avg_disk: number;
    }[] | undefined;
}>;
export declare const ResourceAnalyticsSchema: z.ZodObject<{
    timeframe: z.ZodString;
    granularity: z.ZodString;
    summary: z.ZodObject<{
        total_memory: z.ZodNumber;
        used_memory: z.ZodNumber;
        total_disk: z.ZodNumber;
        used_disk: z.ZodNumber;
        total_cpu_cores: z.ZodOptional<z.ZodNumber>;
        efficiency_score: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        total_memory: number;
        used_memory: number;
        total_disk: number;
        used_disk: number;
        efficiency_score: number;
        total_cpu_cores?: number | undefined;
    }, {
        total_memory: number;
        used_memory: number;
        total_disk: number;
        used_disk: number;
        efficiency_score: number;
        total_cpu_cores?: number | undefined;
    }>;
    utilization_trends: z.ZodArray<z.ZodObject<{
        timestamp: z.ZodString;
        values: z.ZodRecord<z.ZodString, z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        values: Record<string, number>;
        timestamp: string;
        metadata?: Record<string, any> | undefined;
    }, {
        values: Record<string, number>;
        timestamp: string;
        metadata?: Record<string, any> | undefined;
    }>, "many">;
    by_node: z.ZodArray<z.ZodObject<{
        node_id: z.ZodNumber;
        name: z.ZodString;
        memory_efficiency: z.ZodNumber;
        disk_efficiency: z.ZodNumber;
        cpu_efficiency: z.ZodNumber;
        cost_per_gb: z.ZodOptional<z.ZodNumber>;
        utilization_trend: z.ZodOptional<z.ZodEnum<["increasing", "decreasing", "stable"]>>;
    }, "strip", z.ZodTypeAny, {
        node_id: number;
        name: string;
        memory_efficiency: number;
        disk_efficiency: number;
        cpu_efficiency: number;
        cost_per_gb?: number | undefined;
        utilization_trend?: "stable" | "increasing" | "decreasing" | undefined;
    }, {
        node_id: number;
        name: string;
        memory_efficiency: number;
        disk_efficiency: number;
        cpu_efficiency: number;
        cost_per_gb?: number | undefined;
        utilization_trend?: "stable" | "increasing" | "decreasing" | undefined;
    }>, "many">;
    waste_analysis: z.ZodObject<{
        underutilized_memory: z.ZodNumber;
        underutilized_disk: z.ZodNumber;
        underutilized_cpu: z.ZodOptional<z.ZodNumber>;
        potential_savings: z.ZodNumber;
        optimization_opportunities: z.ZodArray<z.ZodString, "many">;
        rightsizing_recommendations: z.ZodOptional<z.ZodArray<z.ZodObject<{
            resource_type: z.ZodEnum<["memory", "disk", "cpu"]>;
            current_allocation: z.ZodNumber;
            recommended_allocation: z.ZodNumber;
            potential_saving: z.ZodNumber;
            affected_servers: z.ZodArray<z.ZodNumber, "many">;
        }, "strip", z.ZodTypeAny, {
            resource_type: "memory" | "cpu" | "disk";
            current_allocation: number;
            recommended_allocation: number;
            potential_saving: number;
            affected_servers: number[];
        }, {
            resource_type: "memory" | "cpu" | "disk";
            current_allocation: number;
            recommended_allocation: number;
            potential_saving: number;
            affected_servers: number[];
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        potential_savings: number;
        underutilized_memory: number;
        underutilized_disk: number;
        optimization_opportunities: string[];
        underutilized_cpu?: number | undefined;
        rightsizing_recommendations?: {
            resource_type: "memory" | "cpu" | "disk";
            current_allocation: number;
            recommended_allocation: number;
            potential_saving: number;
            affected_servers: number[];
        }[] | undefined;
    }, {
        potential_savings: number;
        underutilized_memory: number;
        underutilized_disk: number;
        optimization_opportunities: string[];
        underutilized_cpu?: number | undefined;
        rightsizing_recommendations?: {
            resource_type: "memory" | "cpu" | "disk";
            current_allocation: number;
            recommended_allocation: number;
            potential_saving: number;
            affected_servers: number[];
        }[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    timeframe: string;
    granularity: string;
    by_node: {
        node_id: number;
        name: string;
        memory_efficiency: number;
        disk_efficiency: number;
        cpu_efficiency: number;
        cost_per_gb?: number | undefined;
        utilization_trend?: "stable" | "increasing" | "decreasing" | undefined;
    }[];
    summary: {
        total_memory: number;
        used_memory: number;
        total_disk: number;
        used_disk: number;
        efficiency_score: number;
        total_cpu_cores?: number | undefined;
    };
    utilization_trends: {
        values: Record<string, number>;
        timestamp: string;
        metadata?: Record<string, any> | undefined;
    }[];
    waste_analysis: {
        potential_savings: number;
        underutilized_memory: number;
        underutilized_disk: number;
        optimization_opportunities: string[];
        underutilized_cpu?: number | undefined;
        rightsizing_recommendations?: {
            resource_type: "memory" | "cpu" | "disk";
            current_allocation: number;
            recommended_allocation: number;
            potential_saving: number;
            affected_servers: number[];
        }[] | undefined;
    };
}, {
    timeframe: string;
    granularity: string;
    by_node: {
        node_id: number;
        name: string;
        memory_efficiency: number;
        disk_efficiency: number;
        cpu_efficiency: number;
        cost_per_gb?: number | undefined;
        utilization_trend?: "stable" | "increasing" | "decreasing" | undefined;
    }[];
    summary: {
        total_memory: number;
        used_memory: number;
        total_disk: number;
        used_disk: number;
        efficiency_score: number;
        total_cpu_cores?: number | undefined;
    };
    utilization_trends: {
        values: Record<string, number>;
        timestamp: string;
        metadata?: Record<string, any> | undefined;
    }[];
    waste_analysis: {
        potential_savings: number;
        underutilized_memory: number;
        underutilized_disk: number;
        optimization_opportunities: string[];
        underutilized_cpu?: number | undefined;
        rightsizing_recommendations?: {
            resource_type: "memory" | "cpu" | "disk";
            current_allocation: number;
            recommended_allocation: number;
            potential_saving: number;
            affected_servers: number[];
        }[] | undefined;
    };
}>;
export declare const PerformanceAnalyticsSchema: z.ZodObject<{
    timeframe: z.ZodString;
    granularity: z.ZodString;
    summary: z.ZodObject<{
        overall_score: z.ZodNumber;
        availability: z.ZodNumber;
        response_time: z.ZodNumber;
        error_rate: z.ZodNumber;
        throughput: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        overall_score: number;
        availability: number;
        response_time: number;
        error_rate: number;
        throughput?: number | undefined;
    }, {
        overall_score: number;
        availability: number;
        response_time: number;
        error_rate: number;
        throughput?: number | undefined;
    }>;
    response_times: z.ZodArray<z.ZodObject<{
        timestamp: z.ZodString;
        values: z.ZodRecord<z.ZodString, z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        values: Record<string, number>;
        timestamp: string;
        metadata?: Record<string, any> | undefined;
    }, {
        values: Record<string, number>;
        timestamp: string;
        metadata?: Record<string, any> | undefined;
    }>, "many">;
    error_analysis: z.ZodObject<{
        total_errors: z.ZodNumber;
        by_category: z.ZodArray<z.ZodObject<{
            category: z.ZodString;
            count: z.ZodNumber;
            percentage: z.ZodNumber;
            trend: z.ZodOptional<z.ZodEnum<["increasing", "decreasing", "stable"]>>;
        }, "strip", z.ZodTypeAny, {
            count: number;
            percentage: number;
            category: string;
            trend?: "stable" | "increasing" | "decreasing" | undefined;
        }, {
            count: number;
            percentage: number;
            category: string;
            trend?: "stable" | "increasing" | "decreasing" | undefined;
        }>, "many">;
        trends: z.ZodObject<{
            this_week: z.ZodNumber;
            this_month: z.ZodNumber;
            this_quarter: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            this_week: number;
            this_month: number;
            this_quarter?: number | undefined;
        }, {
            this_week: number;
            this_month: number;
            this_quarter?: number | undefined;
        }>;
        by_status_code: z.ZodOptional<z.ZodArray<z.ZodObject<{
            status_code: z.ZodNumber;
            count: z.ZodNumber;
            percentage: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            count: number;
            percentage: number;
            status_code: number;
        }, {
            count: number;
            percentage: number;
            status_code: number;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        total_errors: number;
        by_category: {
            count: number;
            percentage: number;
            category: string;
            trend?: "stable" | "increasing" | "decreasing" | undefined;
        }[];
        trends: {
            this_week: number;
            this_month: number;
            this_quarter?: number | undefined;
        };
        by_status_code?: {
            count: number;
            percentage: number;
            status_code: number;
        }[] | undefined;
    }, {
        total_errors: number;
        by_category: {
            count: number;
            percentage: number;
            category: string;
            trend?: "stable" | "increasing" | "decreasing" | undefined;
        }[];
        trends: {
            this_week: number;
            this_month: number;
            this_quarter?: number | undefined;
        };
        by_status_code?: {
            count: number;
            percentage: number;
            status_code: number;
        }[] | undefined;
    }>;
    bottlenecks: z.ZodArray<z.ZodObject<{
        component: z.ZodString;
        impact: z.ZodEnum<["low", "medium", "high", "critical"]>;
        avg_delay: z.ZodNumber;
        frequency: z.ZodOptional<z.ZodNumber>;
        suggestions: z.ZodArray<z.ZodString, "many">;
        priority: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        component: string;
        impact: "critical" | "medium" | "high" | "low";
        avg_delay: number;
        suggestions: string[];
        priority?: number | undefined;
        frequency?: number | undefined;
    }, {
        component: string;
        impact: "critical" | "medium" | "high" | "low";
        avg_delay: number;
        suggestions: string[];
        priority?: number | undefined;
        frequency?: number | undefined;
    }>, "many">;
    availability_metrics: z.ZodOptional<z.ZodObject<{
        uptime_percentage: z.ZodNumber;
        downtime_incidents: z.ZodNumber;
        mttr: z.ZodOptional<z.ZodNumber>;
        mtbf: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        uptime_percentage: number;
        downtime_incidents: number;
        mttr?: number | undefined;
        mtbf?: number | undefined;
    }, {
        uptime_percentage: number;
        downtime_incidents: number;
        mttr?: number | undefined;
        mtbf?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    timeframe: string;
    granularity: string;
    summary: {
        overall_score: number;
        availability: number;
        response_time: number;
        error_rate: number;
        throughput?: number | undefined;
    };
    response_times: {
        values: Record<string, number>;
        timestamp: string;
        metadata?: Record<string, any> | undefined;
    }[];
    error_analysis: {
        total_errors: number;
        by_category: {
            count: number;
            percentage: number;
            category: string;
            trend?: "stable" | "increasing" | "decreasing" | undefined;
        }[];
        trends: {
            this_week: number;
            this_month: number;
            this_quarter?: number | undefined;
        };
        by_status_code?: {
            count: number;
            percentage: number;
            status_code: number;
        }[] | undefined;
    };
    bottlenecks: {
        component: string;
        impact: "critical" | "medium" | "high" | "low";
        avg_delay: number;
        suggestions: string[];
        priority?: number | undefined;
        frequency?: number | undefined;
    }[];
    availability_metrics?: {
        uptime_percentage: number;
        downtime_incidents: number;
        mttr?: number | undefined;
        mtbf?: number | undefined;
    } | undefined;
}, {
    timeframe: string;
    granularity: string;
    summary: {
        overall_score: number;
        availability: number;
        response_time: number;
        error_rate: number;
        throughput?: number | undefined;
    };
    response_times: {
        values: Record<string, number>;
        timestamp: string;
        metadata?: Record<string, any> | undefined;
    }[];
    error_analysis: {
        total_errors: number;
        by_category: {
            count: number;
            percentage: number;
            category: string;
            trend?: "stable" | "increasing" | "decreasing" | undefined;
        }[];
        trends: {
            this_week: number;
            this_month: number;
            this_quarter?: number | undefined;
        };
        by_status_code?: {
            count: number;
            percentage: number;
            status_code: number;
        }[] | undefined;
    };
    bottlenecks: {
        component: string;
        impact: "critical" | "medium" | "high" | "low";
        avg_delay: number;
        suggestions: string[];
        priority?: number | undefined;
        frequency?: number | undefined;
    }[];
    availability_metrics?: {
        uptime_percentage: number;
        downtime_incidents: number;
        mttr?: number | undefined;
        mtbf?: number | undefined;
    } | undefined;
}>;
export declare const FinancialAnalyticsSchema: z.ZodObject<{
    timeframe: z.ZodString;
    currency: z.ZodDefault<z.ZodString>;
    summary: z.ZodObject<{
        total_revenue: z.ZodNumber;
        total_costs: z.ZodNumber;
        profit_margin: z.ZodNumber;
        customer_lifetime_value: z.ZodOptional<z.ZodNumber>;
        customer_acquisition_cost: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        total_revenue: number;
        total_costs: number;
        profit_margin: number;
        customer_lifetime_value?: number | undefined;
        customer_acquisition_cost?: number | undefined;
    }, {
        total_revenue: number;
        total_costs: number;
        profit_margin: number;
        customer_lifetime_value?: number | undefined;
        customer_acquisition_cost?: number | undefined;
    }>;
    revenue_breakdown: z.ZodArray<z.ZodObject<{
        source: z.ZodString;
        amount: z.ZodNumber;
        percentage: z.ZodNumber;
        growth_rate: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        source: string;
        percentage: number;
        amount: number;
        growth_rate?: number | undefined;
    }, {
        source: string;
        percentage: number;
        amount: number;
        growth_rate?: number | undefined;
    }>, "many">;
    cost_breakdown: z.ZodArray<z.ZodObject<{
        category: z.ZodString;
        amount: z.ZodNumber;
        percentage: z.ZodNumber;
        trend: z.ZodOptional<z.ZodEnum<["increasing", "decreasing", "stable"]>>;
    }, "strip", z.ZodTypeAny, {
        percentage: number;
        category: string;
        amount: number;
        trend?: "stable" | "increasing" | "decreasing" | undefined;
    }, {
        percentage: number;
        category: string;
        amount: number;
        trend?: "stable" | "increasing" | "decreasing" | undefined;
    }>, "many">;
    pricing_analysis: z.ZodOptional<z.ZodObject<{
        average_revenue_per_user: z.ZodNumber;
        price_sensitivity: z.ZodOptional<z.ZodNumber>;
        optimal_pricing: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        average_revenue_per_user: number;
        price_sensitivity?: number | undefined;
        optimal_pricing?: Record<string, number> | undefined;
    }, {
        average_revenue_per_user: number;
        price_sensitivity?: number | undefined;
        optimal_pricing?: Record<string, number> | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    timeframe: string;
    summary: {
        total_revenue: number;
        total_costs: number;
        profit_margin: number;
        customer_lifetime_value?: number | undefined;
        customer_acquisition_cost?: number | undefined;
    };
    currency: string;
    revenue_breakdown: {
        source: string;
        percentage: number;
        amount: number;
        growth_rate?: number | undefined;
    }[];
    cost_breakdown: {
        percentage: number;
        category: string;
        amount: number;
        trend?: "stable" | "increasing" | "decreasing" | undefined;
    }[];
    pricing_analysis?: {
        average_revenue_per_user: number;
        price_sensitivity?: number | undefined;
        optimal_pricing?: Record<string, number> | undefined;
    } | undefined;
}, {
    timeframe: string;
    summary: {
        total_revenue: number;
        total_costs: number;
        profit_margin: number;
        customer_lifetime_value?: number | undefined;
        customer_acquisition_cost?: number | undefined;
    };
    revenue_breakdown: {
        source: string;
        percentage: number;
        amount: number;
        growth_rate?: number | undefined;
    }[];
    cost_breakdown: {
        percentage: number;
        category: string;
        amount: number;
        trend?: "stable" | "increasing" | "decreasing" | undefined;
    }[];
    currency?: string | undefined;
    pricing_analysis?: {
        average_revenue_per_user: number;
        price_sensitivity?: number | undefined;
        optimal_pricing?: Record<string, number> | undefined;
    } | undefined;
}>;
export declare const AnalyticsExportSchema: z.ZodObject<{
    export_id: z.ZodString;
    format: z.ZodEnum<["csv", "json", "pdf", "xlsx"]>;
    timeframe: z.ZodString;
    metrics: z.ZodArray<z.ZodString, "many">;
    filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    status: z.ZodEnum<["generating", "completed", "failed", "expired"]>;
    progress: z.ZodOptional<z.ZodNumber>;
    file_size: z.ZodOptional<z.ZodNumber>;
    download_url: z.ZodOptional<z.ZodString>;
    expires_at: z.ZodString;
    created_at: z.ZodString;
    completed_at: z.ZodOptional<z.ZodString>;
    error_message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "generating" | "completed" | "failed" | "expired";
    format: "csv" | "json" | "pdf" | "xlsx";
    timeframe: string;
    metrics: string[];
    export_id: string;
    expires_at: string;
    created_at: string;
    filters?: Record<string, any> | undefined;
    progress?: number | undefined;
    file_size?: number | undefined;
    download_url?: string | undefined;
    completed_at?: string | undefined;
    error_message?: string | undefined;
}, {
    status: "generating" | "completed" | "failed" | "expired";
    format: "csv" | "json" | "pdf" | "xlsx";
    timeframe: string;
    metrics: string[];
    export_id: string;
    expires_at: string;
    created_at: string;
    filters?: Record<string, any> | undefined;
    progress?: number | undefined;
    file_size?: number | undefined;
    download_url?: string | undefined;
    completed_at?: string | undefined;
    error_message?: string | undefined;
}>;
export declare const DashboardWidgetSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["metric", "chart", "table", "gauge", "map", "text"]>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    position: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
        width: number;
        height: number;
    }, {
        x: number;
        y: number;
        width: number;
        height: number;
    }>;
    configuration: z.ZodObject<{
        metric: z.ZodOptional<z.ZodString>;
        chart_type: z.ZodOptional<z.ZodEnum<["line", "bar", "pie", "area", "scatter"]>>;
        timeframe: z.ZodOptional<z.ZodString>;
        refresh_interval: z.ZodOptional<z.ZodNumber>;
        filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        display_options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        filters?: Record<string, any> | undefined;
        timeframe?: string | undefined;
        metric?: string | undefined;
        chart_type?: "line" | "bar" | "pie" | "area" | "scatter" | undefined;
        refresh_interval?: number | undefined;
        display_options?: Record<string, any> | undefined;
    }, {
        filters?: Record<string, any> | undefined;
        timeframe?: string | undefined;
        metric?: string | undefined;
        chart_type?: "line" | "bar" | "pie" | "area" | "scatter" | undefined;
        refresh_interval?: number | undefined;
        display_options?: Record<string, any> | undefined;
    }>;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "map" | "metric" | "table" | "chart" | "gauge" | "text";
    id: string;
    title: string;
    configuration: {
        filters?: Record<string, any> | undefined;
        timeframe?: string | undefined;
        metric?: string | undefined;
        chart_type?: "line" | "bar" | "pie" | "area" | "scatter" | undefined;
        refresh_interval?: number | undefined;
        display_options?: Record<string, any> | undefined;
    };
    created_at: string;
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    updated_at: string;
    description?: string | undefined;
    permissions?: string[] | undefined;
}, {
    type: "map" | "metric" | "table" | "chart" | "gauge" | "text";
    id: string;
    title: string;
    configuration: {
        filters?: Record<string, any> | undefined;
        timeframe?: string | undefined;
        metric?: string | undefined;
        chart_type?: "line" | "bar" | "pie" | "area" | "scatter" | undefined;
        refresh_interval?: number | undefined;
        display_options?: Record<string, any> | undefined;
    };
    created_at: string;
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    updated_at: string;
    description?: string | undefined;
    permissions?: string[] | undefined;
}>;
export declare const DashboardLayoutSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    widgets: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["metric", "chart", "table", "gauge", "map", "text"]>;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        position: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            width: number;
            height: number;
        }, {
            x: number;
            y: number;
            width: number;
            height: number;
        }>;
        configuration: z.ZodObject<{
            metric: z.ZodOptional<z.ZodString>;
            chart_type: z.ZodOptional<z.ZodEnum<["line", "bar", "pie", "area", "scatter"]>>;
            timeframe: z.ZodOptional<z.ZodString>;
            refresh_interval: z.ZodOptional<z.ZodNumber>;
            filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            display_options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            filters?: Record<string, any> | undefined;
            timeframe?: string | undefined;
            metric?: string | undefined;
            chart_type?: "line" | "bar" | "pie" | "area" | "scatter" | undefined;
            refresh_interval?: number | undefined;
            display_options?: Record<string, any> | undefined;
        }, {
            filters?: Record<string, any> | undefined;
            timeframe?: string | undefined;
            metric?: string | undefined;
            chart_type?: "line" | "bar" | "pie" | "area" | "scatter" | undefined;
            refresh_interval?: number | undefined;
            display_options?: Record<string, any> | undefined;
        }>;
        permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        created_at: z.ZodString;
        updated_at: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "map" | "metric" | "table" | "chart" | "gauge" | "text";
        id: string;
        title: string;
        configuration: {
            filters?: Record<string, any> | undefined;
            timeframe?: string | undefined;
            metric?: string | undefined;
            chart_type?: "line" | "bar" | "pie" | "area" | "scatter" | undefined;
            refresh_interval?: number | undefined;
            display_options?: Record<string, any> | undefined;
        };
        created_at: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        updated_at: string;
        description?: string | undefined;
        permissions?: string[] | undefined;
    }, {
        type: "map" | "metric" | "table" | "chart" | "gauge" | "text";
        id: string;
        title: string;
        configuration: {
            filters?: Record<string, any> | undefined;
            timeframe?: string | undefined;
            metric?: string | undefined;
            chart_type?: "line" | "bar" | "pie" | "area" | "scatter" | undefined;
            refresh_interval?: number | undefined;
            display_options?: Record<string, any> | undefined;
        };
        created_at: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        updated_at: string;
        description?: string | undefined;
        permissions?: string[] | undefined;
    }>, "many">;
    is_default: z.ZodDefault<z.ZodBoolean>;
    is_public: z.ZodDefault<z.ZodBoolean>;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    created_by: z.ZodOptional<z.ZodNumber>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    created_at: string;
    updated_at: string;
    widgets: {
        type: "map" | "metric" | "table" | "chart" | "gauge" | "text";
        id: string;
        title: string;
        configuration: {
            filters?: Record<string, any> | undefined;
            timeframe?: string | undefined;
            metric?: string | undefined;
            chart_type?: "line" | "bar" | "pie" | "area" | "scatter" | undefined;
            refresh_interval?: number | undefined;
            display_options?: Record<string, any> | undefined;
        };
        created_at: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        updated_at: string;
        description?: string | undefined;
        permissions?: string[] | undefined;
    }[];
    is_default: boolean;
    is_public: boolean;
    description?: string | undefined;
    permissions?: string[] | undefined;
    created_by?: number | undefined;
}, {
    name: string;
    id: string;
    created_at: string;
    updated_at: string;
    widgets: {
        type: "map" | "metric" | "table" | "chart" | "gauge" | "text";
        id: string;
        title: string;
        configuration: {
            filters?: Record<string, any> | undefined;
            timeframe?: string | undefined;
            metric?: string | undefined;
            chart_type?: "line" | "bar" | "pie" | "area" | "scatter" | undefined;
            refresh_interval?: number | undefined;
            display_options?: Record<string, any> | undefined;
        };
        created_at: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        updated_at: string;
        description?: string | undefined;
        permissions?: string[] | undefined;
    }[];
    description?: string | undefined;
    permissions?: string[] | undefined;
    is_default?: boolean | undefined;
    is_public?: boolean | undefined;
    created_by?: number | undefined;
}>;
export declare const AnalyticsAlertSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    metric: z.ZodString;
    condition: z.ZodObject<{
        operator: z.ZodEnum<[">", "<", ">=", "<=", "==", "!="]>;
        threshold: z.ZodNumber;
        aggregation: z.ZodDefault<z.ZodEnum<["avg", "sum", "min", "max", "count"]>>;
        timeframe: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        timeframe: number;
        threshold: number;
        aggregation: "avg" | "sum" | "min" | "max" | "count";
        operator: ">" | "<" | ">=" | "<=" | "==" | "!=";
    }, {
        threshold: number;
        operator: ">" | "<" | ">=" | "<=" | "==" | "!=";
        timeframe?: number | undefined;
        aggregation?: "avg" | "sum" | "min" | "max" | "count" | undefined;
    }>;
    severity: z.ZodEnum<["info", "warning", "error", "critical"]>;
    enabled: z.ZodDefault<z.ZodBoolean>;
    notification_channels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    cooldown_period: z.ZodDefault<z.ZodNumber>;
    filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    last_triggered: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    enabled: boolean;
    id: string;
    metric: string;
    condition: {
        timeframe: number;
        threshold: number;
        aggregation: "avg" | "sum" | "min" | "max" | "count";
        operator: ">" | "<" | ">=" | "<=" | "==" | "!=";
    };
    severity: "warning" | "critical" | "info" | "error";
    created_at: string;
    updated_at: string;
    cooldown_period: number;
    filters?: Record<string, any> | undefined;
    description?: string | undefined;
    notification_channels?: string[] | undefined;
    last_triggered?: string | undefined;
}, {
    name: string;
    id: string;
    metric: string;
    condition: {
        threshold: number;
        operator: ">" | "<" | ">=" | "<=" | "==" | "!=";
        timeframe?: number | undefined;
        aggregation?: "avg" | "sum" | "min" | "max" | "count" | undefined;
    };
    severity: "warning" | "critical" | "info" | "error";
    created_at: string;
    updated_at: string;
    filters?: Record<string, any> | undefined;
    description?: string | undefined;
    enabled?: boolean | undefined;
    notification_channels?: string[] | undefined;
    cooldown_period?: number | undefined;
    last_triggered?: string | undefined;
}>;
export declare const RealTimeMetricSchema: z.ZodObject<{
    metric: z.ZodString;
    value: z.ZodNumber;
    timestamp: z.ZodString;
    tags: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    unit: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    value: number;
    timestamp: string;
    metric: string;
    tags?: Record<string, string> | undefined;
    unit?: string | undefined;
}, {
    value: number;
    timestamp: string;
    metric: string;
    tags?: Record<string, string> | undefined;
    unit?: string | undefined;
}>;
export declare const RealTimeUpdateSchema: z.ZodObject<{
    type: z.ZodEnum<["metric", "event", "status"]>;
    data: z.ZodAny;
    timestamp: z.ZodString;
    source: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "status" | "metric" | "event";
    timestamp: string;
    source?: string | undefined;
    data?: any;
}, {
    type: "status" | "metric" | "event";
    timestamp: string;
    source?: string | undefined;
    data?: any;
}>;
export declare const ComparisonAnalyticsSchema: z.ZodObject<{
    baseline: z.ZodObject<{
        timeframe: z.ZodString;
        start_date: z.ZodString;
        end_date: z.ZodString;
        data: z.ZodRecord<z.ZodString, z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        timeframe: string;
        data: Record<string, number>;
        start_date: string;
        end_date: string;
    }, {
        timeframe: string;
        data: Record<string, number>;
        start_date: string;
        end_date: string;
    }>;
    comparison: z.ZodObject<{
        timeframe: z.ZodString;
        start_date: z.ZodString;
        end_date: z.ZodString;
        data: z.ZodRecord<z.ZodString, z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        timeframe: string;
        data: Record<string, number>;
        start_date: string;
        end_date: string;
    }, {
        timeframe: string;
        data: Record<string, number>;
        start_date: string;
        end_date: string;
    }>;
    differences: z.ZodRecord<z.ZodString, z.ZodObject<{
        absolute_change: z.ZodNumber;
        percentage_change: z.ZodNumber;
        trend: z.ZodEnum<["improving", "declining", "stable"]>;
        significance: z.ZodEnum<["low", "medium", "high"]>;
    }, "strip", z.ZodTypeAny, {
        trend: "stable" | "improving" | "declining";
        absolute_change: number;
        percentage_change: number;
        significance: "medium" | "high" | "low";
    }, {
        trend: "stable" | "improving" | "declining";
        absolute_change: number;
        percentage_change: number;
        significance: "medium" | "high" | "low";
    }>>;
}, "strip", z.ZodTypeAny, {
    baseline: {
        timeframe: string;
        data: Record<string, number>;
        start_date: string;
        end_date: string;
    };
    comparison: {
        timeframe: string;
        data: Record<string, number>;
        start_date: string;
        end_date: string;
    };
    differences: Record<string, {
        trend: "stable" | "improving" | "declining";
        absolute_change: number;
        percentage_change: number;
        significance: "medium" | "high" | "low";
    }>;
}, {
    baseline: {
        timeframe: string;
        data: Record<string, number>;
        start_date: string;
        end_date: string;
    };
    comparison: {
        timeframe: string;
        data: Record<string, number>;
        start_date: string;
        end_date: string;
    };
    differences: Record<string, {
        trend: "stable" | "improving" | "declining";
        absolute_change: number;
        percentage_change: number;
        significance: "medium" | "high" | "low";
    }>;
}>;
export declare const QueryFilterSchema: z.ZodObject<{
    field: z.ZodString;
    operator: z.ZodEnum<["=", "!=", ">", "<", ">=", "<=", "in", "not_in", "like", "not_like"]>;
    value: z.ZodAny;
    logical_operator: z.ZodOptional<z.ZodEnum<["and", "or"]>>;
}, "strip", z.ZodTypeAny, {
    operator: ">" | "<" | ">=" | "<=" | "!=" | "=" | "in" | "not_in" | "like" | "not_like";
    field: string;
    value?: any;
    logical_operator?: "and" | "or" | undefined;
}, {
    operator: ">" | "<" | ">=" | "<=" | "!=" | "=" | "in" | "not_in" | "like" | "not_like";
    field: string;
    value?: any;
    logical_operator?: "and" | "or" | undefined;
}>;
export declare const AnalyticsQuerySchema: z.ZodObject<{
    metrics: z.ZodArray<z.ZodString, "many">;
    dimensions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    filters: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        operator: z.ZodEnum<["=", "!=", ">", "<", ">=", "<=", "in", "not_in", "like", "not_like"]>;
        value: z.ZodAny;
        logical_operator: z.ZodOptional<z.ZodEnum<["and", "or"]>>;
    }, "strip", z.ZodTypeAny, {
        operator: ">" | "<" | ">=" | "<=" | "!=" | "=" | "in" | "not_in" | "like" | "not_like";
        field: string;
        value?: any;
        logical_operator?: "and" | "or" | undefined;
    }, {
        operator: ">" | "<" | ">=" | "<=" | "!=" | "=" | "in" | "not_in" | "like" | "not_like";
        field: string;
        value?: any;
        logical_operator?: "and" | "or" | undefined;
    }>, "many">>;
    time_range: z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        start: string;
        end: string;
    }, {
        start: string;
        end: string;
    }>;
    granularity: z.ZodEnum<["minute", "hour", "day", "week", "month"]>;
    limit: z.ZodOptional<z.ZodNumber>;
    order_by: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        direction: z.ZodEnum<["asc", "desc"]>;
    }, "strip", z.ZodTypeAny, {
        direction: "asc" | "desc";
        field: string;
    }, {
        direction: "asc" | "desc";
        field: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    granularity: "minute" | "hour" | "day" | "week" | "month";
    metrics: string[];
    time_range: {
        start: string;
        end: string;
    };
    filters?: {
        operator: ">" | "<" | ">=" | "<=" | "!=" | "=" | "in" | "not_in" | "like" | "not_like";
        field: string;
        value?: any;
        logical_operator?: "and" | "or" | undefined;
    }[] | undefined;
    dimensions?: string[] | undefined;
    limit?: number | undefined;
    order_by?: {
        direction: "asc" | "desc";
        field: string;
    }[] | undefined;
}, {
    granularity: "minute" | "hour" | "day" | "week" | "month";
    metrics: string[];
    time_range: {
        start: string;
        end: string;
    };
    filters?: {
        operator: ">" | "<" | ">=" | "<=" | "!=" | "=" | "in" | "not_in" | "like" | "not_like";
        field: string;
        value?: any;
        logical_operator?: "and" | "or" | undefined;
    }[] | undefined;
    dimensions?: string[] | undefined;
    limit?: number | undefined;
    order_by?: {
        direction: "asc" | "desc";
        field: string;
    }[] | undefined;
}>;
export declare const CohortAnalysisSchema: z.ZodObject<{
    cohort_type: z.ZodEnum<["registration", "first_purchase", "first_login"]>;
    time_period: z.ZodEnum<["daily", "weekly", "monthly"]>;
    metric: z.ZodEnum<["retention", "revenue", "activity"]>;
    cohorts: z.ZodArray<z.ZodObject<{
        cohort_id: z.ZodString;
        cohort_date: z.ZodString;
        initial_size: z.ZodNumber;
        periods: z.ZodArray<z.ZodObject<{
            period: z.ZodNumber;
            value: z.ZodNumber;
            percentage: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            period: number;
            percentage?: number | undefined;
        }, {
            value: number;
            period: number;
            percentage?: number | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        cohort_id: string;
        cohort_date: string;
        initial_size: number;
        periods: {
            value: number;
            period: number;
            percentage?: number | undefined;
        }[];
    }, {
        cohort_id: string;
        cohort_date: string;
        initial_size: number;
        periods: {
            value: number;
            period: number;
            percentage?: number | undefined;
        }[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    metric: "retention" | "revenue" | "activity";
    cohort_type: "registration" | "first_purchase" | "first_login";
    time_period: "daily" | "weekly" | "monthly";
    cohorts: {
        cohort_id: string;
        cohort_date: string;
        initial_size: number;
        periods: {
            value: number;
            period: number;
            percentage?: number | undefined;
        }[];
    }[];
}, {
    metric: "retention" | "revenue" | "activity";
    cohort_type: "registration" | "first_purchase" | "first_login";
    time_period: "daily" | "weekly" | "monthly";
    cohorts: {
        cohort_id: string;
        cohort_date: string;
        initial_size: number;
        periods: {
            value: number;
            period: number;
            percentage?: number | undefined;
        }[];
    }[];
}>;
export declare const FunnelAnalysisSchema: z.ZodObject<{
    funnel_name: z.ZodString;
    steps: z.ZodArray<z.ZodObject<{
        step_id: z.ZodString;
        step_name: z.ZodString;
        event: z.ZodString;
        users: z.ZodNumber;
        conversion_rate: z.ZodNumber;
        drop_off_rate: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        users: number;
        event: string;
        step_id: string;
        step_name: string;
        conversion_rate: number;
        drop_off_rate: number;
    }, {
        users: number;
        event: string;
        step_id: string;
        step_name: string;
        conversion_rate: number;
        drop_off_rate: number;
    }>, "many">;
    timeframe: z.ZodString;
    total_users: z.ZodNumber;
    overall_conversion_rate: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    timeframe: string;
    total_users: number;
    funnel_name: string;
    steps: {
        users: number;
        event: string;
        step_id: string;
        step_name: string;
        conversion_rate: number;
        drop_off_rate: number;
    }[];
    overall_conversion_rate: number;
}, {
    timeframe: string;
    total_users: number;
    funnel_name: string;
    steps: {
        users: number;
        event: string;
        step_id: string;
        step_name: string;
        conversion_rate: number;
        drop_off_rate: number;
    }[];
    overall_conversion_rate: number;
}>;
export declare function validateMetricName(name: string): boolean;
export declare function validateTimeRange(start: string, end: string, maxRange?: number): {
    valid: boolean;
    error?: string;
};
export declare function validateAggregationMethod(method: string, dataType: string): boolean;
export declare function calculatePercentageChange(current: number, previous: number): number;
export declare function determineSignificance(change: number, threshold: {
    low: number;
    high: number;
}): string;
//# sourceMappingURL=analytics.d.ts.map