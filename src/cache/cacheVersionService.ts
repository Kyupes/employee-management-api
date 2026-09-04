import { redisClient } from "../config/redisClient";

export type VersionResult =
    | { 
        status: "found";
        version: number;
    }
    | {
        status: "missing";
    }
    | {
        status: "error";
    };

export async function getVersion(key: string): Promise<VersionResult>{
    try {
        const version = await redisClient.get(key);
        if (version === null){
            return { status: "missing" };
        }
        const versionNumber = Number(version);
        if ( Number.isNaN(versionNumber) || versionNumber <= 0 ){
            return { status: "error" };
        }
        return { status: "found", version: versionNumber };
    } catch (err) {
        console.error("Redis get version error:", err);
        return { status: "error" };
    }
}

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