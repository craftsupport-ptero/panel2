import { z } from 'zod';

// Analytics data validation schemas

// Time series data schema
export const TimeSeriesDataSchema = z.object({
  timestamp: z.string().datetime(),
  values: z.record(z.number()),
  metadata: z.record(z.any()).optional()
});

export const TimeSeriesQuerySchema = z.object({
  metric: z.string().min(1),
  timeframe: z.enum(['1h', '6h', '24h', '7d', '30d', '90d', '1y']),
  granularity: z.enum(['minute', 'hour', 'day', 'week', 'month']),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  aggregation: z.enum(['avg', 'sum', 'min', 'max', 'count']).default('avg'),
  fill_missing: z.boolean().default(true),
  filters: z.record(z.any()).optional()
});

// User analytics schemas
export const UserAnalyticsSchema = z.object({
  timeframe: z.string(),
  granularity: z.string(),
  summary: z.object({
    total_users: z.number().int().min(0),
    active_users: z.number().int().min(0),
    new_registrations: z.number().int().min(0),
    user_growth_rate: z.number(),
    retention_rate: z.number().optional(),
    churn_rate: z.number().optional()
  }),
  time_series: z.array(TimeSeriesDataSchema),
  demographics: z.object({
    by_region: z.array(z.object({
      region: z.string(),
      users: z.number().int().min(0),
      percentage: z.number().min(0).max(100)
    })),
    by_plan: z.array(z.object({
      plan: z.string(),
      users: z.number().int().min(0),
      percentage: z.number().min(0).max(100)
    })),
    by_registration_method: z.array(z.object({
      method: z.string(),
      users: z.number().int().min(0),
      percentage: z.number().min(0).max(100)
    })).optional()
  }),
  activity_patterns: z.object({
    peak_hours: z.array(z.number().int().min(0).max(23)),
    most_active_day: z.string(),
    avg_session_duration: z.number().min(0),
    actions_per_session: z.number().min(0).optional(),
    bounce_rate: z.number().min(0).max(100).optional()
  })
});

// Server analytics schemas
export const ServerAnalyticsSchema = z.object({
  timeframe: z.string(),
  granularity: z.string(),
  summary: z.object({
    total_servers: z.number().int().min(0),
    avg_uptime: z.number().min(0).max(100),
    avg_cpu_usage: z.number().min(0).max(100),
    avg_memory_usage: z.number().min(0).max(100),
    avg_disk_usage: z.number().min(0).max(100),
    total_restarts: z.number().int().min(0),
    total_crashes: z.number().int().min(0).optional()
  }),
  time_series: z.array(TimeSeriesDataSchema),
  by_game_type: z.array(z.object({
    game: z.string(),
    count: z.number().int().min(0),
    avg_cpu: z.number().min(0).max(100),
    avg_memory: z.number().min(0),
    avg_players: z.number().min(0),
    avg_uptime: z.number().min(0).max(100).optional()
  })),
  by_node: z.array(z.object({
    node_id: z.number().int(),
    node_name: z.string(),
    server_count: z.number().int().min(0),
    avg_cpu: z.number().min(0).max(100),
    avg_memory: z.number().min(0).max(100),
    avg_disk: z.number().min(0).max(100)
  })).optional(),
  performance_metrics: z.object({
    top_performing: z.array(z.object({
      server_id: z.number().int(),
      name: z.string(),
      uptime: z.number().min(0).max(100),
      avg_cpu: z.number().min(0).max(100),
      score: z.number().min(0).max(100).optional()
    })),
    problematic: z.array(z.object({
      server_id: z.number().int(),
      name: z.string(),
      issues: z.array(z.string()),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      last_issue: z.string().datetime().optional()
    }))
  })
});

// Resource analytics schemas
export const ResourceAnalyticsSchema = z.object({
  timeframe: z.string(),
  granularity: z.string(),
  summary: z.object({
    total_memory: z.number().int().min(0),
    used_memory: z.number().int().min(0),
    total_disk: z.number().int().min(0),
    used_disk: z.number().int().min(0),
    total_cpu_cores: z.number().int().min(0).optional(),
    efficiency_score: z.number().min(0).max(100)
  }),
  utilization_trends: z.array(TimeSeriesDataSchema),
  by_node: z.array(z.object({
    node_id: z.number().int(),
    name: z.string(),
    memory_efficiency: z.number().min(0).max(100),
    disk_efficiency: z.number().min(0).max(100),
    cpu_efficiency: z.number().min(0).max(100),
    cost_per_gb: z.number().min(0).optional(),
    utilization_trend: z.enum(['increasing', 'decreasing', 'stable']).optional()
  })),
  waste_analysis: z.object({
    underutilized_memory: z.number().int().min(0),
    underutilized_disk: z.number().int().min(0),
    underutilized_cpu: z.number().min(0).optional(),
    potential_savings: z.number().min(0),
    optimization_opportunities: z.array(z.string()),
    rightsizing_recommendations: z.array(z.object({
      resource_type: z.enum(['memory', 'disk', 'cpu']),
      current_allocation: z.number(),
      recommended_allocation: z.number(),
      potential_saving: z.number(),
      affected_servers: z.array(z.number())
    })).optional()
  })
});

