import { HTTPException } from 'hono/http-exception';
import { createDb } from '../db';
import { databases, databaseHosts, servers } from '../db/schema';
import { eq, and, count, desc } from 'drizzle-orm';
import { generateRandomString } from '../utils/helpers';

export interface CreateDatabaseData {
  database: string;
  remote?: string;
  hostId: number;
}

export interface CreateDatabaseHostData {
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  maxDatabases?: number;
  nodeId?: number;
}

export interface UpdateDatabaseHostData {
  name?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  maxDatabases?: number;
  nodeId?: number;
}

export class DatabaseService {
  constructor(private db: ReturnType<typeof createDb>) {}

  async createDatabase(serverId: number, data: CreateDatabaseData): Promise<any> {
    // Validate server exists
    const server = await this.db
      .select({ 
        id: servers.id, 
        databaseLimit: servers.databaseLimit 
      })
      .from(servers)
      .where(eq(servers.id, serverId))
      .get();

    if (!server) {
      throw new HTTPException(404, { message: 'Server not found' });
    }

    // Check database limit
    if (server.databaseLimit > 0) {
      const currentDatabases = await this.db
        .select({ count: count() })
        .from(databases)
        .where(eq(databases.serverId, serverId))
        .get();

      if (currentDatabases && currentDatabases.count >= server.databaseLimit) {
        throw new HTTPException(403, { 
          message: 'Server has reached its database limit' 
        });
      }
    }

    // Validate database host exists
    const dbHost = await this.db
      .select()
      .from(databaseHosts)
      .where(eq(databaseHosts.id, data.hostId))
      .get();

    if (!dbHost) {
      throw new HTTPException(404, { message: 'Database host not found' });
    }

    // Check database host limit
    if (dbHost.maxDatabases && dbHost.maxDatabases > 0) {
      const hostDatabases = await this.db
        .select({ count: count() })
        .from(databases)
        .where(eq(databases.databaseHostId, data.hostId))
        .get();

      if (hostDatabases && hostDatabases.count >= dbHost.maxDatabases) {
        throw new HTTPException(403, { 
          message: 'Database host has reached its database limit' 
        });
      }
    }

    // Check if database name already exists for this server
    const existingDatabase = await this.db
      .select({ id: databases.id })
      .from(databases)
      .where(and(
        eq(databases.serverId, serverId),
        eq(databases.database, data.database)
      ))
      .get();

    if (existingDatabase) {
      throw new HTTPException(409, { 
        message: 'Database with this name already exists for this server' 
      });
    }

    // Generate username and password
    const username = `s${serverId}_${data.database}`;
    const password = generateRandomString(16);

    // Create database record
    const database = await this.db
      .insert(databases)
      .values({
        serverId,
        databaseHostId: data.hostId,
        database: data.database,
        username,
        password,
        remote: data.remote || '%',
        maxConnections: 0,
      })
      .returning()
      .get();

    // In a real implementation, you would create the actual database and user
    // on the database host here using the database credentials

    return this.getDatabaseById(database.id);
  }

  async getDatabaseById(id: number): Promise<any> {
    const database = await this.db
      .select({
        id: databases.id,
        database: databases.database,
        username: databases.username,
        remote: databases.remote,
        maxConnections: databases.maxConnections,
        host: {
          id: databaseHosts.id,
          name: databaseHosts.name,
          host: databaseHosts.host,
          port: databaseHosts.port,
        },
        server: {
          id: servers.id,
          name: servers.name,
        },
        createdAt: databases.createdAt,
        updatedAt: databases.updatedAt,
      })
      .from(databases)
      .leftJoin(databaseHosts, eq(databases.databaseHostId, databaseHosts.id))
      .leftJoin(servers, eq(databases.serverId, servers.id))
      .where(eq(databases.id, id))
      .get();

    if (!database) {
      throw new HTTPException(404, { message: 'Database not found' });
    }

    return database;
  }

  async getDatabasesByServer(serverId: number): Promise<any[]> {
    return await this.db
      .select({
        id: databases.id,
        database: databases.database,
        username: databases.username,
        remote: databases.remote,
        maxConnections: databases.maxConnections,
        host: {
          id: databaseHosts.id,
          name: databaseHosts.name,
          host: databaseHosts.host,
          port: databaseHosts.port,
        },
        createdAt: databases.createdAt,
      })
      .from(databases)
      .leftJoin(databaseHosts, eq(databases.databaseHostId, databaseHosts.id))
      .where(eq(databases.serverId, serverId))
      .orderBy(desc(databases.createdAt));
  }

