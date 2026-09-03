import { redisClient } from "../config/redisClient";

export async function get<T>(key: string): Promise<T | null>{
    try {
        const value = await redisClient.get(key);
        if (value != null) {
            const result = JSON.parse(value);
            return result;
        }
        return null;
    } catch (err) {
        if (err instanceof SyntaxError){
            console.error("JSON parsing failed:", err);
        }
        else {
            console.error("Redis get error:", err);
        }
        return null;
    }
}

export async function set<T>(key: string, value: T, ttl: number): Promise<void>{
    try {
        await redisClient.set(key, JSON.stringify(value), { expiration: { type: "EX", value: ttl } });
    } catch (err) {
        console.error("Redis set error:", err);
    }
}

export async function remove(key: string): Promise<void>{
    try{
        await redisClient.del(key);
    } catch (err) {
        console.error("Redis delete error:", err);
    }
}
