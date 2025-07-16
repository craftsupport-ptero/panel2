export interface Env {
  // Cloudflare bindings
  DB: D1Database;
  CACHE: KVNamespace;
  STORAGE: R2Bucket;

  // Environment variables
  JWT_SECRET: string;
  BCRYPT_ROUNDS: string;
  API_RATE_LIMIT: string;
  CORS_ORIGINS: string;
  ENVIRONMENT: string;
}

export interface JWTPayload {
  sub: string; // user ID
  uuid: string; // user UUID
  type: 'user' | 'application';
  iat: number;
  exp: number;
}

export interface AuthenticatedContext {
  user: {
    id: number;
    uuid: string;
    username: string;
    email: string;
    rootAdmin: boolean;
  };
}

export interface PaginatedResponse<T> {
  object: 'list';
  data: T[];
  meta: {
    pagination: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
      links: {
        next?: string;
        previous?: string;
      };
    };
  };
}

export interface ApiResponse<T = any> {
  object: string;
  attributes?: T;
  data?: T;
  meta?: Record<string, any>;
}

export interface ServerResource {
  object: 'server';
  attributes: {
    id: number;
    external_id?: string;
    uuid: string;
    identifier: string;
    name: string;
    description?: string;
    status?: string;
    suspended: boolean;
    limits: {
      memory: number;
      swap: number;
      disk: number;
      io: number;
      cpu: number;
      threads?: string;
      oom_disabled: boolean;
    };
    feature_limits: {
      databases: number;
      allocations?: number;
      backups: number;
    };
    user: number;
    node: number;
    allocation: number;
    nest: number;
    egg: number;
    container: {
      startup_command: string;
      image: string;
      installed: boolean;
      environment: Record<string, any>;
    };
    updated_at: string;
    created_at: string;
  };
}

export interface UserResource {
  object: 'user';
  attributes: {
    id: number;
    external_id?: string;
    uuid: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    language: string;
    root_admin: boolean;
    2fa: boolean;
    gravatar: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface NodeResource {
  object: 'node';
  attributes: {
    id: number;
    uuid: string;
    public: boolean;
    name: string;
    description?: string;
    location_id: number;
    fqdn: string;
    scheme: string;
    behind_proxy: boolean;
    maintenance_mode: boolean;
    memory: number;
    memory_overallocate: number;
    disk: number;
    disk_overallocate: number;
    allocated_resources: {
      memory: number;
      disk: number;
    };
    created_at: string;
    updated_at: string;
  };
}