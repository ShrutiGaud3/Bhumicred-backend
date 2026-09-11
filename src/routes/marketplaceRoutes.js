import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getMarketplaceStats,
} from '../controllers/marketplaceController.js';
import {
  createProductValidator,
  updateProductValidator,
  createOrderValidator,
  updateOrderStatusValidator,
} from '../validators/marketplaceValidators.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// Public / Authenticated Product Catalog
router.get('/products', getProducts);
router.get('/products/:id', getProductById);

// Protected Order Routes (Farmer / Any authenticated user)
router.post('/orders', authenticateToken, createOrderValidator, validateRequest, createOrder);
router.get('/orders', authenticateToken, getUserOrders);
router.get('/orders/:id', authenticateToken, getOrderById);

// Partner / Admin / Logistics Order Updates
router.patch(
  '/orders/:id/status',
  authenticateToken,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.OPERATIONS_ADMIN,
    ROLES.PARTNER
  ),
  updateOrderStatusValidator,
  validateRequest,
  updateOrderStatus
);

// Admin & Vendor Product Management
router.post(
  '/products',
  authenticateToken,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.OPERATIONS_ADMIN,
    ROLES.GOVERNMENT,
    ROLES.PARTNER
  ),
  createProductValidator,
  validateRequest,
  createProduct
);

router.put(
  '/products/:id',
  authenticateToken,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.OPERATIONS_ADMIN,
    ROLES.GOVERNMENT,
    ROLES.PARTNER
  ),
  updateProductValidator,
  validateRequest,
  updateProduct
);

// Marketplace Overview Stats (Admin & Partner)
router.get(
  '/stats',
  authenticateToken,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.OPERATIONS_ADMIN,
    ROLES.FINANCE_ADMIN,
    ROLES.PARTNER
  ),
  getMarketplaceStats
);

router.get(
  '/stats/overview',
  authenticateToken,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.OPERATIONS_ADMIN,
    ROLES.FINANCE_ADMIN,
    ROLES.PARTNER
  ),
  getMarketplaceStats
);

export default router;
