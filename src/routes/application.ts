import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, count, like, or } from 'drizzle-orm';
import { z } from 'zod';
import { users, servers, nodes, locations } from '../db/schema';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { ResponseUtils, UuidUtils, PasswordUtils } from '../utils';
import type { Env, AuthenticatedContext, UserResource, NodeResource } from '../types';

const application = new Hono<{ Bindings: Env; Variables: AuthenticatedContext }>();

// Apply auth and admin middleware to all routes
application.use('*', authMiddleware);
application.use('*', adminMiddleware);

// Validation schemas
const createUserSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  password: z.string().min(8),
  root_admin: z.boolean().optional().default(false),
  language: z.string().optional().default('en'),
});

const updateUserSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  email: z.string().email().optional(),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  password: z.string().min(8).optional(),
  root_admin: z.boolean().optional(),
  language: z.string().optional(),
});

const createNodeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  location_id: z.number().int().positive(),
  fqdn: z.string().min(1),
  scheme: z.enum(['http', 'https']).default('https'),
  behind_proxy: z.boolean().default(false),
  public: z.boolean().default(true),
  memory: z.number().int().positive(),
  memory_overallocate: z.number().int().min(-1).default(0),
  disk: z.number().int().positive(),
  disk_overallocate: z.number().int().min(-1).default(0),
  daemon_listen: z.number().int().min(1).max(65535).default(8080),
  daemon_sftp: z.number().int().min(1).max(65535).default(2022),
  daemon_base: z.string().default('/var/lib/pterodactyl/volumes'),
});

// Helper functions
function transformUserToResource(user: any): UserResource {
  return {
    object: 'user',
    attributes: {
      id: user.id,
      external_id: user.externalId,
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      language: user.language,
      root_admin: user.rootAdmin,
      '2fa': user.useTotp,
      gravatar: user.gravatar,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    },
  };
}

function transformNodeToResource(node: any): NodeResource {
  return {
    object: 'node',
    attributes: {
      id: node.id,
      uuid: node.uuid,
      public: node.public,
      name: node.name,
      description: node.description,
      location_id: node.locationId,
      fqdn: node.fqdn,
      scheme: node.scheme,
      behind_proxy: node.behindProxy,
      maintenance_mode: node.maintenanceMode,
      memory: node.memory,
      memory_overallocate: node.memoryOverallocate,
      disk: node.disk,
      disk_overallocate: node.diskOverallocate,
      allocated_resources: {
        memory: 0, // Would need to calculate from servers
        disk: 0,   // Would need to calculate from servers
      },
      created_at: node.createdAt,
      updated_at: node.updatedAt,
    },
  };
}

// User Management Routes

// GET /api/application/users
application.get('/users', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const perPage = Math.min(parseInt(c.req.query('per_page') || '25'), 100);
    const offset = (page - 1) * perPage;
    const search = c.req.query('filter[email]') || c.req.query('filter[username]');

    const db = drizzle(c.env.DB);

    let query = db.select().from(users);
    let countQuery = db.select({ count: count() }).from(users);

    if (search) {
      const searchCondition = or(
        like(users.email, `%${search}%`),
        like(users.username, `%${search}%`)
      );
      query = query.where(searchCondition);
      countQuery = countQuery.where(searchCondition);
    }

    const [totalResult] = await countQuery;
    const total = totalResult.count;

    const userList = await query
      .orderBy(desc(users.createdAt))
      .limit(perPage)
      .offset(offset);

    const userResources = userList.map(transformUserToResource);

    return c.json(
      ResponseUtils.paginated(
        userResources,
        total,
        page,
        perPage,
        '/api/application/users'
      )
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json(
      ResponseUtils.error(
        'InternalServerError',
        '500',
        'Failed to fetch users'
      ),
      500
    );
  }
});

// GET /api/application/users/:id
application.get('/users/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const db = drizzle(c.env.DB);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return c.json(
        ResponseUtils.error(
          'NotFoundHttpException',
          '404',
          'The requested user was not found'
        ),
        404
      );
    }

    return c.json(transformUserToResource(user));
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.json(
      ResponseUtils.error(
        'InternalServerError',
        '500',
        'Failed to fetch user'
      ),
      500
    );
  }
});

// POST /api/application/users
application.post('/users', async (c) => {
  try {
    const body = await c.req.json();
    const result = createUserSchema.safeParse(body);

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

    const { username, email, first_name, last_name, password, root_admin, language } = result.data;

    const db = drizzle(c.env.DB);

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)))
      .limit(1);

    if (existingUser) {
      return c.json(
        ResponseUtils.error(
          'ValidationException',
          '422',
          'A user with this email or username already exists'
        ),
        422
      );
    }

    // Hash password
    const hashedPassword = await PasswordUtils.hash(password, 12);

    // Create user
    const userUuid = UuidUtils.generate();
    const [newUser] = await db
      .insert(users)
      .values({
        uuid: userUuid,
        username,
        email,
        firstName: first_name,
        lastName: last_name,
        password: hashedPassword,
        rootAdmin: root_admin,
        language,
        useTotp: false,
        gravatar: true,
      })
      .returning();

    return c.json(transformUserToResource(newUser), 201);
  } catch (error) {
    console.error('Error creating user:', error);
    return c.json(
      ResponseUtils.error(
        'InternalServerError',
        '500',
        'Failed to create user'
      ),
      500
    );
  }
});

