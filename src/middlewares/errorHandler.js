import { HTTP_STATUS } from '../constants/httpStatus.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.NOT_FOUND;
    message = `Resource not found with ID: ${err.value}`;
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for ${field}. Please use another value.`;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation failed';
    errors = Object.values(err.errors || {}).map((val) => ({
      field: val.path,
      message: val.message,
    }));
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Invalid authentication token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Authentication token has expired. Please log in again.';
  }

  const response = {
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  };

  return res.status(statusCode).json(response);
};

export const notFoundHandler = (req, res, next) => {
  return res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Cannot find endpoint ${req.method} ${req.originalUrl} on BHUMICRED Sovereign Server`,
  });
};
