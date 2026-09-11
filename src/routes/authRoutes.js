import express from 'express';
import { authController } from '../controllers/authController.js';
import {
  sendOtpValidator,
  verifyOtpValidator,
  registerValidator,
  passwordLoginValidator,
} from '../validators/authValidators.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public Authentication Routes
router.post('/send-otp', sendOtpValidator, validateRequest, authController.sendOtp);
router.post('/verify-otp', verifyOtpValidator, validateRequest, authController.verifyOtp);
router.post('/register', registerValidator, validateRequest, authController.register);
router.post('/login', passwordLoginValidator, validateRequest, authController.loginWithPassword);
router.get('/roles-matrix', authController.getRoleMatrix);

// Protected Authentication Routes
router.get('/me', authenticateToken, authController.getCurrentUser);
router.put('/profile', authenticateToken, authController.updateProfile);
router.post('/logout', authenticateToken, authController.logout);

export default router;
