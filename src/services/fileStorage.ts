import { HTTPException } from 'hono/http-exception';
import { createDb } from '../db';
import { backups, servers } from '../db/schema';
import { eq, desc, and, count } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { generateRandomString } from '../utils/helpers';

export interface CreateBackupData {
  name: string;
  ignored?: string;
  locked?: boolean;
}

export interface BackupUploadData {
  name: string;
  size: number;
  checksum: string;
  successful: boolean;
}

export class FileStorageService {
  constructor(
    private db: ReturnType<typeof createDb>,
    private r2: R2Bucket
  ) {}

  // Backup Management

  async createBackup(serverId: number, data: CreateBackupData): Promise<any> {
    // Validate server exists
    const server = await this.db
      .select({ 
        id: servers.id,
        backupLimit: servers.backupLimit,
        uuid: servers.uuid 
      })
      .from(servers)
      .where(eq(servers.id, serverId))
      .get();

    if (!server) {
      throw new HTTPException(404, { message: 'Server not found' });
    }

    // Check backup limit
    if (server.backupLimit > 0) {
      const currentBackups = await this.db
        .select({ count: count() })
        .from(backups)
        .where(eq(backups.serverId, serverId))
        .get();

      if (currentBackups && currentBackups.count >= server.backupLimit) {
        throw new HTTPException(403, { 
          message: 'Server has reached its backup limit' 
        });
      }
    }

    // Generate backup UUID
    const backupUuid = uuidv4();

    // Parse ignored files
    const ignoredFiles = data.ignored ? 
      data.ignored.split('\n').filter(line => line.trim()) : [];

    // Create backup record
    const backup = await this.db
      .insert(backups)
      .values({
        serverId,
        uuid: backupUuid,
        name: data.name,
        ignoredFiles: JSON.stringify(ignoredFiles),
        disk: 's3', // Using R2 (S3-compatible)
        locked: data.locked || false,
        successful: false,
        bytes: 0,
      })
      .returning()
      .get();

    // In a real implementation, you would trigger the backup process
    // on the Wings daemon here

    return this.getBackupById(backup.id);
  }

  async getBackupById(id: number): Promise<any> {
    const backup = await this.db
      .select({
        id: backups.id,
        uuid: backups.uuid,
        name: backups.name,
        ignoredFiles: backups.ignoredFiles,
        sha256Hash: backups.sha256Hash,
        bytes: backups.bytes,
        successful: backups.successful,
        locked: backups.locked,
        disk: backups.disk,
        completedAt: backups.completedAt,
        server: {
          id: servers.id,
          uuid: servers.uuid,
          name: servers.name,
        },
        createdAt: backups.createdAt,
        updatedAt: backups.updatedAt,
      })
      .from(backups)
      .leftJoin(servers, eq(backups.serverId, servers.id))
      .where(eq(backups.id, id))
      .get();

    if (!backup) {
      throw new HTTPException(404, { message: 'Backup not found' });
    }

    return backup;
  }

  async getBackupsByServer(serverId: number): Promise<any[]> {
    return await this.db
      .select({
        id: backups.id,
        uuid: backups.uuid,
        name: backups.name,
        bytes: backups.bytes,
        successful: backups.successful,
        locked: backups.locked,
        completedAt: backups.completedAt,
        createdAt: backups.createdAt,
      })
      .from(backups)
      .where(eq(backups.serverId, serverId))
      .orderBy(desc(backups.createdAt));
  }

  async deleteBackup(id: number): Promise<void> {
    const backup = await this.db
      .select({
        id: backups.id,
        uuid: backups.uuid,
        locked: backups.locked,
        serverId: backups.serverId,
      })
      .from(backups)
      .where(eq(backups.id, id))
      .get();

    if (!backup) {
      throw new HTTPException(404, { message: 'Backup not found' });
    }

    if (backup.locked) {
      throw new HTTPException(400, { message: 'Cannot delete locked backup' });
    }

    // Delete from R2 storage
    try {
      await this.r2.delete(`backups/${backup.serverId}/${backup.uuid}.tar.gz`);
    } catch (error) {
      console.warn('Failed to delete backup from R2:', error);
      // Continue with database deletion even if R2 deletion fails
    }

    // Delete backup record
    await this.db
      .delete(backups)
      .where(eq(backups.id, id));
  }

  async downloadBackup(id: number): Promise<{ url: string; expires: Date }> {
    const backup = await this.db
      .select({
        id: backups.id,
        uuid: backups.uuid,
        serverId: backups.serverId,
        successful: backups.successful,
      })
      .from(backups)
      .where(eq(backups.id, id))
      .get();

    if (!backup) {
      throw new HTTPException(404, { message: 'Backup not found' });
    }

    if (!backup.successful) {
      throw new HTTPException(400, { message: 'Backup is not ready for download' });
    }

    // Generate signed URL for R2 download
    const key = `backups/${backup.serverId}/${backup.uuid}.tar.gz`;
    
    // In a real implementation, you would generate a presigned URL
    // For now, return a placeholder
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    return {
      url: `https://your-r2-domain.com/${key}?expires=${expires.getTime()}`,
      expires,
    };
  }

