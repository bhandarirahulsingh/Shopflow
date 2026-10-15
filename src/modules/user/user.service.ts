import { query } from '../../db';
import { ApiError } from '../../utils/ApiError';
import { UserResponse } from '../auth/auth.service';


export class UserService {
    // 1. GET PROFILE BY USER ID
    static async getProfile(userId: number): Promise<UserResponse> {
        const result = await query<UserResponse>(
            `SELECT id, email, first_name as "firstName", last_name as "lastName", role, created_at as "createdAt"
       FROM users WHERE id = $1`,
            [userId]
        );
        const user = result.rows[0];
        if (!user) {
            throw ApiError.notFound('User not found');
        }
        return user;
    }
}
