import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

// Create a singleton connection for BullMQ and generic caching
export const redisConnection = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

redisConnection.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err);
});

redisConnection.on('ready', () => {
  console.log('✅ Connected to Redis (Local)');
});
