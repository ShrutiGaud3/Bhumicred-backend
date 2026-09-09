import { body, query, param } from 'express-validator';

export const analyzePolygonValidator = [
  body('coordinates')
    .isArray({ min: 3 })
    .withMessage('At least 3 coordinate points [lng, lat] are required to form a polygon'),
];

export const createLayerValidator = [
  body('name').trim().notEmpty().withMessage('Layer name is required'),
  body('district').trim().notEmpty().withMessage('District is required'),
  body('category')
    .optional()
    .isIn([
      'CADASTRAL_GRID',
      'FOREST_ASSET',
      'WATER_CANAL',
      'NDVI_VEGETATION',
      'SOIL_FERTILITY_ZONE',
      'DROUGHT_RISK_MAP',
      'COMMUNITY_LAND',
    ])
    .withMessage('Invalid GIS layer category'),
  body('geoJson').optional().isObject(),
];

export const queryGisValidator = [
  query('district').optional().trim(),
  query('category').optional().trim(),
  query('taluka').optional().trim(),
  query('village').optional().trim(),
];
