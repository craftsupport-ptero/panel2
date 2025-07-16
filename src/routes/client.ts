import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc, asc, count } from 'drizzle-orm';
import { z } from 'zod';
import { servers, users, nodes, allocations, nests, eggs } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { ResponseUtils, UuidUtils } from '../utils';
import type { Env, AuthenticatedContext, ServerResource } from '../types';

const client = new Hono<{ Bindings: Env; Variables: AuthenticatedContext }>();

// Apply auth middleware to all routes
client.use('*', authMiddleware);

// Validation schemas
const createServerSchema = z.object({
  name: z.string().min(1, 'Server name is required').max(100, 'Server name too long'),
  description: z.string().optional(),
  egg: z.number().int().positive('Invalid egg ID'),
  node: z.number().int().positive('Invalid node ID'),
  memory: z.number().int().positive('Memory must be positive'),
  swap: z.number().int().min(0, 'Swap cannot be negative'),
  disk: z.number().int().positive('Disk must be positive'),
  cpu: z.number().int().positive('CPU must be positive'),
  startup: z.string().min(1, 'Startup command is required'),
  environment: z.record(z.string()).optional(),
});

const updateServerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
});

// Helper function to transform server to API resource
function transformServerToResource(server: any, node?: any, allocation?: any): ServerResource {
  return {
    object: 'server',
    attributes: {
      id: server.id,
      external_id: server.externalId,
      uuid: server.uuid,
      identifier: server.uuidShort,
      name: server.name,
      description: server.description,
      status: server.status,
      suspended: server.suspended,
      limits: {
        memory: server.memory,
        swap: server.swap,
        disk: server.disk,
        io: server.io,
        cpu: server.cpu,
        threads: server.threads,
        oom_disabled: server.oomDisabled,
      },
      feature_limits: {
        databases: server.databaseLimit,
        allocations: server.allocationLimit,
        backups: server.backupLimit,
      },
      user: server.ownerId,
      node: server.nodeId,
      allocation: server.allocationId,
      nest: server.nestId,
      egg: server.eggId,
      container: {
        startup_command: server.startup,
        image: server.image,
        installed: !!server.installedAt,
        environment: {},
      },
      updated_at: server.updatedAt,
      created_at: server.createdAt,
    },
  };
}

// GET /api/client/servers
client.get('/servers', async (c) => {
  try {
    const user = c.get('user');
    const page = parseInt(c.req.query('page') || '1');
    const perPage = Math.min(parseInt(c.req.query('per_page') || '25'), 100);
    const offset = (page - 1) * perPage;

    const db = drizzle(c.env.DB);

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(servers)
      .where(eq(servers.ownerId, user.id));

    const total = totalResult.count;

    // Get servers with pagination
    const userServers = await db
      .select()
      .from(servers)
      .where(eq(servers.ownerId, user.id))
      .orderBy(desc(servers.createdAt))
      .limit(perPage)
      .offset(offset);

    const serverResources = userServers.map(server => transformServerToResource(server));

    return c.json(
      ResponseUtils.paginated(
        serverResources,
        total,
        page,
        perPage,
        '/api/client/servers'
      )
    );
  } catch (error) {
    console.error('Error fetching servers:', error);
    return c.json(
      ResponseUtils.error(
        'InternalServerError',
        '500',
        'Failed to fetch servers'
      ),
      500
    );
  }
});

// GET /api/client/servers/:uuid
client.get('/servers/:uuid', async (c) => {
  try {
    const user = c.get('user');
    const uuid = c.req.param('uuid');

    const db = drizzle(c.env.DB);

    const [server] = await db
      .select()
      .from(servers)
      .where(and(
        eq(servers.uuid, uuid),
        eq(servers.ownerId, user.id)
      ))
      .limit(1);

    if (!server) {
      return c.json(
        ResponseUtils.error(
          'NotFoundHttpException',
          '404',
          'The requested server was not found'
        ),
        404
      );
    }

    return c.json(transformServerToResource(server));
  } catch (error) {
    console.error('Error fetching server:', error);
    return c.json(
      ResponseUtils.error(
        'InternalServerError',
        '500',
        'Failed to fetch server'
      ),
      500
    );
  }
});

