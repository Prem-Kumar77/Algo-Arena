// src/lib/redis.js
import { createClient } from "redis";

const url = process.env.REDIS_URL

// Enable TLS automatically for rediss:// URLs commonly used by managed Redis providers
const useTls = typeof url === "string" && url.startsWith("rediss://");
const redis = createClient({
  url: url,
  socket: useTls ? { tls: true } : undefined,
});

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
