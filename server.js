import http from 'http';
import app from './src/app.js';
import { env } from './src/config/env.js';
import { connectDB } from './src/config/db.js';

const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Start HTTP Server
const PORT = env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🌾 BHUMICRED Sovereign Backend Server Started`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Environment: ${env.NODE_ENV}`);
  console.log(`====================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Details:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Details:', err);
  process.exit(1);
});
