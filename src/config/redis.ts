import { initializeVersion } from "../cache/cacheVersionService";
import { redisClient } from "./redisClient";

export async function connectRedis(): Promise<void> {
    if (!redisClient.isOpen){
        await redisClient.connect();
        console.log('Successfully connected to Redis');
        await initializeCacheMetadata();
    }
}

export async function disconnectRedis(): Promise<void> {
    if (redisClient.isOpen){
        await redisClient.quit();
    }
}

async function initializeCacheMetadata(){
    const listVersionKey = "employees:list:version";
    await initializeVersion(listVersionKey);
}