// PATCH /api/application/users/:id
application.patch('/users/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const result = updateUserSchema.safeParse(body);

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

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return c.json(
        ResponseUtils.error(
          'NotFoundHttpException',
          '404',
          'The requested user was not found'
        ),
        404
      );
    }

    const updateData: any = { updatedAt: new Date().toISOString() };

    if (result.data.username) updateData.username = result.data.username;
    if (result.data.email) updateData.email = result.data.email;
    if (result.data.first_name) updateData.firstName = result.data.first_name;
    if (result.data.last_name) updateData.lastName = result.data.last_name;
    if (result.data.language) updateData.language = result.data.language;
    if (result.data.root_admin !== undefined) updateData.rootAdmin = result.data.root_admin;
    if (result.data.password) {
      updateData.password = await PasswordUtils.hash(result.data.password, 12);
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    return c.json(transformUserToResource(updatedUser));
  } catch (error) {
    console.error('Error updating user:', error);
    return c.json(
      ResponseUtils.error(
        'InternalServerError',
        '500',
        'Failed to update user'
      ),
      500
    );
  }
});

// DELETE /api/application/users/:id
application.delete('/users/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const db = drizzle(c.env.DB);

    // Check if user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return c.json(
        ResponseUtils.error(
          'NotFoundHttpException',
          '404',
          'The requested user was not found'
        ),
        404
      );
    }

    // Check if user has servers
    const [userServers] = await db
      .select({ count: count() })
      .from(servers)
      .where(eq(servers.ownerId, id));

    if (userServers.count > 0) {
      return c.json(
        ResponseUtils.error(
          'ValidationException',
          '422',
          'Cannot delete user with existing servers'
        ),
        422
      );
    }

    await db.delete(users).where(eq(users.id, id));

    return c.text('', 204);
  } catch (error) {
    console.error('Error deleting user:', error);
    return c.json(
      ResponseUtils.error(
        'InternalServerError',
        '500',
        'Failed to delete user'
      ),
      500
    );
  }
});

// Node Management Routes

// GET /api/application/nodes
application.get('/nodes', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const perPage = Math.min(parseInt(c.req.query('per_page') || '25'), 100);
    const offset = (page - 1) * perPage;

    const db = drizzle(c.env.DB);

    const [totalResult] = await db
      .select({ count: count() })
      .from(nodes);

    const total = totalResult.count;

    const nodeList = await db
      .select()
      .from(nodes)
      .orderBy(desc(nodes.createdAt))
      .limit(perPage)
      .offset(offset);

    const nodeResources = nodeList.map(transformNodeToResource);

    return c.json(
      ResponseUtils.paginated(
        nodeResources,
        total,
        page,
        perPage,
        '/api/application/nodes'
      )
    );
  } catch (error) {
    console.error('Error fetching nodes:', error);
    return c.json(
      ResponseUtils.error(
        'InternalServerError',
        '500',
        'Failed to fetch nodes'
      ),
      500
    );
  }
});

// GET /api/application/servers
application.get('/servers', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const perPage = Math.min(parseInt(c.req.query('per_page') || '25'), 100);
    const offset = (page - 1) * perPage;

    const db = drizzle(c.env.DB);

    const [totalResult] = await db
      .select({ count: count() })
      .from(servers);

    const total = totalResult.count;

    const serverList = await db
      .select()
      .from(servers)
      .orderBy(desc(servers.createdAt))
      .limit(perPage)
      .offset(offset);

    // Transform servers to API format (reusing client transform function)
    const serverResources = serverList.map(server => ({
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
        user: server.ownerId,
        node: server.nodeId,
        allocation: server.allocationId,
        nest: server.nestId,
        egg: server.eggId,
        created_at: server.createdAt,
        updated_at: server.updatedAt,
      },
    }));

    return c.json(
      ResponseUtils.paginated(
        serverResources,
        total,
        page,
        perPage,
        '/api/application/servers'
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

// GET /api/application/locations
application.get('/locations', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const perPage = Math.min(parseInt(c.req.query('per_page') || '25'), 100);
    const offset = (page - 1) * perPage;

    const db = drizzle(c.env.DB);

    const [totalResult] = await db
      .select({ count: count() })
      .from(locations);

    const total = totalResult.count;

    const locationList = await db
      .select()
      .from(locations)
      .orderBy(desc(locations.createdAt))
      .limit(perPage)
      .offset(offset);

    const locationResources = locationList.map(location => ({
      object: 'location',
      attributes: {
        id: location.id,
        short: location.short,
        long: location.long,
        created_at: location.createdAt,
        updated_at: location.updatedAt,
      },
    }));

    return c.json(
      ResponseUtils.paginated(
        locationResources,
        total,
        page,
        perPage,
        '/api/application/locations'
      )
    );
  } catch (error) {
    console.error('Error fetching locations:', error);
    return c.json(
      ResponseUtils.error(
        'InternalServerError',
        '500',
        'Failed to fetch locations'
      ),
      500
    );
  }
});

export default application;