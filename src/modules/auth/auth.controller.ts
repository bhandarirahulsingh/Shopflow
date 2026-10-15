import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.schema';
import { ApiResponse } from '../../utils/ApiResponse';

export class AuthController {
    // 1. POST /api/v1/auth/register
    static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Validate request body with Zod
            const validatedData = registerSchema.parse(req.body);
            // Call Service Layer
            const result = await AuthService.register(validatedData);
            // Return 201 Created
            res
                .status(201)
                .json(new ApiResponse(201, result, 'User registered successfully'));
        } catch (error) {
            next(error); // Forwards to our global errorHandler middleware
        }
    }
    // 2. POST /api/v1/auth/login
    static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Validate request body with Zod
            const validatedData = loginSchema.parse(req.body);
            // Call Service Layer
            const result = await AuthService.login(validatedData);
            // Return 200 OK
            res
                .status(200)
                .json(new ApiResponse(200, result, 'Login successful'));
        } catch (error) {
            next(error);
        }
    }
    // 3. POST /api/v1/auth/refresh
    static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Validate request body with Zod
            const validatedData = refreshTokenSchema.parse(req.body);
            // Call Service Layer
            const result = await AuthService.refreshToken(validatedData.refreshToken);
            // Return 200 OK
            res
                .status(200)
                .json(new ApiResponse(200, result, 'Token refreshed successfully'));
        } catch (error) {
            next(error);
        }
    }
}