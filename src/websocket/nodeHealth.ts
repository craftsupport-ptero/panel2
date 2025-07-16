/**
 * Node health WebSocket handler
 * Provides real-time node health monitoring and broadcasting
 */

export interface NodeHealthMessage {
  type: 'health' | 'alert' | 'connected' | 'disconnected' | 'error' | 'pong' | 'subscribed';
  timestamp: string;
  node_id?: number;
  data?: {
    status: 'online' | 'offline' | 'warning' | 'maintenance';
    response_time: number;
    system_stats: {
      cpu_usage: number;
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
      load_average: number[];
      uptime: number;
    };
    daemon_info: {
      version: string;
      reachable: boolean;
      last_ping: string;
    };
    server_count: number;
    allocated_resources: {
      memory: number;
      cpu: number;
      disk: number;
    };
  };
  alert?: {
    id: number;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    metric: string;
    threshold: number;
    current_value: number;
  };
  error?: string;
}

export interface NodeWebSocketConnection {
  id: string;
  user_id: number;
  node_ids: number[];
  permissions: string[];
  connected_at: string;
  last_activity: string;
}

export class NodeHealthWebSocket {
  private static connections = new Map<string, NodeWebSocketConnection>();
  private static healthIntervals = new Map<string, NodeJS.Timeout>();
  private static nodeSubscriptions = new Map<number, Set<string>>(); // node_id -> connection_ids

  /**
   * Handle new WebSocket connection for node health monitoring
   */
  static handleConnection(webSocket: WebSocket, userId: number, permissions: string[]): void {
    const connectionId = this.generateConnectionId();
    
    try {
      // 1. Validate user permissions
      this.validateNodeAccess(userId, permissions);
      
      // 2. Get accessible nodes for user
      const accessibleNodes = this.getAccessibleNodes(userId, permissions);
      
      // 3. Store connection information
      const connection: NodeWebSocketConnection = {
        id: connectionId,
        user_id: userId,
        node_ids: accessibleNodes,
        permissions,
        connected_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
      };
      
      this.connections.set(connectionId, connection);
      
      // 4. Subscribe to node updates
      this.subscribeToNodes(connectionId, accessibleNodes);
      
      // 5. Send connection confirmation with accessible nodes
      this.sendMessage(webSocket, {
        type: 'connected',
        timestamp: new Date().toISOString(),
      } as any);
      
      // 6. Start health monitoring
      this.startHealthMonitoring(webSocket, connectionId);
      
      // 7. Setup WebSocket event handlers
      this.setupEventHandlers(webSocket, connectionId);
      
    } catch (error) {
      console.error('Failed to handle node health WebSocket connection:', error);
      this.sendMessage(webSocket, {
        type: 'error',
        timestamp: new Date().toISOString(),
        error: 'Connection failed: ' + (error as Error).message,
      });
      webSocket.close();
    }
  }

  /**
   * Start health monitoring for all accessible nodes
   */
  private static startHealthMonitoring(webSocket: WebSocket, connectionId: string): void {
    const interval = setInterval(async () => {
      try {
        const connection = this.connections.get(connectionId);
        if (!connection) {
          clearInterval(interval);
          return;
        }
        
        // Collect health data for all accessible nodes
        for (const nodeId of connection.node_ids) {
          try {
            const healthData = await this.collectNodeHealth(nodeId);
            
            this.sendMessage(webSocket, {
              type: 'health',
              timestamp: new Date().toISOString(),
              node_id: nodeId,
              data: healthData,
            });
          } catch (error) {
            console.error(`Error collecting health for node ${nodeId}:`, error);
          }
        }
        
        // Update last activity
        connection.last_activity = new Date().toISOString();
        this.connections.set(connectionId, connection);
        
      } catch (error) {
        console.error('Error in health monitoring:', error);
        this.sendMessage(webSocket, {
          type: 'error',
          timestamp: new Date().toISOString(),
          error: 'Health monitoring error',
        });
      }
    }, 30000); // Check every 30 seconds
    
    this.healthIntervals.set(connectionId, interval);
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
        console.error('Error parsing node health WebSocket message:', error);
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
      console.error('Node health WebSocket error:', error);
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

      case 'request_node_health':
        this.sendImmediateNodeHealth(webSocket, connection, message.node_id);
        break;

      case 'subscribe_node':
        this.subscribeToSpecificNode(webSocket, connectionId, message.node_id);
        break;

      case 'unsubscribe_node':
        this.unsubscribeFromNode(connectionId, message.node_id);
        break;

      case 'force_health_check':
        this.forceHealthCheck(webSocket, connection, message.node_id);
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
   * Send immediate node health data
   */
  private static async sendImmediateNodeHealth(
    webSocket: WebSocket, 
    connection: NodeWebSocketConnection, 
    nodeId: number
  ): Promise<void> {
    try {
      // Check if user has access to this node
      if (!connection.node_ids.includes(nodeId)) {
        throw new Error('Access denied to node');
      }

      const healthData = await this.collectNodeHealth(nodeId);
      
      this.sendMessage(webSocket, {
        type: 'health',
        timestamp: new Date().toISOString(),
        node_id: nodeId,
        data: healthData,
      });
    } catch (error) {
      this.sendMessage(webSocket, {
        type: 'error',
        timestamp: new Date().toISOString(),
        error: `Failed to get health for node ${nodeId}: ${(error as Error).message}`,
      });
    }
  }

  /**
   * Subscribe to specific node updates
   */
  private static subscribeToSpecificNode(webSocket: WebSocket, connectionId: string, nodeId: number): void {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return;
    }

    // Check if user has access to this node
    if (!connection.node_ids.includes(nodeId)) {
      this.sendMessage(webSocket, {
        type: 'error',
        timestamp: new Date().toISOString(),
        error: `Access denied to node ${nodeId}`,
      });
      return;
    }

    // Add to subscriptions
    if (!this.nodeSubscriptions.has(nodeId)) {
      this.nodeSubscriptions.set(nodeId, new Set());
    }
    this.nodeSubscriptions.get(nodeId)!.add(connectionId);

    this.sendMessage(webSocket, {
      type: 'subscribed',
      timestamp: new Date().toISOString(),
    } as any);
  }

