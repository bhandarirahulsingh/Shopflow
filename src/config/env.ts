import dotenv from 'dotenv';
import { z } from 'zod';

// 1. Load the variables from .env into process.env
dotenv.config();

// 2. Define the schema: this is our contract with the environment
const envSchema = z.object({
    PORT: z.string().default('8080').transform((val) => parseInt(val, 10)),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection URL'),
    JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long'),
    JWT_EXPIRES_IN: z.string().default('15m'),
    REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
});

const parseEnv = () => {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
        console.error('❌ FATAL: Invalid environment variables:');
        console.error(result.error.format());
        process.exit(1); // Stop server immediately before accepting any traffic
    }
    return result.data;
};

// 4. Export the validated, fully-typed configuration object
export const env = parseEnv();