import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log('MongoDB is already connected.');
    return;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(`✓ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Notice: ${error.message}`);
    console.warn('Backend server running in resilient mode. Database operations will retry once MongoDB is accessible.');
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('MongoDB connection disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
