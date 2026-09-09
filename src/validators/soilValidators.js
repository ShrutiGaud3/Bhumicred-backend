import { body, param, query } from 'express-validator';

export const validateBookSoilTest = [
  body('landId')
    .notEmpty()
    .withMessage('Target Land Parcel ID is required'),
  body('packageId').optional().isString().withMessage('Package ID must be a string'),
  body('pickupDate').notEmpty().withMessage('Pickup date is required'),
  body('pickupTimeSlot').optional().isString(),
];

export const validateDispatchVan = [
  body('targetVillage').notEmpty().withMessage('Target village panchayat is required'),
  body('scheduledDate').notEmpty().withMessage('Scheduled date is required'),
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
