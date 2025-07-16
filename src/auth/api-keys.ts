import type { Env, ApiKey, User } from '../types';

/**
 * API Key service for application API authentication
 */
export class ApiKeyService {
  private env: Env;
  private readonly keyPrefix = 'api_key:';
  private readonly userKeysPrefix = 'user_api_keys:';

  constructor(env: Env) {
    this.env = env;
  }

  /**
   * Create a new API key for a user
   */
  async createApiKey(
    user: User,
    name: string,
    permissions: string[] = [],
    allowedIps?: string[],
    expiresAt?: Date
  ): Promise<ApiKey> {
    const token = this.generateApiKeyToken();
    const now = new Date();

    const apiKey: ApiKey = {
      id: this.generateKeyId(),
      user_id: user.id,
      name,
      token,
      allowed_ips: allowedIps,
      permissions,
      expires_at: expiresAt?.toISOString(),
      created_at: now.toISOString()
    };

    // Store API key data (without the token for security)
    const keyData = { ...apiKey };
    delete keyData.token; // Don't store the full token

    const keyHash = await this.hashToken(token);
    const keyKey = this.keyPrefix + keyHash;
    
    await this.env.SESSIONS.put(
      keyKey,
      JSON.stringify(keyData),
      expiresAt ? { expiration: Math.floor(expiresAt.getTime() / 1000) } : undefined
    );

    // Track user API keys
    await this.addToUserKeys(user.id, apiKey.id);

    return apiKey;
  }

