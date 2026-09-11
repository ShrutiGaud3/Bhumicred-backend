import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  enrollLandInProject,
  updateMilestone,
  getProjectStats,
} from '../controllers/projectController.js';
import {
  createProjectValidator,
  updateProjectValidator,
  enrollLandValidator,
  updateMilestoneValidator,
} from '../validators/projectValidators.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// Public / Authenticated Project Discovery
router.get('/', getProjects);
router.get('/stats', getProjectStats);
router.get('/stats/overview', getProjectStats);
router.get('/:id', getProjectById);

// Farmer Enrollment Route
router.post(
  '/:id/enroll',
  authenticateToken,
  enrollLandValidator,
  validateRequest,
  enrollLandInProject
);

// Government & Admin Project Creation & Editing
router.post(
  '/',
  authenticateToken,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.PROJECT_ADMIN,
    ROLES.GOVERNMENT,
    ROLES.PARTNER
  ),
  createProjectValidator,
  validateRequest,
  createProject
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.PROJECT_ADMIN,
    ROLES.GOVERNMENT,
    ROLES.PARTNER
  ),
  updateProjectValidator,
  validateRequest,
  updateProject
);

// Milestone verification & progress tracking (Supports /milestone/:index and /milestones/:index)
router.patch(
  '/:id/milestones/:milestoneIndex',
  authenticateToken,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.PROJECT_ADMIN,
    ROLES.GOVERNMENT,
    ROLES.PARTNER
  ),
  updateMilestoneValidator,
  validateRequest,
  updateMilestone
);

router.patch(
  '/:id/milestone/:milestoneIndex',
  authenticateToken,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.PROJECT_ADMIN,
    ROLES.GOVERNMENT,
    ROLES.PARTNER
  ),
  updateMilestoneValidator,
  validateRequest,
  updateMilestone
);

router.patch(
  '/:id/milestones',
  authenticateToken,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.PROJECT_ADMIN,
    ROLES.GOVERNMENT,
    ROLES.PARTNER
  ),
  updateMilestone
);

router.patch(
  '/:id/milestone',
  authenticateToken,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.PROJECT_ADMIN,
    ROLES.GOVERNMENT,
    ROLES.PARTNER
  ),
  updateMilestone
);

export default router;
