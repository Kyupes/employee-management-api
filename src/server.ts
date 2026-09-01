import "dotenv/config";
import { env } from './config/env';
import { connectRedis, disconnectRedis } from "./config/redis";
import { app } from "./app";
import { pool } from './config/db';

async function connectRedisInBackground(): Promise<void>{
    try{
        await connectRedis();
    } catch (err) {
        console.log("Error trying to connect Redis:", err);
    }
}
connectRedisInBackground();

const server = app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
});

let isShuttingDown = false;
async function shutdown(signal: string, exitStatus: number){
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`Received ${signal}. Shutting down...`);
    setTimeout(() => {
        console.error("Shutdown timed out. Forcing exit.");
        process.exit(1);
    }, 10000);
    try {
        await new Promise<void>((resolve, reject) => {
            server.close((err) => {
                if (err){
                    console.error("Error during server close:", err);
                    return reject(err);
                }
                console.log("Server closed successfully");
                resolve();
            });
        });
    } catch (err) {
        console.error("Closing server connection rejected:", err);
    }
    try {
        await pool.end();
        console.log("Database connection closed");
    } catch (err) {
        console.error("Closing database connection rejected:", err);
    }
    try {
        await disconnectRedis();
        console.log("Redis connection closed");
    } catch (err) {
        console.error("Closing redis connection rejected:", err);
    }
    console.log("Successfully closed application");
    process.exit(exitStatus);
};

process.on('SIGTERM', async () => await shutdown('SIGTERM', 0));
process.on('SIGINT', async () => await shutdown('SIGINT', 0));
process.on('uncaughtException', async (err) => {
    console.error("Uncaught Exception:", err);
    await shutdown('uncaughtException', 1);
});
process.on('unhandledRejection', async (reason) => {
    console.error("Unhandled Rejection:", reason);
    await shutdown('unhandledRejection', 1);
});