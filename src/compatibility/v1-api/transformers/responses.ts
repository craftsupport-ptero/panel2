/**
 * Response Transformers
 * 
 * Transforms serverless API responses to legacy Pterodactyl V1 API format
 * Ensures backward compatibility with existing client integrations
 */

interface ServerlessResponse {
    data: any;
    meta?: any;
    links?: any;
    included?: any[];
}

interface LegacyPaginationMeta {
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
}

interface LegacyResponse {
    object: string;
    data?: any[];
    attributes?: any;
    meta?: LegacyPaginationMeta;
}

export class ResponseTransformer {
    /**
     * Transform a list of servers to legacy format
     */
    transformServersList(serverlessResponse: ServerlessResponse): LegacyResponse {
        const servers = Array.isArray(serverlessResponse.data) ? serverlessResponse.data : [serverlessResponse.data];
        
        return {
            object: 'list',
            data: servers.map(server => this.transformServer(server)),
            meta: this.transformPaginationMeta(serverlessResponse.meta)
        };
    }

    /**
     * Transform a single server to legacy format
     */
    transformServer(serverData: any): LegacyResponse {
        return {
            object: 'server',
            attributes: {
                id: serverData.id,
                external_id: serverData.external_id || null,
                uuid: serverData.uuid,
                identifier: serverData.identifier,
                name: serverData.name,
                description: serverData.description || '',
                status: this.mapServerStatus(serverData.status),
                suspended: serverData.suspended || false,
                limits: {
                    memory: serverData.limits?.memory || 0,
                    swap: serverData.limits?.swap || 0,
                    disk: serverData.limits?.disk || 0,
                    io: serverData.limits?.io || 500,
                    cpu: serverData.limits?.cpu || 0
                },
                feature_limits: {
                    databases: serverData.feature_limits?.databases || 0,
                    backups: serverData.feature_limits?.backups || 0,
                    allocations: serverData.feature_limits?.allocations || 0
                },
                user: serverData.owner_id || serverData.user_id,
                node: serverData.node_id,
                allocation: serverData.allocation_id,
                nest: serverData.nest_id,
                egg: serverData.egg_id,
                container: {
                    startup_command: serverData.startup || '',
                    image: serverData.docker_image || '',
                    installed: serverData.installed === true,
                    environment: serverData.environment || {}
                },
                created_at: serverData.created_at,
                updated_at: serverData.updated_at
            }
        };
    }

    /**
     * Transform a list of users to legacy format
     */
    transformUsersList(serverlessResponse: ServerlessResponse): LegacyResponse {
        const users = Array.isArray(serverlessResponse.data) ? serverlessResponse.data : [serverlessResponse.data];
        
        return {
            object: 'list',
            data: users.map(user => this.transformUser(user)),
            meta: this.transformPaginationMeta(serverlessResponse.meta)
        };
    }

    /**
     * Transform a single user to legacy format
     */
    transformUser(userData: any): LegacyResponse {
        return {
            object: 'user',
            attributes: {
                id: userData.id,
                external_id: userData.external_id || null,
                uuid: userData.uuid,
                username: userData.username,
                email: userData.email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                language: userData.language || 'en',
                root_admin: userData.root_admin || false,
                '2fa': userData.two_factor_enabled || false,
                avatar_url: this.generateAvatarUrl(userData),
                admin_role_id: userData.admin_role_id || null,
                created_at: userData.created_at,
                updated_at: userData.updated_at
            }
        };
    }

    /**
     * Transform a list of nodes to legacy format
     */
    transformNodesList(serverlessResponse: ServerlessResponse): LegacyResponse {
        const nodes = Array.isArray(serverlessResponse.data) ? serverlessResponse.data : [serverlessResponse.data];
        
        return {
            object: 'list',
            data: nodes.map(node => this.transformNode(node)),
            meta: this.transformPaginationMeta(serverlessResponse.meta)
        };
    }

