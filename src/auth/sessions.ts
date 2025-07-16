import type { Env, Session, User } from '../types';

/**
 * Session management service using Cloudflare KV storage
 */
export class SessionService {
  private env: Env;
  private readonly sessionPrefix = 'session:';
  private readonly userSessionsPrefix = 'user_sessions:';

  constructor(env: Env) {
    this.env = env;
  }

  /**
   * Create a new session for a user
   */
  async createSession(
    user: User,
    request: Request
  ): Promise<Session> {
    const sessionId = this.generateSessionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days

    const session: Session = {
      id: sessionId,
      user_id: user.id,
      user_agent: request.headers.get('user-agent') || undefined,
      ip_address: this.getClientIP(request),
      last_activity: now.toISOString(),
      expires_at: expiresAt.toISOString()
    };

    // Store session data
    const sessionKey = this.sessionPrefix + sessionId;
    await this.env.SESSIONS.put(
      sessionKey,
      JSON.stringify(session),
      { expirationTtl: 7 * 24 * 60 * 60 } // 7 days in seconds
    );

    // Track user sessions for cleanup
    await this.addToUserSessions(user.id, sessionId);

    return session;
  }

  /**
   * Retrieve a session by ID
   */
  async getSession(sessionId: string): Promise<Session | null> {
    const sessionKey = this.sessionPrefix + sessionId;
    const sessionData = await this.env.SESSIONS.get(sessionKey);
    
    if (!sessionData) {
      return null;
    }

    try {
      const session: Session = JSON.parse(sessionData);
      
      // Check if session is expired
      if (new Date(session.expires_at) < new Date()) {
        await this.deleteSession(sessionId);
        return null;
      }

      return session;
    } catch (error) {
      // Invalid session data, clean it up
      await this.env.SESSIONS.delete(sessionKey);
      return null;
    }
  }

  /**
   * Update session last activity
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return;
    }

    session.last_activity = new Date().toISOString();
    
    const sessionKey = this.sessionPrefix + sessionId;
    await this.env.SESSIONS.put(
      sessionKey,
      JSON.stringify(session),
      { expirationTtl: 7 * 24 * 60 * 60 }
    );
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      await this.removeFromUserSessions(session.user_id, sessionId);
    }

    const sessionKey = this.sessionPrefix + sessionId;
    await this.env.SESSIONS.delete(sessionKey);
  }

  /**
   * Delete all sessions for a user (logout from all devices)
   */
  async deleteUserSessions(userId: number): Promise<void> {
    const userSessionsKey = this.userSessionsPrefix + userId;
    const sessionIds = await this.env.SESSIONS.get(userSessionsKey);
    
    if (sessionIds) {
      try {
        const sessions: string[] = JSON.parse(sessionIds);
        
        // Delete all sessions
        const deletePromises = sessions.map(sessionId => {
          const sessionKey = this.sessionPrefix + sessionId;
          return this.env.SESSIONS.delete(sessionKey);
        });
        
        await Promise.all(deletePromises);
        
        // Clear user sessions list
        await this.env.SESSIONS.delete(userSessionsKey);
      } catch (error) {
        // Invalid data, just delete the key
        await this.env.SESSIONS.delete(userSessionsKey);
      }
    }
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: number): Promise<Session[]> {
    const userSessionsKey = this.userSessionsPrefix + userId;
    const sessionIds = await this.env.SESSIONS.get(userSessionsKey);
    
    if (!sessionIds) {
      return [];
    }

    try {
      const sessionIdList: string[] = JSON.parse(sessionIds);
      const sessions: Session[] = [];
      
      for (const sessionId of sessionIdList) {
        const session = await this.getSession(sessionId);
        if (session) {
          sessions.push(session);
        }
      }
      
      return sessions;
    } catch (error) {
      return [];
    }
  }

  /**
   * Clean up expired sessions (should be called periodically)
   */
  async cleanupExpiredSessions(): Promise<number> {
    // This is a simplified cleanup - in production you'd want to
    // implement a more efficient cleanup mechanism
    let cleaned = 0;
    
    // Note: KV doesn't support listing all keys, so we rely on TTL
    // for automatic cleanup. This method would need to be enhanced
    // with a separate index for production use.
    
    return cleaned;
  }

  /**
   * Generate a cryptographically secure session ID
   */
  private generateSessionId(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Extract client IP address from request
   */
  private getClientIP(request: Request): string {
    // Check various headers that might contain the real IP
    const headers = [
      'cf-connecting-ip',
      'x-forwarded-for',
      'x-real-ip',
      'x-client-ip'
    ];

    for (const header of headers) {
      const ip = request.headers.get(header);
      if (ip) {
        // If multiple IPs, take the first one
        return ip.split(',')[0].trim();
      }
    }

    // Fallback - this won't work in Cloudflare Workers but included for completeness
    return 'unknown';
  }

  /**
   * Add session ID to user's session list
   */
  private async addToUserSessions(userId: number, sessionId: string): Promise<void> {
    const userSessionsKey = this.userSessionsPrefix + userId;
    const existing = await this.env.SESSIONS.get(userSessionsKey);
    
    let sessionIds: string[] = [];
    if (existing) {
      try {
        sessionIds = JSON.parse(existing);
      } catch (error) {
        // Invalid data, start fresh
        sessionIds = [];
      }
    }
    
    sessionIds.push(sessionId);
    
    // Keep only the last 10 sessions per user
    if (sessionIds.length > 10) {
      const oldSessionIds = sessionIds.slice(0, -10);
      sessionIds = sessionIds.slice(-10);
      
      // Clean up old sessions
      const cleanupPromises = oldSessionIds.map(id => {
        const sessionKey = this.sessionPrefix + id;
        return this.env.SESSIONS.delete(sessionKey);
      });
      await Promise.all(cleanupPromises);
    }
    
    await this.env.SESSIONS.put(
      userSessionsKey,
      JSON.stringify(sessionIds),
      { expirationTtl: 30 * 24 * 60 * 60 } // 30 days
    );
  }

  /**
   * Remove session ID from user's session list
   */
  private async removeFromUserSessions(userId: number, sessionId: string): Promise<void> {
    const userSessionsKey = this.userSessionsPrefix + userId;
    const existing = await this.env.SESSIONS.get(userSessionsKey);
    
    if (existing) {
      try {
        const sessionIds: string[] = JSON.parse(existing);
        const filtered = sessionIds.filter(id => id !== sessionId);
        
        if (filtered.length > 0) {
          await this.env.SESSIONS.put(
            userSessionsKey,
            JSON.stringify(filtered),
            { expirationTtl: 30 * 24 * 60 * 60 }
          );
        } else {
          await this.env.SESSIONS.delete(userSessionsKey);
        }
      } catch (error) {
        // Invalid data, delete the key
        await this.env.SESSIONS.delete(userSessionsKey);
      }
    }
  }
}