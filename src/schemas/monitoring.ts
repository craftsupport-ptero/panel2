/**
 * Monitoring validation schemas
 * Defines validation rules for monitoring data, alerts, and configurations
 */

export interface AlertRuleCreateSchema {
  name: string;
  metric: 'cpu' | 'memory' | 'disk' | 'network';
  operator: 'gt' | 'lt' | 'eq';
  threshold: number;
  duration: number;
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  notification_channels?: string[];
}

export interface AlertRuleUpdateSchema {
  name?: string;
  metric?: 'cpu' | 'memory' | 'disk' | 'network';
  operator?: 'gt' | 'lt' | 'eq';
  threshold?: number;
  duration?: number;
  severity?: 'info' | 'warning' | 'critical';
  enabled?: boolean;
  notification_channels?: string[];
}

export interface MonitoringConfigSchema {
  collection_interval: number;
  retention_period: number;
  alert_enabled: boolean;
  notification_channels: string[];
}

export interface StatsQuerySchema {
  start_time?: string;
  end_time?: string;
  interval?: '1m' | '5m' | '15m' | '1h' | '6h' | '24h';
  metrics?: ('cpu' | 'memory' | 'disk' | 'network')[];
}

export class MonitoringValidation {
  /**
   * Validate alert rule creation request
   */
  static validateAlertRuleCreate(data: any): AlertRuleCreateSchema {
    const errors: string[] = [];

    // Validate name
    if (!data.name || typeof data.name !== 'string') {
      errors.push('Alert rule name is required and must be a string');
    } else if (data.name.length < 1 || data.name.length > 255) {
      errors.push('Alert rule name must be between 1 and 255 characters');
    } else if (!/^[a-zA-Z0-9\s\-_.]+$/.test(data.name)) {
      errors.push('Alert rule name can only contain letters, numbers, spaces, hyphens, underscores, and periods');
    }

    // Validate metric
    const validMetrics = ['cpu', 'memory', 'disk', 'network'];
    if (!data.metric || typeof data.metric !== 'string') {
      errors.push('Metric is required and must be a string');
    } else if (!validMetrics.includes(data.metric)) {
      errors.push(`Metric must be one of: ${validMetrics.join(', ')}`);
    }

    // Validate operator
    const validOperators = ['gt', 'lt', 'eq'];
    if (!data.operator || typeof data.operator !== 'string') {
      errors.push('Operator is required and must be a string');
    } else if (!validOperators.includes(data.operator)) {
      errors.push(`Operator must be one of: ${validOperators.join(', ')}`);
    }

    // Validate threshold
    if (data.threshold === undefined || typeof data.threshold !== 'number') {
      errors.push('Threshold is required and must be a number');
    } else if (data.threshold < 0) {
      errors.push('Threshold cannot be negative');
    } else {
      // Validate threshold ranges based on metric
      const thresholdErrors = this.validateThresholdRange(data.metric, data.threshold);
      errors.push(...thresholdErrors);
    }

    // Validate duration
    if (!data.duration || typeof data.duration !== 'number') {
      errors.push('Duration is required and must be a number');
    } else if (data.duration < 60) {
      errors.push('Duration must be at least 60 seconds');
    } else if (data.duration > 86400) {
      errors.push('Duration cannot exceed 24 hours (86400 seconds)');
    }

    // Validate severity
    const validSeverities = ['info', 'warning', 'critical'];
    if (!data.severity || typeof data.severity !== 'string') {
      errors.push('Severity is required and must be a string');
    } else if (!validSeverities.includes(data.severity)) {
      errors.push(`Severity must be one of: ${validSeverities.join(', ')}`);
    }

    // Validate enabled
    if (typeof data.enabled !== 'boolean') {
      errors.push('Enabled must be a boolean');
    }

    // Validate notification_channels (optional)
    if (data.notification_channels !== undefined) {
      const channelErrors = this.validateNotificationChannels(data.notification_channels);
      errors.push(...channelErrors);
    }

    if (errors.length > 0) {
      throw new ValidationError('Alert rule creation validation failed', errors);
    }

    return {
      name: data.name.trim(),
      metric: data.metric,
      operator: data.operator,
      threshold: data.threshold,
      duration: data.duration,
      severity: data.severity,
      enabled: data.enabled,
      notification_channels: data.notification_channels || [],
    };
  }

