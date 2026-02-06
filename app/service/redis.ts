import Redis from "ioredis";
import { env } from "../utils/dotenv";

export const redis = new Redis({
  host: env.REDIS_HOST || "localhost",
  port: Number(env.REDIS_PORT) || 6379,
  password: env.REDIS_PASS || undefined,
  maxRetriesPerRequest: null,
});
