/**
 * Main API router integration
 * Demonstrates how to integrate all server management routes into a serverless application
 */

// Import route handlers
import * as ServerRoutes from './routes/servers/index';
import * as ServerControlRoutes from './routes/servers/control';
import * as ServerMonitoringRoutes from './routes/servers/monitoring';
import * as ServerDatabaseRoutes from './routes/servers/databases';
import * as NodeRoutes from './routes/nodes/index';
import * as NodeCapacityRoutes from './routes/nodes/capacity';
import * as NodeHealthRoutes from './routes/nodes/health';
import * as LocationRoutes from './routes/locations/index';

// Import WebSocket handlers
import { ServerStatsWebSocket } from './websocket/serverStats';
import { NodeHealthWebSocket } from './websocket/nodeHealth';

// Import validation
import { ServerValidation, ValidationError } from './schemas/servers';
import { NodeValidation } from './schemas/nodes';
import { MonitoringValidation } from './schemas/monitoring';

/**
 * Main request router for serverless environment
 * This would be used in a Cloudflare Workers or similar serverless platform
 */
export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;
  const pathname = url.pathname;

  try {
    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // API route matching
    const routeMatch = pathname.match(/^\/api\/(.+)$/);
    if (!routeMatch) {
      return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const apiPath = routeMatch[1];
    const response = await routeRequest(method, apiPath, request);
    
    // Add CORS headers to response
    const responseHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Request handling error:', error);
    
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Route API requests to appropriate handlers
 */
async function routeRequest(method: string, path: string, request: Request): Promise<Response> {
  // Server routes
  if (path === 'servers') {
    switch (method) {
      case 'GET':
        return ServerRoutes.listServers(request);
      case 'POST':
        return ServerRoutes.createServer(request);
      default:
        return methodNotAllowed();
    }
  }

  // Individual server routes
  const serverMatch = path.match(/^servers\/(\d+)$/);
  if (serverMatch) {
    const serverId = serverMatch[1];
    switch (method) {
      case 'GET':
        return ServerRoutes.getServer(request, serverId);
      case 'PUT':
        return ServerRoutes.updateServer(request, serverId);
      case 'DELETE':
        return ServerRoutes.deleteServer(request, serverId);
      default:
        return methodNotAllowed();
    }
  }

  // Server power control routes
  const powerMatch = path.match(/^servers\/(\d+)\/power\/(start|stop|restart|kill)$/);
  if (powerMatch) {
    const [, serverId, action] = powerMatch;
    if (method === 'POST') {
      switch (action) {
        case 'start':
          return ServerControlRoutes.startServer(request, serverId);
        case 'stop':
          return ServerControlRoutes.stopServer(request, serverId);
        case 'restart':
          return ServerControlRoutes.restartServer(request, serverId);
        case 'kill':
          return ServerControlRoutes.killServer(request, serverId);
      }
    }
    return methodNotAllowed();
  }

  // Server status route
  const statusMatch = path.match(/^servers\/(\d+)\/status$/);
  if (statusMatch) {
    const serverId = statusMatch[1];
    if (method === 'GET') {
      return ServerControlRoutes.getServerStatus(request, serverId);
    }
    return methodNotAllowed();
  }

  // Server monitoring routes
  const statsMatch = path.match(/^servers\/(\d+)\/stats$/);
  if (statsMatch) {
    const serverId = statsMatch[1];
    if (method === 'GET') {
      return ServerMonitoringRoutes.getCurrentStats(request, serverId);
    }
    return methodNotAllowed();
  }

  const statsHistoryMatch = path.match(/^servers\/(\d+)\/stats\/history$/);
  if (statsHistoryMatch) {
    const serverId = statsHistoryMatch[1];
    if (method === 'GET') {
      return ServerMonitoringRoutes.getStatsHistory(request, serverId);
    }
    return methodNotAllowed();
  }

  const logsMatch = path.match(/^servers\/(\d+)\/logs$/);
  if (logsMatch) {
    const serverId = logsMatch[1];
    if (method === 'GET') {
      return ServerMonitoringRoutes.getServerLogs(request, serverId);
    }
    return methodNotAllowed();
  }

  // Server database routes
  const dbMatch = path.match(/^servers\/(\d+)\/databases$/);
  if (dbMatch) {
    const serverId = dbMatch[1];
    switch (method) {
      case 'GET':
        return ServerDatabaseRoutes.listDatabases(request, serverId);
      case 'POST':
        return ServerDatabaseRoutes.createDatabase(request, serverId);
      default:
        return methodNotAllowed();
    }
  }

  const dbIdMatch = path.match(/^servers\/(\d+)\/databases\/(\d+)$/);
  if (dbIdMatch) {
    const [, serverId, dbId] = dbIdMatch;
    if (method === 'DELETE') {
      return ServerDatabaseRoutes.deleteDatabase(request, serverId, dbId);
    }
    return methodNotAllowed();
  }

  const dbPasswordMatch = path.match(/^servers\/(\d+)\/databases\/(\d+)\/password$/);
  if (dbPasswordMatch) {
    const [, serverId, dbId] = dbPasswordMatch;
    if (method === 'PUT') {
      return ServerDatabaseRoutes.resetDatabasePassword(request, serverId, dbId);
    }
    return methodNotAllowed();
  }

  const dbBackupMatch = path.match(/^servers\/(\d+)\/databases\/(\d+)\/backup$/);
  if (dbBackupMatch) {
    const [, serverId, dbId] = dbBackupMatch;
    if (method === 'POST') {
      return ServerDatabaseRoutes.createDatabaseBackup(request, serverId, dbId);
    }
    return methodNotAllowed();
  }

  // Node routes
  if (path === 'nodes') {
    switch (method) {
      case 'GET':
        return NodeRoutes.listNodes(request);
      case 'POST':
        return NodeRoutes.createNode(request);
      default:
        return methodNotAllowed();
    }
  }

  const nodeMatch = path.match(/^nodes\/(\d+)$/);
  if (nodeMatch) {
    const nodeId = nodeMatch[1];
    switch (method) {
      case 'GET':
        return NodeRoutes.getNode(request, nodeId);
      case 'PUT':
        return NodeRoutes.updateNode(request, nodeId);
      case 'DELETE':
        return NodeRoutes.deleteNode(request, nodeId);
      default:
        return methodNotAllowed();
    }
  }

  const nodeCapacityMatch = path.match(/^nodes\/(\d+)\/capacity$/);
  if (nodeCapacityMatch) {
    const nodeId = nodeCapacityMatch[1];
    if (method === 'GET') {
      return NodeCapacityRoutes.getNodeCapacity(request, nodeId);
    }
    return methodNotAllowed();
  }

  const nodeHealthMatch = path.match(/^nodes\/(\d+)\/health$/);
  if (nodeHealthMatch) {
    const nodeId = nodeHealthMatch[1];
    if (method === 'GET') {
      return NodeHealthRoutes.getNodeHealth(request, nodeId);
    }
    return methodNotAllowed();
  }

  // Location routes
  if (path === 'locations') {
    switch (method) {
      case 'GET':
        return LocationRoutes.listLocations(request);
      case 'POST':
        return LocationRoutes.createLocation(request);
      default:
        return methodNotAllowed();
    }
  }

  const locationMatch = path.match(/^locations\/(\d+)$/);
  if (locationMatch) {
    const locationId = locationMatch[1];
    switch (method) {
      case 'GET':
        return LocationRoutes.getLocation(request, locationId);
      case 'PUT':
        return LocationRoutes.updateLocation(request, locationId);
      case 'DELETE':
        return LocationRoutes.deleteLocation(request, locationId);
      default:
        return methodNotAllowed();
    }
  }

  // Route not found
  return new Response(JSON.stringify({ error: 'API endpoint not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Handle WebSocket upgrade requests
 */
export function handleWebSocket(request: Request): Response {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Server statistics WebSocket
  const serverStatsMatch = pathname.match(/^\/api\/servers\/(\d+)\/stats$/);
  if (serverStatsMatch) {
    const serverId = parseInt(serverStatsMatch[1]);
    
    // Check for WebSocket upgrade
    if (request.headers.get('Upgrade') === 'websocket') {
      // In a real implementation, you'd handle the WebSocket upgrade here
      // This is a simplified example
      console.log(`WebSocket upgrade requested for server ${serverId} stats`);
      
      return new Response('WebSocket upgrade not supported in this demo', {
        status: 426,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }

  // Node health WebSocket
  const nodeHealthMatch = pathname.match(/^\/api\/nodes\/health$/);
  if (nodeHealthMatch) {
    if (request.headers.get('Upgrade') === 'websocket') {
      console.log('WebSocket upgrade requested for node health monitoring');
      
      return new Response('WebSocket upgrade not supported in this demo', {
        status: 426,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }

  return new Response('WebSocket endpoint not found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain' },
  });
}

/**
 * Helper function for method not allowed responses
 */
function methodNotAllowed(): Response {
  return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Example usage in a Cloudflare Worker
 */
export default {
  async fetch(request: Request): Promise<Response> {
    // Handle WebSocket upgrades
    if (request.headers.get('Upgrade') === 'websocket') {
      return handleWebSocket(request);
    }
    
    // Handle regular HTTP requests
    return handleRequest(request);
  },
};

/**
 * Health check endpoint
 */
export async function healthCheck(): Promise<Response> {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      servers: 'operational',
      nodes: 'operational',
      monitoring: 'operational',
      databases: 'operational',
    },
    connections: {
      server_stats_websockets: ServerStatsWebSocket.getActiveConnectionsCount(),
      node_health_websockets: NodeHealthWebSocket.getActiveConnectionsCount(),
    },
  };

  return new Response(JSON.stringify(health), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Export all validation classes for use in other modules
export {
  ServerValidation,
  NodeValidation, 
  MonitoringValidation,
  ValidationError,
};