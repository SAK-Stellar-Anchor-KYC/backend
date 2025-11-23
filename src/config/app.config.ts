import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiKeys: process.env.API_KEYS?.split(',') || [],
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    ttl: parseInt(process.env.JWT_TTL, 10) || 1800,
  },
  rateLimit: {
    requests: parseInt(process.env.RATE_LIMIT_REQUESTS, 10) || 100,
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
  },
  renaper: {
    apiUrl: process.env.RENAPER_API_URL || 'https://api.renaper.gob.ar/v1',
    apiKey: process.env.RENAPER_API_KEY || '',
  },
  zkProof: {
    secret: process.env.ZK_PROOF_SECRET || 'default-zk-secret',
  },
  file: {
    maxSize: parseInt(process.env.FILE_MAX_SIZE, 10) || 5000000,
  },
}));
