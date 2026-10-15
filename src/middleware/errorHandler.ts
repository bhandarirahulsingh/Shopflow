import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let errors: any[] = [];
    // 1. If it's our custom ApiError (e.g. throw ApiError.notFound('Product not found'))
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        errors = err.errors;
    }
    // 2. If it's a Zod validation error (e.g. invalid email or password too short)
    else if (err instanceof ZodError) {
        statusCode = 400;
        message = 'Validation Error';
        errors = err.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
        }));
    }
    // 3. If it's a PostgreSQL unique constraint error (code '23505' = duplicate key)
    else if (err.code === '23505') {
        statusCode = 409;
        message = 'Duplicate field value entered: A record with that identifier already exists';
    }
    // 4. Unexpected server crash (bug, null pointer, db connection dropped)
    else {
        message = env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
    }
    // Log the error in development terminal
    if (env.NODE_ENV === 'development') {
        console.error(`💥 [ERROR ${statusCode}] ${req.method} ${req.originalUrl}:`, err);
    }
    // Send uniform error response to client
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors,
        // Only show stack trace during local development, never in production!
        ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
