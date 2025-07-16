import { HTTPException } from 'hono/http-exception';
import { createDb } from '../db';
import { servers, users, nodes, allocations, eggs, nests } from '../db/schema';
import { eq, and, desc, asc, sql, count, like, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface CreateServerData {
  name: string;
  description?: string;
  ownerId: number;
  eggId: number;
  dockerImage: string;
  startup: string;
  limits: {
    memory: number;
    swap: number;
    disk: number;
    io: number;
    cpu: number;
    threads?: string;
  };
  featureLimits: {
    databases?: number;
    allocations?: number;
    backups?: number;
  };
  allocation: {
    default: number;
    additional?: number[];
  };
  environment?: Record<string, any>;
  externalId?: string;
  skipScripts?: boolean;
}

export interface UpdateServerData {
  name?: string;
  description?: string;
  ownerId?: number;
  suspended?: boolean;
  externalId?: string;
}

export interface ServerFilters {
  search?: string;
  owner?: number;
  node?: number;
  status?: string;
}

export class ServerService {
  constructor(private db: ReturnType<typeof createDb>) {}

  async createServer(data: CreateServerData, createdBy: number): Promise<any> {
    // Validate owner exists
    const owner = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, data.ownerId))
      .get();

    if (!owner) {
      throw new HTTPException(404, { message: 'Server owner not found' });
    }

    // Validate egg exists
    const egg = await this.db
      .select({ 
        id: eggs.id, 
        nestId: eggs.nestId,
        dockerImages: eggs.dockerImages,
        startup: eggs.startup 
      })
      .from(eggs)
      .where(eq(eggs.id, data.eggId))
      .get();

    if (!egg) {
      throw new HTTPException(404, { message: 'Egg not found' });
    }

    // Validate docker image is allowed
    const dockerImages = typeof egg.dockerImages === 'string' ? 
      JSON.parse(egg.dockerImages) : egg.dockerImages;
    
    if (!dockerImages.includes(data.dockerImage)) {
      throw new HTTPException(400, { message: 'Invalid docker image for this egg' });
    }

    // Validate default allocation exists and is available
    const allocation = await this.db
      .select()
      .from(allocations)
      .where(and(
        eq(allocations.id, data.allocation.default),
        eq(allocations.serverId, null)
      ))
      .get();

    if (!allocation) {
      throw new HTTPException(404, { message: 'Allocation not found or already assigned' });
    }

    // Generate UUIDs
    const serverUuid = uuidv4();
    const shortUuid = serverUuid.split('-')[0];

    // Create server
    const server = await this.db
      .insert(servers)
      .values({
        uuid: serverUuid,
        uuidShort: shortUuid,
        name: data.name,
        description: data.description,
        ownerId: data.ownerId,
        memory: data.limits.memory,
        swap: data.limits.swap,
        disk: data.limits.disk,
        io: data.limits.io,
        cpu: data.limits.cpu,
        threads: data.limits.threads,
        allocationId: data.allocation.default,
        nestId: egg.nestId,
        eggId: data.eggId,
        startup: data.startup || egg.startup || '',
        image: data.dockerImage,
        databaseLimit: data.featureLimits.databases || 0,
        allocationLimit: data.featureLimits.allocations || 0,
        backupLimit: data.featureLimits.backups || 0,
        externalId: data.externalId,
        skipScripts: data.skipScripts || false,
        status: 'installing',
        installed: false,
      })
      .returning()
      .get();

    // Assign default allocation
    await this.db
      .update(allocations)
      .set({ serverId: server.id })
      .where(eq(allocations.id, data.allocation.default));

    // Assign additional allocations if provided
    if (data.allocation.additional && data.allocation.additional.length > 0) {
      // Validate all additional allocations
      const additionalAllocations = await this.db
        .select()
        .from(allocations)
        .where(and(
          inArray(allocations.id, data.allocation.additional),
          eq(allocations.serverId, null)
        ));

      if (additionalAllocations.length !== data.allocation.additional.length) {
        throw new HTTPException(400, { message: 'One or more additional allocations are not available' });
      }

      // Assign additional allocations
      await this.db
        .update(allocations)
        .set({ serverId: server.id })
        .where(inArray(allocations.id, data.allocation.additional));
    }

    return this.getServerById(server.id);
  }

  async getServerById(id: number): Promise<any> {
    const server = await this.db
      .select({
        id: servers.id,
        uuid: servers.uuid,
        name: servers.name,
        description: servers.description,
        status: servers.status,
        suspended: servers.suspended,
        limits: {
          memory: servers.memory,
          swap: servers.swap,
          disk: servers.disk,
          io: servers.io,
          cpu: servers.cpu,
          threads: servers.threads,
        },
        featureLimits: {
          databases: servers.databaseLimit,
          allocations: servers.allocationLimit,
          backups: servers.backupLimit,
        },
        owner: {
          id: users.id,
          uuid: users.uuid,
          email: users.email,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
        },
        node: {
          id: nodes.id,
          uuid: nodes.uuid,
          name: nodes.name,
          fqdn: nodes.fqdn,
          scheme: nodes.scheme,
        },
        egg: {
          id: eggs.id,
          uuid: eggs.uuid,
          name: eggs.name,
        },
        nest: {
          id: nests.id,
          uuid: nests.uuid,
          name: nests.name,
        },
        createdAt: servers.createdAt,
        updatedAt: servers.updatedAt,
      })
      .from(servers)
      .leftJoin(users, eq(servers.ownerId, users.id))
      .leftJoin(allocations, eq(servers.allocationId, allocations.id))
      .leftJoin(nodes, eq(allocations.nodeId, nodes.id))
      .leftJoin(eggs, eq(servers.eggId, eggs.id))
      .leftJoin(nests, eq(servers.nestId, nests.id))
      .where(eq(servers.id, id))
      .get();

    if (!server) {
      throw new HTTPException(404, { message: 'Server not found' });
    }

    return server;
  }

  async getServerByUuid(uuid: string): Promise<any> {
    const server = await this.db
      .select({ id: servers.id })
      .from(servers)
      .where(eq(servers.uuid, uuid))
      .get();

    if (!server) {
      throw new HTTPException(404, { message: 'Server not found' });
    }

    return this.getServerById(server.id);
  }

  async updateServer(id: number, data: UpdateServerData): Promise<any> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.suspended !== undefined) updateData.suspended = data.suspended;
    if (data.externalId !== undefined) updateData.externalId = data.externalId;

    if (data.ownerId !== undefined) {
      // Validate new owner exists
      const owner = await this.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, data.ownerId))
        .get();

      if (!owner) {
        throw new HTTPException(404, { message: 'New owner not found' });
      }

      updateData.ownerId = data.ownerId;
    }

    updateData.updatedAt = new Date();

    const result = await this.db
      .update(servers)
      .set(updateData)
      .where(eq(servers.id, id))
      .returning({ id: servers.id })
      .get();

    if (!result) {
      throw new HTTPException(404, { message: 'Server not found' });
    }

    return this.getServerById(id);
  }

  async deleteServer(id: number): Promise<void> {
    // First, free up allocations
    await this.db
      .update(allocations)
      .set({ serverId: null })
      .where(eq(allocations.serverId, id));

    // Delete server
    const result = await this.db
      .delete(servers)
      .where(eq(servers.id, id))
      .returning({ id: servers.id })
      .get();

    if (!result) {
      throw new HTTPException(404, { message: 'Server not found' });
    }
  }

  async listServers(
    page: number = 1,
    perPage: number = 25,
    filters: ServerFilters = {},
    sortBy: string = 'id',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<any> {
    const offset = (page - 1) * perPage;
    
    // Build where conditions
    const conditions: any[] = [];
    
    if (filters.search) {
      conditions.push(like(servers.name, `%${filters.search}%`));
    }
    
    if (filters.owner) {
      conditions.push(eq(servers.ownerId, filters.owner));
    }

    if (filters.status) {
      conditions.push(eq(servers.status, filters.status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(servers)
      .where(whereClause)
      .get();

    const total = totalResult?.count || 0;

    // Get servers
    const serversQuery = this.db
      .select({
        id: servers.id,
        uuid: servers.uuid,
        name: servers.name,
        description: servers.description,
        status: servers.status,
        suspended: servers.suspended,
        limits: {
          memory: servers.memory,
          swap: servers.swap,
          disk: servers.disk,
          io: servers.io,
          cpu: servers.cpu,
        },
        owner: {
          id: users.id,
          email: users.email,
          username: users.username,
        },
        node: {
          id: nodes.id,
          name: nodes.name,
        },
        createdAt: servers.createdAt,
      })
      .from(servers)
      .leftJoin(users, eq(servers.ownerId, users.id))
      .leftJoin(allocations, eq(servers.allocationId, allocations.id))
      .leftJoin(nodes, eq(allocations.nodeId, nodes.id))
      .where(whereClause)
      .limit(perPage)
      .offset(offset);

    // Apply sorting
    const orderColumn = sortBy === 'name' ? servers.name : servers.id;
    const orderDirection = sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn);
    
    const results = await serversQuery.orderBy(orderDirection);

    const totalPages = Math.ceil(total / perPage);

    return {
      object: 'list',
      data: results,
      meta: {
        pagination: {
          total,
          count: results.length,
          perPage,
          currentPage: page,
          totalPages,
          links: {
            next: page < totalPages ? `/api/application/servers?page=${page + 1}` : undefined,
            previous: page > 1 ? `/api/application/servers?page=${page - 1}` : undefined,
          },
        },
      },
    };
  }

  async getServersByOwner(ownerId: number): Promise<any[]> {
    return await this.db
      .select({
        id: servers.id,
        uuid: servers.uuid,
        name: servers.name,
        description: servers.description,
        status: servers.status,
        suspended: servers.suspended,
        limits: {
          memory: servers.memory,
          swap: servers.swap,
          disk: servers.disk,
          io: servers.io,
          cpu: servers.cpu,
        },
        createdAt: servers.createdAt,
      })
      .from(servers)
      .where(eq(servers.ownerId, ownerId))
      .orderBy(desc(servers.createdAt));
  }

  async suspendServer(id: number): Promise<any> {
    return this.updateServer(id, { suspended: true });
  }

  async unsuspendServer(id: number): Promise<any> {
    return this.updateServer(id, { suspended: false });
  }

  async reinstallServer(id: number): Promise<any> {
    const result = await this.db
      .update(servers)
      .set({ 
        status: 'installing',
        installed: false,
        installedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(servers.id, id))
      .returning({ id: servers.id })
      .get();

    if (!result) {
      throw new HTTPException(404, { message: 'Server not found' });
    }

    return this.getServerById(id);
  }
}