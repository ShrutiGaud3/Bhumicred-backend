import { AppError } from '../utils/appError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ROLE_PERMISSIONS, ROLES } from '../constants/roles.js';

export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new AppError('Unauthorized. User role not found.', HTTP_STATUS.UNAUTHORIZED));
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== ROLES.SUPER_ADMIN) {
      return next(
        new AppError(
          `Forbidden. Access restricted to roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
          HTTP_STATUS.FORBIDDEN
        )
      );
    }

    next();
  };
};

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new AppError('Unauthorized. User credentials missing.', HTTP_STATUS.UNAUTHORIZED));
    }

    // Super Admin has all permissions
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    // Check user's assigned permissions or role default permissions
    const userRole = req.user.role;
    const roleAllowedPerms = ROLE_PERMISSIONS[userRole] || [];
    const customUserPerms = req.user.permissions || [];

    const hasPerm = roleAllowedPerms.includes(permission) || customUserPerms.includes(permission);

    if (!hasPerm) {
      return next(
        new AppError(
          `Forbidden. Required permission '${permission}' is not granted for your role.`,
          HTTP_STATUS.FORBIDDEN
        )
      );
    }

    next();
  };
};