  async deleteDatabase(id: number): Promise<void> {
    const database = await this.db
      .select({
        id: databases.id,
        database: databases.database,
        username: databases.username,
        host: databaseHosts.host,
        port: databaseHosts.port,
        hostUsername: databaseHosts.username,
        hostPassword: databaseHosts.password,
      })
      .from(databases)
      .leftJoin(databaseHosts, eq(databases.databaseHostId, databaseHosts.id))
      .where(eq(databases.id, id))
      .get();

    if (!database) {
      throw new HTTPException(404, { message: 'Database not found' });
    }

    // In a real implementation, you would drop the database and user
    // from the database host here

    // Delete database record
    await this.db
      .delete(databases)
      .where(eq(databases.id, id));
  }

  async rotatePassword(id: number): Promise<{ password: string }> {
    const database = await this.db
      .select({
        id: databases.id,
        username: databases.username,
        host: databaseHosts.host,
        port: databaseHosts.port,
        hostUsername: databaseHosts.username,
        hostPassword: databaseHosts.password,
      })
      .from(databases)
      .leftJoin(databaseHosts, eq(databases.databaseHostId, databaseHosts.id))
      .where(eq(databases.id, id))
      .get();

    if (!database) {
      throw new HTTPException(404, { message: 'Database not found' });
    }

    // Generate new password
    const newPassword = generateRandomString(16);

    // Update database record
    await this.db
      .update(databases)
      .set({ 
        password: newPassword,
        updatedAt: new Date(),
      })
      .where(eq(databases.id, id));

    // In a real implementation, you would update the password
    // on the database host here

    return { password: newPassword };
  }

  // Database Host Management

  async createDatabaseHost(data: CreateDatabaseHostData): Promise<any> {
    // Check if host already exists
    const existingHost = await this.db
      .select({ id: databaseHosts.id })
      .from(databaseHosts)
      .where(and(
        eq(databaseHosts.host, data.host),
        eq(databaseHosts.port, data.port)
      ))
      .get();

    if (existingHost) {
      throw new HTTPException(409, { 
        message: 'Database host with this address already exists' 
      });
    }

    // Create database host
    const dbHost = await this.db
      .insert(databaseHosts)
      .values({
        name: data.name,
        host: data.host,
        port: data.port,
        username: data.username,
        password: data.password,
        maxDatabases: data.maxDatabases,
        nodeId: data.nodeId,
      })
      .returning()
      .get();

    return this.getDatabaseHostById(dbHost.id);
  }

  async getDatabaseHostById(id: number): Promise<any> {
    const dbHost = await this.db
      .select()
      .from(databaseHosts)
      .where(eq(databaseHosts.id, id))
      .get();

    if (!dbHost) {
      throw new HTTPException(404, { message: 'Database host not found' });
    }

    // Get database count for this host
    const databaseCount = await this.db
      .select({ count: count() })
      .from(databases)
      .where(eq(databases.databaseHostId, id))
      .get();

    return {
      ...dbHost,
      databases: databaseCount?.count || 0,
    };
  }

  async listDatabaseHosts(): Promise<any[]> {
    const hosts = await this.db
      .select()
      .from(databaseHosts)
      .orderBy(desc(databaseHosts.createdAt));

    // Add database counts
    const hostsWithCounts = await Promise.all(
      hosts.map(async (host) => {
        const databaseCount = await this.db
          .select({ count: count() })
          .from(databases)
          .where(eq(databases.databaseHostId, host.id))
          .get();

        return {
          ...host,
          databases: databaseCount?.count || 0,
        };
      })
    );

    return hostsWithCounts;
  }

  async updateDatabaseHost(id: number, data: UpdateDatabaseHostData): Promise<any> {
    const updateData: any = {};

    // Build update object
    Object.keys(data).forEach(key => {
      if (data[key as keyof UpdateDatabaseHostData] !== undefined) {
        updateData[key] = data[key as keyof UpdateDatabaseHostData];
      }
    });

    updateData.updatedAt = new Date();

    const result = await this.db
      .update(databaseHosts)
      .set(updateData)
      .where(eq(databaseHosts.id, id))
      .returning({ id: databaseHosts.id })
      .get();

    if (!result) {
      throw new HTTPException(404, { message: 'Database host not found' });
    }

    return this.getDatabaseHostById(id);
  }

  async deleteDatabaseHost(id: number): Promise<void> {
    // Check if host has any databases
    const databaseCount = await this.db
      .select({ count: count() })
      .from(databases)
      .where(eq(databases.databaseHostId, id))
      .get();

    if (databaseCount && databaseCount.count > 0) {
      throw new HTTPException(400, { 
        message: 'Cannot delete database host with existing databases' 
      });
    }

    const result = await this.db
      .delete(databaseHosts)
      .where(eq(databaseHosts.id, id))
      .returning({ id: databaseHosts.id })
      .get();

    if (!result) {
      throw new HTTPException(404, { message: 'Database host not found' });
    }
  }
}