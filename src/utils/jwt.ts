import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
    userId: number;
    email: string;
    role: 'USER' | 'SELLER' | 'ADMIN';
}

// 1. Generate short-lived Access Token (15m)
export const generateAccessToken = (payload: TokenPayload): string => {
    const options: SignOptions = {
        expiresIn: env.JWT_EXPIRES_IN as any,
    };
    return jwt.sign(payload, env.JWT_SECRET, options);
};

// 2. Generate long-lived Refresh Token (7d)
export const generateRefreshToken = (payload: TokenPayload): string => {
    const options: SignOptions = {
        expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as any,
    };
    return jwt.sign(payload, env.JWT_SECRET, options);
};

// 3. Verify and decode an incoming token
export const verifyToken = <T = TokenPayload>(token: string): T => {
    return jwt.verify(token, env.JWT_SECRET) as T;
};