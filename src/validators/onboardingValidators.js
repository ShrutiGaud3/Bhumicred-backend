import { body, param, query } from 'express-validator';
import { ROLE_LIST } from '../constants/roles.js';

export const submitKycValidator = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters'),
  body('applicantName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Applicant name must be at least 2 characters'),
  body('mobile')
    .customSanitizer((val) => {
      const digits = String(val || '').replace(/\D/g, '');
      return digits.length > 10 ? digits.slice(-10) : digits;
    })
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit mobile number'),
  body('role')
    .optional()
    .isIn(ROLE_LIST)
    .withMessage('Invalid platform role specified'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('pincode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Pincode / Postal code cannot be empty'),
];

export const reviewKycValidator = [
  param('id')
    .notEmpty()
    .withMessage('Application ID is required in route parameter'),
  body('status')
    .notEmpty()
    .withMessage('Review decision status is required')
    .isIn(['APPROVED', 'REJECTED', 'QUERY_PENDING'])
    .withMessage('Status must be APPROVED, REJECTED, or QUERY_PENDING'),
  body('reviewNotes')
    .optional()
    .trim(),
];

export const getKycQueueValidator = [
  query('role')
    .optional()
    .isIn(ROLE_LIST)
    .withMessage('Invalid role filter specified'),
  query('status')
    .optional()
    .isIn(['ALL', 'PENDING_VERIFICATION', 'APPROVED', 'REJECTED', 'QUERY_PENDING'])
    .withMessage('Invalid status filter specified'),
];
