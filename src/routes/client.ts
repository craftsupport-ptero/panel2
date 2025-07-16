import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ServerService } from '../services/server';
import { AuthService } from '../services/auth';
import { AuthContext, Env } from '../middleware/auth';
import { paginationSchema } from '../types/validation';

const client = new Hono<{ Bindings: Env } & AuthContext>();

// Get current user's servers
client.get('/servers', zValidator('query', paginationSchema), async (c) => {
  const user = c.get('user');
  const db = c.get('db');
  const { page, perPage } = c.req.valid('query');
  
  try {
    const serverService = new ServerService(db);
    const servers = await serverService.getServersByOwner(user.id);
    
    // Apply pagination
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedServers = servers.slice(startIndex, endIndex);
    
    const totalPages = Math.ceil(servers.length / perPage);
    
    return c.json({
      object: 'list',
      data: paginatedServers.map(server => ({
        object: 'server',
        attributes: server,
      })),
      meta: {
        pagination: {
          total: servers.length,
          count: paginatedServers.length,
          perPage,
          currentPage: page,
          totalPages,
          links: {
            next: page < totalPages ? `/api/client/servers?page=${page + 1}` : undefined,
            previous: page > 1 ? `/api/client/servers?page=${page - 1}` : undefined,
          },
        },
      },
    });
  } catch (error) {
    console.error('Get user servers error:', error);
    throw new HTTPException(500, { message: 'Failed to retrieve servers' });
  }
});

// Get specific server by UUID
client.get('/servers/:uuid', async (c) => {
  const user = c.get('user');
  const db = c.get('db');
  const uuid = c.req.param('uuid');
  
  try {
    const serverService = new ServerService(db);
    const server = await serverService.getServerByUuid(uuid);
    
    // Check if user owns this server or is admin
    if (server.owner.id !== user.id && !user.rootAdmin) {
      throw new HTTPException(403, { message: 'Access denied' });
    }
    
    return c.json({
      object: 'server',
      attributes: server,
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    
    console.error('Get server error:', error);
    throw new HTTPException(500, { message: 'Failed to retrieve server' });
  }
});

// Get server resource usage (placeholder)
client.get('/servers/:uuid/resources', async (c) => {
  const user = c.get('user');
  const db = c.get('db');
  const uuid = c.req.param('uuid');
  
  try {
    const serverService = new ServerService(db);
    const server = await serverService.getServerByUuid(uuid);
    
    // Check if user owns this server or is admin
    if (server.owner.id !== user.id && !user.rootAdmin) {
      throw new HTTPException(403, { message: 'Access denied' });
    }
    
    // This would normally come from the Wings daemon
    // For now, return mock data
    return c.json({
      object: 'stats',
      attributes: {
        current_state: server.status,
        is_suspended: server.suspended,
        resources: {
          memory_bytes: Math.floor(Math.random() * server.limits.memory * 1024 * 1024),
          memory_limit_bytes: server.limits.memory * 1024 * 1024,
          cpu_absolute: Math.floor(Math.random() * server.limits.cpu),
          disk_bytes: Math.floor(Math.random() * server.limits.disk * 1024 * 1024),
          disk_limit_bytes: server.limits.disk * 1024 * 1024,
          network_rx_bytes: Math.floor(Math.random() * 1000000),
          network_tx_bytes: Math.floor(Math.random() * 1000000),
          uptime: Math.floor(Math.random() * 86400),
        },
      },
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    
    console.error('Get server resources error:', error);
    throw new HTTPException(500, { message: 'Failed to retrieve server resources' });
  }
});

// Send power action to server (placeholder)
client.post('/servers/:uuid/power', zValidator('json', z.object({
  signal: z.enum(['start', 'stop', 'restart', 'kill']),
})), async (c) => {
  const user = c.get('user');
  const db = c.get('db');
  const uuid = c.req.param('uuid');
  const { signal } = c.req.valid('json');
  
  try {
    const serverService = new ServerService(db);
    const server = await serverService.getServerByUuid(uuid);
    
    // Check if user owns this server or is admin
    if (server.owner.id !== user.id && !user.rootAdmin) {
      throw new HTTPException(403, { message: 'Access denied' });
    }
    
    // This would normally be sent to the Wings daemon
    // For now, just return success
    return c.json({
      object: 'success',
      attributes: {
        message: `Power signal '${signal}' sent to server`,
      },
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    
    console.error('Send power signal error:', error);
    throw new HTTPException(500, { message: 'Failed to send power signal' });
  }
});

// Send command to server (placeholder)
client.post('/servers/:uuid/command', zValidator('json', z.object({
  command: z.string().min(1),
})), async (c) => {
  const user = c.get('user');
  const db = c.get('db');
  const uuid = c.req.param('uuid');
  const { command } = c.req.valid('json');
  
  try {
    const serverService = new ServerService(db);
    const server = await serverService.getServerByUuid(uuid);
    
    // Check if user owns this server or is admin
    if (server.owner.id !== user.id && !user.rootAdmin) {
      throw new HTTPException(403, { message: 'Access denied' });
    }
    
    // This would normally be sent to the Wings daemon
    // For now, just return success
    return c.json({
      object: 'success',
      attributes: {
        message: `Command '${command}' sent to server`,
      },
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    
    console.error('Send command error:', error);
    throw new HTTPException(500, { message: 'Failed to send command' });
  }
});

// Get user account information
client.get('/account', async (c) => {
  const user = c.get('user');
  const db = c.get('db');
  
  try {
    const authService = new AuthService(db, c.env.JWT_SECRET);
    const fullUser = await authService.getUserById(user.id);
    
    return c.json({
      object: 'user',
      attributes: {
        id: fullUser.id,
        uuid: fullUser.uuid,
        username: fullUser.username,
        email: fullUser.email,
        first_name: fullUser.firstName,
        last_name: fullUser.lastName,
        language: fullUser.language,
        root_admin: fullUser.rootAdmin,
        '2fa': fullUser.useTotp,
        created_at: fullUser.createdAt,
        updated_at: fullUser.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get account error:', error);
    throw new HTTPException(500, { message: 'Failed to retrieve account information' });
  }
});

// Get user permissions (placeholder)
client.get('/permissions', async (c) => {
  const user = c.get('user');
  
  return c.json({
    object: 'system_permissions',
    attributes: {
      permissions: user.rootAdmin ? [
        'user.create',
        'user.read',
        'user.update',
        'user.delete',
        'server.create',
        'server.read',
        'server.update',
        'server.delete',
        'node.create',
        'node.read',
        'node.update',
        'node.delete',
        'allocation.create',
        'allocation.read',
        'allocation.update',
        'allocation.delete',
        'database.create',
        'database.read',
        'database.update',
        'database.delete',
      ] : [
        'server.read',
        'server.update',
      ],
    },
  });
});

export default client;