// Performance analytics schemas
export const PerformanceAnalyticsSchema = z.object({
  timeframe: z.string(),
  granularity: z.string(),
  summary: z.object({
    overall_score: z.number().min(0).max(100),
    availability: z.number().min(0).max(100),
    response_time: z.number().min(0),
    error_rate: z.number().min(0).max(100),
    throughput: z.number().min(0).optional()
  }),
  response_times: z.array(TimeSeriesDataSchema),
  error_analysis: z.object({
    total_errors: z.number().int().min(0),
    by_category: z.array(z.object({
      category: z.string(),
      count: z.number().int().min(0),
      percentage: z.number().min(0).max(100),
      trend: z.enum(['increasing', 'decreasing', 'stable']).optional()
    })),
    trends: z.object({
      this_week: z.number(),
      this_month: z.number(),
      this_quarter: z.number().optional()
    }),
    by_status_code: z.array(z.object({
      status_code: z.number().int().min(100).max(599),
      count: z.number().int().min(0),
      percentage: z.number().min(0).max(100)
    })).optional()
  }),
  bottlenecks: z.array(z.object({
    component: z.string(),
    impact: z.enum(['low', 'medium', 'high', 'critical']),
    avg_delay: z.number().min(0),
    frequency: z.number().int().min(0).optional(),
    suggestions: z.array(z.string()),
    priority: z.number().int().min(1).max(10).optional()
  })),
  availability_metrics: z.object({
    uptime_percentage: z.number().min(0).max(100),
    downtime_incidents: z.number().int().min(0),
    mttr: z.number().min(0).optional(), // Mean Time To Recovery
    mtbf: z.number().min(0).optional()  // Mean Time Between Failures
  }).optional()
});

// Financial analytics schemas
export const FinancialAnalyticsSchema = z.object({
  timeframe: z.string(),
  currency: z.string().length(3).default('USD'),
  summary: z.object({
    total_revenue: z.number().min(0),
    total_costs: z.number().min(0),
    profit_margin: z.number(),
    customer_lifetime_value: z.number().min(0).optional(),
    customer_acquisition_cost: z.number().min(0).optional()
  }),
  revenue_breakdown: z.array(z.object({
    source: z.string(),
    amount: z.number().min(0),
    percentage: z.number().min(0).max(100),
    growth_rate: z.number().optional()
  })),
  cost_breakdown: z.array(z.object({
    category: z.string(),
    amount: z.number().min(0),
    percentage: z.number().min(0).max(100),
    trend: z.enum(['increasing', 'decreasing', 'stable']).optional()
  })),
  pricing_analysis: z.object({
    average_revenue_per_user: z.number().min(0),
    price_sensitivity: z.number().min(0).max(1).optional(),
    optimal_pricing: z.record(z.number()).optional()
  }).optional()
});

// Analytics export schemas
export const AnalyticsExportSchema = z.object({
  export_id: z.string(),
  format: z.enum(['csv', 'json', 'pdf', 'xlsx']),
  timeframe: z.string(),
  metrics: z.array(z.string()),
  filters: z.record(z.any()).optional(),
  status: z.enum(['generating', 'completed', 'failed', 'expired']),
  progress: z.number().min(0).max(100).optional(),
  file_size: z.number().int().min(0).optional(),
  download_url: z.string().url().optional(),
  expires_at: z.string().datetime(),
  created_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
  error_message: z.string().optional()
});

