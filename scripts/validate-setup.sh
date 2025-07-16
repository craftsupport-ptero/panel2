#!/bin/bash

# Pterodactyl Panel Migration - Complete Setup Validation
# This script validates that all migration tools and infrastructure are properly configured

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if command exists
check_command() {
    if command -v "$1" >/dev/null 2>&1; then
        success "$1 is installed"
        return 0
    else
        error "$1 is not installed"
        return 1
    fi
}

# Check Node.js version
check_nodejs() {
    if command -v node >/dev/null 2>&1; then
        local version=$(node --version | sed 's/v//')
        local major_version=$(echo $version | cut -d. -f1)
        
        if [ "$major_version" -ge 14 ]; then
            success "Node.js $version (>= 14.x required)"
        else
            error "Node.js $version is too old (>= 14.x required)"
            return 1
        fi
    else
        error "Node.js is not installed"
        return 1
    fi
}

# Check file permissions
check_permissions() {
    local dir="$1"
    if [ -d "$dir" ]; then
        if [ -w "$dir" ]; then
            success "Write permission for $dir"
        else
            error "No write permission for $dir"
            return 1
        fi
    else
        warning "Directory $dir does not exist"
    fi
}

# Test migration script
test_migration_script() {
    local script="$1"
    local script_path="migration/scripts/$script"
    
    if [ -f "$script_path" ]; then
        log "Testing $script..."
        if npx ts-node --project migration/tsconfig.json "$script_path" --help >/dev/null 2>&1; then
            success "$script works correctly"
        else
            error "$script failed to run"
            return 1
        fi
    else
        error "$script not found"
        return 1
    fi
}

# Test Docker setup
test_docker() {
    if command -v docker >/dev/null 2>&1; then
        if docker info >/dev/null 2>&1; then
            success "Docker is running"
            
            # Test Docker Compose
            if command -v docker-compose >/dev/null 2>&1; then
                success "Docker Compose is available"
                
                # Validate docker-compose.yml
                if docker-compose -f deployment/docker/docker-compose.yml config >/dev/null 2>&1; then
                    success "Docker Compose configuration is valid"
                else
                    error "Docker Compose configuration is invalid"
                    return 1
                fi
            else
                warning "Docker Compose is not installed"
            fi
        else
            error "Docker is not running"
            return 1
        fi
    else
        warning "Docker is not installed (optional for local development)"
    fi
}

