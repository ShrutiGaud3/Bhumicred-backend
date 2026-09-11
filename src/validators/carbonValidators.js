import { body, param, query } from 'express-validator';

export const requestCarbonAuditValidator = [
  body('landId').optional().trim(),
  body('agroforestryType').optional().trim(),
  body('estimatedTreeCount').optional().isInt({ min: 1 }),
  body('areaAcres').optional().isNumeric(),
];

export const processMrvValidator = [
  param('id').trim().notEmpty().withMessage('Audit Request ID is required'),
  body('status')
    .optional()
    .isIn([
      'SUBMITTED',
      'SATELLITE_SCANNING',
      'SPECTRAL_PROCESSED',
      'VERIFIED_MINT_READY',
      'MINTED',
      'REJECTED',
    ]),
  body('ndviMean').optional().isNumeric(),
  body('verifiedMintableCredits').optional().isNumeric(),
];

export const mintCarbonCreditsValidator = [
  body('auditRequestId').optional().trim(),
  body('tCO2e').optional().isNumeric(),
  body('pricePerCredit').optional().isNumeric(),
];

export const retireCarbonCreditValidator = [
  param('id').trim().notEmpty().withMessage('Carbon Credit ID is required'),
  body('beneficiary.organizationName').optional().trim(),
  body('beneficiary.purpose').optional().trim(),
  body('beneficiary.offsetReason').optional().trim(),
];
