import { body, query, param } from 'express-validator';

export const calculateQuoteValidator = [
  body('treeCount')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Tree count must be at least 1'),
];

export const applyPolicyValidator = [
  body('landId')
    .optional()
    .trim(),
];

export const raiseClaimValidator = [
  body('policyId')
    .optional()
    .trim(),
];

export const updateClaimStatusValidator = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Claim status is required')
    .isIn(['UNDER_REVIEW', 'INSPECTION_SCHEDULED', 'APPROVED', 'SETTLED', 'REJECTED'])
    .withMessage('Invalid claim status'),
];
