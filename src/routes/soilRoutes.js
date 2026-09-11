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
router.get('/stats/overview', soilController.getSoilStats);

// Soil Test Requests & Reports (Supports /requests and /tests)
router.get('/requests', soilController.getUserSoilTests);
router.get('/tests', soilController.getUserSoilTests);
router.post('/requests', validateBookSoilTest, validateRequest, soilController.bookSoilTest);
router.post('/tests', validateBookSoilTest, validateRequest, soilController.bookSoilTest);
router.post('/book', validateBookSoilTest, validateRequest, soilController.bookSoilTest);
router.get('/requests/:id', soilController.getSoilTestById);
router.get('/tests/:id', soilController.getSoilTestById);
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

// Mobile Soil Testing Van Dispatches (District Level - Government & Super Admin only)
router.post(
  '/dispatch-van',
  authorizeRoles(
    ROLES.GOVERNMENT,
    ROLES.SUPER_ADMIN,
    ROLES.OPERATIONS_ADMIN
  ),
  validateDispatchVan,
  validateRequest,
  soilController.dispatchMobileVan
);
router.post(
  '/vans',
  authorizeRoles(
    ROLES.GOVERNMENT,
    ROLES.SUPER_ADMIN,
    ROLES.OPERATIONS_ADMIN
  ),
  validateDispatchVan,
  validateRequest,
  soilController.dispatchMobileVan
);
router.get('/dispatches', soilController.getMobileVanDispatches);
router.get('/vans', soilController.getMobileVanDispatches);

export default router;
