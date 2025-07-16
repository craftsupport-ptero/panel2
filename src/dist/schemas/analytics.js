"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunnelAnalysisSchema = exports.CohortAnalysisSchema = exports.AnalyticsQuerySchema = exports.QueryFilterSchema = exports.ComparisonAnalyticsSchema = exports.RealTimeUpdateSchema = exports.RealTimeMetricSchema = exports.AnalyticsAlertSchema = exports.DashboardLayoutSchema = exports.DashboardWidgetSchema = exports.AnalyticsExportSchema = exports.FinancialAnalyticsSchema = exports.PerformanceAnalyticsSchema = exports.ResourceAnalyticsSchema = exports.ServerAnalyticsSchema = exports.UserAnalyticsSchema = exports.TimeSeriesQuerySchema = exports.TimeSeriesDataSchema = void 0;
exports.validateMetricName = validateMetricName;
exports.validateTimeRange = validateTimeRange;
exports.validateAggregationMethod = validateAggregationMethod;
exports.calculatePercentageChange = calculatePercentageChange;
exports.determineSignificance = determineSignificance;
const zod_1 = require("zod");
// Analytics data validation schemas
// Time series data schema
exports.TimeSeriesDataSchema = zod_1.z.object({
    timestamp: zod_1.z.string().datetime(),
    values: zod_1.z.record(zod_1.z.number()),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
exports.TimeSeriesQuerySchema = zod_1.z.object({
    metric: zod_1.z.string().min(1),
    timeframe: zod_1.z.enum(['1h', '6h', '24h', '7d', '30d', '90d', '1y']),
    granularity: zod_1.z.enum(['minute', 'hour', 'day', 'week', 'month']),
    start_time: zod_1.z.string().datetime().optional(),
    end_time: zod_1.z.string().datetime().optional(),
    aggregation: zod_1.z.enum(['avg', 'sum', 'min', 'max', 'count']).default('avg'),
    fill_missing: zod_1.z.boolean().default(true),
    filters: zod_1.z.record(zod_1.z.any()).optional()
});
// User analytics schemas
exports.UserAnalyticsSchema = zod_1.z.object({
    timeframe: zod_1.z.string(),
    granularity: zod_1.z.string(),
    summary: zod_1.z.object({
        total_users: zod_1.z.number().int().min(0),
        active_users: zod_1.z.number().int().min(0),
        new_registrations: zod_1.z.number().int().min(0),
        user_growth_rate: zod_1.z.number(),
        retention_rate: zod_1.z.number().optional(),
        churn_rate: zod_1.z.number().optional()
    }),
    time_series: zod_1.z.array(exports.TimeSeriesDataSchema),
    demographics: zod_1.z.object({
        by_region: zod_1.z.array(zod_1.z.object({
            region: zod_1.z.string(),
            users: zod_1.z.number().int().min(0),
            percentage: zod_1.z.number().min(0).max(100)
        })),
        by_plan: zod_1.z.array(zod_1.z.object({
            plan: zod_1.z.string(),
            users: zod_1.z.number().int().min(0),
            percentage: zod_1.z.number().min(0).max(100)
        })),
        by_registration_method: zod_1.z.array(zod_1.z.object({
            method: zod_1.z.string(),
            users: zod_1.z.number().int().min(0),
            percentage: zod_1.z.number().min(0).max(100)
        })).optional()
    }),
    activity_patterns: zod_1.z.object({
        peak_hours: zod_1.z.array(zod_1.z.number().int().min(0).max(23)),
        most_active_day: zod_1.z.string(),
        avg_session_duration: zod_1.z.number().min(0),
        actions_per_session: zod_1.z.number().min(0).optional(),
        bounce_rate: zod_1.z.number().min(0).max(100).optional()
    })
});
// Server analytics schemas
exports.ServerAnalyticsSchema = zod_1.z.object({
    timeframe: zod_1.z.string(),
    granularity: zod_1.z.string(),
    summary: zod_1.z.object({
        total_servers: zod_1.z.number().int().min(0),
        avg_uptime: zod_1.z.number().min(0).max(100),
        avg_cpu_usage: zod_1.z.number().min(0).max(100),
        avg_memory_usage: zod_1.z.number().min(0).max(100),
        avg_disk_usage: zod_1.z.number().min(0).max(100),
        total_restarts: zod_1.z.number().int().min(0),
        total_crashes: zod_1.z.number().int().min(0).optional()
    }),
    time_series: zod_1.z.array(exports.TimeSeriesDataSchema),
    by_game_type: zod_1.z.array(zod_1.z.object({
        game: zod_1.z.string(),
        count: zod_1.z.number().int().min(0),
        avg_cpu: zod_1.z.number().min(0).max(100),
        avg_memory: zod_1.z.number().min(0),
        avg_players: zod_1.z.number().min(0),
        avg_uptime: zod_1.z.number().min(0).max(100).optional()
    })),
    by_node: zod_1.z.array(zod_1.z.object({
        node_id: zod_1.z.number().int(),
        node_name: zod_1.z.string(),
        server_count: zod_1.z.number().int().min(0),
        avg_cpu: zod_1.z.number().min(0).max(100),
        avg_memory: zod_1.z.number().min(0).max(100),
        avg_disk: zod_1.z.number().min(0).max(100)
    })).optional(),
    performance_metrics: zod_1.z.object({
        top_performing: zod_1.z.array(zod_1.z.object({
            server_id: zod_1.z.number().int(),
            name: zod_1.z.string(),
            uptime: zod_1.z.number().min(0).max(100),
            avg_cpu: zod_1.z.number().min(0).max(100),
            score: zod_1.z.number().min(0).max(100).optional()
        })),
        problematic: zod_1.z.array(zod_1.z.object({
            server_id: zod_1.z.number().int(),
            name: zod_1.z.string(),
            issues: zod_1.z.array(zod_1.z.string()),
            severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
            last_issue: zod_1.z.string().datetime().optional()
        }))
    })
});
// Resource analytics schemas
exports.ResourceAnalyticsSchema = zod_1.z.object({
    timeframe: zod_1.z.string(),
    granularity: zod_1.z.string(),
    summary: zod_1.z.object({
        total_memory: zod_1.z.number().int().min(0),
        used_memory: zod_1.z.number().int().min(0),
        total_disk: zod_1.z.number().int().min(0),
        used_disk: zod_1.z.number().int().min(0),
        total_cpu_cores: zod_1.z.number().int().min(0).optional(),
        efficiency_score: zod_1.z.number().min(0).max(100)
    }),
    utilization_trends: zod_1.z.array(exports.TimeSeriesDataSchema),
    by_node: zod_1.z.array(zod_1.z.object({
        node_id: zod_1.z.number().int(),
        name: zod_1.z.string(),
        memory_efficiency: zod_1.z.number().min(0).max(100),
        disk_efficiency: zod_1.z.number().min(0).max(100),
        cpu_efficiency: zod_1.z.number().min(0).max(100),
        cost_per_gb: zod_1.z.number().min(0).optional(),
        utilization_trend: zod_1.z.enum(['increasing', 'decreasing', 'stable']).optional()
    })),
    waste_analysis: zod_1.z.object({
        underutilized_memory: zod_1.z.number().int().min(0),
        underutilized_disk: zod_1.z.number().int().min(0),
        underutilized_cpu: zod_1.z.number().min(0).optional(),
        potential_savings: zod_1.z.number().min(0),
        optimization_opportunities: zod_1.z.array(zod_1.z.string()),
        rightsizing_recommendations: zod_1.z.array(zod_1.z.object({
            resource_type: zod_1.z.enum(['memory', 'disk', 'cpu']),
            current_allocation: zod_1.z.number(),
            recommended_allocation: zod_1.z.number(),
            potential_saving: zod_1.z.number(),
            affected_servers: zod_1.z.array(zod_1.z.number())
        })).optional()
    })
});
// Performance analytics schemas
exports.PerformanceAnalyticsSchema = zod_1.z.object({
    timeframe: zod_1.z.string(),
    granularity: zod_1.z.string(),
    summary: zod_1.z.object({
        overall_score: zod_1.z.number().min(0).max(100),
        availability: zod_1.z.number().min(0).max(100),
        response_time: zod_1.z.number().min(0),
        error_rate: zod_1.z.number().min(0).max(100),
        throughput: zod_1.z.number().min(0).optional()
    }),
    response_times: zod_1.z.array(exports.TimeSeriesDataSchema),
    error_analysis: zod_1.z.object({
        total_errors: zod_1.z.number().int().min(0),
        by_category: zod_1.z.array(zod_1.z.object({
            category: zod_1.z.string(),
            count: zod_1.z.number().int().min(0),
            percentage: zod_1.z.number().min(0).max(100),
            trend: zod_1.z.enum(['increasing', 'decreasing', 'stable']).optional()
        })),
        trends: zod_1.z.object({
            this_week: zod_1.z.number(),
            this_month: zod_1.z.number(),
            this_quarter: zod_1.z.number().optional()
        }),
        by_status_code: zod_1.z.array(zod_1.z.object({
            status_code: zod_1.z.number().int().min(100).max(599),
            count: zod_1.z.number().int().min(0),
            percentage: zod_1.z.number().min(0).max(100)
        })).optional()
    }),
    bottlenecks: zod_1.z.array(zod_1.z.object({
        component: zod_1.z.string(),
        impact: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
        avg_delay: zod_1.z.number().min(0),
        frequency: zod_1.z.number().int().min(0).optional(),
        suggestions: zod_1.z.array(zod_1.z.string()),
        priority: zod_1.z.number().int().min(1).max(10).optional()
    })),
    availability_metrics: zod_1.z.object({
        uptime_percentage: zod_1.z.number().min(0).max(100),
        downtime_incidents: zod_1.z.number().int().min(0),
        mttr: zod_1.z.number().min(0).optional(), // Mean Time To Recovery
        mtbf: zod_1.z.number().min(0).optional() // Mean Time Between Failures
    }).optional()
});
// Financial analytics schemas
exports.FinancialAnalyticsSchema = zod_1.z.object({
    timeframe: zod_1.z.string(),
    currency: zod_1.z.string().length(3).default('USD'),
    summary: zod_1.z.object({
        total_revenue: zod_1.z.number().min(0),
        total_costs: zod_1.z.number().min(0),
        profit_margin: zod_1.z.number(),
        customer_lifetime_value: zod_1.z.number().min(0).optional(),
        customer_acquisition_cost: zod_1.z.number().min(0).optional()
    }),
    revenue_breakdown: zod_1.z.array(zod_1.z.object({
        source: zod_1.z.string(),
        amount: zod_1.z.number().min(0),
        percentage: zod_1.z.number().min(0).max(100),
        growth_rate: zod_1.z.number().optional()
    })),
    cost_breakdown: zod_1.z.array(zod_1.z.object({
        category: zod_1.z.string(),
        amount: zod_1.z.number().min(0),
        percentage: zod_1.z.number().min(0).max(100),
        trend: zod_1.z.enum(['increasing', 'decreasing', 'stable']).optional()
    })),
    pricing_analysis: zod_1.z.object({
        average_revenue_per_user: zod_1.z.number().min(0),
        price_sensitivity: zod_1.z.number().min(0).max(1).optional(),
        optimal_pricing: zod_1.z.record(zod_1.z.number()).optional()
    }).optional()
});
// Analytics export schemas
exports.AnalyticsExportSchema = zod_1.z.object({
    export_id: zod_1.z.string(),
    format: zod_1.z.enum(['csv', 'json', 'pdf', 'xlsx']),
    timeframe: zod_1.z.string(),
    metrics: zod_1.z.array(zod_1.z.string()),
    filters: zod_1.z.record(zod_1.z.any()).optional(),
    status: zod_1.z.enum(['generating', 'completed', 'failed', 'expired']),
    progress: zod_1.z.number().min(0).max(100).optional(),
    file_size: zod_1.z.number().int().min(0).optional(),
    download_url: zod_1.z.string().url().optional(),
    expires_at: zod_1.z.string().datetime(),
    created_at: zod_1.z.string().datetime(),
    completed_at: zod_1.z.string().datetime().optional(),
    error_message: zod_1.z.string().optional()
});
// Analytics dashboard configuration schemas
exports.DashboardWidgetSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.enum(['metric', 'chart', 'table', 'gauge', 'map', 'text']),
    title: zod_1.z.string().max(255),
    description: zod_1.z.string().max(1000).optional(),
    position: zod_1.z.object({
        x: zod_1.z.number().int().min(0),
        y: zod_1.z.number().int().min(0),
        width: zod_1.z.number().int().min(1).max(12),
        height: zod_1.z.number().int().min(1).max(20)
    }),
    configuration: zod_1.z.object({
        metric: zod_1.z.string().optional(),
        chart_type: zod_1.z.enum(['line', 'bar', 'pie', 'area', 'scatter']).optional(),
        timeframe: zod_1.z.string().optional(),
        refresh_interval: zod_1.z.number().int().min(10).max(3600).optional(), // seconds
        filters: zod_1.z.record(zod_1.z.any()).optional(),
        display_options: zod_1.z.record(zod_1.z.any()).optional()
    }),
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime()
});
exports.DashboardLayoutSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().max(255),
    description: zod_1.z.string().max(1000).optional(),
    widgets: zod_1.z.array(exports.DashboardWidgetSchema),
    is_default: zod_1.z.boolean().default(false),
    is_public: zod_1.z.boolean().default(false),
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
    created_by: zod_1.z.number().int().optional(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime()
});
// Analytics alert schemas
exports.AnalyticsAlertSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().max(255),
    description: zod_1.z.string().max(1000).optional(),
    metric: zod_1.z.string(),
    condition: zod_1.z.object({
        operator: zod_1.z.enum(['>', '<', '>=', '<=', '==', '!=']),
        threshold: zod_1.z.number(),
        aggregation: zod_1.z.enum(['avg', 'sum', 'min', 'max', 'count']).default('avg'),
        timeframe: zod_1.z.number().int().min(60).max(86400).default(300) // seconds
    }),
    severity: zod_1.z.enum(['info', 'warning', 'error', 'critical']),
    enabled: zod_1.z.boolean().default(true),
    notification_channels: zod_1.z.array(zod_1.z.string()).optional(),
    cooldown_period: zod_1.z.number().int().min(60).max(86400).default(300), // seconds
    filters: zod_1.z.record(zod_1.z.any()).optional(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
    last_triggered: zod_1.z.string().datetime().optional()
});
// Real-time analytics schemas
exports.RealTimeMetricSchema = zod_1.z.object({
    metric: zod_1.z.string(),
    value: zod_1.z.number(),
    timestamp: zod_1.z.string().datetime(),
    tags: zod_1.z.record(zod_1.z.string()).optional(),
    unit: zod_1.z.string().optional()
});
exports.RealTimeUpdateSchema = zod_1.z.object({
    type: zod_1.z.enum(['metric', 'event', 'status']),
    data: zod_1.z.any(),
    timestamp: zod_1.z.string().datetime(),
    source: zod_1.z.string().optional()
});
// Analytics comparison schemas
exports.ComparisonAnalyticsSchema = zod_1.z.object({
    baseline: zod_1.z.object({
        timeframe: zod_1.z.string(),
        start_date: zod_1.z.string().datetime(),
        end_date: zod_1.z.string().datetime(),
        data: zod_1.z.record(zod_1.z.number())
    }),
    comparison: zod_1.z.object({
        timeframe: zod_1.z.string(),
        start_date: zod_1.z.string().datetime(),
        end_date: zod_1.z.string().datetime(),
        data: zod_1.z.record(zod_1.z.number())
    }),
    differences: zod_1.z.record(zod_1.z.object({
        absolute_change: zod_1.z.number(),
        percentage_change: zod_1.z.number(),
        trend: zod_1.z.enum(['improving', 'declining', 'stable']),
        significance: zod_1.z.enum(['low', 'medium', 'high'])
    }))
});
// Analytics query builder schemas
exports.QueryFilterSchema = zod_1.z.object({
    field: zod_1.z.string(),
    operator: zod_1.z.enum(['=', '!=', '>', '<', '>=', '<=', 'in', 'not_in', 'like', 'not_like']),
    value: zod_1.z.any(),
    logical_operator: zod_1.z.enum(['and', 'or']).optional()
});
exports.AnalyticsQuerySchema = zod_1.z.object({
    metrics: zod_1.z.array(zod_1.z.string()).min(1),
    dimensions: zod_1.z.array(zod_1.z.string()).optional(),
    filters: zod_1.z.array(exports.QueryFilterSchema).optional(),
    time_range: zod_1.z.object({
        start: zod_1.z.string().datetime(),
        end: zod_1.z.string().datetime()
    }),
    granularity: zod_1.z.enum(['minute', 'hour', 'day', 'week', 'month']),
    limit: zod_1.z.number().int().min(1).max(10000).optional(),
    order_by: zod_1.z.array(zod_1.z.object({
        field: zod_1.z.string(),
        direction: zod_1.z.enum(['asc', 'desc'])
    })).optional()
});
// Cohort analysis schemas
exports.CohortAnalysisSchema = zod_1.z.object({
    cohort_type: zod_1.z.enum(['registration', 'first_purchase', 'first_login']),
    time_period: zod_1.z.enum(['daily', 'weekly', 'monthly']),
    metric: zod_1.z.enum(['retention', 'revenue', 'activity']),
    cohorts: zod_1.z.array(zod_1.z.object({
        cohort_id: zod_1.z.string(),
        cohort_date: zod_1.z.string().datetime(),
        initial_size: zod_1.z.number().int().min(0),
        periods: zod_1.z.array(zod_1.z.object({
            period: zod_1.z.number().int().min(0),
            value: zod_1.z.number(),
            percentage: zod_1.z.number().min(0).max(100).optional()
        }))
    }))
});
// Funnel analysis schemas
exports.FunnelAnalysisSchema = zod_1.z.object({
    funnel_name: zod_1.z.string(),
    steps: zod_1.z.array(zod_1.z.object({
        step_id: zod_1.z.string(),
        step_name: zod_1.z.string(),
        event: zod_1.z.string(),
        users: zod_1.z.number().int().min(0),
        conversion_rate: zod_1.z.number().min(0).max(100),
        drop_off_rate: zod_1.z.number().min(0).max(100)
    })),
    timeframe: zod_1.z.string(),
    total_users: zod_1.z.number().int().min(0),
    overall_conversion_rate: zod_1.z.number().min(0).max(100)
});
// Export validation functions
function validateMetricName(name) {
    return /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)*$/.test(name);
}
function validateTimeRange(start, end, maxRange) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return { valid: false, error: 'Invalid date format' };
    }
    if (startDate >= endDate) {
        return { valid: false, error: 'Start date must be before end date' };
    }
    if (maxRange) {
        const rangeDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        if (rangeDays > maxRange) {
            return { valid: false, error: `Time range cannot exceed ${maxRange} days` };
        }
    }
    return { valid: true };
}
function validateAggregationMethod(method, dataType) {
    const numericMethods = ['avg', 'sum', 'min', 'max', 'count'];
    const stringMethods = ['count'];
    if (dataType === 'number') {
        return numericMethods.includes(method);
    }
    else if (dataType === 'string') {
        return stringMethods.includes(method);
    }
    return false;
}
function calculatePercentageChange(current, previous) {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
}
function determineSignificance(change, threshold) {
    const absChange = Math.abs(change);
    if (absChange < threshold.low)
        return 'low';
    if (absChange < threshold.high)
        return 'medium';
    return 'high';
}
//# sourceMappingURL=analytics.js.map