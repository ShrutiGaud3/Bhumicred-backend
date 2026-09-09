import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bhumicred',
  JWT_SECRET: process.env.JWT_SECRET || 'bhumicred_sovereign_secure_jwt_secret_key_2026_x8921',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_COOKIE_EXPIRES_IN: process.env.JWT_COOKIE_EXPIRES_IN || 7,
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 15,
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  GST_RATE_PERCENT: parseFloat(process.env.GST_RATE_PERCENT) || 18,
  LAND_REGISTRATION_RATE_PER_ACRE: parseFloat(process.env.LAND_REGISTRATION_RATE_PER_ACRE) || 149,
  TREE_INSURANCE_BASE_RATE_PER_TREE: parseFloat(process.env.TREE_INSURANCE_BASE_RATE_PER_TREE) || 31,
};
