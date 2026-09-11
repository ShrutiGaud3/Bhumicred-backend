import express from 'express';
import { landController } from '../controllers/landController.js';
import {
  registerLandValidator,
  verifyLandValidator,
  updateLandValidator,
  queryLandValidator,
} from '../validators/landValidators.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// 1. Citizen & Farmer Endpoints
router.post('/', authenticateToken, registerLandValidator, validateRequest, landController.registerLand);
router.get('/my', authenticateToken, queryLandValidator, validateRequest, landController.getMyLands);
router.get('/stats/gis', authenticateToken, landController.getGisStats);
router.get('/stats', authenticateToken, landController.getGisStats);
router.get('/stats/overview', authenticateToken, landController.getGisStats);

// 2. Administrative / Cadastral Inspection Endpoints (All Lands)
router.get(
  '/',
  authenticateToken,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.OPERATIONS_ADMIN,
    ROLES.VERIFICATION_ADMIN,
    ROLES.ADMIN_STAFF,
    ROLES.GOVERNMENT_OFFICIAL,
    ROLES.FIELD_AGENT,
    ROLES.INSURANCE_OFFICER,
    ROLES.FARMER
  ),
  queryLandValidator,
  validateRequest,
  landController.getAllLands
);

// 3. Single Land Details & Updates
router.get('/:id', authenticateToken, landController.getLandById);
router.put('/:id', authenticateToken, updateLandValidator, validateRequest, landController.updateLand);

// 4. Verification & RoR Approval
router.patch(
  '/:id/verify',
  authenticateToken,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.OPERATIONS_ADMIN,
    ROLES.VERIFICATION_ADMIN,
    ROLES.ADMIN_STAFF,
    ROLES.GOVERNMENT_OFFICIAL
  ),
  verifyLandValidator,
  validateRequest,
  landController.verifyLand
);

export default router;