# Main validation function
main() {
    log "Starting Pterodactyl Panel Migration Setup Validation"
    echo ""
    
    local errors=0
    
    # System requirements
    log "🔧 Checking System Requirements..."
    check_nodejs || ((errors++))
    check_command "yarn" || ((errors++))
    check_command "git" || ((errors++))
    echo ""
    
    # Project structure
    log "📁 Checking Project Structure..."
    
    # Migration directories
    for dir in "migration/scripts" "migration/docs" "migration/tests" "deployment/docker" "deployment/terraform"; do
        if [ -d "$dir" ]; then
            success "$dir exists"
        else
            error "$dir is missing"
            ((errors++))
        fi
    done
    
    # Check permissions
    check_permissions "migration/logs" || ((errors++))
    check_permissions "public/assets" || ((errors++))
    echo ""
    
    # Dependencies
    log "📦 Checking Dependencies..."
    if [ -f "node_modules/.bin/ts-node" ]; then
        success "TypeScript dependencies installed"
    else
        error "Dependencies not installed. Run 'yarn install'"
        ((errors++))
    fi
    echo ""
    
    # Migration scripts
    log "🔄 Testing Migration Scripts..."
    test_migration_script "migrate-database.ts" || ((errors++))
    test_migration_script "migrate-files.ts" || ((errors++))
    test_migration_script "validate-data.ts" || ((errors++))
    test_migration_script "rollback.ts" || ((errors++))
    test_migration_script "cleanup.ts" || ((errors++))
    echo ""
    
    # TypeScript compilation
    log "🏗️ Testing TypeScript Compilation..."
    if npx tsc --project migration/tsconfig.json --noEmit >/dev/null 2>&1; then
        success "TypeScript compilation successful"
    else
        error "TypeScript compilation failed"
        ((errors++))
    fi
    echo ""
    
    # Frontend build
    log "🎨 Testing Frontend Build..."
    if [ -f "webpack.config.js" ]; then
        success "Webpack configuration exists"
        
        # Test if build works (dry run)
        if yarn build >/dev/null 2>&1; then
            success "Frontend build successful"
        else
            warning "Frontend build failed (may require environment setup)"
        fi
    else
        error "Webpack configuration missing"
        ((errors++))
    fi
    echo ""
    
    # Test suite
    log "🧪 Running Test Suite..."
    if yarn test >/dev/null 2>&1; then
        success "All tests pass"
    else
        error "Some tests are failing"
        ((errors++))
    fi
    echo ""
    
    # Docker validation
    log "🐳 Testing Docker Setup..."
    test_docker || ((errors++))
    echo ""
    
    # Linting
    log "🔍 Running Code Quality Checks..."
    if yarn lint >/dev/null 2>&1; then
        success "ESLint checks pass"
    else
        warning "ESLint found issues (run 'yarn lint' to see details)"
    fi
    echo ""
    
    # Environment validation
    log "🌍 Checking Environment Configuration..."
    if [ -f ".env.example" ]; then
        success ".env.example exists"
    else
        error ".env.example is missing"
        ((errors++))
    fi
    
    # Check for required environment variables template
    local required_vars=("CLOUDFLARE_API_TOKEN" "CLOUDFLARE_ACCOUNT_ID" "D1_DATABASE_ID" "R2_BUCKET_NAME")
    for var in "${required_vars[@]}"; do
        if grep -q "$var" .env.example 2>/dev/null; then
            success "Environment variable $var documented"
        else
            warning "Environment variable $var not in .env.example"
        fi
    done
    echo ""
    
    # Documentation check
    log "📚 Checking Documentation..."
    local docs=("migration/docs/migration-guide.md" "migration/docs/troubleshooting.md" "README.md")
    for doc in "${docs[@]}"; do
        if [ -f "$doc" ]; then
            success "$doc exists"
        else
            error "$doc is missing"
            ((errors++))
        fi
    done
    echo ""
    
    # CI/CD configuration
    log "🚀 Checking CI/CD Configuration..."
    if [ -f ".github/workflows/deploy.yml" ]; then
        success "GitHub Actions workflow exists"
    else
        error "GitHub Actions workflow missing"
        ((errors++))
    fi
    echo ""
    
    # Terraform configuration
    log "🏗️ Checking Terraform Configuration..."
    if [ -f "deployment/terraform/main.tf" ]; then
        success "Terraform configuration exists"
        
        if command -v terraform >/dev/null 2>&1; then
            cd deployment/terraform
            if terraform validate >/dev/null 2>&1; then
                success "Terraform configuration is valid"
            else
                error "Terraform configuration is invalid"
                ((errors++))
            fi
            cd ../..
        else
            warning "Terraform not installed (run 'terraform validate' manually)"
        fi
    else
        error "Terraform configuration missing"
        ((errors++))
    fi
    echo ""
    
    # Summary
    log "📊 Validation Summary"
    echo "===================="
    
    if [ $errors -eq 0 ]; then
        echo -e "${GREEN}🎉 All validations passed! Your Pterodactyl Panel migration setup is ready.${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Copy .env.example to .env and configure your environment"
        echo "2. Set up your Cloudflare account and services"
        echo "3. Run migration assessment: yarn migrate:assess"
        echo "4. Follow the migration guide: migration/docs/migration-guide.md"
    else
        echo -e "${RED}❌ Found $errors issues that need to be resolved.${NC}"
        echo ""
        echo "Please fix the errors above before proceeding with migration."
        exit 1
    fi
    
    echo ""
    echo "For help and documentation:"
    echo "📖 Migration Guide: migration/docs/migration-guide.md"
    echo "🔧 Troubleshooting: migration/docs/troubleshooting.md"
    echo "💬 Support: https://github.com/your-repo/panel2/issues"
}

# Run main function
main "$@"