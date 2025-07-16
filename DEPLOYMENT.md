# Deployment Guide - Pterodactyl Panel Serverless API

This guide walks you through deploying the Pterodactyl Panel Serverless User Management API to Cloudflare Workers.

## Prerequisites

Before deploying, ensure you have:

1. **Cloudflare Account** with access to:
   - Cloudflare Workers (for the API)
   - Cloudflare D1 (for the database)
   - Cloudflare R2 (for file storage)

2. **Local Development Environment**:
   - Node.js 18 or later
   - npm or yarn package manager
   - Git for version control

3. **Wrangler CLI** installed globally:
   ```bash
   npm install -g wrangler
   ```

4. **Authenticated Wrangler**:
   ```bash
   wrangler login
   ```

## Step 1: Create Cloudflare Resources

### Create D1 Database

1. Create the production database:
   ```bash
   wrangler d1 create pterodactyl-panel
   ```

2. Create development database (optional):
   ```bash
   wrangler d1 create pterodactyl-panel-dev
   ```

3. Note the database IDs from the output and update your `wrangler.toml`:
   ```toml
   [[env.production.d1_databases]]
   binding = "DB"
   database_name = "pterodactyl-panel"
   database_id = "your-production-database-id"

   [[env.development.d1_databases]]
   binding = "DB"
   database_name = "pterodactyl-panel-dev"
   database_id = "your-development-database-id"
   ```

### Create R2 Bucket

1. Create the production bucket:
   ```bash
   wrangler r2 bucket create pterodactyl-avatars
   ```

2. Create development bucket (optional):
   ```bash
   wrangler r2 bucket create pterodactyl-avatars-dev
   ```

3. Update your `wrangler.toml`:
   ```toml
   [[env.production.r2_buckets]]
   binding = "AVATARS"
   bucket_name = "pterodactyl-avatars"

   [[env.development.r2_buckets]]
   binding = "AVATARS"
   bucket_name = "pterodactyl-avatars-dev"
   ```

## Step 2: Configure Environment Variables

Update your `wrangler.toml` with environment-specific variables:

```toml
[env.production.vars]
ENVIRONMENT = "production"
JWT_SECRET = "your-super-secure-jwt-secret-key-here"
BCRYPT_ROUNDS = "12"

[env.development.vars]
ENVIRONMENT = "development"
JWT_SECRET = "development-jwt-secret-key"
BCRYPT_ROUNDS = "10"
```

**Important Security Notes:**
- Use a strong, unique JWT secret (at least 256 bits)
- Never commit secrets to version control
- Consider using Cloudflare's secret management for sensitive values

## Step 3: Initialize Database Schema

### For Production
```bash
wrangler d1 execute pterodactyl-panel --file=./database-schema.sql --env production
```

### For Development
```bash
wrangler d1 execute pterodactyl-panel-dev --file=./database-schema.sql --env development
```

### Verify Database Setup
```bash
# Check tables were created
wrangler d1 execute pterodactyl-panel --command="SELECT name FROM sqlite_master WHERE type='table';" --env production

# Check default roles were inserted
wrangler d1 execute pterodactyl-panel --command="SELECT name, description FROM roles;" --env production

# Check permissions were inserted
wrangler d1 execute pterodactyl-panel --command="SELECT COUNT(*) as permission_count FROM permissions;" --env production
```

## Step 4: Build and Test Locally

### Install Dependencies
```bash
# Install main project dependencies (if not already done)
npm install --legacy-peer-deps

# Install serverless-specific dependencies
npm install @cloudflare/workers-types bcryptjs jsonwebtoken zod wrangler
```

### Local Development
```bash
# Start local development server
wrangler dev --env development

# Test in another terminal
curl http://localhost:8787/api/health
```

### Run Tests
```bash
# Run serverless API tests
npx jest --config jest.serverless.config.json

# Run with coverage
npx jest --config jest.serverless.config.json --coverage
```

## Step 5: Deploy to Staging/Development

```bash
# Deploy to development environment
wrangler deploy --env development

# Test the deployed API
curl https://pterodactyl-panel-api-dev.your-username.workers.dev/api/health
```

## Step 6: Deploy to Production

### Pre-deployment Checklist

- [ ] All tests passing
- [ ] Database schema applied
- [ ] Environment variables configured
- [ ] JWT secret is secure and unique
- [ ] R2 bucket permissions configured
- [ ] Domain/subdomain configured (if using custom domain)

### Deploy

```bash
# Deploy to production
wrangler deploy --env production

# Verify deployment
curl https://pterodactyl-panel-api.your-username.workers.dev/api/health
```

## Step 7: Configure Custom Domain (Optional)

### Add Custom Domain to Worker

