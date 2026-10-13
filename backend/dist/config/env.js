"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('4000'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: zod_1.z.string().optional().default('postgresql://postgres:postgres@localhost:5432/clarifyx_dev?schema=public'),
    MONGODB_URI: zod_1.z.string().optional().default('mongodb://localhost:27017/clarifyx'),
    FRONTEND_URL: zod_1.z.string().default('http://localhost:5173'),
    SESSION_SECRET: zod_1.z.string().default('dev_secret_key_clarifyx_soc_2026'),
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error('Invalid environment variables', _env.error.format());
    process.exit(1);
}
exports.env = _env.data;
