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
app.use(helmet());

// CORS configuration for React frontend
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

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