    /**
     * Transform a single node to legacy format
     */
    transformNode(nodeData: any): LegacyResponse {
        return {
            object: 'node',
            attributes: {
                id: nodeData.id,
                uuid: nodeData.uuid,
                public: nodeData.public || true,
                name: nodeData.name,
                description: nodeData.description || '',
                location_id: nodeData.location_id,
                fqdn: nodeData.fqdn,
                scheme: nodeData.scheme || 'https',
                behind_proxy: nodeData.behind_proxy || false,
                maintenance_mode: nodeData.maintenance_mode || false,
                memory: nodeData.memory || 0,
                memory_overallocate: nodeData.memory_overallocate || 0,
                disk: nodeData.disk || 0,
                disk_overallocate: nodeData.disk_overallocate || 0,
                upload_size: nodeData.upload_size || 100,
                daemon_listen: nodeData.daemon_listen || 8080,
                daemon_sftp: nodeData.daemon_sftp || 2022,
                daemon_base: nodeData.daemon_base || '/var/lib/pterodactyl/volumes',
                created_at: nodeData.created_at,
                updated_at: nodeData.updated_at
            }
        };
    }

    /**
     * Transform a list of allocations to legacy format
     */
    transformAllocationsList(serverlessResponse: ServerlessResponse): LegacyResponse {
        const allocations = Array.isArray(serverlessResponse.data) ? serverlessResponse.data : [serverlessResponse.data];
        
        return {
            object: 'list',
            data: allocations.map(allocation => this.transformAllocation(allocation)),
            meta: this.transformPaginationMeta(serverlessResponse.meta)
        };
    }

    /**
     * Transform a single allocation to legacy format
     */
    transformAllocation(allocationData: any): LegacyResponse {
        return {
            object: 'allocation',
            attributes: {
                id: allocationData.id,
                ip: allocationData.ip,
                ip_alias: allocationData.ip_alias || null,
                port: allocationData.port,
                notes: allocationData.notes || null,
                assigned: allocationData.server_id !== null,
                server: allocationData.server_id
            }
        };
    }

    /**
     * Transform a list of databases to legacy format
     */
    transformDatabasesList(serverlessResponse: ServerlessResponse): LegacyResponse {
        const databases = Array.isArray(serverlessResponse.data) ? serverlessResponse.data : [serverlessResponse.data];
        
        return {
            object: 'list',
            data: databases.map(database => this.transformDatabase(database)),
            meta: this.transformPaginationMeta(serverlessResponse.meta)
        };
    }

    /**
     * Transform a single database to legacy format
     */
    transformDatabase(databaseData: any): LegacyResponse {
        return {
            object: 'server_database',
            attributes: {
                id: databaseData.id,
                server: databaseData.server_id,
                host: databaseData.host_id,
                database: databaseData.database,
                username: databaseData.username,
                remote: databaseData.remote || '%',
                max_connections: databaseData.max_connections || 0,
                created_at: databaseData.created_at,
                updated_at: databaseData.updated_at
            }
        };
    }

    /**
     * Transform error responses to legacy format
     */
    transformError(error: any): any {
        // Map common serverless errors to legacy error format
        const errorMap: Record<string, string> = {
            'UNAUTHORIZED': 'UnauthorizedException',
            'FORBIDDEN': 'ForbiddenException',
            'NOT_FOUND': 'NotFoundException',
            'VALIDATION_ERROR': 'ValidationException',
            'RATE_LIMITED': 'TooManyRequestsException',
            'SERVER_ERROR': 'InternalServerErrorException'
        };

        const errorCode = errorMap[error.code] || 'InternalServerErrorException';
        const statusCode = error.status || 500;

        return {
            errors: [{
                code: errorCode,
                status: statusCode.toString(),
                detail: error.message || 'An error occurred while processing the request.'
            }]
        };
    }

    /**
     * Transform pagination metadata to legacy format
     */
    private transformPaginationMeta(meta: any): LegacyPaginationMeta | undefined {
        if (!meta || !meta.pagination) {
            return undefined;
        }

        const pagination = meta.pagination;
        
        return {
            pagination: {
                total: pagination.total || 0,
                count: pagination.count || 0,
                per_page: pagination.per_page || 50,
                current_page: pagination.current_page || 1,
                total_pages: pagination.total_pages || 1,
                links: {
                    next: pagination.next_page_url || undefined,
                    previous: pagination.prev_page_url || undefined
                }
            }
        };
    }

