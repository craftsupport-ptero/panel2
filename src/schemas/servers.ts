/**
 * Server validation schemas
 * Defines validation rules for server creation, updates, and operations
 */

export interface ServerCreateSchema {
  name: string;
  description?: string;
  egg_id: number;
  location_id?: number;
  node_id?: number;
  limits: {
    memory: number;
    cpu: number;
    disk: number;
    io?: number;
  };
  environment?: Record<string, string>;
  startup?: string;
}

export interface ServerUpdateSchema {
  name?: string;
  description?: string;
  limits?: {
    memory?: number;
    cpu?: number;
    disk?: number;
    io?: number;
  };
  environment?: Record<string, string>;
  startup?: string;
}

export interface PowerControlSchema {
  signal?: 'start' | 'stop' | 'restart' | 'kill';
}

export class ServerValidation {
  /**
   * Validate server creation request
   */
  static validateServerCreate(data: any): ServerCreateSchema {
    const errors: string[] = [];

    // Validate name
    if (!data.name || typeof data.name !== 'string') {
      errors.push('Server name is required and must be a string');
    } else if (data.name.length < 1 || data.name.length > 255) {
      errors.push('Server name must be between 1 and 255 characters');
    } else if (!/^[a-zA-Z0-9\s\-_.]+$/.test(data.name)) {
      errors.push('Server name can only contain letters, numbers, spaces, hyphens, underscores, and periods');
    }

    // Validate description (optional)
    if (data.description !== undefined) {
      if (typeof data.description !== 'string') {
        errors.push('Description must be a string');
      } else if (data.description.length > 1000) {
        errors.push('Description cannot exceed 1000 characters');
      }
    }

    // Validate egg_id
    if (!data.egg_id || typeof data.egg_id !== 'number') {
      errors.push('Egg ID is required and must be a number');
    } else if (data.egg_id <= 0) {
      errors.push('Egg ID must be a positive integer');
    }

    // Validate location_id (optional)
    if (data.location_id !== undefined) {
      if (typeof data.location_id !== 'number' || data.location_id <= 0) {
        errors.push('Location ID must be a positive integer');
      }
    }

    // Validate node_id (optional)
    if (data.node_id !== undefined) {
      if (typeof data.node_id !== 'number' || data.node_id <= 0) {
        errors.push('Node ID must be a positive integer');
      }
    }

    // Validate limits (required)
    if (!data.limits || typeof data.limits !== 'object') {
      errors.push('Resource limits are required');
    } else {
      const limitsErrors = this.validateResourceLimits(data.limits);
      errors.push(...limitsErrors);
    }

    // Validate environment (optional)
    if (data.environment !== undefined) {
      const envErrors = this.validateEnvironment(data.environment);
      errors.push(...envErrors);
    }

    // Validate startup command (optional)
    if (data.startup !== undefined) {
      if (typeof data.startup !== 'string') {
        errors.push('Startup command must be a string');
      } else if (data.startup.length > 1000) {
        errors.push('Startup command cannot exceed 1000 characters');
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Server creation validation failed', errors);
    }

    return {
      name: data.name.trim(),
      description: data.description?.trim(),
      egg_id: data.egg_id,
      location_id: data.location_id,
      node_id: data.node_id,
      limits: data.limits,
      environment: data.environment || {},
      startup: data.startup?.trim(),
    };
  }

  /**
   * Validate server update request
   */
  static validateServerUpdate(data: any): ServerUpdateSchema {
    const errors: string[] = [];

    // Validate name (optional)
    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        errors.push('Server name must be a string');
      } else if (data.name.length < 1 || data.name.length > 255) {
        errors.push('Server name must be between 1 and 255 characters');
      } else if (!/^[a-zA-Z0-9\s\-_.]+$/.test(data.name)) {
        errors.push('Server name can only contain letters, numbers, spaces, hyphens, underscores, and periods');
      }
    }

    // Validate description (optional)
    if (data.description !== undefined) {
      if (typeof data.description !== 'string') {
        errors.push('Description must be a string');
      } else if (data.description.length > 1000) {
        errors.push('Description cannot exceed 1000 characters');
      }
    }

    // Validate limits (optional)
    if (data.limits !== undefined) {
      if (typeof data.limits !== 'object' || data.limits === null) {
        errors.push('Resource limits must be an object');
      } else {
        const limitsErrors = this.validateResourceLimitsPartial(data.limits);
        errors.push(...limitsErrors);
      }
    }

