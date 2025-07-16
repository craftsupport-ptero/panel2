/**
 * Node validation schemas
 * Defines validation rules for node creation, updates, and configuration
 */

export interface NodeCreateSchema {
  name: string;
  description?: string;
  location_id: number;
  fqdn: string;
  scheme: 'http' | 'https';
  behind_proxy: boolean;
  maintenance_mode: boolean;
  memory: number;
  memory_overallocate: number;
  disk: number;
  disk_overallocate: number;
  upload_size: number;
  daemon_token_id: string;
  daemon_token: string;
}

export interface NodeUpdateSchema {
  name?: string;
  description?: string;
  location_id?: number;
  fqdn?: string;
  scheme?: 'http' | 'https';
  behind_proxy?: boolean;
  maintenance_mode?: boolean;
  memory?: number;
  memory_overallocate?: number;
  disk?: number;
  disk_overallocate?: number;
  upload_size?: number;
  daemon_token_id?: string;
  daemon_token?: string;
}

export interface AllocationRequestSchema {
  memory: number;
  cpu: number;
  disk: number;
}

export class NodeValidation {
  /**
   * Validate node creation request
   */
  static validateNodeCreate(data: any): NodeCreateSchema {
    const errors: string[] = [];

    // Validate name
    if (!data.name || typeof data.name !== 'string') {
      errors.push('Node name is required and must be a string');
    } else if (data.name.length < 1 || data.name.length > 255) {
      errors.push('Node name must be between 1 and 255 characters');
    } else if (!/^[a-zA-Z0-9\s\-_.]+$/.test(data.name)) {
      errors.push('Node name can only contain letters, numbers, spaces, hyphens, underscores, and periods');
    }

    // Validate description (optional)
    if (data.description !== undefined) {
      if (typeof data.description !== 'string') {
        errors.push('Description must be a string');
      } else if (data.description.length > 1000) {
        errors.push('Description cannot exceed 1000 characters');
      }
    }

    // Validate location_id
    if (!data.location_id || typeof data.location_id !== 'number') {
      errors.push('Location ID is required and must be a number');
    } else if (data.location_id <= 0) {
      errors.push('Location ID must be a positive integer');
    }

    // Validate FQDN
    if (!data.fqdn || typeof data.fqdn !== 'string') {
      errors.push('FQDN is required and must be a string');
    } else if (data.fqdn.length < 1 || data.fqdn.length > 255) {
      errors.push('FQDN must be between 1 and 255 characters');
    } else if (!this.isValidFQDN(data.fqdn)) {
      errors.push('FQDN must be a valid domain name or IP address');
    }

    // Validate scheme
    if (!data.scheme || typeof data.scheme !== 'string') {
      errors.push('Scheme is required and must be a string');
    } else if (!['http', 'https'].includes(data.scheme)) {
      errors.push('Scheme must be either "http" or "https"');
    }

    // Validate behind_proxy
    if (typeof data.behind_proxy !== 'boolean') {
      errors.push('Behind proxy must be a boolean');
    }

    // Validate maintenance_mode
    if (typeof data.maintenance_mode !== 'boolean') {
      errors.push('Maintenance mode must be a boolean');
    }

    // Validate memory
    if (!data.memory || typeof data.memory !== 'number') {
      errors.push('Memory is required and must be a number');
    } else if (data.memory < 1024) {
      errors.push('Memory must be at least 1024 MB (1 GB)');
    } else if (data.memory > 1024 * 1024 * 10) {
      errors.push('Memory cannot exceed 10TB');
    }

    // Validate memory_overallocate
    if (typeof data.memory_overallocate !== 'number') {
      errors.push('Memory overallocate must be a number');
    } else if (data.memory_overallocate < 0) {
      errors.push('Memory overallocate cannot be negative');
    } else if (data.memory_overallocate > 1000) {
      errors.push('Memory overallocate cannot exceed 1000%');
    }

    // Validate disk
    if (!data.disk || typeof data.disk !== 'number') {
      errors.push('Disk is required and must be a number');
    } else if (data.disk < 10000) {
      errors.push('Disk must be at least 10000 MB (10 GB)');
    } else if (data.disk > 1024 * 1024 * 1024 * 100) {
      errors.push('Disk cannot exceed 100PB');
    }

    // Validate disk_overallocate
    if (typeof data.disk_overallocate !== 'number') {
      errors.push('Disk overallocate must be a number');
    } else if (data.disk_overallocate < 0) {
      errors.push('Disk overallocate cannot be negative');
    } else if (data.disk_overallocate > 1000) {
      errors.push('Disk overallocate cannot exceed 1000%');
    }

    // Validate upload_size
    if (!data.upload_size || typeof data.upload_size !== 'number') {
      errors.push('Upload size is required and must be a number');
    } else if (data.upload_size < 1) {
      errors.push('Upload size must be at least 1 MB');
    } else if (data.upload_size > 10000) {
      errors.push('Upload size cannot exceed 10000 MB (10 GB)');
    }

    // Validate daemon_token_id
    if (!data.daemon_token_id || typeof data.daemon_token_id !== 'string') {
      errors.push('Daemon token ID is required and must be a string');
    } else if (data.daemon_token_id.length < 16 || data.daemon_token_id.length > 255) {
      errors.push('Daemon token ID must be between 16 and 255 characters');
    }

    // Validate daemon_token
    if (!data.daemon_token || typeof data.daemon_token !== 'string') {
      errors.push('Daemon token is required and must be a string');
    } else if (data.daemon_token.length < 32 || data.daemon_token.length > 255) {
      errors.push('Daemon token must be between 32 and 255 characters');
    }

    if (errors.length > 0) {
      throw new ValidationError('Node creation validation failed', errors);
    }

    return {
      name: data.name.trim(),
      description: data.description?.trim(),
      location_id: data.location_id,
      fqdn: data.fqdn.trim(),
      scheme: data.scheme,
      behind_proxy: data.behind_proxy,
      maintenance_mode: data.maintenance_mode,
      memory: data.memory,
      memory_overallocate: data.memory_overallocate,
      disk: data.disk,
      disk_overallocate: data.disk_overallocate,
      upload_size: data.upload_size,
      daemon_token_id: data.daemon_token_id.trim(),
      daemon_token: data.daemon_token.trim(),
    };
  }

