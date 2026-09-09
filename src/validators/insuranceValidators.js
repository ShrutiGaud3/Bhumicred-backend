import { body, query, param } from 'express-validator';

export const calculateQuoteValidator = [
  body('treeCount')
    .notEmpty()
    .withMessage('Tree count is required')
    .isInt({ min: 1 })
    .withMessage('Tree count must be at least 1'),
  body('species').optional().trim(),
  body('ageYears').optional().isFloat({ min: 0.5 }),
  body('durationMonths').optional().isInt({ min: 12, max: 60 }),
];

export const applyPolicyValidator = [
  body('landId').trim().notEmpty().withMessage('Registered land parcel is required'),
  body('planName').trim().notEmpty().withMessage('Policy plan name is required'),
  body('insuredTreeCount')
    .notEmpty()
    .withMessage('Insured tree count is required')
    .isInt({ min: 1 })
    .withMessage('Must insure at least 1 tree'),
  body('speciesSummary').optional().trim(),
  body('sumInsured').notEmpty().withMessage('Sum insured amount is required').isNumeric(),
  body('farmerNetPayable').notEmpty().withMessage('Net payable premium is required').isNumeric(),
  body('durationMonths').optional().isInt({ min: 12, max: 60 }),
];

export const raiseClaimValidator = [
  body('policyId').trim().notEmpty().withMessage('Policy ID is required'),
  body('incidentType').trim().notEmpty().withMessage('Incident type is required'),
  body('incidentDate').notEmpty().withMessage('Incident date is required'),
  body('affectedTreeCount')
    .notEmpty()
    .withMessage('Affected tree count is required')
    .isInt({ min: 1 })
    .withMessage('Must report at least 1 affected tree'),
  body('estimatedLoss').notEmpty().withMessage('Estimated loss amount is required').isNumeric(),
  body('claimDescription').optional().trim(),
  body('damagePhotos').optional().isArray(),
];

export const updateClaimStatusValidator = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn([
      'SUBMITTED',
      'DESK_REVIEW',
      'INSPECTION_SCHEDULED',
      'INSPECTED',
      'APPROVED',
      'REJECTED',
      'SETTLED',
    ])
    .withMessage('Invalid claim status'),
  body('approvedPayoutAmount').optional().isNumeric(),
  body('remarks').optional().trim(),
  body('inspectorName').optional().trim(),
  body('inspectionDate').optional(),
];
