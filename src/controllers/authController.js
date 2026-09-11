import { authService } from '../services/authService.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLE_PERMISSIONS, ROLE_LIST } from '../constants/roles.js';

export const authController = {
  sendOtp: asyncHandler(async (req, res) => {
    const { mobile, role } = req.body;
    const result = await authService.sendOtp(mobile, role);
    return sendSuccess(res, 'OTP sent successfully to registered mobile number', result);
  }),

  verifyOtp: asyncHandler(async (req, res) => {
    const { mobile, otp, role } = req.body;
    const result = await authService.verifyOtp(mobile, otp, role);

    // Set HTTP-only cookie for secure session
    res.cookie('token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',
    });

    return sendSuccess(res, 'Authentication successful', result);
  }),

  register: asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);

    res.cookie('token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    return sendCreated(res, 'Citizen KYC and Application registered successfully', result);
  }),

  loginWithPassword: asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;
    const result = await authService.loginWithPassword(identifier, password);

    res.cookie('token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    return sendSuccess(res, 'Login successful', result);
  }),

  getCurrentUser: asyncHandler(async (req, res) => {
    const user = await authService.getCurrentUser(req.user.id, req.user);
    return sendSuccess(res, 'Current user profile retrieved', user);
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const updatedUser = await authService.updateProfile(req.user.id || req.user._id, req.body);
    return sendSuccess(res, 'User profile updated successfully', updatedUser);
  }),

  logout: asyncHandler(async (req, res) => {
    res.clearCookie('token');
    return sendSuccess(res, 'Logged out successfully');
  }),

  getRoleMatrix: asyncHandler(async (req, res) => {
    return sendSuccess(res, 'Role and Permission RBAC matrix', {
      roles: ROLE_LIST,
      permissionsMap: ROLE_PERMISSIONS,
    });
  }),
};
