import "server-only";
import { createClient } from "redis";
if (!process.env.REDIS_PASSWORD) {
  throw new Error("REDIS_PASSWORD is not defined in environment variables");
}

export const redisClient = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: "redis-19069.c292.ap-southeast-1-1.ec2.cloud.redislabs.com",
    port: 19069,
  },
});

export async function ensureRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

redisClient.on("error", (err) => console.log("Redis Client Error", err));
