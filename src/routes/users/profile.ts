import { CloudflareEnv, ProfileUpdateRequest, PasswordChangeRequest } from '@/types';
import { UserService } from '@/services/userService';
import { ActivityService } from '@/services/activityService';
import { ProfileUpdateSchema, PasswordChangeSchema, validateRequest } from '@/schemas/users';
import { authenticate } from '@/middleware/permissions';
import { 
  successResponse, 
  errorResponse, 
  handleError, 
  createCorsHeaders,
  extractPaginationParams 
} from '@/utils';

/**
 * GET /api/users/profile
 * Get current user's profile
 * Requires: Authentication
 */
export async function getProfile(request: Request, env: CloudflareEnv): Promise<Response> {
  try {
    // Authenticate user
    const authResult = await authenticate(request, env);
    if (!authResult.success) {
      return authResult.response;
    }

    const { context } = authResult;
    const userService = new UserService(env);

    // Get user profile
    const user = await userService.getUserById(context.user!.id);
    if (!user) {
      return new Response(
        JSON.stringify(errorResponse('User not found', 'USER_NOT_FOUND')),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...createCorsHeaders()
          }
        }
      );
    }

    // Get user preferences
    const preferences = await userService.getUserPreferences(context.user!.id);

    // Get user permissions
    const permissions = await userService.getUserPermissions(context.user!.id);

    const profile = {
      ...user,
      preferences,
      permissions
    };

    return new Response(
      JSON.stringify(successResponse(profile)),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  } catch (error) {
    const errorResp = handleError(error);
    return new Response(
      JSON.stringify(errorResp),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  }
}

/**
 * PUT /api/users/profile
 * Update current user's profile
 * Requires: Authentication
 */
