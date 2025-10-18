// src/lib/redis.js
import { createClient } from "redis";

const url = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;

// Enable TLS automatically for rediss:// URLs commonly used by managed Redis providers
const useTls = typeof url === "string" && url.startsWith("rediss://");
const redis = createClient({
  url: url,
  socket: useTls ? { tls: true } : undefined,
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err));

// Only connect if Redis URL is available
if (process.env.REDIS_URL || process.env.REDIS_HOST) {
  (async () => {
      try {
          await redis.connect();
      } catch (err) {
          console.error("Redis connection failed:", err);
          // Don't exit process, just log the error
      }
  })();
} else {
  console.log("⚠️ Redis not configured, skipping Redis connection");
}

export default redis;