1. In Cloudflare Dashboard:
   - Go to Workers & Pages
   - Select your worker
   - Go to Settings > Triggers
   - Add Custom Domain

2. Configure DNS:
   ```
   api.pterodactyl.example.com -> CNAME -> pterodactyl-panel-api.your-username.workers.dev
   ```

### Update CORS Settings

If using a custom domain, update your API to allow requests from your frontend domain:

```typescript
// In src/utils.ts - createCorsHeaders function
export function createCorsHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = [
    'https://panel.pterodactyl.example.com',
    'https://pterodactyl.example.com'
  ];
  
  const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : '*';
  
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  };
}
```

## Step 8: Set Up Monitoring and Logging

### Enable Worker Analytics

1. In Cloudflare Dashboard:
   - Go to Workers & Pages
   - Select your worker
   - Go to Observability
   - Enable analytics and real-time logs

### Add Custom Logging

Update your error handling to include structured logging:

```typescript
// In src/utils.ts
export function logError(error: unknown, context: string, userId?: number) {
  const logData = {
    timestamp: new Date().toISOString(),
    context,
    userId,
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack
    } : error
  };
  
  console.error('API_ERROR', JSON.stringify(logData));
}
```

### Set Up Alerts

Configure alerts in Cloudflare Dashboard for:
- High error rates
- Unusual traffic patterns
- Database connection issues
- Failed authentication attempts

## Step 9: Create Admin User

After deployment, create the initial admin user:

### Option 1: Direct Database Insert

```bash
# Generate password hash (use bcrypt with 12 rounds for production)
# You can use online bcrypt generators or Node.js script

wrangler d1 execute pterodactyl-panel --command="
INSERT INTO users (username, email, password, first_name, last_name, role, root_admin, created_at, updated_at)
VALUES (
  'admin',
  'admin@your-domain.com',
  '\$2b\$12\$hashedPasswordHere',
  'System',
  'Administrator',
  'admin',
  true,
  datetime('now'),
  datetime('now')
);" --env production
```

### Option 2: Use API (after Phase 2 integration)

Once integrated with Phase 2 authentication, use the user creation endpoint with an admin token.

## Step 10: Integration with Phase 2

### Update Phase 2 Configuration

Ensure Phase 2 authentication system is configured to:
1. Generate JWT tokens with the correct payload structure
2. Use the same JWT secret as the User Management API
3. Include user permissions in the JWT payload

### Test Integration

1. Authenticate through Phase 2 to get JWT token
2. Use JWT token to access User Management API endpoints
3. Verify permissions are enforced correctly

## Maintenance and Updates

### Database Migrations

For schema changes, create migration scripts:

```sql
-- migration-001-add-new-column.sql
ALTER TABLE users ADD COLUMN new_column VARCHAR(255) DEFAULT NULL;
```

Apply migrations:
```bash
wrangler d1 execute pterodactyl-panel --file=./migration-001-add-new-column.sql --env production
```

### Code Updates

```bash
# Deploy updates
git pull origin main
npm run build
wrangler deploy --env production
```

### Monitoring Database Size

```bash
# Check database size and usage
wrangler d1 info pterodactyl-panel --env production
```

## Troubleshooting

### Common Issues

**1. "Database not found" error**
- Verify database ID in wrangler.toml
- Ensure database was created in correct Cloudflare account

**2. "JWT verification failed"**
- Check JWT secret matches between Phase 2 and User Management API
- Verify JWT token format and payload structure

**3. "Permission denied" errors**
- Check user roles and permissions in database
- Verify permission checking logic

**4. "CORS errors"**
- Update allowed origins in CORS headers
- Ensure preflight requests are handled

### Debug Commands

```bash
# View worker logs
wrangler tail --env production

# Check database contents
wrangler d1 execute pterodactyl-panel --command="SELECT * FROM users LIMIT 5;" --env production

# Test specific endpoints
curl -X GET "https://your-api-domain.com/api/health" -v
```

## Security Considerations

1. **Rotate JWT secrets regularly**
2. **Monitor for suspicious activity**
3. **Keep dependencies updated**
4. **Use HTTPS only**
5. **Implement rate limiting**
6. **Regular security audits**

## Performance Optimization

1. **Monitor response times**
2. **Optimize database queries**
3. **Use appropriate indexes**
4. **Cache frequently accessed data**
5. **Monitor memory usage**

## Backup and Recovery

1. **Regular database backups**
2. **Version control for all code**
3. **Document recovery procedures**
4. **Test disaster recovery**

This completes the deployment of Phase 3: User Management API. The system is now ready to handle user management operations and integrate with the rest of the Pterodactyl Panel ecosystem.