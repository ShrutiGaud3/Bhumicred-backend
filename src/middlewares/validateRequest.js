import { validationResult } from 'express-validator';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed for request payload',
      errors: formattedErrors,
    });
  }

  next();
};
