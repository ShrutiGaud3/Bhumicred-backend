import express from 'express';
import { carbonController } from '../controllers/carbonController.js';
import {
  requestCarbonAuditValidator,
  processMrvValidator,
  mintCarbonCreditsValidator,
  retireCarbonCreditValidator,
} from '../validators/carbonValidators.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// 1. Carbon Opportunities & Public Discovery
router.get('/opportunities', carbonController.getCarbonOpportunities);
router.get('/projects', carbonController.getCarbonOpportunities);
router.get('/stats', authenticateToken, carbonController.getCarbonStats);
router.get('/stats/overview', authenticateToken, carbonController.getCarbonStats);

// 2. Satellite MRV Audits
router.post(
  '/audits',
  authenticateToken,
  requestCarbonAuditValidator,
  validateRequest,
  carbonController.requestCarbonAudit
);
router.post(
  '/request-audit',
  authenticateToken,
  requestCarbonAuditValidator,
  validateRequest,
  carbonController.requestCarbonAudit
);
router.get('/audits', authenticateToken, carbonController.getUserAudits);
router.get('/audits/:id', authenticateToken, carbonController.getAuditById);

router.patch(
  '/audits/:id/mrv',
  authenticateToken,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.OPERATIONS_ADMIN,
    ROLES.GOVERNMENT,
    ROLES.PARTNER
  ),
  processMrvValidator,
  validateRequest,
  carbonController.processSatelliteMRV
);

// 3. Carbon Credits Minting & Portfolio
router.post(
  '/credits/mint',
  authenticateToken,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.OPERATIONS_ADMIN,
    ROLES.GOVERNMENT,
    ROLES.PARTNER
  ),
  mintCarbonCreditsValidator,
  validateRequest,
  carbonController.mintCarbonCredits
);
router.post(
  '/mint',
  authenticateToken,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.OPERATIONS_ADMIN,
    ROLES.GOVERNMENT,
    ROLES.PARTNER
  ),
  mintCarbonCreditsValidator,
  validateRequest,
  carbonController.mintCarbonCredits
);

router.get('/credits', authenticateToken, carbonController.getUserCredits);
router.get('/credits/:id', authenticateToken, carbonController.getCreditById);

// 4. ESG Retirement
router.post(
  '/credits/:id/retire',
  authenticateToken,
  retireCarbonCreditValidator,
  validateRequest,
  carbonController.retireCarbonCredits
);
router.post(
  '/retire/:id',
  authenticateToken,
  retireCarbonCreditValidator,
  validateRequest,
  carbonController.retireCarbonCredits
);

export default router;