  /**
   * Validate an API key and return associated data
   */
  async validateApiKey(token: string, clientIp?: string): Promise<{
    valid: boolean;
    apiKey?: ApiKey;
    user?: User;
    error?: string;
  }> {
    try {
      const keyHash = await this.hashToken(token);
      const keyKey = this.keyPrefix + keyHash;
      const keyData = await this.env.SESSIONS.get(keyKey);

      if (!keyData) {
        return { valid: false, error: 'Invalid API key' };
      }

      const apiKey: ApiKey = JSON.parse(keyData);

      // Check expiration
      if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
        await this.revokeApiKey(apiKey.id);
        return { valid: false, error: 'API key has expired' };
      }

      // Check IP restrictions
      if (apiKey.allowed_ips && apiKey.allowed_ips.length > 0 && clientIp) {
        if (!this.isIpAllowed(clientIp, apiKey.allowed_ips)) {
          return { valid: false, error: 'IP address not allowed for this API key' };
        }
      }

      // Update last used timestamp
      await this.updateLastUsed(keyHash);

      // Get user data
      const user = await this.getUserById(apiKey.user_id);
      if (!user) {
        return { valid: false, error: 'Associated user not found' };
      }

      return { valid: true, apiKey, user };
    } catch (error) {
      console.error('API key validation error:', error);
      return { valid: false, error: 'API key validation failed' };
    }
  }

  /**
   * Check if API key has specific permission
   */
  hasPermission(apiKey: ApiKey, permission: string): boolean {
    // Admin users have all permissions
    if (apiKey.permissions.includes('*') || apiKey.permissions.includes('admin.*')) {
      return true;
    }

    // Check for exact permission match
    if (apiKey.permissions.includes(permission)) {
      return true;
    }

    // Check for wildcard permissions
    const permissionParts = permission.split('.');
    for (const apiPermission of apiKey.permissions) {
      if (apiPermission.endsWith('*')) {
        const apiPermissionBase = apiPermission.slice(0, -1);
        if (permission.startsWith(apiPermissionBase)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(keyId: string): Promise<boolean> {
    // Find the key by ID (this is inefficient, in production you'd want a better index)
    const keyHash = await this.findKeyHashById(keyId);
    if (!keyHash) {
      return false;
    }

    const keyKey = this.keyPrefix + keyHash;
    await this.env.SESSIONS.delete(keyKey);

    // Remove from user's key list
    const keyData = await this.env.SESSIONS.get(keyKey);
    if (keyData) {
      const apiKey: ApiKey = JSON.parse(keyData);
      await this.removeFromUserKeys(apiKey.user_id, keyId);
    }

    return true;
  }

  /**
   * Get all API keys for a user
   */
  async getUserApiKeys(userId: number): Promise<ApiKey[]> {
    const userKeysKey = this.userKeysPrefix + userId;
    const keyIds = await this.env.SESSIONS.get(userKeysKey);

    if (!keyIds) {
      return [];
    }

    try {
      const keyIdList: string[] = JSON.parse(keyIds);
      const apiKeys: ApiKey[] = [];

      for (const keyId of keyIdList) {
        const keyHash = await this.findKeyHashById(keyId);
        if (keyHash) {
          const keyKey = this.keyPrefix + keyHash;
          const keyData = await this.env.SESSIONS.get(keyKey);
          if (keyData) {
            const apiKey: ApiKey = JSON.parse(keyData);
            apiKeys.push(apiKey);
          }
        }
      }

      return apiKeys;
    } catch (error) {
      return [];
    }
  }

  /**
   * Generate a secure API key token
   */
  private generateApiKeyToken(): string {
    const prefix = 'ptlr_';
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const token = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    return prefix + token;
  }

  /**
   * Generate a unique key ID
   */
  private generateKeyId(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Hash API key token for storage
   */
  private async hashToken(token: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Check if IP is in allowed list
   */
  private isIpAllowed(clientIp: string, allowedIps: string[]): boolean {
    for (const allowedIp of allowedIps) {
      if (allowedIp === clientIp) {
        return true;
      }
      
      // Check for CIDR notation (simplified)
      if (allowedIp.includes('/')) {
        // This is a simplified CIDR check - in production you'd want a proper IP library
        const [network, prefixLength] = allowedIp.split('/');
        // For now, just check exact match
        if (network === clientIp) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Update last used timestamp for API key
   */
  private async updateLastUsed(keyHash: string): Promise<void> {
    const keyKey = this.keyPrefix + keyHash;
    const keyData = await this.env.SESSIONS.get(keyKey);
    
    if (keyData) {
      try {
        const apiKey: ApiKey = JSON.parse(keyData);
        apiKey.last_used_at = new Date().toISOString();
        
        await this.env.SESSIONS.put(keyKey, JSON.stringify(apiKey));
      } catch (error) {
        // Ignore errors in updating last used time
      }
    }
  }

  /**
   * Find key hash by key ID (inefficient - would need proper indexing in production)
   */
  private async findKeyHashById(keyId: string): Promise<string | null> {
    // This is a placeholder - in production you'd need a proper index
    // For now, we'll store the mapping separately
    const indexKey = 'key_index:' + keyId;
    return await this.env.SESSIONS.get(indexKey);
  }

  /**
   * Get user by ID from database
   */
  private async getUserById(userId: number): Promise<User | null> {
    try {
      const stmt = this.env.DB.prepare('SELECT * FROM users WHERE id = ?');
      const result = await stmt.bind(userId).first();
      
      if (!result) {
        return null;
      }

      return {
        id: result.id as number,
        username: result.username as string,
        email: result.email as string,
        root_admin: Boolean(result.root_admin),
        created_at: result.created_at as string,
        updated_at: result.updated_at as string
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  /**
   * Add API key to user's key list
   */
  private async addToUserKeys(userId: number, keyId: string): Promise<void> {
    const userKeysKey = this.userKeysPrefix + userId;
    const existing = await this.env.SESSIONS.get(userKeysKey);
    
    let keyIds: string[] = [];
    if (existing) {
      try {
        keyIds = JSON.parse(existing);
      } catch (error) {
        keyIds = [];
      }
    }
    
    keyIds.push(keyId);
    
    await this.env.SESSIONS.put(
      userKeysKey,
      JSON.stringify(keyIds),
      { expirationTtl: 365 * 24 * 60 * 60 } // 1 year
    );
  }

  /**
   * Remove API key from user's key list
   */
  private async removeFromUserKeys(userId: number, keyId: string): Promise<void> {
    const userKeysKey = this.userKeysPrefix + userId;
    const existing = await this.env.SESSIONS.get(userKeysKey);
    
    if (existing) {
      try {
        const keyIds: string[] = JSON.parse(existing);
        const filtered = keyIds.filter(id => id !== keyId);
        
        if (filtered.length > 0) {
          await this.env.SESSIONS.put(
            userKeysKey,
            JSON.stringify(filtered),
            { expirationTtl: 365 * 24 * 60 * 60 }
          );
        } else {
          await this.env.SESSIONS.delete(userKeysKey);
        }
      } catch (error) {
        await this.env.SESSIONS.delete(userKeysKey);
      }
    }
  }
}

/**
 * Default API permissions for different user types
 */
export const DEFAULT_PERMISSIONS = {
  USER: [
    'user.read',
    'server.read',
    'server.console',
    'server.files.read',
    'database.read',
    'schedule.read',
    'backup.read'
  ],
  ADMIN: ['*'], // All permissions
  READ_ONLY: [
    'user.read',
    'server.read',
    'database.read',
    'schedule.read',
    'backup.read'
  ]
} as const;