  /**
   * Validate node update request
   */
  static validateNodeUpdate(data: any): NodeUpdateSchema {
    const errors: string[] = [];

    // Validate name (optional)
    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        errors.push('Node name must be a string');
      } else if (data.name.length < 1 || data.name.length > 255) {
        errors.push('Node name must be between 1 and 255 characters');
      } else if (!/^[a-zA-Z0-9\s\-_.]+$/.test(data.name)) {
        errors.push('Node name can only contain letters, numbers, spaces, hyphens, underscores, and periods');
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

    // Validate location_id (optional)
    if (data.location_id !== undefined) {
      if (typeof data.location_id !== 'number' || data.location_id <= 0) {
        errors.push('Location ID must be a positive integer');
      }
    }

    // Validate FQDN (optional)
    if (data.fqdn !== undefined) {
      if (typeof data.fqdn !== 'string') {
        errors.push('FQDN must be a string');
      } else if (data.fqdn.length < 1 || data.fqdn.length > 255) {
        errors.push('FQDN must be between 1 and 255 characters');
      } else if (!this.isValidFQDN(data.fqdn)) {
        errors.push('FQDN must be a valid domain name or IP address');
      }
    }

    // Validate scheme (optional)
    if (data.scheme !== undefined) {
      if (!['http', 'https'].includes(data.scheme)) {
        errors.push('Scheme must be either "http" or "https"');
      }
    }

    // Validate behind_proxy (optional)
    if (data.behind_proxy !== undefined) {
      if (typeof data.behind_proxy !== 'boolean') {
        errors.push('Behind proxy must be a boolean');
      }
    }

    // Validate maintenance_mode (optional)
    if (data.maintenance_mode !== undefined) {
      if (typeof data.maintenance_mode !== 'boolean') {
        errors.push('Maintenance mode must be a boolean');
      }
    }

    // Validate memory (optional)
    if (data.memory !== undefined) {
      if (typeof data.memory !== 'number') {
        errors.push('Memory must be a number');
      } else if (data.memory < 1024) {
        errors.push('Memory must be at least 1024 MB (1 GB)');
      } else if (data.memory > 1024 * 1024 * 10) {
        errors.push('Memory cannot exceed 10TB');
      }
    }

    // Validate memory_overallocate (optional)
    if (data.memory_overallocate !== undefined) {
      if (typeof data.memory_overallocate !== 'number') {
        errors.push('Memory overallocate must be a number');
      } else if (data.memory_overallocate < 0) {
        errors.push('Memory overallocate cannot be negative');
      } else if (data.memory_overallocate > 1000) {
        errors.push('Memory overallocate cannot exceed 1000%');
      }
    }

    // Validate disk (optional)
    if (data.disk !== undefined) {
      if (typeof data.disk !== 'number') {
        errors.push('Disk must be a number');
      } else if (data.disk < 10000) {
        errors.push('Disk must be at least 10000 MB (10 GB)');
      } else if (data.disk > 1024 * 1024 * 1024 * 100) {
        errors.push('Disk cannot exceed 100PB');
      }
    }

    // Validate disk_overallocate (optional)
    if (data.disk_overallocate !== undefined) {
      if (typeof data.disk_overallocate !== 'number') {
        errors.push('Disk overallocate must be a number');
      } else if (data.disk_overallocate < 0) {
        errors.push('Disk overallocate cannot be negative');
      } else if (data.disk_overallocate > 1000) {
        errors.push('Disk overallocate cannot exceed 1000%');
      }
    }

    // Validate upload_size (optional)
    if (data.upload_size !== undefined) {
      if (typeof data.upload_size !== 'number') {
        errors.push('Upload size must be a number');
      } else if (data.upload_size < 1) {
        errors.push('Upload size must be at least 1 MB');
      } else if (data.upload_size > 10000) {
        errors.push('Upload size cannot exceed 10000 MB (10 GB)');
      }
    }

    // Validate daemon_token_id (optional)
    if (data.daemon_token_id !== undefined) {
      if (typeof data.daemon_token_id !== 'string') {
        errors.push('Daemon token ID must be a string');
      } else if (data.daemon_token_id.length < 16 || data.daemon_token_id.length > 255) {
        errors.push('Daemon token ID must be between 16 and 255 characters');
      }
    }

    // Validate daemon_token (optional)
    if (data.daemon_token !== undefined) {
      if (typeof data.daemon_token !== 'string') {
        errors.push('Daemon token must be a string');
      } else if (data.daemon_token.length < 32 || data.daemon_token.length > 255) {
        errors.push('Daemon token must be between 32 and 255 characters');
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Node update validation failed', errors);
    }

    const result: NodeUpdateSchema = {};
    
    if (data.name !== undefined) result.name = data.name.trim();
    if (data.description !== undefined) result.description = data.description.trim();
    if (data.location_id !== undefined) result.location_id = data.location_id;
    if (data.fqdn !== undefined) result.fqdn = data.fqdn.trim();
    if (data.scheme !== undefined) result.scheme = data.scheme;
    if (data.behind_proxy !== undefined) result.behind_proxy = data.behind_proxy;
    if (data.maintenance_mode !== undefined) result.maintenance_mode = data.maintenance_mode;
    if (data.memory !== undefined) result.memory = data.memory;
    if (data.memory_overallocate !== undefined) result.memory_overallocate = data.memory_overallocate;
    if (data.disk !== undefined) result.disk = data.disk;
    if (data.disk_overallocate !== undefined) result.disk_overallocate = data.disk_overallocate;
    if (data.upload_size !== undefined) result.upload_size = data.upload_size;
    if (data.daemon_token_id !== undefined) result.daemon_token_id = data.daemon_token_id.trim();
    if (data.daemon_token !== undefined) result.daemon_token = data.daemon_token.trim();

    return result;
  }

  /**
   * Validate resource allocation request
   */
  static validateAllocationRequest(data: any): AllocationRequestSchema {
    const errors: string[] = [];

    // Validate memory
    if (!data.memory || typeof data.memory !== 'number') {
      errors.push('Memory is required and must be a number');
    } else if (data.memory < 128) {
      errors.push('Memory must be at least 128 MB');
    } else if (data.memory > 1024 * 1024) {
      errors.push('Memory cannot exceed 1TB (1048576 MB)');
    }

    // Validate CPU
    if (!data.cpu || typeof data.cpu !== 'number') {
      errors.push('CPU is required and must be a number');
    } else if (data.cpu < 50) {
      errors.push('CPU must be at least 50%');
    } else if (data.cpu > 10000) {
      errors.push('CPU cannot exceed 10000% (100 cores)');
    }

    // Validate disk
    if (!data.disk || typeof data.disk !== 'number') {
      errors.push('Disk is required and must be a number');
    } else if (data.disk < 1000) {
      errors.push('Disk must be at least 1000 MB (1 GB)');
    } else if (data.disk > 1024 * 1024 * 1024) {
      errors.push('Disk cannot exceed 1PB');
    }

    if (errors.length > 0) {
      throw new ValidationError('Allocation request validation failed', errors);
    }

    return {
      memory: data.memory,
      cpu: data.cpu,
      disk: data.disk,
    };
  }

  /**
   * Validate FQDN format
   */
  private static isValidFQDN(fqdn: string): boolean {
    // Check for valid IP address
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    if (ipv4Regex.test(fqdn) || ipv6Regex.test(fqdn)) {
      return true;
    }

    // Check for valid domain name
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
    
    if (!domainRegex.test(fqdn)) {
      return false;
    }

    // Additional checks
    if (fqdn.length > 253) {
      return false;
    }

    // Check each label length
    const labels = fqdn.split('.');
    for (const label of labels) {
      if (label.length > 63 || label.length === 0) {
        return false;
      }
    }

    return true;
  }
}

/**
 * Location validation schemas
 */
export interface LocationCreateSchema {
  short: string;
  long: string;
}

export interface LocationUpdateSchema {
  short?: string;
  long?: string;
}

export class LocationValidation {
  /**
   * Validate location creation request
   */
  static validateLocationCreate(data: any): LocationCreateSchema {
    const errors: string[] = [];

    // Validate short code
    if (!data.short || typeof data.short !== 'string') {
      errors.push('Short code is required and must be a string');
    } else if (!/^[A-Z]{3,4}$/.test(data.short)) {
      errors.push('Short code must be 3-4 uppercase letters');
    }

    // Validate long name
    if (!data.long || typeof data.long !== 'string') {
      errors.push('Long name is required and must be a string');
    } else if (data.long.length < 1 || data.long.length > 255) {
      errors.push('Long name must be between 1 and 255 characters');
    } else if (!/^[a-zA-Z0-9\s,.-]+$/.test(data.long)) {
      errors.push('Long name can only contain letters, numbers, spaces, commas, periods, and hyphens');
    }

    if (errors.length > 0) {
      throw new ValidationError('Location creation validation failed', errors);
    }

    return {
      short: data.short.trim().toUpperCase(),
      long: data.long.trim(),
    };
  }

  /**
   * Validate location update request
   */
  static validateLocationUpdate(data: any): LocationUpdateSchema {
    const errors: string[] = [];

    // Validate short code (optional)
    if (data.short !== undefined) {
      if (typeof data.short !== 'string') {
        errors.push('Short code must be a string');
      } else if (!/^[A-Z]{3,4}$/.test(data.short)) {
        errors.push('Short code must be 3-4 uppercase letters');
      }
    }

    // Validate long name (optional)
    if (data.long !== undefined) {
      if (typeof data.long !== 'string') {
        errors.push('Long name must be a string');
      } else if (data.long.length < 1 || data.long.length > 255) {
        errors.push('Long name must be between 1 and 255 characters');
      } else if (!/^[a-zA-Z0-9\s,.-]+$/.test(data.long)) {
        errors.push('Long name can only contain letters, numbers, spaces, commas, periods, and hyphens');
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Location update validation failed', errors);
    }

    const result: LocationUpdateSchema = {};
    
    if (data.short !== undefined) result.short = data.short.trim().toUpperCase();
    if (data.long !== undefined) result.long = data.long.trim();

    return result;
  }
}

/**
 * Custom validation error class (imported from servers.ts)
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