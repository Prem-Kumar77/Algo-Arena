// src/lib/redis.js
import { createClient } from "redis";

// Prefer process env (from Docker or system). Only load .env if values are missing.
let { REDIS_HOST, REDIS_PORT } = process.env;
if (!REDIS_HOST || !REDIS_PORT) {
    // Lazy-load dotenv locally to avoid overriding container envs
    const { default: dotenv } = await import("dotenv");
    dotenv.config();
    REDIS_HOST = process.env.REDIS_HOST || REDIS_HOST;
    REDIS_PORT = process.env.REDIS_PORT || REDIS_PORT;
}

const redisUrl = `redis://${REDIS_HOST || "localhost"}:${REDIS_PORT || "6379"}`;

const redis = createClient({ url: redisUrl });

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err));

(async () => {
    try {
        await redis.connect();
    } catch (err) {
        console.error("Redis connection failed:", err);
    }
})();

export default redis;
