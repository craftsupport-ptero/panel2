declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                username: string;
                email: string;
                role: string;
                permissions: string[];
                hasPermission(permission: string): boolean;
            };
        }
    }
}
export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    status: 'active' | 'suspended' | 'banned';
    permissions: string[];
    created_at: string;
    updated_at: string;
    last_login?: string;
}
export interface AuthenticatedRequest extends Express.Request {
    user: {
        id: number;
        username: string;
        email: string;
        role: string;
        permissions: string[];
        hasPermission(permission: string): boolean;
    };
}
export interface ServerInfo {
    id: number;
    name: string;
    description?: string;
    node_id: number;
    user_id: number;
    status: 'running' | 'stopped' | 'starting' | 'stopping' | 'installing' | 'suspended';
    memory_limit: number;
    disk_limit: number;
    cpu_limit: number;
    created_at: string;
    updated_at: string;
}
export interface NodeInfo {
    id: number;
    name: string;
    location: string;
    fqdn: string;
    scheme: string;
    behind_proxy: boolean;
    public: boolean;
    maintenance_mode: boolean;
    memory: number;
    memory_overallocate: number;
    disk: number;
    disk_overallocate: number;
    upload_size: number;
    daemon_listen: number;
    daemon_sftp: number;
    created_at: string;
    updated_at: string;
}
export interface ApiResponse<T = any> {
    data?: T;
    message?: string;
    error?: string;
    errors?: string[];
    pagination?: {
        current_page: number;
        per_page: number;
        total: number;
        total_pages: number;
        has_next: boolean;
        has_previous: boolean;
    };
}
export interface ErrorResponse {
    error: string;
    message: string;
    details?: any;
}
//# sourceMappingURL=index.d.ts.map