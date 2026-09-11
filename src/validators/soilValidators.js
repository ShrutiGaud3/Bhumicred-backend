import { body, param, query } from 'express-validator';

export const validateBookSoilTest = [
  body('landId').optional().trim(),
  body('packageId').optional().isString(),
  body('pickupDate').optional().trim(),
  body('pickupTimeSlot').optional().isString(),
];

export const validateDispatchVan = [
  body('targetVillage').optional().trim(),
  body('scheduledDate').optional().trim(),
  body('district').optional().trim(),
  body('vanId').optional().isString(),
];

export const validateUpdateReport = [
  param('id').notEmpty().withMessage('Soil Test Request ID is required'),
  body('status')
    .optional()
    .isIn([
      'SUBMITTED',
      'SAMPLE_COLLECTION_SCHEDULED',
      'SAMPLE_COLLECTED',
      'TESTING',
      'REPORT_READY',
      'REJECTED',
    ])
    .withMessage('Invalid status'),
  body('healthScore').optional().isNumeric().withMessage('Health score must be a number'),
];
