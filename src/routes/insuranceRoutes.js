import express from 'express';
import { insuranceController } from '../controllers/insuranceController.js';
import {
  calculateQuoteValidator,
  applyPolicyValidator,
  raiseClaimValidator,
  updateClaimStatusValidator,
} from '../validators/insuranceValidators.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// 1. Live Parametric Quote Calculator (Public / Citizen)
router.post('/quote', calculateQuoteValidator, validateRequest, insuranceController.calculateQuote);
router.get('/stats', authenticateToken, insuranceController.getInsuranceStats);
router.get('/stats/overview', authenticateToken, insuranceController.getInsuranceStats);
router.get('/plans', insuranceController.getInsurancePlans);

// 2. Policies CRUD
router.get('/policies', authenticateToken, insuranceController.getUserPolicies);
router.post(
  '/policies',
  authenticateToken,
  applyPolicyValidator,
  validateRequest,
  insuranceController.applyPolicy
);
router.get('/policies/:id', authenticateToken, insuranceController.getPolicyById);

// 3. Claims Lifecycle
router.get('/claims', authenticateToken, insuranceController.getUserClaims);
router.post(
  '/claims',
  authenticateToken,
  raiseClaimValidator,
  validateRequest,
  insuranceController.raiseClaim
);
router.get('/claims/:id', authenticateToken, insuranceController.getClaimById);
router.patch(
  '/claims/:id/status',
  authenticateToken,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.OPERATIONS_ADMIN,
    ROLES.VERIFICATION_ADMIN,
    ROLES.GOVERNMENT,
    ROLES.PARTNER
  ),
  updateClaimStatusValidator,
  validateRequest,
  insuranceController.updateClaimStatus
);

export default router;