export async function updateProfile(request: Request, env: CloudflareEnv): Promise<Response> {
  try {
    // Authenticate user
    const authResult = await authenticate(request, env);
    if (!authResult.success) {
      return authResult.response;
    }

    const { context } = authResult;
    const userService = new UserService(env);
    const activityService = new ActivityService(env);

    // Parse request body
    const body = await request.json() as ProfileUpdateRequest;

    // Validate request data
    const validatedData = validateRequest(ProfileUpdateSchema, body);

    // Track changes for activity log
    const changes: string[] = [];
    if (validatedData.email) changes.push('email');
    if (validatedData.first_name) changes.push('first_name');
    if (validatedData.last_name) changes.push('last_name');
    if (validatedData.language) changes.push('language');
    if (validatedData.preferences) changes.push('preferences');

    // Update profile
    const user = await userService.updateProfile(context.user!.id, validatedData);

    // Log activity
    if (changes.length > 0) {
      await activityService.logProfileUpdate(
        context.user!.id,
        changes,
        request.headers.get('CF-Connecting-IP') || undefined,
        request.headers.get('User-Agent') || undefined
      );
    }

    // Get updated preferences
    const preferences = await userService.getUserPreferences(context.user!.id);

    const profile = {
      ...user,
      preferences
    };

    return new Response(
      JSON.stringify(successResponse(profile)),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  } catch (error) {
    const errorResp = handleError(error);
    const status = errorResp.error?.message.includes('already exists') ? 409 : 500;
    
    return new Response(
      JSON.stringify(errorResp),
      {
        status,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  }
}

/**
 * PUT /api/users/profile/password
 * Change current user's password
 * Requires: Authentication
 */
export async function changePassword(request: Request, env: CloudflareEnv): Promise<Response> {
  try {
    // Authenticate user
    const authResult = await authenticate(request, env);
    if (!authResult.success) {
      return authResult.response;
    }

    const { context } = authResult;
    const userService = new UserService(env);
    const activityService = new ActivityService(env);

    // Parse request body
    const body = await request.json() as PasswordChangeRequest;

    // Validate request data
    const validatedData = validateRequest(PasswordChangeSchema, body);

    // Change password
    await userService.changePassword(
      context.user!.id,
      validatedData.current_password,
      validatedData.new_password
    );

    // Log activity
    await activityService.logPasswordChange(
      context.user!.id,
      request.headers.get('CF-Connecting-IP') || undefined,
      request.headers.get('User-Agent') || undefined
    );

    return new Response(
      JSON.stringify(successResponse({ message: 'Password changed successfully' })),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  } catch (error) {
    const errorResp = handleError(error);
    const status = errorResp.error?.message.includes('incorrect') ? 400 : 500;
    
    return new Response(
      JSON.stringify(errorResp),
      {
        status,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  }
}

/**
 * POST /api/users/profile/avatar
 * Upload avatar image
 * Requires: Authentication
 */
export async function uploadAvatar(request: Request, env: CloudflareEnv): Promise<Response> {
  try {
    // Authenticate user
    const authResult = await authenticate(request, env);
    if (!authResult.success) {
      return authResult.response;
    }

    const { context } = authResult;
    const activityService = new ActivityService(env);

    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return new Response(
        JSON.stringify(errorResponse('No file uploaded', 'NO_FILE')),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...createCorsHeaders()
          }
        }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify(errorResponse('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed', 'INVALID_FILE_TYPE')),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...createCorsHeaders()
          }
        }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify(errorResponse('File too large. Maximum size is 5MB', 'FILE_TOO_LARGE')),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...createCorsHeaders()
          }
        }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `avatars/${context.user!.id}/${timestamp}.${extension}`;

    // Upload to R2
    await env.AVATARS.put(filename, file.stream(), {
      httpMetadata: {
        contentType: file.type
      }
    });

    // Update user avatar URL in database
    const avatarUrl = `https://avatars.your-domain.com/${filename}`;
    const userService = new UserService(env);
    await userService.updateUser(context.user!.id, { avatar_url: avatarUrl });

    // Log activity
    await activityService.logAvatarUpload(
      context.user!.id,
      request.headers.get('CF-Connecting-IP') || undefined,
      request.headers.get('User-Agent') || undefined
    );

    return new Response(
      JSON.stringify(successResponse({ 
        message: 'Avatar uploaded successfully',
        avatar_url: avatarUrl
      })),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  } catch (error) {
    const errorResp = handleError(error);
    return new Response(
      JSON.stringify(errorResp),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  }
}

/**
 * GET /api/users/profile/settings
 * Get current user's settings
 * Requires: Authentication
 */
export async function getSettings(request: Request, env: CloudflareEnv): Promise<Response> {
  try {
    // Authenticate user
    const authResult = await authenticate(request, env);
    if (!authResult.success) {
      return authResult.response;
    }

    const { context } = authResult;
    const userService = new UserService(env);

    // Get user preferences
    const preferences = await userService.getUserPreferences(context.user!.id);

    return new Response(
      JSON.stringify(successResponse(preferences)),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  } catch (error) {
    const errorResp = handleError(error);
    return new Response(
      JSON.stringify(errorResp),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  }
}

/**
 * PUT /api/users/profile/settings
 * Update current user's settings
 * Requires: Authentication
 */
export async function updateSettings(request: Request, env: CloudflareEnv): Promise<Response> {
  try {
    // Authenticate user
    const authResult = await authenticate(request, env);
    if (!authResult.success) {
      return authResult.response;
    }

    const { context } = authResult;
    const userService = new UserService(env);
    const activityService = new ActivityService(env);

    // Parse request body
    const body = await request.json();

    // Basic validation for preferences
    const allowedPreferences = ['theme', 'notifications', 'language', 'timezone'];
    const preferences: any = {};
    const changes: string[] = [];

    for (const [key, value] of Object.entries(body)) {
      if (allowedPreferences.includes(key)) {
        preferences[key] = value;
        changes.push(key);
      }
    }

    if (Object.keys(preferences).length === 0) {
      return new Response(
        JSON.stringify(errorResponse('No valid preferences provided', 'NO_PREFERENCES')),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...createCorsHeaders()
          }
        }
      );
    }

    // Update preferences
    const updatedPreferences = await userService.updateUserPreferences(context.user!.id, preferences);

    // Log activity
    await activityService.logSettingsUpdate(
      context.user!.id,
      changes,
      request.headers.get('CF-Connecting-IP') || undefined,
      request.headers.get('User-Agent') || undefined
    );

    return new Response(
      JSON.stringify(successResponse(updatedPreferences)),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  } catch (error) {
    const errorResp = handleError(error);
    return new Response(
      JSON.stringify(errorResp),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  }
}

/**
 * GET /api/users/profile/activity
 * Get current user's activity log
 * Requires: Authentication
 */
export async function getActivity(request: Request, env: CloudflareEnv): Promise<Response> {
  try {
    // Authenticate user
    const authResult = await authenticate(request, env);
    if (!authResult.success) {
      return authResult.response;
    }

    const { context } = authResult;
    const activityService = new ActivityService(env);

    // Extract pagination parameters
    const url = new URL(request.url);
    const queryParams = extractPaginationParams(url.searchParams);

    // Get user activities
    const result = await activityService.getUserActivities(context.user!.id, queryParams);

    return new Response(
      JSON.stringify(successResponse(result)),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  } catch (error) {
    const errorResp = handleError(error);
    return new Response(
      JSON.stringify(errorResp),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...createCorsHeaders()
        }
      }
    );
  }
}