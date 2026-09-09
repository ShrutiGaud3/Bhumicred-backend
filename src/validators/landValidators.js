import { body, query, param } from 'express-validator';

export const registerLandValidator = [
  body('landName')
    .trim()
    .notEmpty()
    .withMessage('Land name / plot title is required')
    .isLength({ min: 2, max: 120 })
    .withMessage('Land name must be between 2 and 120 characters'),

  body('surveyNumber')
    .trim()
    .notEmpty()
    .withMessage('Survey number is required'),

  body('khasraNumber')
    .trim()
    .notEmpty()
    .withMessage('Khasra / Plot number is required'),

  body('area')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Land area must be a valid number greater than 0'),

  body('areaAcres')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Area in acres must be a valid number greater than 0'),

  body('village')
    .optional()
    .trim(),

  body('district')
    .optional()
    .trim(),

  body('state')
    .optional()
    .trim(),
];

export const verifyLandValidator = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Land parcel ID is required'),

  body('action')
    .optional()
    .isIn(['APPROVE', 'REJECT', 'QUERY_RAISED', 'REQUEST_CHANGES'])
    .withMessage('Action must be APPROVE, REJECT, or QUERY_RAISED'),

  body('status')
    .optional()
    .isIn(['APPROVED', 'REJECTED', 'QUERY_RAISED', 'PENDING_VERIFICATION'])
    .withMessage('Invalid status value'),

  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Remarks cannot exceed 500 characters'),

  body('verifiedWithBhulekh')
    .optional()
    .isBoolean()
    .withMessage('verifiedWithBhulekh must be a boolean'),
];

export const updateLandValidator = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Land parcel ID is required'),

  body('landName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 }),

  body('area')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Area must be a number greater than 0'),
];

export const queryLandValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .trim(),

  query('search')
    .optional()
    .trim(),
];
