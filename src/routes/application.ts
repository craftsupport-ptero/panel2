import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ServerService } from '../services/server';
import { AuthService } from '../services/auth';
import { AuthContext, Env } from '../middleware/auth';
import { 
  paginationSchema,
  createServerSchema,
  updateServerDetailsSchema,
  createUserSchema,
  updateUserSchema
} from '../types/validation';

const application = new Hono<{ Bindings: Env } & AuthContext>();

// Server Management Routes

// List all servers
application.get('/servers', zValidator('query', paginationSchema.extend({
  search: z.string().optional(),
  owner: z.coerce.number().optional(),
  status: z.string().optional(),
  sort: z.enum(['id', 'name', 'status', 'owner']).default('id'),
  order: z.enum(['asc', 'desc']).default('desc'),
})), async (c) => {
  const db = c.get('db');
  const query = c.req.valid('query');
  
  try {
    const serverService = new ServerService(db);
    const result = await serverService.listServers(
      query.page,
      query.perPage,
      {
        search: query.search,
        owner: query.owner,
        status: query.status,
      },
      query.sort,
      query.order
    );
    
    return c.json({
      ...result,
      data: result.data.map((server: any) => ({
        object: 'server',
        attributes: server,
      })),
    });
  } catch (error) {
    console.error('List servers error:', error);
    throw new HTTPException(500, { message: 'Failed to retrieve servers' });
  }
});

// Create new server
application.post('/servers', zValidator('json', createServerSchema), async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  const data = c.req.valid('json');
  
  try {
    const serverService = new ServerService(db);
    const server = await serverService.createServer(data, user.id);
    
    return c.json({
      object: 'server',
      attributes: server,
    }, 201);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    
    console.error('Create server error:', error);
    throw new HTTPException(500, { message: 'Failed to create server' });
  }
});

// Get server details
application.get('/servers/:id', async (c) => {
  const db = c.get('db');
  const id = parseInt(c.req.param('id'));
  
  if (isNaN(id)) {
    throw new HTTPException(400, { message: 'Invalid server ID' });
  }
  
  try {
    const serverService = new ServerService(db);
    const server = await serverService.getServerById(id);
    
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

// Update server details
application.patch('/servers/:id/details', zValidator('json', updateServerDetailsSchema), async (c) => {
  const db = c.get('db');
  const id = parseInt(c.req.param('id'));
  const data = c.req.valid('json');
  
  if (isNaN(id)) {
    throw new HTTPException(400, { message: 'Invalid server ID' });
  }
  
  try {
    const serverService = new ServerService(db);
    const server = await serverService.updateServer(id, data);
    
    return c.json({
      object: 'server',
      attributes: server,
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    
    console.error('Update server error:', error);
    throw new HTTPException(500, { message: 'Failed to update server' });
  }
});

// Suspend server
application.post('/servers/:id/suspend', async (c) => {
  const db = c.get('db');
  const id = parseInt(c.req.param('id'));
  
  if (isNaN(id)) {
    throw new HTTPException(400, { message: 'Invalid server ID' });
  }
  
  try {
    const serverService = new ServerService(db);
    const server = await serverService.suspendServer(id);
    
    return c.json({
      object: 'server',
      attributes: server,
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    
    console.error('Suspend server error:', error);
    throw new HTTPException(500, { message: 'Failed to suspend server' });
  }
});

// Unsuspend server
application.post('/servers/:id/unsuspend', async (c) => {
  const db = c.get('db');
  const id = parseInt(c.req.param('id'));
  
  if (isNaN(id)) {
    throw new HTTPException(400, { message: 'Invalid server ID' });
  }
  
  try {
    const serverService = new ServerService(db);
    const server = await serverService.unsuspendServer(id);
    
    return c.json({
      object: 'server',
      attributes: server,
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    
    console.error('Unsuspend server error:', error);
    throw new HTTPException(500, { message: 'Failed to unsuspend server' });
  }
});

// Delete server
application.delete('/servers/:id', async (c) => {
  const db = c.get('db');
  const id = parseInt(c.req.param('id'));
  
  if (isNaN(id)) {
    throw new HTTPException(400, { message: 'Invalid server ID' });
  }
  
  try {
    const serverService = new ServerService(db);
    await serverService.deleteServer(id);
    
    return c.json({
      object: 'success',
      attributes: {
        message: 'Server deleted successfully',
      },
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    
    console.error('Delete server error:', error);
    throw new HTTPException(500, { message: 'Failed to delete server' });
  }
});

// User Management Routes

// List all users
application.get('/users', zValidator('query', paginationSchema.extend({
  search: z.string().optional(),
  sort: z.enum(['id', 'email', 'username']).default('id'),
  order: z.enum(['asc', 'desc']).default('desc'),
})), async (c) => {
  const db = c.get('db');
  const query = c.req.valid('query');
  
  // This would be implemented in UserService
  // For now, return a placeholder response
  return c.json({
    object: 'list',
    data: [],
    meta: {
      pagination: {
        total: 0,
        count: 0,
        perPage: query.perPage,
        currentPage: query.page,
        totalPages: 0,
        links: {},
      },
    },
  });
});

// Create new user
application.post('/users', zValidator('json', createUserSchema), async (c) => {
  const db = c.get('db');
  const data = c.req.valid('json');
  
  try {
    const authService = new AuthService(db, c.env.JWT_SECRET);
    
    // For admin creation, we'll generate a random password if none provided
    const userData = {
      ...data,
      password: data.password || Math.random().toString(36).slice(-12),
    };
    
    const result = await authService.register(userData);
    
    return c.json({
      object: 'user',
      attributes: {
        ...result.user,
        // Don't return the token for admin-created users
        token: undefined,
      },
    }, 201);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    
    console.error('Create user error:', error);
    throw new HTTPException(500, { message: 'Failed to create user' });
  }
});

// Get user details
application.get('/users/:id', async (c) => {
  const db = c.get('db');
  const id = parseInt(c.req.param('id'));
  
  if (isNaN(id)) {
    throw new HTTPException(400, { message: 'Invalid user ID' });
  }
  
  try {
    const authService = new AuthService(db, c.env.JWT_SECRET);
    const user = await authService.getUserById(id);
    
    return c.json({
      object: 'user',
      attributes: user,
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    
    console.error('Get user error:', error);
    throw new HTTPException(500, { message: 'Failed to retrieve user' });
  }
});

// Nodes, Locations, and other admin endpoints would go here
// For now, providing placeholder responses

application.get('/nodes', async (c) => {
  return c.json({
    object: 'list',
    data: [],
    meta: {
      pagination: {
        total: 0,
        count: 0,
        perPage: 25,
        currentPage: 1,
        totalPages: 0,
        links: {},
      },
    },
  });
});

application.get('/locations', async (c) => {
  return c.json({
    object: 'list',
    data: [],
    meta: {
      pagination: {
        total: 0,
        count: 0,
        perPage: 25,
        currentPage: 1,
        totalPages: 0,
        links: {},
      },
    },
  });
});

application.get('/nests', async (c) => {
  return c.json({
    object: 'list',
    data: [],
    meta: {
      pagination: {
        total: 0,
        count: 0,
        perPage: 25,
        currentPage: 1,
        totalPages: 0,
        links: {},
      },
    },
  });
});

export default application;