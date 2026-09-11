import { body, query, param } from 'express-validator';

export const analyzePolygonValidator = [
  body('coordinates')
    .isArray({ min: 3 })
    .withMessage('At least 3 coordinate points [lng, lat] are required to form a polygon'),
];

export const createLayerValidator = [
  body().custom((body) => {
    if (!body.name && !body.layerName && !body.title) {
      throw new Error('Layer name is required (use "name" or "layerName")');
    }
    return true;
  }),
];

export const queryGisValidator = [
  query('district').optional().trim(),
  query('category').optional().trim(),
  query('taluka').optional().trim(),
  query('village').optional().trim(),
];