  /**
   * Validate alert rule update request
   */
  static validateAlertRuleUpdate(data: any): AlertRuleUpdateSchema {
    const errors: string[] = [];

    // Validate name (optional)
    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        errors.push('Alert rule name must be a string');
      } else if (data.name.length < 1 || data.name.length > 255) {
        errors.push('Alert rule name must be between 1 and 255 characters');
      } else if (!/^[a-zA-Z0-9\s\-_.]+$/.test(data.name)) {
        errors.push('Alert rule name can only contain letters, numbers, spaces, hyphens, underscores, and periods');
      }
    }

    // Validate metric (optional)
    if (data.metric !== undefined) {
      const validMetrics = ['cpu', 'memory', 'disk', 'network'];
      if (typeof data.metric !== 'string' || !validMetrics.includes(data.metric)) {
        errors.push(`Metric must be one of: ${validMetrics.join(', ')}`);
      }
    }

    // Validate operator (optional)
    if (data.operator !== undefined) {
      const validOperators = ['gt', 'lt', 'eq'];
      if (typeof data.operator !== 'string' || !validOperators.includes(data.operator)) {
        errors.push(`Operator must be one of: ${validOperators.join(', ')}`);
      }
    }

    // Validate threshold (optional)
    if (data.threshold !== undefined) {
      if (typeof data.threshold !== 'number') {
        errors.push('Threshold must be a number');
      } else if (data.threshold < 0) {
        errors.push('Threshold cannot be negative');
      } else if (data.metric) {
        const thresholdErrors = this.validateThresholdRange(data.metric, data.threshold);
        errors.push(...thresholdErrors);
      }
    }

    // Validate duration (optional)
    if (data.duration !== undefined) {
      if (typeof data.duration !== 'number') {
        errors.push('Duration must be a number');
      } else if (data.duration < 60) {
        errors.push('Duration must be at least 60 seconds');
      } else if (data.duration > 86400) {
        errors.push('Duration cannot exceed 24 hours (86400 seconds)');
      }
    }

    // Validate severity (optional)
    if (data.severity !== undefined) {
      const validSeverities = ['info', 'warning', 'critical'];
      if (typeof data.severity !== 'string' || !validSeverities.includes(data.severity)) {
        errors.push(`Severity must be one of: ${validSeverities.join(', ')}`);
      }
    }

    // Validate enabled (optional)
    if (data.enabled !== undefined) {
      if (typeof data.enabled !== 'boolean') {
        errors.push('Enabled must be a boolean');
      }
    }

    // Validate notification_channels (optional)
    if (data.notification_channels !== undefined) {
      const channelErrors = this.validateNotificationChannels(data.notification_channels);
      errors.push(...channelErrors);
    }

    if (errors.length > 0) {
      throw new ValidationError('Alert rule update validation failed', errors);
    }

    const result: AlertRuleUpdateSchema = {};
    
    if (data.name !== undefined) result.name = data.name.trim();
    if (data.metric !== undefined) result.metric = data.metric;
    if (data.operator !== undefined) result.operator = data.operator;
    if (data.threshold !== undefined) result.threshold = data.threshold;
    if (data.duration !== undefined) result.duration = data.duration;
    if (data.severity !== undefined) result.severity = data.severity;
    if (data.enabled !== undefined) result.enabled = data.enabled;
    if (data.notification_channels !== undefined) result.notification_channels = data.notification_channels;

    return result;
  }

  /**
   * Validate monitoring configuration
   */
  static validateMonitoringConfig(data: any): MonitoringConfigSchema {
    const errors: string[] = [];

    // Validate collection_interval
    if (!data.collection_interval || typeof data.collection_interval !== 'number') {
      errors.push('Collection interval is required and must be a number');
    } else if (data.collection_interval < 30) {
      errors.push('Collection interval must be at least 30 seconds');
    } else if (data.collection_interval > 3600) {
      errors.push('Collection interval cannot exceed 1 hour (3600 seconds)');
    }

    // Validate retention_period
    if (!data.retention_period || typeof data.retention_period !== 'number') {
      errors.push('Retention period is required and must be a number');
    } else if (data.retention_period < 1) {
      errors.push('Retention period must be at least 1 day');
    } else if (data.retention_period > 365) {
      errors.push('Retention period cannot exceed 365 days');
    }

    // Validate alert_enabled
    if (typeof data.alert_enabled !== 'boolean') {
      errors.push('Alert enabled must be a boolean');
    }

    // Validate notification_channels
    if (!Array.isArray(data.notification_channels)) {
      errors.push('Notification channels must be an array');
    } else {
      const channelErrors = this.validateNotificationChannels(data.notification_channels);
      errors.push(...channelErrors);
    }

    if (errors.length > 0) {
      throw new ValidationError('Monitoring configuration validation failed', errors);
    }

    return {
      collection_interval: data.collection_interval,
      retention_period: data.retention_period,
      alert_enabled: data.alert_enabled,
      notification_channels: data.notification_channels,
    };
  }

  /**
   * Validate statistics query parameters
   */
  static validateStatsQuery(query: URLSearchParams): StatsQuerySchema {
    const errors: string[] = [];
    const result: StatsQuerySchema = {};

    // Validate start_time
    const startTime = query.get('start_time');
    if (startTime) {
      const startDate = new Date(startTime);
      if (isNaN(startDate.getTime())) {
        errors.push('Start time must be a valid ISO 8601 timestamp');
      } else {
        result.start_time = startTime;
      }
    }

    // Validate end_time
    const endTime = query.get('end_time');
    if (endTime) {
      const endDate = new Date(endTime);
      if (isNaN(endDate.getTime())) {
        errors.push('End time must be a valid ISO 8601 timestamp');
      } else {
        result.end_time = endTime;
      }
    }

    // Validate time range
    if (result.start_time && result.end_time) {
      const start = new Date(result.start_time);
      const end = new Date(result.end_time);
      
      if (start >= end) {
        errors.push('Start time must be before end time');
      }
      
      const maxRange = 30 * 24 * 60 * 60 * 1000; // 30 days
      if (end.getTime() - start.getTime() > maxRange) {
        errors.push('Time range cannot exceed 30 days');
      }
    }

    // Validate interval
    const interval = query.get('interval');
    if (interval) {
      const validIntervals = ['1m', '5m', '15m', '1h', '6h', '24h'];
      if (!validIntervals.includes(interval)) {
        errors.push(`Interval must be one of: ${validIntervals.join(', ')}`);
      } else {
        result.interval = interval as StatsQuerySchema['interval'];
      }
    }

    // Validate metrics
    const metricsParam = query.get('metrics');
    if (metricsParam) {
      const metrics = metricsParam.split(',');
      const validMetrics = ['cpu', 'memory', 'disk', 'network'];
      const invalidMetrics = metrics.filter(m => !validMetrics.includes(m));
      
      if (invalidMetrics.length > 0) {
        errors.push(`Invalid metrics: ${invalidMetrics.join(', ')}. Valid metrics are: ${validMetrics.join(', ')}`);
      } else {
        result.metrics = metrics as ('cpu' | 'memory' | 'disk' | 'network')[];
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Statistics query validation failed', errors);
    }

    return result;
  }

  /**
   * Validate threshold range based on metric type
   */
  private static validateThresholdRange(metric: string, threshold: number): string[] {
    const errors: string[] = [];

    switch (metric) {
      case 'cpu':
        if (threshold > 100) {
          errors.push('CPU threshold cannot exceed 100%');
        }
        break;
      
      case 'memory':
        if (threshold > 100) {
          errors.push('Memory threshold cannot exceed 100%');
        }
        break;
      
      case 'disk':
        if (threshold > 100) {
          errors.push('Disk threshold cannot exceed 100%');
        }
        break;
      
      case 'network':
        if (threshold > 1000000000) { // 1GB/s
          errors.push('Network threshold cannot exceed 1GB/s (1000000000 bytes/s)');
        }
        break;
    }

    return errors;
  }

  /**
   * Validate notification channels
   */
  private static validateNotificationChannels(channels: any): string[] {
    const errors: string[] = [];

    if (!Array.isArray(channels)) {
      errors.push('Notification channels must be an array');
      return errors;
    }

    if (channels.length > 10) {
      errors.push('Cannot have more than 10 notification channels');
    }

    const validChannels = ['email', 'webhook', 'discord', 'slack'];
    
    for (const channel of channels) {
      if (typeof channel !== 'string') {
        errors.push('Notification channel must be a string');
      } else if (!validChannels.includes(channel)) {
        errors.push(`Invalid notification channel: ${channel}. Valid channels are: ${validChannels.join(', ')}`);
      }
    }

    // Check for duplicates
    const uniqueChannels = new Set(channels);
    if (uniqueChannels.size !== channels.length) {
      errors.push('Notification channels cannot contain duplicates');
    }

    return errors;
  }
}

