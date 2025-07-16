# Pterodactyl Panel - Serverless Setup Guide

This guide covers the initial setup for the serverless version of Pterodactyl Panel using Cloudflare Workers.

## Prerequisites

- Node.js 18+ and npm
- Cloudflare account with Workers and D1 access
- Git

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 3. Authenticate with Cloudflare

```bash
wrangler login
```

### 4. Create Cloudflare Services

#### Create D1 Database

```bash
# Development
wrangler d1 create pterodactyl-db-dev

# Staging
wrangler d1 create pterodactyl-db-staging

# Production  
wrangler d1 create pterodactyl-db-prod
```

Copy the database IDs to your `wrangler.toml` file.

#### Create KV Namespace

```bash
# Development
wrangler kv:namespace create "CACHE" --preview

# Staging
wrangler kv:namespace create "CACHE" --env staging

# Production
wrangler kv:namespace create "CACHE" --env production
```

Copy the namespace IDs to your `wrangler.toml` file.

#### Create R2 Bucket

```bash
# Development
wrangler r2 bucket create pterodactyl-storage-dev

# Staging
wrangler r2 bucket create pterodactyl-storage-staging

# Production
wrangler r2 bucket create pterodactyl-storage-prod
```

### 5. Update Configuration

Update `wrangler.toml` with your actual service IDs:

```toml
# Add your D1 database IDs
[[env.development.d1_databases]]
binding = "DB"
database_name = "pterodactyl-db-dev"
database_id = "your-database-id-here"

# Add your KV namespace IDs
[[env.development.kv_namespaces]]
binding = "CACHE"
id = "your-kv-id-here"
preview_id = "your-preview-kv-id-here"
```

### 6. Run Database Migrations

```bash
# Development (local)
npm run db:migrate

# Staging
npm run db:migrate:staging

# Production
npm run db:migrate:production
```

### 7. Build the Worker

```bash
npm run build:worker
```

### 8. Start Development Server

```bash
npm run dev
```

The development server will start at `http://localhost:8787`.

### 9. Test the Setup

```bash
# Test health endpoint
curl http://localhost:8787/health

# Should return:
{
  "status": "healthy",
  "version": "2.0.0-serverless",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected",
  "environment": "development"
}
```

## Environment Variables

Set these in your Cloudflare Worker environment:

```bash
# Development
wrangler secret put JWT_SECRET --env development
wrangler secret put BCRYPT_ROUNDS --env development

# Staging
wrangler secret put JWT_SECRET --env staging  
wrangler secret put BCRYPT_ROUNDS --env staging

# Production
wrangler secret put JWT_SECRET --env production
wrangler secret put BCRYPT_ROUNDS --env production
```

## Development Workflow

### Running Tests

```bash
npm run test:infrastructure
```

### Database Management

```bash
# Generate new migration
npm run db:generate

# View database in browser
npm run db:studio

# Apply migrations
npm run db:migrate
```

### Deployment

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

## File Structure

```
src/
├── db/
│   ├── schema.ts      # Database schema definitions
│   └── index.ts       # Database connection setup
├── types/
│   └── env.ts         # Environment type definitions
├── utils/
│   └── constants.ts   # Application constants
└── index.ts           # Main worker entry point

migrations/
└── 001_initial_schema.sql

docs/
├── SETUP.md           # This file
└── DATABASE.md        # Database documentation
```

## Next Steps

After completing this setup:

1. Review the database schema in `src/db/schema.ts`
2. Check the health endpoint works correctly
3. Proceed with Phase 2: Authentication system implementation

## Troubleshooting

### Database Connection Issues

```bash
# Check D1 database status
wrangler d1 info pterodactyl-db-dev

# View database tables
wrangler d1 execute pterodactyl-db-dev --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### Worker Deployment Issues

```bash
# Check worker status
wrangler status

# View worker logs
wrangler tail
```

### Build Issues

```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild worker
npm run build:worker
```