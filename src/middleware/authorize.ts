import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const authorize = (...allowedRoles: Array<'USER' | 'SELLER' | 'ADMIN'>) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        // 1. Ensure user passed through authenticate middleware first
        if (!req.user) {
            return next(ApiError.unauthorized('Authentication required'));
        }

        // 2. Is their role in the allowed list?
        if (!allowedRoles.includes(req.user.role)) {
            return next(
                ApiError.forbidden(
                    `Forbidden: Role '${req.user.role}' does not have permission to access this resource`
                )
            );
        }

        next(); // Role permitted!
    };
};
