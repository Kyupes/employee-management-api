import { redisClient } from "../config/redisClient";

export async function initializeVersion(key: string): Promise<void>{
    try {
        await redisClient.setNX(key, '1');
    } catch (err) {
        console.error("Redis version initialization error:", err);
    }
}

export async function incrementVersion(key: string): Promise<number | null>{
    try {
        const version = await redisClient.incr(key);
        return version;
    } catch (err) {
        console.error("Redis increment version error:", err);
        return null;
    }
}