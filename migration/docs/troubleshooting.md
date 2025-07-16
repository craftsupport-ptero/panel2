# Pterodactyl Panel Migration - Troubleshooting Guide

This guide helps resolve common issues encountered during the migration to serverless architecture.

## 🚨 Quick Emergency Procedures

### Emergency Rollback
If the migration encounters critical issues:

```bash
# Immediate rollback to last known good state
yarn migrate:rollback --backup-db /path/to/backup.sql \
                      --backup-files /path/to/files-backup \
                      --metadata migration/backups/metadata.json

# Verify rollback success
curl -H "Authorization: Bearer your-api-key" https://your-domain.com/api/application/users
```

### Service Recovery
If services become unresponsive:

```bash
# Check service status
docker-compose ps

# Restart all services
docker-compose restart

# Check logs for errors
docker-compose logs -f panel
```

## 📊 Common Issues & Solutions

### 1. Database Migration Issues

#### Error: Connection Timeout
```
Error: Connection timeout while connecting to source database
```

**Solutions:**
```bash
# Increase connection timeout
yarn migrate:database --source "mysql://user:pass@host/db?timeout=60000"

# Check network connectivity
ping your-database-host
telnet your-database-host 3306

# Test database connection manually
mysql -h your-database-host -u pterodactyl -p pterodactyl
```

#### Error: Foreign Key Constraints
```
Error: Cannot drop table due to foreign key constraints
```

**Solutions:**
```bash
# Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

# Use migration with constraint handling
yarn migrate:database --handle-constraints

# Manual constraint resolution
ALTER TABLE child_table DROP FOREIGN KEY constraint_name;
```

#### Error: Large Table Migration Timeout
```
Error: Migration timeout for table 'activity_logs' (2.5M rows)
```

**Solutions:**
```bash
# Increase batch size and use parallel processing
yarn migrate:database --batch-size 5000 --parallel

# Migrate specific tables separately
yarn migrate:database --only-tables "users,servers" --batch-size 1000
yarn migrate:database --only-tables "activity_logs" --batch-size 500

# Skip problematic tables temporarily
yarn migrate:database --skip-tables "activity_logs,audit_logs"
```

### 2. File Migration Issues

#### Error: R2 Upload Failures
```
Error: Upload failed for large-file.zip: Request timeout
```

**Solutions:**
```bash
# Exclude large files initially
yarn migrate:files --exclude "*.zip,*.tar.gz" --max-file-size 100000000

# Reduce parallel uploads
yarn migrate:files --parallel 2

# Migrate large files separately
find storage/ -size +100M -name "*.zip" > large-files.txt
```

#### Error: Permission Denied
```
Error: EACCES: permission denied, open '/var/www/pterodactyl/storage/app/file.txt'
```

**Solutions:**
```bash
# Fix file permissions
sudo chown -R www-data:www-data /var/www/pterodactyl/storage/
sudo chmod -R 755 /var/www/pterodactyl/storage/

# Run migration as correct user
sudo -u www-data yarn migrate:files

# Use Docker for permission isolation
docker run --rm -v /var/www/pterodactyl:/app node:18 yarn migrate:files
```

#### Error: Checksum Mismatch
```
Error: Checksum mismatch for file.txt: local=abc123, remote=def456
```

**Solutions:**
```bash
# Retry with integrity verification
yarn migrate:files --verify-integrity --retry-failed

# Check for file corruption
md5sum /path/to/file.txt

# Re-upload specific files
yarn migrate:files --include "path/to/problematic/files/*"
```

### 3. API Compatibility Issues

#### Error: Legacy API Authentication Failed
```
HTTP 401: The credentials provided were invalid for this request
```

**Solutions:**
```bash
# Verify API key format
echo "your-api-key" | grep -E "^ptl[ac]_[a-zA-Z0-9]{43}$"

# Check API key in database
mysql -e "SELECT identifier, last_used_at FROM api_keys WHERE token = 'your-hashed-token';"

# Test with new API format
curl -H "Authorization: Bearer ptla_your-new-token" \
     https://your-domain.com/api/application/users
```

#### Error: API Response Format Mismatch
```
Expected object 'server' but got 'server_data'
```

**Solutions:**
```bash
# Enable legacy response format
export LEGACY_API_ENABLED=true

# Check response transformation
curl -H "Authorization: Bearer your-token" \
     https://your-domain.com/api/application/servers | jq '.object'

# Update client to handle new format
# Update client code to expect new response structure
```

### 4. Performance Issues

#### Error: Slow Database Queries
```
Warning: Query execution time exceeding 5 seconds
```

**Solutions:**
```sql
-- Analyze slow queries
SHOW PROCESSLIST;
EXPLAIN SELECT * FROM servers WHERE owner_id = 1;

-- Add missing indexes
CREATE INDEX idx_servers_owner_id ON servers(owner_id);
CREATE INDEX idx_activity_logs_subject_id ON activity_logs(subject_id);
CREATE INDEX idx_backups_server_id ON backups(server_id);

-- Optimize tables
OPTIMIZE TABLE servers, users, activity_logs;
```

#### Error: Memory Issues During Migration
```
JavaScript heap out of memory
```

**Solutions:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=8192"
yarn migrate:database

# Use streaming for large datasets
yarn migrate:database --streaming --batch-size 500

# Process in smaller chunks
yarn migrate:database --only-tables "users" --batch-size 100
```

### 5. Cloudflare Configuration Issues

#### Error: D1 Database Not Found
```
Error: D1 database 'your-database-id' not found
```

**Solutions:**
```bash
# Verify database exists
wrangler d1 list

