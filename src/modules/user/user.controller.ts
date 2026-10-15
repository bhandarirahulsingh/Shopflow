import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { ApiResponse } from '../../utils/ApiResponse';

export class UserController {
    // GET /api/v1/users/me
    static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // req.user was attached by our authenticate middleware!
            const user = await UserService.getProfile(req.user!.userId);
            res.status(200).json(new ApiResponse(200, user, 'Profile fetched successfully'));
        } catch (error) {
            next(error);
        }
    }
}