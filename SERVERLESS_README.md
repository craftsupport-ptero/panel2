# Pterodactyl Panel Serverless API - Phase 3: User Management

This directory contains the serverless implementation of the Pterodactyl Panel User Management API, built with TypeScript and designed to run on Cloudflare Workers.

## 🚀 Phase 3 Features

This implementation provides comprehensive user management functionality:

### User CRUD Operations
- **User listing** with pagination, search, and filtering
- **User creation** with role assignment and validation
- **User profile management** with secure updates
- **User deletion** with proper cleanup and cascading
- **User statistics** and analytics

### Role-Based Access Control
- **Predefined roles**: admin, moderator, user
- **Granular permissions** with resource-based access control
- **Dynamic permission checking** per route
- **Role assignment** and modification
- **Permission inheritance** and aggregation

### Profile Management
- **Profile updates** (email, password, preferences)
- **Avatar management** using R2 storage
- **User preferences** and settings
- **Password change** with current password validation

### Activity Logging
- **Comprehensive activity tracking** for all user actions
- **Admin action logging** (user creation, deletion, role changes)
- **Login/logout tracking** with IP and user agent
- **Activity analytics** and statistics

## 📁 Project Structure

```
src/
├── index.ts                 # Main router and Cloudflare Workers entry point
├── types.ts                 # TypeScript type definitions
├── utils.ts                 # Utility functions and helpers
├── routes/
│   └── users/
│       ├── index.ts         # User CRUD operations
│       ├── profile.ts       # Profile management
│       ├── roles.ts         # Role management
│       └── permissions.ts   # Permission management
├── services/
│   ├── userService.ts       # User business logic
│   ├── roleService.ts       # Role management service
│   ├── permissionService.ts # Permission checking
│   └── activityService.ts   # Activity logging
├── schemas/
│   ├── users.ts             # User validation schemas
│   └── roles.ts             # Role/permission schemas
└── middleware/
    └── permissions.ts       # Permission checking middleware
```

## 🛠️ Setup and Deployment

### Prerequisites

1. **Cloudflare Account** with Workers and D1 database
2. **Wrangler CLI** installed and configured
3. **Node.js** 18+ for development

### Installation

1. Install dependencies:
```bash
npm install --legacy-peer-deps  # For main project dependencies
npm install -g wrangler          # For Cloudflare Workers CLI
```

2. Configure Cloudflare resources:
```bash
# Create D1 database
wrangler d1 create pterodactyl-panel

# Create R2 bucket for avatars
wrangler r2 bucket create pterodactyl-avatars
```

3. Update `wrangler.toml` with your database and bucket IDs

4. Initialize database schema:
```bash
wrangler d1 execute pterodactyl-panel --file=./database-schema.sql
```

### Development

```bash
# Start development server
npm run dev
# or
wrangler dev

# Run in specific environment
wrangler dev --env development
```

### Deployment

```bash
# Deploy to production
npm run deploy
# or
wrangler deploy

# Deploy to staging
wrangler deploy --env development
```

## 🔌 API Endpoints

### User Management
```
GET    /api/users              # List users (paginated, filterable)
POST   /api/users              # Create new user
GET    /api/users/:id          # Get user details
PUT    /api/users/:id          # Update user
DELETE /api/users/:id          # Delete user
GET    /api/users/stats        # User statistics
```

### Profile Management
```
GET    /api/users/profile      # Get current user profile
PUT    /api/users/profile      # Update current user profile
PUT    /api/users/profile/password # Change password
POST   /api/users/profile/avatar   # Upload avatar image
GET    /api/users/profile/settings # Get user settings
PUT    /api/users/profile/settings # Update user settings
GET    /api/users/profile/activity # Get user activity log
```

### Role & Permission Management
```
GET    /api/users/:id/roles    # Get user roles
PUT    /api/users/:id/roles    # Update user roles
GET    /api/users/:id/permissions # Get effective permissions
GET    /api/users/:id/activity # User activity log
GET    /api/roles              # List available roles
GET    /api/permissions        # List available permissions
POST   /api/permissions/check  # Check specific permissions
GET    /api/permissions/resources # Get permissions by resource
GET    /api/permissions/stats  # Permission statistics
```

### Administrative Functions
```
POST   /api/users/:id/suspend  # Suspend user account
POST   /api/users/:id/activate # Activate user account
```

### Health Check
```
GET    /api/health             # API health status
```

## 🔒 Authentication & Permissions

### JWT Authentication
All API endpoints require JWT authentication via the `Authorization: Bearer <token>` header. The JWT should contain:

```json
{
  "user_id": 123,
  "username": "admin",
  "email": "admin@example.com",
  "role": "admin",
  "permissions": ["users.view", "users.create", ...],
  "iat": 1641024000,
  "exp": 1641110400
}
```

### Permission System
The API uses a granular permission system with the following structure:

- **Resource-based permissions**: `resource.action` (e.g., `users.create`, `servers.view`)
- **Hierarchical roles**: admin > moderator > user
- **Self-service operations**: Users can always access their own resources
- **Admin override**: Root admins have all permissions

### Default Roles

#### Admin
- Full system access with all permissions
- Can manage all users, servers, nodes
- Can access administrative interface

#### Moderator
- Limited administrative access
- Can view and edit users
- Can manage servers but not nodes
- Cannot delete users or change roles

#### User
- Standard user permissions
- Can manage own profile and settings
- Can access assigned servers
- Cannot manage other users

## 📝 Example Usage

### Create New User
```bash
curl -X POST http://localhost:8787/api/users \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "user@example.com", 
    "password": "securepassword123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user"
  }'
```

### List Users with Filtering
```bash
curl -X GET "http://localhost:8787/api/users?page=1&limit=10&role=admin&search=john" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Update User Profile
```bash
curl -X PUT http://localhost:8787/api/users/profile \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@example.com",
    "preferences": {
      "theme": "dark",
      "notifications": true
    }
  }'
```

### Check Permissions
```bash
curl -X POST http://localhost:8787/api/permissions/check \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": ["users.create", "servers.manage"]
  }'
```

## 🔧 Environment Variables

Configure these in your `wrangler.toml`:

```toml
[env.production.vars]
ENVIRONMENT = "production"
JWT_SECRET = "your-jwt-secret"
BCRYPT_ROUNDS = "12"

[env.development.vars]
ENVIRONMENT = "development"
JWT_SECRET = "dev-jwt-secret"
BCRYPT_ROUNDS = "10"
```

## 🧪 Testing

The API includes comprehensive validation and error handling:

- **Input validation** using Zod schemas
- **Permission checking** on all endpoints
- **Detailed error responses** with appropriate HTTP status codes
- **Activity logging** for audit trails

### Response Format

All responses follow a consistent format:

```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {
      // Additional error details
    }
  }
}
```

## 🔄 Integration with Phase 2

This Phase 3 implementation builds upon the authentication system from Phase 2:

- **JWT token validation** for all requests
- **User context extraction** from JWT payload
- **Permission-based route protection**
- **Database integration** with existing user schema

## 🎯 Next Steps: Phase 4

Phase 4 will build upon this user management foundation to provide:

- **Server CRUD operations** with user ownership
- **Resource allocation** and limits per user
- **Server status monitoring** and management
- **Node assignment** and load balancing

The user management system provides the necessary foundation for server operations with proper user context and permissions.

## 📚 Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)