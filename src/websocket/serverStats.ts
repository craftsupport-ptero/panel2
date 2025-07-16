/**
 * Server statistics WebSocket handler
 * Provides real-time server statistics streaming via WebSocket connections
 */

export interface ServerStatsMessage {
  type: 'stats' | 'error' | 'connected' | 'disconnected' | 'pong' | 'interval_changed';
  timestamp: string;
  server_id?: number;
  data?: {
    cpu: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    disk: {
      used: number;
      total: number;
      percentage: number;
    };
    network: {
      rx: number;
      tx: number;
    };
    uptime: number;
    players?: number;
    load_average?: number[];
  };
  error?: string;
}

export interface WebSocketConnection {
  id: string;
  server_id: number;
  user_id: number;
  connected_at: string;
  last_ping: string;
}

export class ServerStatsWebSocket {
  private static connections = new Map<string, WebSocketConnection>();
  private static intervals = new Map<string, NodeJS.Timeout>();

  /**
   * Handle new WebSocket connection for server statistics
   */
  static handleConnection(webSocket: WebSocket, serverId: number, userId: number): void {
    const connectionId = this.generateConnectionId();
    
    try {
      // 1. Validate server access permissions
      this.validateServerAccess(serverId, userId);
      
      // 2. Store connection information
      const connection: WebSocketConnection = {
        id: connectionId,
        server_id: serverId,
        user_id: userId,
        connected_at: new Date().toISOString(),
        last_ping: new Date().toISOString(),
      };
      
      this.connections.set(connectionId, connection);
      
      // 3. Send connection confirmation
      this.sendMessage(webSocket, {
        type: 'connected',
        timestamp: new Date().toISOString(),
        server_id: serverId,
      });
      
      // 4. Start periodic statistics collection
      this.startStatsCollection(webSocket, connectionId, serverId);
      
      // 5. Setup WebSocket event handlers
      this.setupEventHandlers(webSocket, connectionId);
      
    } catch (error) {
      console.error('Failed to handle WebSocket connection:', error);
      this.sendMessage(webSocket, {
        type: 'error',
        timestamp: new Date().toISOString(),
        error: 'Connection failed: ' + (error as Error).message,
      });
      webSocket.close();
    }
  }

  /**
   * Start periodic statistics collection for a connection
   */
  private static startStatsCollection(webSocket: WebSocket, connectionId: string, serverId: number): void {
    const interval = setInterval(async () => {
      try {
        // Check if connection still exists
        if (!this.connections.has(connectionId)) {
          clearInterval(interval);
          return;
        }
        
        // Collect current server statistics
        const stats = await this.collectServerStats(serverId);
        
        // Send stats to client
        this.sendMessage(webSocket, {
          type: 'stats',
          timestamp: new Date().toISOString(),
          server_id: serverId,
          data: stats,
        });
        
        // Update last ping time
        const connection = this.connections.get(connectionId);
        if (connection) {
          connection.last_ping = new Date().toISOString();
          this.connections.set(connectionId, connection);
        }
        
      } catch (error) {
        console.error('Error collecting server stats:', error);
        this.sendMessage(webSocket, {
          type: 'error',
          timestamp: new Date().toISOString(),
          error: 'Failed to collect statistics',
        });
      }
    }, 5000); // Collect stats every 5 seconds
    
    this.intervals.set(connectionId, interval);
  }