  /**
   * Unsubscribe from node updates
   */
  private static unsubscribeFromNode(connectionId: string, nodeId: number): void {
    const subscriptions = this.nodeSubscriptions.get(nodeId);
    if (subscriptions) {
      subscriptions.delete(connectionId);
      
      // Clean up empty subscription sets
      if (subscriptions.size === 0) {
        this.nodeSubscriptions.delete(nodeId);
      }
    }
  }

  /**
   * Force health check for a specific node
   */
  private static async forceHealthCheck(
    webSocket: WebSocket, 
    connection: NodeWebSocketConnection, 
    nodeId: number
  ): Promise<void> {
    try {
      // Check permissions
      if (!connection.permissions.includes('nodes.manage')) {
        throw new Error('Insufficient permissions for forced health check');
      }

      if (!connection.node_ids.includes(nodeId)) {
        throw new Error('Access denied to node');
      }

      // Perform immediate health check
      const healthData = await this.performForceHealthCheck(nodeId);
      
      this.sendMessage(webSocket, {
        type: 'health',
        timestamp: new Date().toISOString(),
        node_id: nodeId,
        data: healthData,
      });

      // Broadcast to other subscribers
      this.broadcastNodeHealth(nodeId, healthData, connection.id);
      
    } catch (error) {
      this.sendMessage(webSocket, {
        type: 'error',
        timestamp: new Date().toISOString(),
        error: `Failed to force health check for node ${nodeId}: ${(error as Error).message}`,
      });
    }
  }

