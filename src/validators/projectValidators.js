import { body, param, query } from 'express-validator';

export const createProjectValidator = [
  body('title').optional().trim(),
  body('scope').optional().trim(),
  body('category').optional().trim(),
];

export const updateProjectValidator = [
  param('id').trim().notEmpty().withMessage('Project ID is required'),
];

export const enrollLandValidator = [
  param('id').trim().notEmpty().withMessage('Project ID is required'),
  body('landId').trim().notEmpty().withMessage('Land ID is required'),
];

export const updateMilestoneValidator = [
  param('id').trim().notEmpty().withMessage('Project ID is required'),
  param('milestoneIndex').isInt({ min: 0 }).withMessage('Milestone index must be a non-negative integer'),
];
