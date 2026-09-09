import express from 'express';
import {
  getSchemes,
  getSchemeById,
  applyForScheme,
} from '../controllers/governmentController.js';
import { applySchemeValidator } from '../validators/governmentValidators.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public / Authenticated Schemes Catalog
router.get('/', getSchemes);
router.get('/:id', getSchemeById);

// Farmer DBT Application
router.post(
  '/:id/apply',
  authenticateToken,
  applySchemeValidator,
  validateRequest,
  applyForScheme
);

export default router;