// Analytics dashboard configuration schemas
export const DashboardWidgetSchema = z.object({
  id: z.string(),
  type: z.enum(['metric', 'chart', 'table', 'gauge', 'map', 'text']),
  title: z.string().max(255),
  description: z.string().max(1000).optional(),
  position: z.object({
    x: z.number().int().min(0),
    y: z.number().int().min(0),
    width: z.number().int().min(1).max(12),
    height: z.number().int().min(1).max(20)
  }),
  configuration: z.object({
    metric: z.string().optional(),
    chart_type: z.enum(['line', 'bar', 'pie', 'area', 'scatter']).optional(),
    timeframe: z.string().optional(),
    refresh_interval: z.number().int().min(10).max(3600).optional(), // seconds
    filters: z.record(z.any()).optional(),
    display_options: z.record(z.any()).optional()
  }),
  permissions: z.array(z.string()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const DashboardLayoutSchema = z.object({
  id: z.string(),
  name: z.string().max(255),
  description: z.string().max(1000).optional(),
  widgets: z.array(DashboardWidgetSchema),
  is_default: z.boolean().default(false),
  is_public: z.boolean().default(false),
  permissions: z.array(z.string()).optional(),
  created_by: z.number().int().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

// Analytics alert schemas
export const AnalyticsAlertSchema = z.object({
  id: z.string(),
  name: z.string().max(255),
  description: z.string().max(1000).optional(),
  metric: z.string(),
  condition: z.object({
    operator: z.enum(['>', '<', '>=', '<=', '==', '!=']),
    threshold: z.number(),
    aggregation: z.enum(['avg', 'sum', 'min', 'max', 'count']).default('avg'),
    timeframe: z.number().int().min(60).max(86400).default(300) // seconds
  }),
  severity: z.enum(['info', 'warning', 'error', 'critical']),
  enabled: z.boolean().default(true),
  notification_channels: z.array(z.string()).optional(),
  cooldown_period: z.number().int().min(60).max(86400).default(300), // seconds
  filters: z.record(z.any()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  last_triggered: z.string().datetime().optional()
});

// Real-time analytics schemas
export const RealTimeMetricSchema = z.object({
  metric: z.string(),
  value: z.number(),
  timestamp: z.string().datetime(),
  tags: z.record(z.string()).optional(),
  unit: z.string().optional()
});

export const RealTimeUpdateSchema = z.object({
  type: z.enum(['metric', 'event', 'status']),
  data: z.any(),
  timestamp: z.string().datetime(),
  source: z.string().optional()
});

// Analytics comparison schemas
export const ComparisonAnalyticsSchema = z.object({
  baseline: z.object({
    timeframe: z.string(),
    start_date: z.string().datetime(),
    end_date: z.string().datetime(),
    data: z.record(z.number())
  }),
  comparison: z.object({
    timeframe: z.string(),
    start_date: z.string().datetime(),
    end_date: z.string().datetime(),
    data: z.record(z.number())
  }),
  differences: z.record(z.object({
    absolute_change: z.number(),
    percentage_change: z.number(),
    trend: z.enum(['improving', 'declining', 'stable']),
    significance: z.enum(['low', 'medium', 'high'])
  }))
});

// Analytics query builder schemas
export const QueryFilterSchema = z.object({
  field: z.string(),
  operator: z.enum(['=', '!=', '>', '<', '>=', '<=', 'in', 'not_in', 'like', 'not_like']),
  value: z.any(),
  logical_operator: z.enum(['and', 'or']).optional()
});

export const AnalyticsQuerySchema = z.object({
  metrics: z.array(z.string()).min(1),
  dimensions: z.array(z.string()).optional(),
  filters: z.array(QueryFilterSchema).optional(),
  time_range: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }),
  granularity: z.enum(['minute', 'hour', 'day', 'week', 'month']),
  limit: z.number().int().min(1).max(10000).optional(),
  order_by: z.array(z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc'])
  })).optional()
});

// Cohort analysis schemas
export const CohortAnalysisSchema = z.object({
  cohort_type: z.enum(['registration', 'first_purchase', 'first_login']),
  time_period: z.enum(['daily', 'weekly', 'monthly']),
  metric: z.enum(['retention', 'revenue', 'activity']),
  cohorts: z.array(z.object({
    cohort_id: z.string(),
    cohort_date: z.string().datetime(),
    initial_size: z.number().int().min(0),
    periods: z.array(z.object({
      period: z.number().int().min(0),
      value: z.number(),
      percentage: z.number().min(0).max(100).optional()
    }))
  }))
});

// Funnel analysis schemas
export const FunnelAnalysisSchema = z.object({
  funnel_name: z.string(),
  steps: z.array(z.object({
    step_id: z.string(),
    step_name: z.string(),
    event: z.string(),
    users: z.number().int().min(0),
    conversion_rate: z.number().min(0).max(100),
    drop_off_rate: z.number().min(0).max(100)
  })),
  timeframe: z.string(),
  total_users: z.number().int().min(0),
  overall_conversion_rate: z.number().min(0).max(100)
});

// Export validation functions
export function validateMetricName(name: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)*$/.test(name);
}

export function validateTimeRange(start: string, end: string, maxRange?: number): {
  valid: boolean;
  error?: string;
} {
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

export function validateAggregationMethod(method: string, dataType: string): boolean {
  const numericMethods = ['avg', 'sum', 'min', 'max', 'count'];
  const stringMethods = ['count'];
  
  if (dataType === 'number') {
    return numericMethods.includes(method);
  } else if (dataType === 'string') {
    return stringMethods.includes(method);
  }
  
  return false;
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

export function determineSignificance(change: number, threshold: { low: number; high: number }): string {
  const absChange = Math.abs(change);
  if (absChange < threshold.low) return 'low';
  if (absChange < threshold.high) return 'medium';
  return 'high';
}