import express from 'express';
import { soilController } from '../controllers/soilController.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  validateBookSoilTest,
  validateDispatchVan,
  validateUpdateReport,
} from '../validators/soilValidators.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// Require authentication for all soil endpoints
router.use(authenticateToken);

// Soil Health & Testing Metrics
router.get('/stats', soilController.getSoilStats);

// Soil Test Requests & Reports
router.get('/requests', soilController.getUserSoilTests);
router.post('/requests', validateBookSoilTest, validateRequest, soilController.bookSoilTest);
router.post('/book', validateBookSoilTest, validateRequest, soilController.bookSoilTest);
router.get('/requests/:id', soilController.getSoilTestById);
router.patch(
  '/requests/:id/report',
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.OPERATIONS_ADMIN,
    ROLES.GOVERNMENT,
    ROLES.PARTNER
  ),
  validateUpdateReport,
  validateRequest,
  soilController.updateSoilTestReport
);

// Mobile Soil Testing Van Dispatches (District Level)
router.post(
  '/dispatch-van',
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.OPERATIONS_ADMIN,
    ROLES.GOVERNMENT,
    ROLES.PARTNER,
    ROLES.FARMER
  ),
  validateDispatchVan,
  validateRequest,
  soilController.dispatchMobileVan
);
router.get('/dispatches', soilController.getMobileVanDispatches);

export default router;
