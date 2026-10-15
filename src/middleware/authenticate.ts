import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { verifyToken, TokenPayload } from '../utils/jwt';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        // 1. Is the header present? Does it start with 'Bearer '?
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw ApiError.unauthorized('Access denied. No token provided.');
        }

        // 2. Extract the raw token string
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw ApiError.unauthorized('Access denied. Malformed token.');
        }

        // 3. Cryptographically verify signature and expiration
        const decoded = verifyToken<TokenPayload>(token);

        // 4. Attach user to request object for any downstream controller to use
        req.user = decoded;

        next(); // All good! Move forward.
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            next(ApiError.unauthorized('Token has expired. Please refresh your token.'));
        } else if (error.name === 'JsonWebTokenError') {
            next(ApiError.unauthorized('Invalid token signature.'));
        } else {
            next(error);
        }
    }
};
