import { z } from 'zod';

export const envSchema = z.object({
    DB_HOST: z.string(),
    DB_PORT: z.coerce.number().int().positive(),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('1h'),
    SALT_ROUNDS: z.coerce.number().int().positive()
});