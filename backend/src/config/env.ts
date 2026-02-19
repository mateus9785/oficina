import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  PORT: parseInt(optional('PORT', '3001'), 10),
  NODE_ENV: optional('NODE_ENV', 'development'),
  DB: {
    HOST: optional('DB_HOST', 'localhost'),
    PORT: parseInt(optional('DB_PORT', '3306'), 10),
    USER: optional('DB_USER', 'root'),
    PASSWORD: optional('DB_PASSWORD', ''),
    NAME: optional('DB_NAME', 'oficina'),
  },
  JWT: {
    SECRET: required('JWT_SECRET'),
    EXPIRES_IN: optional('JWT_EXPIRES_IN', '8h'),
    REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
    REFRESH_EXPIRES_IN: optional('JWT_REFRESH_EXPIRES_IN', '7d'),
  },
  CORS_ORIGIN: optional('CORS_ORIGIN', 'http://localhost:5173'),
  BCRYPT_ROUNDS: parseInt(optional('BCRYPT_ROUNDS', '12'), 10),
};