  /**
   * Handle WebSocket disconnection
   */
  private static handleDisconnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      // Remove from all node subscriptions
      connection.node_ids.forEach(nodeId => {
        this.unsubscribeFromNode(connectionId, nodeId);
      });
    }

    // Clear health monitoring interval
    const interval = this.healthIntervals.get(connectionId);
    if (interval) {
      clearInterval(interval);
      this.healthIntervals.delete(connectionId);
    }

    // Remove connection record
    this.connections.delete(connectionId);
    
    console.log(`Node health WebSocket connection ${connectionId} disconnected`);
  }

  /**
   * Collect node health data
   */
  private static async collectNodeHealth(nodeId: number): Promise<NodeHealthMessage['data']> {
    try {
      // TODO: Implement actual node health collection
      // This would integrate with the NodeService health check methods
      
      // Mock health data
      const healthData = {
        status: ['online', 'warning', 'maintenance'][Math.floor(Math.random() * 3)] as any,
        response_time: Math.floor(Math.random() * 200) + 10,
        system_stats: {
          cpu_usage: Math.random() * 100,
          memory: {
            used: Math.floor(Math.random() * 15000) + 1000,
            total: 16384,
            percentage: 0,
          },
          disk: {
            used: Math.floor(Math.random() * 400000) + 100000,
            total: 500000,
            percentage: 0,
          },
          load_average: [Math.random() * 2, Math.random() * 2, Math.random() * 2],
          uptime: Math.floor(Math.random() * 2592000), // Up to 30 days
        },
        daemon_info: {
          version: '1.0.0',
          reachable: Math.random() > 0.1, // 90% uptime
          last_ping: new Date().toISOString(),
        },
        server_count: Math.floor(Math.random() * 20),
        allocated_resources: {
          memory: Math.floor(Math.random() * 8000) + 2000,
          cpu: Math.floor(Math.random() * 500) + 100,
          disk: Math.floor(Math.random() * 200000) + 50000,
        },
      };

      // Calculate percentages
      healthData.system_stats.memory.percentage = 
        (healthData.system_stats.memory.used / healthData.system_stats.memory.total) * 100;
      healthData.system_stats.disk.percentage = 
        (healthData.system_stats.disk.used / healthData.system_stats.disk.total) * 100;

      return healthData;
    } catch (error) {
      console.error('Failed to collect node health:', error);
      throw new Error('Health collection failed');
    }
  }

  /**
   * Perform forced health check
   */
  private static async performForceHealthCheck(nodeId: number): Promise<NodeHealthMessage['data']> {
    // TODO: Implement actual forced health check
    // This would trigger immediate health verification
    
    console.log(`Performing forced health check for node ${nodeId}`);
    return this.collectNodeHealth(nodeId);
  }

  /**
   * Broadcast node health to subscribers
   */
  static broadcastNodeHealth(nodeId: number, healthData: NodeHealthMessage['data'], excludeConnectionId?: string): void {
    const subscribers = this.nodeSubscriptions.get(nodeId);
    if (!subscribers) {
      return;
    }

    subscribers.forEach(connectionId => {
      if (connectionId === excludeConnectionId) {
        return; // Skip the connection that triggered the update
      }

      // In a real implementation, you'd need to maintain WebSocket references
      // This is a simplified example
      console.log(`Broadcasting health update to connection ${connectionId} for node ${nodeId}`);
    });
  }

  /**
   * Broadcast alert to all relevant connections
   */
  static broadcastNodeAlert(nodeId: number, alert: NodeHealthMessage['alert']): void {
    const message: NodeHealthMessage = {
      type: 'alert',
      timestamp: new Date().toISOString(),
      node_id: nodeId,
      alert,
    };

    const subscribers = this.nodeSubscriptions.get(nodeId);
    if (!subscribers) {
      return;
    }

    subscribers.forEach(connectionId => {
      console.log(`Broadcasting alert to connection ${connectionId} for node ${nodeId}:`, alert);
    });
  }

  /**
   * Send message to WebSocket client
   */
  private static sendMessage(webSocket: WebSocket, message: NodeHealthMessage): void {
    try {
      if (webSocket.readyState === WebSocket.OPEN) {
        webSocket.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error('Failed to send node health WebSocket message:', error);
    }
  }

  /**
   * Validate node access permissions
   */
  private static validateNodeAccess(userId: number, permissions: string[]): void {
    // TODO: Implement actual permission checking
    
    if (!permissions.includes('nodes.view')) {
      throw new Error('Insufficient permissions to view node health');
    }
    
    if (userId <= 0) {
      throw new Error('Invalid user ID');
    }
  }

  /**
   * Get accessible nodes for user
   */
  private static getAccessibleNodes(userId: number, permissions: string[]): number[] {
    // TODO: Implement actual node access checking based on user permissions
    
    // Mock implementation - return all nodes for admin users
    if (permissions.includes('nodes.view_all')) {
      return [1, 2, 3, 4, 5]; // All node IDs
    }
    
    // Return limited nodes for regular users
    return [1, 2];
  }

  /**
   * Subscribe to multiple nodes
   */
  private static subscribeToNodes(connectionId: string, nodeIds: number[]): void {
    nodeIds.forEach(nodeId => {
      if (!this.nodeSubscriptions.has(nodeId)) {
        this.nodeSubscriptions.set(nodeId, new Set());
      }
      this.nodeSubscriptions.get(nodeId)!.add(connectionId);
    });
  }

  /**
   * Generate unique connection ID
   */
  private static generateConnectionId(): string {
    return `node_conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get active connections count
   */
  static getActiveConnectionsCount(): number {
    return this.connections.size;
  }

  /**
   * Get node subscription statistics
   */
  static getSubscriptionStats(): {
    total_connections: number;
    nodes_with_subscribers: number;
    subscriptions_by_node: Record<number, number>;
  } {
    const subscriptionsByNode: Record<number, number> = {};
    
    this.nodeSubscriptions.forEach((subscribers, nodeId) => {
      subscriptionsByNode[nodeId] = subscribers.size;
    });

    return {
      total_connections: this.connections.size,
      nodes_with_subscribers: this.nodeSubscriptions.size,
      subscriptions_by_node: subscriptionsByNode,
    };
  }

  /**
   * Cleanup all connections (for graceful shutdown)
   */
  static cleanup(): void {
    // Clear all intervals
    this.healthIntervals.forEach(interval => clearInterval(interval));
    this.healthIntervals.clear();
    
    // Clear all connections and subscriptions
    this.connections.clear();
    this.nodeSubscriptions.clear();
    
    console.log('Node health WebSocket cleanup completed');
  }
}