// POST /api/client/servers
client.post('/servers', async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const result = createServerSchema.safeParse(body);

    if (!result.success) {
      return c.json(
        ResponseUtils.validationError(
          Object.fromEntries(
            result.error.errors.map(err => [err.path[0], [err.message]])
          )
        ),
        422
      );
    }

    const { name, description, egg, node, memory, swap, disk, cpu, startup, environment } = result.data;

    const db = drizzle(c.env.DB);

    // Verify node exists
    const [nodeRecord] = await db
      .select()
      .from(nodes)
      .where(eq(nodes.id, node))
      .limit(1);

    if (!nodeRecord) {
      return c.json(
        ResponseUtils.error(
          'ValidationException',
          '422',
          'The specified node does not exist'
        ),
        422
      );
    }

    // Verify egg exists
    const [eggRecord] = await db
      .select()
      .from(eggs)
      .where(eq(eggs.id, egg))
      .limit(1);

    if (!eggRecord) {
      return c.json(
        ResponseUtils.error(
          'ValidationException',
          '422',
          'The specified egg does not exist'
        ),
        422
      );
    }

    // Find available allocation
    const [allocation] = await db
      .select()
      .from(allocations)
      .where(and(
        eq(allocations.nodeId, node),
        eq(allocations.serverId, null as any)
      ))
      .limit(1);

    if (!allocation) {
      return c.json(
        ResponseUtils.error(
          'ValidationException',
          '422',
          'No available allocations on the specified node'
        ),
        422
      );
    }

    // Create server
    const serverUuid = UuidUtils.generate();
    const serverShortUuid = UuidUtils.generateShort(8);

    const [newServer] = await db
      .insert(servers)
      .values({
        uuid: serverUuid,
        uuidShort: serverShortUuid,
        name,
        description,
        ownerId: user.id,
        memory,
        swap,
        disk,
        io: 500, // Default IO weight
        cpu,
        threads: null,
        oomDisabled: true,
        allocationId: allocation.id,
        nestId: eggRecord.nestId,
        eggId: egg,
        startup,
        image: JSON.parse(eggRecord.dockerImages)[0] || 'node:18-alpine',
        nodeId: node,
        allocationLimit: null,
        databaseLimit: 0,
        backupLimit: 0,
        status: 'installing',
        suspended: false,
        skipScripts: false,
      })
      .returning();

    // Update allocation to assign it to the server
    await db
      .update(allocations)
      .set({ serverId: newServer.id })
      .where(eq(allocations.id, allocation.id));

    return c.json(transformServerToResource(newServer), 201);
  } catch (error) {
    console.error('Error creating server:', error);
    return c.json(
      ResponseUtils.error(
        'InternalServerError',
        '500',
        'Failed to create server'
      ),
      500
    );
  }
});

// PATCH /api/client/servers/:uuid
client.patch('/servers/:uuid', async (c) => {
  try {
    const user = c.get('user');
    const uuid = c.req.param('uuid');
    const body = await c.req.json();
    const result = updateServerSchema.safeParse(body);

    if (!result.success) {
      return c.json(
        ResponseUtils.validationError(
          Object.fromEntries(
            result.error.errors.map(err => [err.path[0], [err.message]])
          )
        ),
        422
      );
    }

    const db = drizzle(c.env.DB);

    // Find server
    const [server] = await db
      .select()
      .from(servers)
      .where(and(
        eq(servers.uuid, uuid),
        eq(servers.ownerId, user.id)
      ))
      .limit(1);

    if (!server) {
      return c.json(
        ResponseUtils.error(
          'NotFoundHttpException',
          '404',
          'The requested server was not found'
        ),
        404
      );
    }

    // Update server
    const [updatedServer] = await db
      .update(servers)
      .set({
        ...result.data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(servers.id, server.id))
      .returning();

    return c.json(transformServerToResource(updatedServer));
  } catch (error) {
    console.error('Error updating server:', error);
    return c.json(
      ResponseUtils.error(
        'InternalServerError',
        '500',
        'Failed to update server'
      ),
      500
    );
  }
});

// DELETE /api/client/servers/:uuid
client.delete('/servers/:uuid', async (c) => {
  try {
    const user = c.get('user');
    const uuid = c.req.param('uuid');

    const db = drizzle(c.env.DB);

    // Find server
    const [server] = await db
      .select()
      .from(servers)
      .where(and(
        eq(servers.uuid, uuid),
        eq(servers.ownerId, user.id)
      ))
      .limit(1);

    if (!server) {
      return c.json(
        ResponseUtils.error(
          'NotFoundHttpException',
          '404',
          'The requested server was not found'
        ),
        404
      );
    }

    // Free up the allocation
    if (server.allocationId) {
      await db
        .update(allocations)
        .set({ serverId: null })
        .where(eq(allocations.id, server.allocationId));
    }

    // Delete server
    await db
      .delete(servers)
      .where(eq(servers.id, server.id));

    return c.text('', 204);
  } catch (error) {
    console.error('Error deleting server:', error);
    return c.json(
      ResponseUtils.error(
        'InternalServerError',
        '500',
        'Failed to delete server'
      ),
      500
    );
  }
});

export default client;