import { envSchema } from '../schemas/env.schema';

export const env = envSchema.parse(process.env);