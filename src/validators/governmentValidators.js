import { body, param, query } from 'express-validator';

export const applySchemeValidator = [
  param('id').trim().notEmpty().withMessage('Scheme ID is required'),
];

export const createAssetValidator = [
  body('name').trim().notEmpty().withMessage('Asset name is required'),
];

export const createCampaignValidator = [
  body('title').trim().notEmpty().withMessage('Campaign title is required'),
];
