import express from 'express';
import { documentController } from '../controllers/documentController.js';
import {
  uploadDocumentValidator,
  verifyDocumentValidator,
} from '../validators/documentValidators.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// 1. Vault Documents CRUD
router.get('/', authenticateToken, documentController.getUserDocuments);
router.post(
  '/',
  authenticateToken,
  uploadDocumentValidator,
  validateRequest,
  documentController.uploadDocument
);
router.get('/stats', authenticateToken, documentController.getVaultStats);

// 2. Single Document Operations
router.get('/:id', authenticateToken, documentController.getDocumentById);
router.delete('/:id', authenticateToken, documentController.deleteDocument);

// 3. Admin Verification
router.patch(
  '/:id/verify',
  authenticateToken,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.OPERATIONS_ADMIN,
    ROLES.VERIFICATION_ADMIN,
    ROLES.GOVERNMENT_OFFICIAL
  ),
  verifyDocumentValidator,
  validateRequest,
  documentController.verifyDocument
);

export default router;