    /**
     * Map serverless server status to legacy status
     */
    private mapServerStatus(status: string): string {
        const statusMap: Record<string, string> = {
            'running': 'running',
            'starting': 'starting',
            'stopping': 'stopping',
            'stopped': 'offline',
            'installing': 'installing',
            'suspended': 'suspended',
            'error': 'offline'
        };

        return statusMap[status] || 'offline';
    }

    /**
     * Generate avatar URL for user
     */
    private generateAvatarUrl(userData: any): string {
        // Generate Gravatar URL based on email
        const email = userData.email || '';
        const hash = this.md5(email.toLowerCase().trim());
        return `https://www.gravatar.com/avatar/${hash}?s=128&d=identicon`;
    }

    /**
     * Simple MD5 hash implementation for Gravatar
     */
    private md5(str: string): string {
        // This is a simplified implementation
        // In a real application, you'd use a proper crypto library
        return require('crypto').createHash('md5').update(str).digest('hex');
    }

    /**
     * Transform client API responses (for user-facing endpoints)
     */
    transformClientResponse(data: any, resourceType: string): any {
        switch (resourceType) {
            case 'account':
                return this.transformClientAccount(data);
            case 'servers':
                return Array.isArray(data) ? 
                    data.map(s => this.transformClientServer(s)) : 
                    this.transformClientServer(data);
            case 'server_resources':
                return this.transformServerResources(data);
            default:
                return data;
        }
    }

    /**
     * Transform client account data
     */
    private transformClientAccount(accountData: any): any {
        return {
            object: 'user',
            attributes: {
                id: accountData.id,
                admin: accountData.root_admin || false,
                username: accountData.username,
                email: accountData.email,
                first_name: accountData.first_name,
                last_name: accountData.last_name,
                language: accountData.language || 'en'
            }
        };
    }

    /**
     * Transform client server data
     */
    private transformClientServer(serverData: any): any {
        return {
            object: 'server',
            attributes: {
                server_owner: serverData.is_owner || false,
                identifier: serverData.identifier,
                internal_id: serverData.id,
                uuid: serverData.uuid,
                name: serverData.name,
                description: serverData.description || '',
                status: this.mapServerStatus(serverData.status),
                is_suspended: serverData.suspended || false,
                is_installing: serverData.status === 'installing',
                is_transferring: serverData.status === 'transferring',
                limits: {
                    memory: serverData.limits?.memory || 0,
                    swap: serverData.limits?.swap || 0,
                    disk: serverData.limits?.disk || 0,
                    io: serverData.limits?.io || 500,
                    cpu: serverData.limits?.cpu || 0,
                    threads: serverData.limits?.threads || null,
                    oom_disabled: serverData.limits?.oom_disabled || false
                },
                feature_limits: {
                    databases: serverData.feature_limits?.databases || 0,
                    backups: serverData.feature_limits?.backups || 0,
                    allocations: serverData.feature_limits?.allocations || 0
                },
                invocation: serverData.startup || '',
                docker_image: serverData.docker_image || '',
                egg_features: serverData.egg_features || [],
                is_node_under_maintenance: serverData.node_maintenance || false
            }
        };
    }

    /**
     * Transform server resource usage data
     */
    private transformServerResources(resourceData: any): any {
        return {
            object: 'stats',
            attributes: {
                current_state: resourceData.state || 'offline',
                is_suspended: resourceData.suspended || false,
                resources: {
                    memory_bytes: resourceData.memory?.current || 0,
                    memory_limit_bytes: resourceData.memory?.limit || 0,
                    cpu_absolute: resourceData.cpu?.current || 0,
                    network_rx_bytes: resourceData.network?.rx || 0,
                    network_tx_bytes: resourceData.network?.tx || 0,
                    uptime: resourceData.uptime || 0
                }
            }
        };
    }
}