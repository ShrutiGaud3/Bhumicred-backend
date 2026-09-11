import express from 'express';
import { walletController } from '../controllers/walletController.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// All wallet routes require authentication
router.use(authenticateToken);

// User Wallet Endpoints
router.get('/me', walletController.getWallet);
router.post('/topup', walletController.topupWallet);
router.post('/withdraw', walletController.requestWithdrawal);
router.get('/transactions', walletController.getTransactions);
router.get('/transactions/:id', walletController.getTransactionById);

// Admin & Government Treasury Overview
router.get(
  '/admin/overview',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN_STAFF, ROLES.GOVERNMENT),
  walletController.getAdminTreasuryOverview
);

export default router;
