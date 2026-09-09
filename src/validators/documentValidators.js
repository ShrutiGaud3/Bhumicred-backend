import { body, param, query } from 'express-validator';

export const uploadDocumentValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Document title is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Document title must be between 2 and 255 characters'),

  body('category')
    .optional()
    .isIn(['IDENTITY', 'LAND', 'INSURANCE', 'SOIL', 'OTHER'])
    .withMessage('Invalid document category'),

  body('documentType')
    .optional()
    .isIn([
      'AADHAAR',
      'PAN',
      'ROR_7_12',
      'KHASRA_PAWTI',
      'CADASTRAL_MAP',
      'SOIL_HEALTH_CARD',
      'TREE_POLICY',
      'NOC_POA',
      'INVOICE',
      'OTHER',
    ])
    .withMessage('Invalid document type'),

  body('fileName').optional().trim(),
  body('fileSize').optional().trim(),
  body('fileUrl').optional().trim(),
  body('fileData').optional(),
  body('mimeType').optional().trim(),
  body('landId').optional().trim(),
  body('tags').optional().isArray(),
  body('metadata').optional().isObject(),
];

export const verifyDocumentValidator = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Verification status is required')
    .isIn(['VERIFIED', 'REJECTED', 'PENDING_VERIFICATION'])
    .withMessage('Status must be VERIFIED, REJECTED, or PENDING_VERIFICATION'),

  body('verificationNotes').optional().trim(),
];
