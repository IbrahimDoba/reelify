import dotenv from 'dotenv';

dotenv.config();

export default {
  PORT: process.env.PORT || 4000,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
//   REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
  UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
  NODE_ENV: process.env.NODE_ENV || 'development'
};