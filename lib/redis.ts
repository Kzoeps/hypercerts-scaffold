import "server-only";
import { createClient } from "redis";

const redisConfig: Parameters<typeof createClient>[0] = {
  socket: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    reconnectStrategy: (retries) => {
      const delay = Math.min(retries * 50, 5000);
      console.log(`Redis reconnecting in ${delay}ms (attempt ${retries})...`);
      return delay;
    },
    connectTimeout: 10000,
  },
};

if (process.env.REDIS_PASSWORD) {
  redisConfig.username = process.env.REDIS_USERNAME || "default";
  redisConfig.password = process.env.REDIS_PASSWORD;
}

export const redisClient = createClient(redisConfig);

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

redisClient.on("connect", () => {
  console.log("✓ Redis connected");
});

redisClient.on("reconnecting", () => {
  console.log("⟳ Redis reconnecting...");
});

redisClient.on("ready", () => {
  console.log("✓ Redis ready");
});

redisClient.connect().catch((err) => {
  console.error("✗ Redis initial connection failed:", err.message);
});

// Graceful shutdown on process exit
const cleanup = async () => {
  if (redisClient.isOpen) {
    console.log("Closing Redis connection...");
    await redisClient.quit();
  }
};

process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);
process.on("beforeExit", cleanup);
