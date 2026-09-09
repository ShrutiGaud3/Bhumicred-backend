import express from 'express';
import {
  getPublicAssets,
  createPublicAsset,
  getCampaigns,
  createCampaign,
  getFarmersInArea,
  getGovernmentDashboardStats,
} from '../controllers/governmentController.js';
import {
  createAssetValidator,
  createCampaignValidator,
} from '../validators/governmentValidators.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// Government Portal Overview Stats
router.get(
  '/stats',
  authenticateToken,
  authorizeRoles(ROLES.GOVERNMENT, ROLES.SUPER_ADMIN, ROLES.FINANCE_ADMIN),
  getGovernmentDashboardStats
);

// Public Green Assets & Cadastre
router.get(
  '/assets',
  authenticateToken,
  authorizeRoles(ROLES.GOVERNMENT, ROLES.SUPER_ADMIN, ROLES.PARTNER),
  getPublicAssets
);

router.post(
  '/assets',
  authenticateToken,
  authorizeRoles(ROLES.GOVERNMENT, ROLES.SUPER_ADMIN),
  createAssetValidator,
  validateRequest,
  createPublicAsset
);

// District On-Demand Campaigns
router.get(
  '/campaigns',
  authenticateToken,
  authorizeRoles(ROLES.GOVERNMENT, ROLES.SUPER_ADMIN, ROLES.PARTNER),
  getCampaigns
);

router.post(
  '/campaigns',
  authenticateToken,
  authorizeRoles(ROLES.GOVERNMENT, ROLES.SUPER_ADMIN),
  createCampaignValidator,
  validateRequest,
  createCampaign
);

// Farmers Directory in Area
router.get(
  '/farmers',
  authenticateToken,
  authorizeRoles(ROLES.GOVERNMENT, ROLES.SUPER_ADMIN),
  getFarmersInArea
);

export default router;