    // Validate environment (optional)
    if (data.environment !== undefined) {
      const envErrors = this.validateEnvironment(data.environment);
      errors.push(...envErrors);
    }

    // Validate startup command (optional)
    if (data.startup !== undefined) {
      if (typeof data.startup !== 'string') {
        errors.push('Startup command must be a string');
      } else if (data.startup.length > 1000) {
        errors.push('Startup command cannot exceed 1000 characters');
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Server update validation failed', errors);
    }

    const result: ServerUpdateSchema = {};
    
    if (data.name !== undefined) result.name = data.name.trim();
    if (data.description !== undefined) result.description = data.description.trim();
    if (data.limits !== undefined) result.limits = data.limits;
    if (data.environment !== undefined) result.environment = data.environment;
    if (data.startup !== undefined) result.startup = data.startup.trim();

    return result;
  }

  /**
   * Validate power control request
   */
  static validatePowerControl(data: any): PowerControlSchema {
    const errors: string[] = [];
    const validSignals = ['start', 'stop', 'restart', 'kill'];

    if (data.signal !== undefined) {
      if (typeof data.signal !== 'string') {
        errors.push('Signal must be a string');
      } else if (!validSignals.includes(data.signal)) {
        errors.push(`Signal must be one of: ${validSignals.join(', ')}`);
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Power control validation failed', errors);
    }

    return {
      signal: data.signal,
    };
  }

  /**
   * Validate resource limits (complete)
   */
  private static validateResourceLimits(limits: any): string[] {
    const errors: string[] = [];

    // Validate memory
    if (!limits.memory || typeof limits.memory !== 'number') {
      errors.push('Memory limit is required and must be a number');
    } else if (limits.memory < 128) {
      errors.push('Memory limit must be at least 128 MB');
    } else if (limits.memory > 1024 * 1024) {
      errors.push('Memory limit cannot exceed 1TB (1048576 MB)');
    }

    // Validate CPU
    if (!limits.cpu || typeof limits.cpu !== 'number') {
      errors.push('CPU limit is required and must be a number');
    } else if (limits.cpu < 50) {
      errors.push('CPU limit must be at least 50%');
    } else if (limits.cpu > 10000) {
      errors.push('CPU limit cannot exceed 10000% (100 cores)');
    }

    // Validate disk
    if (!limits.disk || typeof limits.disk !== 'number') {
      errors.push('Disk limit is required and must be a number');
    } else if (limits.disk < 1000) {
      errors.push('Disk limit must be at least 1000 MB (1 GB)');
    } else if (limits.disk > 1024 * 1024 * 1024) {
      errors.push('Disk limit cannot exceed 1PB');
    }

    // Validate IO (optional)
    if (limits.io !== undefined) {
      if (typeof limits.io !== 'number') {
        errors.push('IO limit must be a number');
      } else if (limits.io < 10) {
        errors.push('IO limit must be at least 10');
      } else if (limits.io > 10000) {
        errors.push('IO limit cannot exceed 10000');
      }
    }

    return errors;
  }

  /**
   * Validate resource limits (partial for updates)
   */
  private static validateResourceLimitsPartial(limits: any): string[] {
    const errors: string[] = [];

    // Validate memory (optional)
    if (limits.memory !== undefined) {
      if (typeof limits.memory !== 'number') {
        errors.push('Memory limit must be a number');
      } else if (limits.memory < 128) {
        errors.push('Memory limit must be at least 128 MB');
      } else if (limits.memory > 1024 * 1024) {
        errors.push('Memory limit cannot exceed 1TB (1048576 MB)');
      }
    }

    // Validate CPU (optional)
    if (limits.cpu !== undefined) {
      if (typeof limits.cpu !== 'number') {
        errors.push('CPU limit must be a number');
      } else if (limits.cpu < 50) {
        errors.push('CPU limit must be at least 50%');
      } else if (limits.cpu > 10000) {
        errors.push('CPU limit cannot exceed 10000% (100 cores)');
      }
    }

    // Validate disk (optional)
    if (limits.disk !== undefined) {
      if (typeof limits.disk !== 'number') {
        errors.push('Disk limit must be a number');
      } else if (limits.disk < 1000) {
        errors.push('Disk limit must be at least 1000 MB (1 GB)');
      } else if (limits.disk > 1024 * 1024 * 1024) {
        errors.push('Disk limit cannot exceed 1PB');
      }
    }

    // Validate IO (optional)
    if (limits.io !== undefined) {
      if (typeof limits.io !== 'number') {
        errors.push('IO limit must be a number');
      } else if (limits.io < 10) {
        errors.push('IO limit must be at least 10');
      } else if (limits.io > 10000) {
        errors.push('IO limit cannot exceed 10000');
      }
    }

    return errors;
  }

  /**
   * Validate environment variables
   */
  private static validateEnvironment(environment: any): string[] {
    const errors: string[] = [];

    if (typeof environment !== 'object' || environment === null) {
      errors.push('Environment must be an object');
      return errors;
    }

    // Check number of variables
    const keys = Object.keys(environment);
    if (keys.length > 100) {
      errors.push('Cannot have more than 100 environment variables');
    }

    // Validate each key-value pair
    for (const [key, value] of Object.entries(environment)) {
      // Validate key
      if (typeof key !== 'string') {
        errors.push('Environment variable keys must be strings');
      } else if (key.length === 0) {
        errors.push('Environment variable keys cannot be empty');
      } else if (key.length > 255) {
        errors.push('Environment variable keys cannot exceed 255 characters');
      } else if (!/^[A-Z_][A-Z0-9_]*$/i.test(key)) {
        errors.push(`Invalid environment variable key: ${key}. Keys must start with a letter or underscore and contain only letters, numbers, and underscores`);
      }

      // Validate value
      if (typeof value !== 'string') {
        errors.push(`Environment variable value for ${key} must be a string`);
      } else if (value.length > 2000) {
        errors.push(`Environment variable value for ${key} cannot exceed 2000 characters`);
      }
    }

    return errors;
  }
}

/**
 * Database creation schema
 */
export interface DatabaseCreateSchema {
  name: string;
  remote?: string;
}

/**
 * Database validation
 */
export class DatabaseValidation {
  static validateDatabaseCreate(data: any): DatabaseCreateSchema {
    const errors: string[] = [];

    // Validate name
    if (!data.name || typeof data.name !== 'string') {
      errors.push('Database name is required and must be a string');
    } else if (data.name.length < 1 || data.name.length > 64) {
      errors.push('Database name must be between 1 and 64 characters');
    } else if (!/^[a-zA-Z0-9_]+$/.test(data.name)) {
      errors.push('Database name can only contain letters, numbers, and underscores');
    }

    // Validate remote (optional)
    if (data.remote !== undefined) {
      if (typeof data.remote !== 'string') {
        errors.push('Remote must be a string');
      } else if (data.remote.length > 255) {
        errors.push('Remote cannot exceed 255 characters');
      } else if (data.remote !== '%' && !/^[a-zA-Z0-9\-_.%]+$/.test(data.remote)) {
        errors.push('Remote must be a valid hostname, IP address, or %');
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Database creation validation failed', errors);
    }

    return {
      name: data.name.trim(),
      remote: data.remote?.trim() || '%',
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
 * Query parameter validation helpers
 */
export class QueryValidation {
  /**
   * Validate pagination parameters
   */
  static validatePagination(query: URLSearchParams): { page: number; per_page: number } {
    const page = Math.max(1, parseInt(query.get('page') || '1'));
    const per_page = Math.min(100, Math.max(1, parseInt(query.get('per_page') || '25')));

    return { page, per_page };
  }

  /**
   * Validate sorting parameters
   */
  static validateSort(query: URLSearchParams, allowedFields: string[]): { sort?: string; order?: 'asc' | 'desc' } {
    const sort = query.get('sort');
    const order = query.get('order') as 'asc' | 'desc' | null;

    if (sort && !allowedFields.includes(sort)) {
      throw new ValidationError('Invalid sort field', [`Sort field must be one of: ${allowedFields.join(', ')}`]);
    }

    if (order && !['asc', 'desc'].includes(order)) {
      throw new ValidationError('Invalid sort order', ['Sort order must be "asc" or "desc"']);
    }

    return {
      sort: sort || undefined,
      order: order || 'asc',
    };
  }

  /**
   * Validate filter parameters
   */
  static validateFilters(query: URLSearchParams, allowedFilters: string[]): Record<string, string> {
    const filters: Record<string, string> = {};

    // Manual iteration over URLSearchParams
    const keys = [];
    const entries = [];
    const paramString = query.toString();
    if (paramString) {
      const pairs = paramString.split('&');
      for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key && value) {
          keys.push(decodeURIComponent(key));
          entries.push([decodeURIComponent(key), decodeURIComponent(value)]);
        }
      }
    }

    for (const [key, value] of entries) {
      if (allowedFilters.includes(key) && value) {
        filters[key] = value;
      }
    }

    return filters;
  }
}