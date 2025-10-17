// src/lib/redis.js
import { createClient } from "redis";

// Prefer REDIS_URL when provided (Render/Upstash/Redis Cloud). Fallback to host/port.
let { REDIS_URL, REDIS_HOST, REDIS_PORT } = process.env;
if (!REDIS_URL && (!REDIS_HOST || !REDIS_PORT)) {
  // Lazy-load dotenv locally only
  const { default: dotenv } = await import("dotenv");
  dotenv.config();
  REDIS_URL = process.env.REDIS_URL || REDIS_URL;
  REDIS_HOST = process.env.REDIS_HOST || REDIS_HOST;
  REDIS_PORT = process.env.REDIS_PORT || REDIS_PORT;
}

const url = REDIS_URL || `redis://${REDIS_HOST || "localhost"}:${REDIS_PORT || "6379"}`;

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
