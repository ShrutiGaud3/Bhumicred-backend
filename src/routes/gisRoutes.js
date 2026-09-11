import express from 'express';
import { gisController } from '../controllers/gisController.js';
import {
  analyzePolygonValidator,
  createLayerValidator,
  queryGisValidator,
} from '../validators/gisValidators.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// 1. Public & Citizen Spatial Queries
router.get('/layers', queryGisValidator, validateRequest, gisController.getGisLayers);
router.get('/stats', gisController.getMacroMetrics);
router.get('/stats/overview', gisController.getMacroMetrics);
router.post(
  '/analyze-polygon',
  analyzePolygonValidator,
  validateRequest,
  gisController.analyzePolygon
);
router.get('/parcel/:landId', authenticateToken, gisController.getParcelSpatialData);

// 2. Admin GIS Layer Ingestion
router.post(
  '/layers',
  authenticateToken,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.OPERATIONS_ADMIN, ROLES.GOVERNMENT, ROLES.PARTNER),
  createLayerValidator,
  validateRequest,
  gisController.createGisLayer
);

export default router;
