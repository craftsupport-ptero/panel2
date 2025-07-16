import { HTTPException } from 'hono/http-exception';
import { createDb } from '../db';
import { nodes, locations, allocations } from '../db/schema';
import { eq, desc, asc, count, like, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface CreateNodeData {
  name: string;
  description?: string;
  locationId: number;
  fqdn: string;
  scheme?: 'http' | 'https';
  behindProxy?: boolean;
  maintenanceMode?: boolean;
  memory: number;
  memoryOverallocate?: number;
  disk: number;
  diskOverallocate?: number;
  daemonListen?: number;
  daemonSftp?: number;
  daemonBase?: string;
  uploadSize?: number;
}

export interface UpdateNodeData {
  name?: string;
  description?: string;
  fqdn?: string;
  scheme?: 'http' | 'https';
  behindProxy?: boolean;
  maintenanceMode?: boolean;
  memory?: number;
  memoryOverallocate?: number;
  disk?: number;
  diskOverallocate?: number;
  daemonListen?: number;
  daemonSftp?: number;
  daemonBase?: string;
  uploadSize?: number;
}

export interface NodeFilters {
  search?: string;
  location?: number;
  maintenance?: boolean;
}

export class NodeService {
  constructor(private db: ReturnType<typeof createDb>) {}

  async createNode(data: CreateNodeData): Promise<any> {
    // Validate location exists
    const location = await this.db
      .select({ id: locations.id })
      .from(locations)
      .where(eq(locations.id, data.locationId))
      .get();

    if (!location) {
      throw new HTTPException(404, { message: 'Location not found' });
    }

    // Check if FQDN is already in use
    const existingNode = await this.db
      .select({ id: nodes.id })
      .from(nodes)
      .where(eq(nodes.fqdn, data.fqdn))
      .get();

    if (existingNode) {
      throw new HTTPException(409, { message: 'FQDN already in use' });
    }

    // Generate UUID
    const nodeUuid = uuidv4();

    // Create node
    const node = await this.db
      .insert(nodes)
      .values({
        uuid: nodeUuid,
        name: data.name,
        description: data.description,
        locationId: data.locationId,
        fqdn: data.fqdn,
        scheme: data.scheme || 'https',
        behindProxy: data.behindProxy || false,
        maintenanceMode: data.maintenanceMode || false,
        memory: data.memory,
        memoryOverallocate: data.memoryOverallocate || 0,
        disk: data.disk,
        diskOverallocate: data.diskOverallocate || 0,
        daemonListen: data.daemonListen || 8080,
        daemonSftp: data.daemonSftp || 2022,
        daemonBase: data.daemonBase || '/var/lib/pterodactyl/volumes',
        uploadSize: data.uploadSize || 100,
      })
      .returning()
      .get();

    return this.getNodeById(node.id);
  }

  async getNodeById(id: number): Promise<any> {
    const node = await this.db
      .select({
        id: nodes.id,
        uuid: nodes.uuid,
        name: nodes.name,
        description: nodes.description,
        fqdn: nodes.fqdn,
        scheme: nodes.scheme,
        behindProxy: nodes.behindProxy,
        maintenanceMode: nodes.maintenanceMode,
        memory: nodes.memory,
        memoryOverallocate: nodes.memoryOverallocate,
        disk: nodes.disk,
        diskOverallocate: nodes.diskOverallocate,
        uploadSize: nodes.uploadSize,
        daemonListen: nodes.daemonListen,
        daemonSftp: nodes.daemonSftp,
        daemonBase: nodes.daemonBase,
        location: {
          id: locations.id,
          short: locations.short,
          long: locations.long,
        },
        createdAt: nodes.createdAt,
        updatedAt: nodes.updatedAt,
      })
      .from(nodes)
      .leftJoin(locations, eq(nodes.locationId, locations.id))
      .where(eq(nodes.id, id))
      .get();

    if (!node) {
      throw new HTTPException(404, { message: 'Node not found' });
    }

    // Get allocation statistics
    const allocStats = await this.db
      .select({
        total: count(),
        assigned: count(allocations.serverId),
      })
      .from(allocations)
      .where(eq(allocations.nodeId, id))
      .get();

    return {
      ...node,
      allocations: {
        total: allocStats?.total || 0,
        assigned: allocStats?.assigned || 0,
        available: (allocStats?.total || 0) - (allocStats?.assigned || 0),
      },
    };
  }

  async updateNode(id: number, data: UpdateNodeData): Promise<any> {
    const updateData: any = {};

    // Validate FQDN uniqueness if changing
    if (data.fqdn) {
      const existingNode = await this.db
        .select({ id: nodes.id })
        .from(nodes)
        .where(and(eq(nodes.fqdn, data.fqdn), eq(nodes.id, id)))
        .get();

      if (existingNode && existingNode.id !== id) {
        throw new HTTPException(409, { message: 'FQDN already in use' });
      }
    }

    // Build update object
    Object.keys(data).forEach(key => {
      if (data[key as keyof UpdateNodeData] !== undefined) {
        updateData[key] = data[key as keyof UpdateNodeData];
      }
    });

    updateData.updatedAt = new Date();

    const result = await this.db
      .update(nodes)
      .set(updateData)
      .where(eq(nodes.id, id))
      .returning({ id: nodes.id })
      .get();

    if (!result) {
      throw new HTTPException(404, { message: 'Node not found' });
    }

    return this.getNodeById(id);
  }

  async deleteNode(id: number): Promise<void> {
    // Check if node has any allocated servers
    const allocatedServers = await this.db
      .select({ count: count() })
      .from(allocations)
      .where(and(
        eq(allocations.nodeId, id),
        eq(allocations.serverId, null)
      ))
      .get();

    if (allocatedServers && allocatedServers.count > 0) {
      throw new HTTPException(400, { 
        message: 'Cannot delete node with allocated servers. Please move servers first.' 
      });
    }

    // Delete all allocations for this node
    await this.db
      .delete(allocations)
      .where(eq(allocations.nodeId, id));

    // Delete node
    const result = await this.db
      .delete(nodes)
      .where(eq(nodes.id, id))
      .returning({ id: nodes.id })
      .get();

    if (!result) {
      throw new HTTPException(404, { message: 'Node not found' });
    }
  }

  async listNodes(
    page: number = 1,
    perPage: number = 25,
    filters: NodeFilters = {},
    sortBy: string = 'id',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<any> {
    const offset = (page - 1) * perPage;
    
    // Build where conditions
    const conditions: any[] = [];
    
    if (filters.search) {
      conditions.push(like(nodes.name, `%${filters.search}%`));
    }
    
    if (filters.location) {
      conditions.push(eq(nodes.locationId, filters.location));
    }

    if (filters.maintenance !== undefined) {
      conditions.push(eq(nodes.maintenanceMode, filters.maintenance));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(nodes)
      .where(whereClause)
      .get();

    const total = totalResult?.count || 0;

    // Get nodes
    const nodesQuery = this.db
      .select({
        id: nodes.id,
        uuid: nodes.uuid,
        name: nodes.name,
        description: nodes.description,
        fqdn: nodes.fqdn,
        scheme: nodes.scheme,
        maintenanceMode: nodes.maintenanceMode,
        memory: nodes.memory,
        memoryOverallocate: nodes.memoryOverallocate,
        disk: nodes.disk,
        diskOverallocate: nodes.diskOverallocate,
        location: {
          id: locations.id,
          short: locations.short,
          long: locations.long,
        },
        createdAt: nodes.createdAt,
      })
      .from(nodes)
      .leftJoin(locations, eq(nodes.locationId, locations.id))
      .where(whereClause)
      .limit(perPage)
      .offset(offset);

    // Apply sorting
    const orderColumn = sortBy === 'name' ? nodes.name : nodes.id;
    const orderDirection = sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn);
    
    const results = await nodesQuery.orderBy(orderDirection);

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
            next: page < totalPages ? `/api/application/nodes?page=${page + 1}` : undefined,
            previous: page > 1 ? `/api/application/nodes?page=${page - 1}` : undefined,
          },
        },
      },
    };
  }

  async getNodeConfiguration(id: number): Promise<any> {
    const node = await this.getNodeById(id);
    
    // This would normally generate a secure daemon configuration
    // For now, return a basic configuration structure
    return {
      debug: false,
      uuid: node.uuid,
      token_id: 'placeholder-token-id',
      token: 'placeholder-token',
      api: {
        host: '0.0.0.0',
        port: node.daemonListen,
        ssl: {
          enabled: node.scheme === 'https',
          cert: '/etc/letsencrypt/live/example.com/fullchain.pem',
          key: '/etc/letsencrypt/live/example.com/privkey.pem',
        },
      },
      system: {
        data: node.daemonBase,
        sftp: {
          bind_port: node.daemonSftp,
        },
      },
      allowed_mounts: [],
      remote: `${node.scheme}://${node.fqdn}`,
    };
  }

  async createAllocation(nodeId: number, ip: string, ports: string[], alias?: string): Promise<any> {
    // Validate node exists
    const node = await this.db
      .select({ id: nodes.id })
      .from(nodes)
      .where(eq(nodes.id, nodeId))
      .get();

    if (!node) {
      throw new HTTPException(404, { message: 'Node not found' });
    }

    const createdAllocations = [];

    // Create allocations for each port
    for (const portStr of ports) {
      const port = parseInt(portStr);
      
      if (isNaN(port) || port < 1 || port > 65535) {
        throw new HTTPException(400, { message: `Invalid port: ${portStr}` });
      }

      // Check if allocation already exists
      const existingAllocation = await this.db
        .select({ id: allocations.id })
        .from(allocations)
        .where(and(
          eq(allocations.nodeId, nodeId),
          eq(allocations.ip, ip),
          eq(allocations.port, port)
        ))
        .get();

      if (existingAllocation) {
        throw new HTTPException(409, { 
          message: `Allocation ${ip}:${port} already exists` 
        });
      }

      // Create allocation
      const allocation = await this.db
        .insert(allocations)
        .values({
          nodeId,
          ip,
          port,
          ipAlias: alias,
          notes: null,
          serverId: null,
        })
        .returning()
        .get();

      createdAllocations.push(allocation);
    }

    return createdAllocations;
  }

  async getNodeAllocations(nodeId: number): Promise<any[]> {
    return await this.db
      .select()
      .from(allocations)
      .where(eq(allocations.nodeId, nodeId))
      .orderBy(asc(allocations.ip), asc(allocations.port));
  }

  async deleteAllocation(allocationId: number): Promise<void> {
    // Check if allocation is assigned to a server
    const allocation = await this.db
      .select({ serverId: allocations.serverId })
      .from(allocations)
      .where(eq(allocations.id, allocationId))
      .get();

    if (!allocation) {
      throw new HTTPException(404, { message: 'Allocation not found' });
    }

    if (allocation.serverId) {
      throw new HTTPException(400, { 
        message: 'Cannot delete allocation assigned to a server' 
      });
    }

    await this.db
      .delete(allocations)
      .where(eq(allocations.id, allocationId));
  }
}