# Create database if missing
wrangler d1 create pterodactyl-panel

# Check account ID
wrangler whoami

# Verify API token permissions
curl -X GET "https://api.cloudflare.com/client/v4/accounts" \
     -H "Authorization: Bearer your-api-token"
```

#### Error: R2 Bucket Access Denied
```
Error: Access denied to R2 bucket 'pterodactyl-files'
```

**Solutions:**
```bash
# Verify bucket exists and permissions
wrangler r2 bucket list

# Check R2 token permissions
wrangler r2 bucket create test-bucket --dry-run

# Verify endpoint URL
curl -X HEAD https://your-account.r2.cloudflarestorage.com/pterodactyl-files
```

### 6. Docker & Deployment Issues

#### Error: Container Build Failures
```
Error: failed to solve: process "/bin/sh -c yarn build:production" did not complete successfully
```

**Solutions:**
```bash
# Build locally first
yarn install
yarn build:production

# Check Docker build context
docker build -t pterodactyl-test -f deployment/docker/Dockerfile .

# Use multi-stage build debugging
docker build --target builder -t debug-build .
docker run -it debug-build /bin/bash
```

#### Error: Service Dependencies
```
Error: service "database" is not available
```

**Solutions:**
```bash
# Check service status
docker-compose ps

# Restart with proper order
docker-compose down
docker-compose up -d database
sleep 30
docker-compose up -d panel

# Check service logs
docker-compose logs database
docker-compose logs panel
```

## 🔧 Diagnostic Commands

### System Health Check
```bash
# Check all services
./scripts/health-check.sh

# Database connectivity
npx ts-node migration/scripts/validate-data.ts pre-migration \
  --source "mysql://user:pass@host/db"

# API endpoints
curl -f https://your-domain.com/api/health
curl -f -H "Authorization: Bearer token" https://your-domain.com/api/application/users
```

### Performance Monitoring
```bash
# Database performance
mysql -e "SHOW PROCESSLIST; SHOW ENGINE INNODB STATUS\G"

# File system performance
iostat -x 1 5

# Memory usage
free -h
ps aux --sort=-%mem | head -10

# Network performance
iftop -t -s 10
```

### Log Analysis
```bash
# Migration logs
tail -f migration/logs/migration-*.log

# Application logs
tail -f storage/logs/laravel.log

# System logs
journalctl -u pterodactyl-panel -f

# Docker logs
docker-compose logs -f --tail=100
```

## 📋 Pre-Migration Checklist

Before starting migration, verify:

- [ ] **Backup Created**: Full database and file backup completed
- [ ] **Dependencies Installed**: Node.js 18+, yarn, Docker (if using)
- [ ] **Cloudflare Setup**: D1 database, R2 bucket, API tokens configured
- [ ] **Network Access**: Firewall rules allow Cloudflare API access
- [ ] **Disk Space**: Sufficient space for migration files and logs
- [ ] **Maintenance Window**: Migration scheduled during low-traffic period
- [ ] **Team Notification**: Staff informed of migration timeline
- [ ] **Rollback Plan**: Rollback procedures tested and ready

## 🚀 Post-Migration Verification

After migration completion:

- [ ] **API Endpoints**: All API endpoints responding correctly
- [ ] **User Authentication**: Login and API key authentication working
- [ ] **Server Management**: Server creation, modification, deletion working
- [ ] **File Operations**: File uploads, downloads, management working
- [ ] **Database Integrity**: Data counts match between old and new systems
- [ ] **Performance**: Response times within acceptable limits
- [ ] **Monitoring**: Monitoring and alerting configured and active
- [ ] **SSL/DNS**: Domain routing and SSL certificates working
- [ ] **Legacy Compatibility**: Old API integrations still functional

## 📞 Getting Help

### Community Support
- **Discord**: [Pterodactyl Community Server](https://discord.gg/pterodactyl)
- **Forums**: [Community Discussion](https://pterodactyl.io/community)
- **GitHub**: [Issue Tracker](https://github.com/your-repo/panel2/issues)

### Professional Support
- **Migration Consulting**: Available for complex migrations
- **24/7 Support**: Emergency support during migration
- **Training**: Team training on new serverless architecture

### Emergency Contacts
- **Critical Issues**: Create GitHub issue with `critical` label
- **Security Issues**: Email security@pterodactyl.io
- **Migration Help**: Join #migration-support Discord channel

## 📝 Reporting Issues

When reporting issues, include:

1. **Migration Phase**: Which migration step was running
2. **Error Message**: Full error message and stack trace
3. **Environment**: OS, Node.js version, database version
4. **Configuration**: Sanitized configuration files
5. **Logs**: Relevant log files (last 100 lines)
6. **Steps to Reproduce**: Exact commands that caused the issue

### Issue Template
```
## Environment
- OS: Ubuntu 20.04
- Node.js: v18.17.0
- Database: MySQL 8.0.34
- Migration Phase: Database Migration

## Error
```
[2024-01-15T10:30:00Z] [ERROR] Migration failed with error: Connection timeout
```

## Steps to Reproduce
1. Run `yarn migrate:database --source mysql://...`
2. Migration runs for ~10 minutes
3. Connection timeout occurs

## Expected Behavior
Migration should complete successfully

## Additional Context
- Large database (2M records)
- Remote database server
- Network latency ~50ms
```

Remember: Most migration issues are recoverable. Stay calm, follow the procedures, and reach out for help when needed!