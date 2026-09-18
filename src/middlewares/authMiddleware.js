import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticateToken = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from Authorization header or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new AppError('Authentication required. Please provide a valid Bearer token.', HTTP_STATUS.UNAUTHORIZED);
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded; // { id, role, email, phone, permissions, iat, exp }
    next();
  } catch (error) {
    throw new AppError('Invalid or expired authentication token', HTTP_STATUS.UNAUTHORIZED);
  }
});

export const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      req.user = decoded;
    } catch {
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
});

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', HTTP_STATUS.UNAUTHORIZED));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`,
          HTTP_STATUS.FORBIDDEN
        )
      );
    }
    next();
  };
};

export const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', HTTP_STATUS.UNAUTHORIZED));
    }
    const permissions = req.user.permissions || [];
    if (!permissions.includes(requiredPermission) && !permissions.includes('*')) {
      return next(
        new AppError(
          `Forbidden: You lack permission '${requiredPermission}' to perform this action.`,
          HTTP_STATUS.FORBIDDEN
        )
      );
    }
    next();
  };
};

export const requireApprovedUser = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required.', HTTP_STATUS.UNAUTHORIZED));
  }

  // Super Admin and Admin staff have unrestricted administrative access
  if (req.user.role === 'SUPER_ADMIN' || req.user.role === 'ADMIN_STAFF') {
    return next();
  }

  const isApproved = req.user.status === 'APPROVED' || req.user.status === 'ACTIVE';
  if (!isApproved) {
    return next(
      new AppError(
        'Your registration application is currently pending administrative verification and approval. Dashboard actions are locked until approved.',
        HTTP_STATUS.FORBIDDEN
      )
    );
  }
  next();
};
