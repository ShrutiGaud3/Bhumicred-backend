import { body } from 'express-validator';
import { ROLE_LIST } from '../constants/roles.js';

const sanitizeMobile = (val) => {
  if (val === undefined || val === null) return '';
  const cleaned = String(val).trim().replace(/\D/g, '');
  // If user entered +91 or 91 before 10-digit number
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned.slice(2);
  }
  return cleaned;
};

const sanitizeRole = (val) => {
  if (!val) return undefined;
  const upper = String(val).trim().toUpperCase();
  if (upper.includes('FARMER') || upper.includes('LAND')) return 'FARMER';
  if (upper.includes('GOV')) return 'GOVERNMENT';
  if (upper.includes('PARTNER') || upper.includes('ENTERPRISE')) return 'PARTNER';
  if (upper.includes('SUPER') || upper.includes('ADMIN')) return 'SUPER_ADMIN';
  return upper;
};

export const sendOtpValidator = [
  body('mobile')
    .customSanitizer(sanitizeMobile)
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit Indian mobile number'),
  body('role')
    .optional({ nullable: true, checkFalsy: true })
    .customSanitizer(sanitizeRole)
    .isIn(ROLE_LIST)
    .withMessage('Invalid platform role specified'),
];

export const verifyOtpValidator = [
  body('mobile')
    .customSanitizer(sanitizeMobile)
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit mobile number'),
  body('otp')
    .customSanitizer((val) => (val !== undefined && val !== null ? String(val).trim() : ''))
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits'),
  body('role')
    .optional({ nullable: true, checkFalsy: true })
    .customSanitizer(sanitizeRole)
    .isIn(ROLE_LIST)
    .withMessage('Invalid platform role specified'),
];

export const registerValidator = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
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
];

export const passwordLoginValidator = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Mobile number or Email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];
