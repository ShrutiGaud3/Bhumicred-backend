import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import apiRouter from './routes/apiRouter.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Dynamic CORS configuration supporting Vercel, Localhost, Render and custom domains
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'https://bhumicred.vercel.app',
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, mobile apps, cURL, server-to-server)
    if (!origin) return callback(null, true);

    // Allow all vercel.app domains (including preview branches & production), localhost, onrender, or allowedOrigins
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('vercel.app') ||
      origin.includes('onrender.com') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }

    // Default fallback allow origin for production flexibility
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Compression & Body Parsers
app.use(compression());
app.use(express.json({ limit: `${env.MAX_FILE_SIZE_MB}mb` }));
app.use(express.urlencoded({ extended: true, limit: `${env.MAX_FILE_SIZE_MB}mb` }));
app.use(cookieParser());

// HTTP Request Logger
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static folder for uploaded files
app.use('/uploads', express.static(env.UPLOAD_DIR));

// API Root Router (supports versioned /api/v1 and unversioned /api)
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

// Root Index Route
app.get('/', (req, res) => {
  res.json({
    name: 'BHUMICRED Sovereign Agro-GIS Backend API',
    status: 'online',
    healthCheck: '/api/v1/health',
    version: '1.0.0',
  });
});

// 404 Not Found Handler
app.use(notFoundHandler);

// Global Centralized Error Handler
app.use(errorHandler);

export default app;
