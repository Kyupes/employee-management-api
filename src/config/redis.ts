import { createClient } from "redis";
import { env } from './env';

const redisUrl = env.REDIS_URL;
export const redisClient = createClient({
    url: redisUrl,
    disableOfflineQueue: true,
});

redisClient.on('error', err => {
    console.log('Redis Client Error:', err);
});

export async function connectRedis(): Promise<void> {
    if (!redisClient.isOpen){
        await redisClient.connect();
        console.log('Successfully connected to Redis');
    }
}

export async function disconnectRedis(): Promise<void> {
    if (redisClient.isOpen){
        await redisClient.quit();
    }
}