  async lockBackup(id: number): Promise<any> {
    const result = await this.db
      .update(backups)
      .set({ 
        locked: true,
        updatedAt: new Date(),
      })
      .where(eq(backups.id, id))
      .returning({ id: backups.id })
      .get();

    if (!result) {
      throw new HTTPException(404, { message: 'Backup not found' });
    }

    return this.getBackupById(id);
  }

  async unlockBackup(id: number): Promise<any> {
    const result = await this.db
      .update(backups)
      .set({ 
        locked: false,
        updatedAt: new Date(),
      })
      .where(eq(backups.id, id))
      .returning({ id: backups.id })
      .get();

    if (!result) {
      throw new HTTPException(404, { message: 'Backup not found' });
    }

    return this.getBackupById(id);
  }

  // File Upload/Download

  async uploadFile(serverId: number, path: string, file: ReadableStream): Promise<any> {
    // Validate server exists
    const server = await this.db
      .select({ id: servers.id, uuid: servers.uuid })
      .from(servers)
      .where(eq(servers.id, serverId))
      .get();

    if (!server) {
      throw new HTTPException(404, { message: 'Server not found' });
    }

    // Sanitize path
    const sanitizedPath = path.replace(/\.\./g, '').replace(/\/+/g, '/');
    const key = `servers/${server.uuid}/files/${sanitizedPath}`;

    try {
      // Upload to R2
      await this.r2.put(key, file);

      return {
        success: true,
        path: sanitizedPath,
        key,
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw new HTTPException(500, { message: 'Failed to upload file' });
    }
  }

  async downloadFile(serverId: number, path: string): Promise<ReadableStream | null> {
    // Validate server exists
    const server = await this.db
      .select({ id: servers.id, uuid: servers.uuid })
      .from(servers)
      .where(eq(servers.id, serverId))
      .get();

    if (!server) {
      throw new HTTPException(404, { message: 'Server not found' });
    }

    // Sanitize path
    const sanitizedPath = path.replace(/\.\./g, '').replace(/\/+/g, '/');
    const key = `servers/${server.uuid}/files/${sanitizedPath}`;

    try {
      const object = await this.r2.get(key);
      return object?.body || null;
    } catch (error) {
      console.error('File download error:', error);
      return null;
    }
  }

  async deleteFile(serverId: number, path: string): Promise<void> {
    // Validate server exists
    const server = await this.db
      .select({ id: servers.id, uuid: servers.uuid })
      .from(servers)
      .where(eq(servers.id, serverId))
      .get();

    if (!server) {
      throw new HTTPException(404, { message: 'Server not found' });
    }

    // Sanitize path
    const sanitizedPath = path.replace(/\.\./g, '').replace(/\/+/g, '/');
    const key = `servers/${server.uuid}/files/${sanitizedPath}`;

    try {
      await this.r2.delete(key);
    } catch (error) {
      console.error('File deletion error:', error);
      throw new HTTPException(500, { message: 'Failed to delete file' });
    }
  }

  async listFiles(serverId: number, directory: string = '/'): Promise<any[]> {
    // Validate server exists
    const server = await this.db
      .select({ id: servers.id, uuid: servers.uuid })
      .from(servers)
      .where(eq(servers.id, serverId))
      .get();

    if (!server) {
      throw new HTTPException(404, { message: 'Server not found' });
    }

    // Sanitize directory path
    const sanitizedDirectory = directory.replace(/\.\./g, '').replace(/\/+/g, '/');
    const prefix = `servers/${server.uuid}/files${sanitizedDirectory}`;

    try {
      const objects = await this.r2.list({ prefix });
      
      return objects.objects.map(obj => ({
        name: obj.key.replace(prefix, ''),
        size: obj.size,
        modified: obj.uploaded,
        etag: obj.etag,
      }));
    } catch (error) {
      console.error('File listing error:', error);
      throw new HTTPException(500, { message: 'Failed to list files' });
    }
  }

  // Update backup with completion data (called by Wings daemon)
  async completeBackup(uuid: string, data: BackupUploadData): Promise<any> {
    const backup = await this.db
      .select({ id: backups.id })
      .from(backups)
      .where(eq(backups.uuid, uuid))
      .get();

    if (!backup) {
      throw new HTTPException(404, { message: 'Backup not found' });
    }

    const result = await this.db
      .update(backups)
      .set({
        bytes: data.size,
        sha256Hash: data.checksum,
        successful: data.successful,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(backups.uuid, uuid))
      .returning({ id: backups.id })
      .get();

    return this.getBackupById(backup.id);
  }
}