  /**
   * Setup WebSocket event handlers
   */
  private static setupEventHandlers(webSocket: WebSocket, connectionId: string): void {
    webSocket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data.toString());
        this.handleClientMessage(webSocket, connectionId, message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        this.sendMessage(webSocket, {
          type: 'error',
          timestamp: new Date().toISOString(),
          error: 'Invalid message format',
        });
      }
    });

    webSocket.addEventListener('close', () => {
      this.handleDisconnection(connectionId);
    });

    webSocket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      this.handleDisconnection(connectionId);
    });
  }

  /**
   * Handle client messages
   */
  private static handleClientMessage(webSocket: WebSocket, connectionId: string, message: any): void {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return;
    }

    switch (message.type) {
      case 'ping':
        this.sendMessage(webSocket, {
          type: 'pong',
          timestamp: new Date().toISOString(),
        });
        break;

      case 'request_immediate_stats':
        this.sendImmediateStats(webSocket, connection.server_id);
        break;

      case 'change_interval':
        this.changeStatsInterval(webSocket, connectionId, message.interval);
        break;

      default:
        this.sendMessage(webSocket, {
          type: 'error',
          timestamp: new Date().toISOString(),
          error: `Unknown message type: ${message.type}`,
        });
    }
  }

  /**
   * Send immediate statistics without waiting for interval
   */
  private static async sendImmediateStats(webSocket: WebSocket, serverId: number): Promise<void> {
    try {
      const stats = await this.collectServerStats(serverId);
      
      this.sendMessage(webSocket, {
        type: 'stats',
        timestamp: new Date().toISOString(),
        server_id: serverId,
        data: stats,
      });
    } catch (error) {
      this.sendMessage(webSocket, {
        type: 'error',
        timestamp: new Date().toISOString(),
        error: 'Failed to collect immediate statistics',
      });
    }
  }

  /**
   * Change statistics collection interval
   */
  private static changeStatsInterval(webSocket: WebSocket, connectionId: string, newInterval: number): void {
    try {
      // Validate interval (minimum 1 second, maximum 60 seconds)
      if (newInterval < 1000 || newInterval > 60000) {
        throw new Error('Interval must be between 1000ms and 60000ms');
      }

      const connection = this.connections.get(connectionId);
      if (!connection) {
        return;
      }

      // Clear existing interval
      const existingInterval = this.intervals.get(connectionId);
      if (existingInterval) {
        clearInterval(existingInterval);
      }

      // Start new interval
      this.startStatsCollectionWithInterval(webSocket, connectionId, connection.server_id, newInterval);
      
      this.sendMessage(webSocket, {
        type: 'interval_changed',
        timestamp: new Date().toISOString(),
      } as any);
      
    } catch (error) {
      this.sendMessage(webSocket, {
        type: 'error',
        timestamp: new Date().toISOString(),
        error: (error as Error).message,
      });
    }
  }

  /**
   * Start stats collection with custom interval
   */
  private static startStatsCollectionWithInterval(
    webSocket: WebSocket, 
    connectionId: string, 
    serverId: number, 
    interval: number
  ): void {
    const intervalHandle = setInterval(async () => {
      try {
        if (!this.connections.has(connectionId)) {
          clearInterval(intervalHandle);
          return;
        }
        
        const stats = await this.collectServerStats(serverId);
        
        this.sendMessage(webSocket, {
          type: 'stats',
          timestamp: new Date().toISOString(),
          server_id: serverId,
          data: stats,
        });
        
      } catch (error) {
        console.error('Error in custom interval stats collection:', error);
      }
    }, interval);
    
    this.intervals.set(connectionId, intervalHandle);
  }

  /**
   * Handle WebSocket disconnection
   */
  private static handleDisconnection(connectionId: string): void {
    // Clear statistics collection interval
    const interval = this.intervals.get(connectionId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(connectionId);
    }

    // Remove connection record
    this.connections.delete(connectionId);
    
    console.log(`WebSocket connection ${connectionId} disconnected`);
  }

  /**
   * Collect server statistics
   */
  private static async collectServerStats(serverId: number): Promise<ServerStatsMessage['data']> {
    try {
      // TODO: Implement actual statistics collection
      // This would integrate with the MonitoringService
      
      // Mock statistics data
      const stats = {
        cpu: Math.random() * 100,
        memory: {
          used: Math.floor(Math.random() * 2048),
          total: 2048,
          percentage: 0,
        },
        disk: {
          used: Math.floor(Math.random() * 10000),
          total: 10000,
          percentage: 0,
        },
        network: {
          rx: Math.floor(Math.random() * 1000000),
          tx: Math.floor(Math.random() * 1000000),
        },
        uptime: Math.floor(Math.random() * 86400),
        players: Math.floor(Math.random() * 20),
        load_average: [Math.random(), Math.random(), Math.random()],
      };

      // Calculate percentages
      stats.memory.percentage = (stats.memory.used / stats.memory.total) * 100;
      stats.disk.percentage = (stats.disk.used / stats.disk.total) * 100;

      return stats;
    } catch (error) {
      console.error('Failed to collect server stats:', error);
      throw new Error('Statistics collection failed');
    }
  }

  /**
   * Send message to WebSocket client
   */
  private static sendMessage(webSocket: WebSocket, message: ServerStatsMessage): void {
    try {
      if (webSocket.readyState === WebSocket.OPEN) {
        webSocket.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
    }
  }

  /**
   * Validate server access permissions
   */
  private static async validateServerAccess(serverId: number, userId: number): Promise<void> {
    // TODO: Implement actual permission checking
    // Check if user owns the server or has permission to view stats
    
    console.log(`Validating access for user ${userId} to server ${serverId}`);
    
    // Mock validation - in real implementation, this would query the database
    if (serverId <= 0 || userId <= 0) {
      throw new Error('Invalid server or user ID');
    }
  }

  /**
   * Generate unique connection ID
   */
  private static generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get active connections count
   */
  static getActiveConnectionsCount(): number {
    return this.connections.size;
  }

  /**
   * Get connections for a specific server
   */
  static getServerConnections(serverId: number): WebSocketConnection[] {
    return Array.from(this.connections.values()).filter(
      conn => conn.server_id === serverId
    );
  }

  /**
   * Broadcast message to all connections for a server
   */
  static broadcastToServer(serverId: number, message: Omit<ServerStatsMessage, 'server_id'>): void {
    const serverConnections = this.getServerConnections(serverId);
    
    serverConnections.forEach(connection => {
      // In a real implementation, you'd need to maintain WebSocket references
      // This is a simplified example
      console.log(`Broadcasting to connection ${connection.id}:`, message);
    });
  }

  /**
   * Cleanup all connections (for graceful shutdown)
   */
  static cleanup(): void {
    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    
    // Clear all connections
    this.connections.clear();
    
    console.log('Server stats WebSocket cleanup completed');
  }

  /**
   * Get connection statistics
   */
  static getConnectionStats(): {
    total_connections: number;
    connections_by_server: Record<number, number>;
    oldest_connection: string | null;
  } {
    const connectionsByServer: Record<number, number> = {};
    let oldestConnection: string | null = null;
    let oldestTimestamp = Date.now();

    this.connections.forEach(connection => {
      // Count by server
      connectionsByServer[connection.server_id] = 
        (connectionsByServer[connection.server_id] || 0) + 1;
      
      // Find oldest connection
      const connectedAt = new Date(connection.connected_at).getTime();
      if (connectedAt < oldestTimestamp) {
        oldestTimestamp = connectedAt;
        oldestConnection = connection.connected_at;
      }
    });

    return {
      total_connections: this.connections.size,
      connections_by_server: connectionsByServer,
      oldest_connection: oldestConnection,
    };
  }
}