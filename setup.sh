#!/bin/bash

# Pterodactyl Panel Serverless Setup Script
# This script automates the setup of Cloudflare services and deploys the serverless panel

set -e

echo "🚀 Pterodactyl Panel Serverless Setup"
echo "======================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check wrangler
    if ! command -v wrangler &> /dev/null; then
        print_warning "Wrangler CLI not found. Installing..."
        npm install -g wrangler
    fi
    
    # Check if user is authenticated with Cloudflare
    if ! wrangler auth list &> /dev/null; then
        print_error "You are not authenticated with Cloudflare."
        echo "Please run: wrangler auth login"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    print_success "Dependencies installed"
}

# Create Cloudflare D1 database
setup_database() {
    print_status "Setting up Cloudflare D1 database..."
    
    # Create database (will fail if exists, but that's OK)
    if wrangler d1 create pterodactyl &> /dev/null; then
        print_success "D1 database 'pterodactyl' created"
    else
        print_warning "D1 database 'pterodactyl' already exists or creation failed"
    fi
    
    # Get database ID and update wrangler.toml
    print_status "Retrieving database ID..."
    DB_ID=$(wrangler d1 list | grep pterodactyl | awk '{print $2}' | head -1)
    
    if [ -n "$DB_ID" ]; then
        print_success "Database ID retrieved: $DB_ID"
        
        # Update wrangler.toml with database ID
        if command -v sed &> /dev/null; then
            sed -i.bak "s/database_id = \"\"/database_id = \"$DB_ID\"/" wrangler.toml
            print_success "Updated wrangler.toml with database ID"
        else
            print_warning "Please manually update database_id in wrangler.toml with: $DB_ID"
        fi
    else
        print_error "Could not retrieve database ID"
        exit 1
    fi
}

# Create KV namespace
setup_kv_namespace() {
    print_status "Setting up Cloudflare KV namespace..."
    
    # Create KV namespace for caching
    KV_OUTPUT=$(wrangler kv:namespace create "CACHE" 2>/dev/null || echo "")
    
    if [[ $KV_OUTPUT == *"id"* ]]; then
        KV_ID=$(echo "$KV_OUTPUT" | grep -o '"id": "[^"]*"' | cut -d'"' -f4)
        print_success "KV namespace created with ID: $KV_ID"
        
        # Update wrangler.toml
        if command -v sed &> /dev/null; then
            sed -i.bak "s/id = \"\" # Will be populated during setup/id = \"$KV_ID\"/" wrangler.toml
            print_success "Updated wrangler.toml with KV namespace ID"
        else
            print_warning "Please manually update KV namespace ID in wrangler.toml with: $KV_ID"
        fi
    else
        print_warning "KV namespace creation failed or already exists"
    fi
}

# Create R2 bucket
setup_r2_bucket() {
    print_status "Setting up Cloudflare R2 bucket..."
    
    # Create R2 bucket for storage
    if wrangler r2 bucket create pterodactyl-storage &> /dev/null; then
        print_success "R2 bucket 'pterodactyl-storage' created"
    else
        print_warning "R2 bucket 'pterodactyl-storage' already exists or creation failed"
    fi
    
    # Create preview bucket
    if wrangler r2 bucket create pterodactyl-storage-preview &> /dev/null; then
        print_success "R2 preview bucket 'pterodactyl-storage-preview' created"
    else
        print_warning "R2 preview bucket already exists or creation failed"
    fi
}

# Generate database schema and run migrations
setup_schema() {
    print_status "Generating database schema..."
    
    # Generate Drizzle migrations
    npm run db:generate
    print_success "Database schema generated"
    
    # Apply migrations to D1
    print_status "Running database migrations..."
    npm run db:migrate
    print_success "Database migrations applied"
}

