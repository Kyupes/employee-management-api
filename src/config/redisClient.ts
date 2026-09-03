import { createClient } from "redis";
import { env } from './env';

const redisUrl = env.REDIS_URL;
export const redisClient = createClient({
    url: redisUrl,
    disableOfflineQueue: true,
});

redisClient.on('error', err => {
    console.error('Redis Client Error:', err);
});