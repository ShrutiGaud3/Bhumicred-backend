import { HTTP_STATUS } from '../constants/httpStatus.js';

export const sendResponse = (res, {
  statusCode = HTTP_STATUS.OK,
  success = true,
  message = 'Operation successful',
  data = null,
  meta = null,
}) => {
  const response = {
    success,
    message,
    ...(data !== null && data !== undefined && { data }),
    ...(meta && { meta }),
  };

  return res.status(statusCode).json(response);
};

export const sendSuccess = (res, message = 'Success', data = null, statusCode = HTTP_STATUS.OK, meta = null) => {
  return sendResponse(res, {
    statusCode,
    success: true,
    message,
    data,
    meta,
  });
};

export const sendCreated = (res, message = 'Resource created successfully', data = null) => {
  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message,
    data,
  });
};