# Create default admin user
create_admin_user() {
    print_status "Creating default admin user..."
    
    # This would typically be done via API call or direct database insert
    # For now, we'll create a script that can be run after deployment
    cat > scripts/create-admin.js << 'EOF'
#!/usr/bin/env node

/**
 * Create default admin user for Pterodactyl Panel
 */

const bcrypt = require('bcryptjs');

const adminUser = {
  uuid: 'admin-uuid-' + Date.now(),
  username: 'admin',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  password: bcrypt.hashSync('changeme123!', 12),
  language: 'en',
  rootAdmin: true,
  useTotp: false,
  gravatar: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

console.log('Default admin user configuration:');
console.log('Email: admin@example.com');
console.log('Password: changeme123!');
console.log('⚠️  CHANGE THE PASSWORD AFTER FIRST LOGIN!');
console.log('');
console.log('SQL to insert admin user:');
console.log(`INSERT INTO users (uuid, username, email, firstName, lastName, password, language, rootAdmin, useTotp, gravatar, createdAt, updatedAt) VALUES`);
console.log(`('${adminUser.uuid}', '${adminUser.username}', '${adminUser.email}', '${adminUser.firstName}', '${adminUser.lastName}', '${adminUser.password}', '${adminUser.language}', ${adminUser.rootAdmin ? 1 : 0}, ${adminUser.useTotp ? 1 : 0}, ${adminUser.gravatar ? 1 : 0}, '${adminUser.createdAt}', '${adminUser.updatedAt}');`);
EOF

    chmod +x scripts/create-admin.js
    
    print_success "Admin user creation script created"
    print_warning "Run 'node scripts/create-admin.js' after deployment to get admin credentials"
}

# Generate JWT secret
generate_jwt_secret() {
    print_status "Generating JWT secret..."
    
    JWT_SECRET=$(openssl rand -hex 32)
    
    if [ -n "$JWT_SECRET" ]; then
        print_success "JWT secret generated"
        print_status "Please add this to your wrangler.toml or Cloudflare dashboard:"
        echo "JWT_SECRET = \"$JWT_SECRET\""
    else
        print_warning "Could not generate JWT secret automatically"
        print_warning "Please generate a secure random string for JWT_SECRET"
    fi
}

# Deploy the worker
deploy_worker() {
    print_status "Deploying Cloudflare Worker..."
    
    # Deploy to staging first
    if wrangler deploy --env staging; then
        print_success "Worker deployed to staging"
    else
        print_error "Failed to deploy worker to staging"
        exit 1
    fi
    
    echo ""
    print_status "To deploy to production, run: npm run deploy --env production"
}

# Test deployment
test_deployment() {
    print_status "Testing deployment..."
    
    # Get worker URL
    WORKER_URL=$(wrangler subdomain get 2>/dev/null | grep -o 'https://[^"]*' || echo "")
    
    if [ -n "$WORKER_URL" ]; then
        print_status "Testing health endpoint..."
        if curl -s "$WORKER_URL/health" | grep -q "ok"; then
            print_success "Health check passed"
            echo "🌐 Worker URL: $WORKER_URL"
        else
            print_warning "Health check failed, but worker is deployed"
        fi
    else
        print_warning "Could not determine worker URL"
    fi
}

# Main setup function
main() {
    echo ""
    check_prerequisites
    echo ""
    install_dependencies
    echo ""
    setup_database
    echo ""
    setup_kv_namespace
    echo ""
    setup_r2_bucket
    echo ""
    setup_schema
    echo ""
    create_admin_user
    echo ""
    generate_jwt_secret
    echo ""
    deploy_worker
    echo ""
    test_deployment
    echo ""
    
    print_success "🎉 Pterodactyl Panel Serverless setup completed!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update JWT_SECRET in wrangler.toml or Cloudflare dashboard"
    echo "2. Run 'node scripts/create-admin.js' to create admin user"
    echo "3. Visit your worker URL to access the panel"
    echo "4. Configure DNS to point to your worker"
    echo "5. Run 'npm run deploy --env production' for production deployment"
    echo ""
    echo "📚 Documentation: https://pterodactyl.io"
    echo "🐛 Issues: https://github.com/pterodactyl/panel/issues"
}

# Run main function
main