# API Usage Examples

This document provides practical examples of using the Pterodactyl Panel Serverless User Management API.

## Authentication

All API requests require a JWT token in the Authorization header:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The JWT token should be obtained from Phase 2 authentication system and contain user information and permissions.

## User Management Examples

### 1. List All Users

```bash
curl -X GET "https://api.pterodactyl.example.com/api/users?page=1&limit=10" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "first_name": "System",
        "last_name": "Administrator",
        "role": "admin",
        "root_admin": true,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

### 2. Search Users

```bash
curl -X GET "https://api.pterodactyl.example.com/api/users?search=john&role=user" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### 3. Create New User

```bash
curl -X POST "https://api.pterodactyl.example.com/api/users" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user",
    "language": "en"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user",
    "root_admin": false,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### 4. Get Specific User

```bash
curl -X GET "https://api.pterodactyl.example.com/api/users/5" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### 5. Update User

```bash
curl -X PUT "https://api.pterodactyl.example.com/api/users/5" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Johnny",
    "email": "johnny@example.com"
  }'
```

### 6. Delete User

```bash
curl -X DELETE "https://api.pterodactyl.example.com/api/users/5" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## Profile Management Examples

### 1. Get Current User Profile

```bash
curl -X GET "https://api.pterodactyl.example.com/api/users/profile" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user",
    "preferences": {
      "theme": "dark",
      "notifications": true,
      "language": "en",
      "timezone": "UTC"
    },
    "permissions": [
      "profile.edit",
      "profile.change_password",
      "servers.view",
      "servers.console"
    ]
  }
}
```

### 2. Update Profile

```bash
curl -X PUT "https://api.pterodactyl.example.com/api/users/profile" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jonathan",
    "preferences": {
      "theme": "dark",
      "notifications": false,
      "timezone": "America/New_York"
    }
  }'
```

### 3. Change Password

```bash
curl -X PUT "https://api.pterodactyl.example.com/api/users/profile/password" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "OldPassword123!",
    "new_password": "NewSecurePassword456!",
    "new_password_confirmation": "NewSecurePassword456!"
  }'
```

### 4. Upload Avatar

```bash
curl -X POST "https://api.pterodactyl.example.com/api/users/profile/avatar" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -F "avatar=@/path/to/avatar.jpg"
```

### 5. Update Settings

```bash
curl -X PUT "https://api.pterodactyl.example.com/api/users/profile/settings" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "light",
    "notifications": true,
    "language": "es",
    "timezone": "Europe/Madrid"
  }'
```

### 6. Get Activity Log

```bash
curl -X GET "https://api.pterodactyl.example.com/api/users/profile/activity?page=1&limit=20" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## Role and Permission Management

### 1. Get User Roles

```bash
curl -X GET "https://api.pterodactyl.example.com/api/users/5/roles" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": 5,
    "role": "user",
    "root_admin": false,
    "role_details": {
      "id": 3,
      "name": "user",
      "description": "Standard user with basic server management permissions",
      "permissions": [
        "profile.edit",
        "profile.change_password",
        "servers.view",
        "servers.console"
      ]
    },
    "effective_permissions": [
      "profile.edit",
      "profile.change_password",
      "servers.view",
      "servers.console"
    ]
  }
}
```

### 2. Update User Role

```bash
curl -X PUT "https://api.pterodactyl.example.com/api/users/5/roles" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "moderator",
    "root_admin": false
  }'
```

### 3. Get All Available Roles

```bash
curl -X GET "https://api.pterodactyl.example.com/api/roles" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### 4. Get User Permissions

```bash
curl -X GET "https://api.pterodactyl.example.com/api/users/5/permissions" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### 5. Check Specific Permissions

```bash
curl -X POST "https://api.pterodactyl.example.com/api/permissions/check" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": ["users.create", "servers.manage", "admin.view"]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": 3,
    "checked_permissions": {
      "users.create": false,
      "servers.manage": false,
      "admin.view": false
    },
    "has_any": false,
    "has_all": false
  }
}
```

### 6. Get All Permissions

```bash
curl -X GET "https://api.pterodactyl.example.com/api/permissions" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### 7. Get Permissions by Resource

```bash
curl -X GET "https://api.pterodactyl.example.com/api/permissions/resources?resource=users" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## Administrative Functions

### 1. Suspend User

```bash
curl -X POST "https://api.pterodactyl.example.com/api/users/5/suspend" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### 2. Activate User

```bash
curl -X POST "https://api.pterodactyl.example.com/api/users/5/activate" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### 3. Get User Statistics

```bash
curl -X GET "https://api.pterodactyl.example.com/api/users/stats" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "active": 23,
    "suspended": 2,
    "admins": 2,
    "moderators": 3,
    "users": 20
  }
}
```

### 4. Get Permission Statistics

```bash
curl -X GET "https://api.pterodactyl.example.com/api/permissions/stats" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### 5. Get User Activity

```bash
curl -X GET "https://api.pterodactyl.example.com/api/users/5/activity?page=1&limit=10" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## Error Handling

### Validation Errors

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address",
        "code": "invalid_string"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters",
        "code": "too_small"
      }
    ]
  }
}
```

### Authentication Errors

```json
{
  "success": false,
  "error": {
    "message": "Authorization token required",
    "code": "UNAUTHORIZED"
  }
}
```

### Permission Errors

```json
{
  "success": false,
  "error": {
    "message": "Insufficient permissions",
    "code": "FORBIDDEN"
  }
}
```

### Not Found Errors

```json
{
  "success": false,
  "error": {
    "message": "User not found",
    "code": "USER_NOT_FOUND"
  }
}
```

## Pagination

Most list endpoints support pagination with these parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search term for filtering
- `sort`: Sort field (default varies by endpoint)
- `order`: Sort order - `asc` or `desc` (default: `asc`)

Example:
```bash
curl -X GET "https://api.pterodactyl.example.com/api/users?page=2&limit=25&search=admin&sort=created_at&order=desc" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## Rate Limiting

The API implements standard rate limiting. If you exceed the rate limit, you'll receive a `429 Too Many Requests` response:

```json
{
  "success": false,
  "error": {
    "message": "Too many requests",
    "code": "RATE_LIMITED"
  }
}
```

## Best Practices

1. **Always handle errors**: Check the `success` field in responses
2. **Use appropriate HTTP methods**: GET for reading, POST for creating, PUT for updating, DELETE for removing
3. **Include proper headers**: Always include `Content-Type: application/json` for POST/PUT requests
4. **Validate input**: Client-side validation improves user experience
5. **Store JWT securely**: Never expose JWT tokens in client-side code
6. **Use pagination**: Don't request all data at once for large datasets
7. **Check permissions**: Verify user permissions before showing UI elements