"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnection = void 0;
const ioredis_1 = require("ioredis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
// Create a singleton connection for BullMQ and generic caching
exports.redisConnection = new ioredis_1.Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    maxRetriesPerRequest: null,
});
exports.redisConnection.on('error', (err) => {
    console.error('❌ Redis Connection Error:', err);
});
exports.redisConnection.on('ready', () => {
    console.log('✅ Connected to Redis (Local)');
});
//# sourceMappingURL=redisService.js.map