import express from 'express';
import { onboardingController } from '../controllers/onboardingController.js';
import {
  submitKycValidator,
  reviewKycValidator,
  getKycQueueValidator,
} from '../validators/onboardingValidators.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// Public / Authenticated Application Submission
router.post('/submit', submitKycValidator, validateRequest, onboardingController.submitKyc);

// Citizen Status Route (supports optional token or query fallback)
router.get('/status', authenticateToken, onboardingController.getMyKycStatus);
router.post('/resubmit/:id', authenticateToken, onboardingController.resubmitKyc);

// Administrative Review & Verification Queue Endpoints
router.get(
  '/admin/queue',
  authenticateToken,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.OPERATIONS_ADMIN,
    ROLES.VERIFICATION_ADMIN,
    ROLES.ADMIN_STAFF
  ),
  getKycQueueValidator,
  validateRequest,
  onboardingController.getAdminQueue
);

router.patch(
  '/admin/review/:id',
  authenticateToken,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.OPERATIONS_ADMIN,
    ROLES.VERIFICATION_ADMIN,
    ROLES.ADMIN_STAFF
  ),
  reviewKycValidator,
  validateRequest,
  onboardingController.reviewKyc
);

export default router;
