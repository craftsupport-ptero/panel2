import { Request, Response } from 'express';
/**
 * Get all system settings
 * GET /api/admin/settings
 */
export declare function getSystemSettings(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Update system settings
 * PUT /api/admin/settings
 */
export declare function updateSystemSettings(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get email configuration
 * GET /api/admin/settings/email
 */
export declare function getEmailSettings(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Update email configuration
 * PUT /api/admin/settings/email
 */
export declare function updateEmailSettings(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get security configuration
 * GET /api/admin/settings/security
 */
export declare function getSecuritySettings(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Update security configuration
 * PUT /api/admin/settings/security
 */
export declare function updateSecuritySettings(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Test email configuration
 * POST /api/admin/settings/test-email
 */
export declare function testEmailConfiguration(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=settings.d.ts.map