/**
 * Alert acknowledgment schema
 */
export interface AlertAcknowledgeSchema {
  acknowledged: boolean;
  note?: string;
}

/**
 * Alert validation
 */
export class AlertValidation {
  /**
   * Validate alert acknowledgment request
   */
  static validateAlertAcknowledge(data: any): AlertAcknowledgeSchema {
    const errors: string[] = [];

    // Validate acknowledged
    if (typeof data.acknowledged !== 'boolean') {
      errors.push('Acknowledged must be a boolean');
    }

    // Validate note (optional)
    if (data.note !== undefined) {
      if (typeof data.note !== 'string') {
        errors.push('Note must be a string');
      } else if (data.note.length > 1000) {
        errors.push('Note cannot exceed 1000 characters');
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Alert acknowledgment validation failed', errors);
    }

    return {
      acknowledged: data.acknowledged,
      note: data.note?.trim(),
    };
  }
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  public errors: string[];

  constructor(message: string, errors: string[]) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      errors: this.errors,
    };
  }
}

/**
 * Monitoring query helpers
 */
export class MonitoringQueryValidation {
  /**
   * Validate log query parameters
   */
  static validateLogQuery(query: URLSearchParams): any {
    const errors: string[] = [];
    const result: any = {};

    // Validate page
    const page = query.get('page');
    if (page) {
      const pageNum = parseInt(page);
      if (isNaN(pageNum) || pageNum < 1) {
        errors.push('Page must be a positive integer');
      } else {
        result.page = pageNum;
      }
    }

    // Validate per_page
    const perPage = query.get('per_page');
    if (perPage) {
      const perPageNum = parseInt(perPage);
      if (isNaN(perPageNum) || perPageNum < 1 || perPageNum > 1000) {
        errors.push('Per page must be between 1 and 1000');
      } else {
        result.per_page = perPageNum;
      }
    }

    // Validate level
    const level = query.get('level');
    if (level) {
      const validLevels = ['debug', 'info', 'warn', 'error'];
      if (!validLevels.includes(level)) {
        errors.push(`Level must be one of: ${validLevels.join(', ')}`);
      } else {
        result.level = level;
      }
    }

    // Validate search
    const search = query.get('search');
    if (search) {
      if (search.length > 255) {
        errors.push('Search term cannot exceed 255 characters');
      } else {
        result.search = search;
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Log query validation failed', errors);
    }

    return result;
  }

  /**
   * Validate real-time streaming parameters
   */
  static validateStreamingParams(query: URLSearchParams): any {
    const errors: string[] = [];
    const result: any = {};

    // Validate interval
    const interval = query.get('interval');
    if (interval) {
      const intervalNum = parseInt(interval);
      if (isNaN(intervalNum) || intervalNum < 1000 || intervalNum > 60000) {
        errors.push('Interval must be between 1000ms (1s) and 60000ms (60s)');
      } else {
        result.interval = intervalNum;
      }
    }

    // Validate buffer_size
    const bufferSize = query.get('buffer_size');
    if (bufferSize) {
      const bufferSizeNum = parseInt(bufferSize);
      if (isNaN(bufferSizeNum) || bufferSizeNum < 1 || bufferSizeNum > 1000) {
        errors.push('Buffer size must be between 1 and 1000');
      } else {
        result.buffer_size = bufferSizeNum;
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Streaming parameters validation failed', errors);
    }

    return result;
  }
}