import bcrypt from 'bcryptjs';
import { query, withTransaction } from '../../db';
import { ApiError } from '../../utils/ApiError';
import { generateAccessToken, generateRefreshToken, verifyToken, TokenPayload } from '../../utils/jwt';
import { RegisterInput, LoginInput } from './auth.schema';

export interface UserResponse {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: 'USER' | 'SELLER' | 'ADMIN';
    createdAt: Date;
}

export interface AuthResponse {
    user: UserResponse;
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}

export class AuthService {
    // 1. REGISTER A NEW USER
    static async register(input: RegisterInput): Promise<AuthResponse> {
        const { email, password, firstName, lastName, role } = input;

        // A. Check if email already exists
        const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            throw ApiError.conflict('An account with this email already exists');
        }

        // B. Hash the password with 12 salt rounds (resistant to GPU brute-forcing)
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        // C. Atomic Transaction: Insert user AND create their initial empty cart!
        const newUser = await withTransaction(async (client) => {
            // Insert User
            const userResult = await client.query<UserResponse>(
                `INSERT INTO users (email, password_hash, first_name, last_name, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, first_name as "firstName", last_name as "lastName", role, created_at as "createdAt"`,
                [email, passwordHash, firstName, lastName, role]
            );

            const createdUser = userResult.rows[0];

            // Create their initial empty cart (1-to-1 relationship!)
            await client.query('INSERT INTO carts (user_id) VALUES ($1)', [createdUser.id]);

            return createdUser;
        });

        // D. Generate JWT tokens
        const tokenPayload: TokenPayload = {
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role,
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        return {
            user: newUser,
            tokens: { accessToken, refreshToken },
        };
    }

    // 2. LOGIN USER
    static async login(input: LoginInput): Promise<AuthResponse> {
        const { email, password } = input;

        // A. Find user by email
        const result = await query(
            `SELECT id, email, password_hash, first_name as "firstName", last_name as "lastName", role, created_at as "createdAt"
       FROM users WHERE email = $1`,
            [email]
        );

        const user = result.rows[0];

        // B. Security Best Practice: Never reveal whether email or password was wrong!
        if (!user) {
            throw ApiError.unauthorized('Invalid email or password');
        }

        // C. Compare plain password with bcrypt hash
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw ApiError.unauthorized('Invalid email or password');
        }

        // D. Generate JWT tokens
        const tokenPayload: TokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // E. Strip password_hash before returning user data!
        const { password_hash, ...safeUser } = user;

        return {
            user: safeUser,
            tokens: { accessToken, refreshToken },
        };
    }

    // 3. REFRESH ACCESS TOKEN
    static async refreshToken(token: string): Promise<{ accessToken: string }> {
        try {
            // Decode and verify the refresh token
            const decoded = verifyToken<TokenPayload>(token);

            // Verify the user still exists in PostgreSQL
            const result = await query('SELECT id, email, role FROM users WHERE id = $1', [decoded.userId]);
            const user = result.rows[0];

            if (!user) {
                throw ApiError.unauthorized('User no longer exists');
            }

            // Issue a fresh new 15-minute access token
            const newAccessToken = generateAccessToken({
                userId: user.id,
                email: user.email,
                role: user.role,
            });

            return { accessToken: newAccessToken };
        } catch (err) {
            throw ApiError.unauthorized('Invalid or expired refresh token. Please log in again.');
        }
    }
}
