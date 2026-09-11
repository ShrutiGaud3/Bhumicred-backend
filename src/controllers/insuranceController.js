import { insuranceService } from '../services/insuranceService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';

export const insuranceController = {
  calculateQuote: asyncHandler(async (req, res) => {
    const quote = await insuranceService.calculateQuote(req.body);
    return sendSuccess(res, 'Parametric insurance quote calculated', quote);
  }),

  applyPolicy: asyncHandler(async (req, res) => {
    const policy = await insuranceService.applyPolicy(req.user, req.body);
    return sendCreated(res, 'Tree insurance policy activated & bond generated', policy);
  }),

  getInsurancePlans: asyncHandler(async (req, res) => {
    const plans = await insuranceService.getInsurancePlans();
    return sendSuccess(res, 'Insurance plans catalog retrieved successfully', plans);
  }),

  getUserPolicies: asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.user?._id;
    const userRole = req.user?.role || 'FARMER';
    const policies = await insuranceService.getUserPolicies(userId, userRole, req.query);
    return sendSuccess(res, 'Policies retrieved successfully', policies);
  }),

  getPolicyById: asyncHandler(async (req, res) => {
    const policy = await insuranceService.getPolicyById(req.params.id, req.user.id, req.user.role);
    return sendSuccess(res, 'Policy details retrieved successfully', policy);
  }),

  raiseClaim: asyncHandler(async (req, res) => {
    const claim = await insuranceService.raiseClaim(req.user, req.body);
    return sendCreated(res, 'Insurance claim registered & dispatched for inspection', claim);
  }),

  getUserClaims: asyncHandler(async (req, res) => {
    const claims = await insuranceService.getUserClaims(req.user.id, req.user.role, req.query);
    return sendSuccess(res, 'Claims retrieved successfully', claims);
  }),

  getClaimById: asyncHandler(async (req, res) => {
    const claim = await insuranceService.getClaimById(req.params.id, req.user.id, req.user.role);
    return sendSuccess(res, 'Claim details retrieved successfully', claim);
  }),

  updateClaimStatus: asyncHandler(async (req, res) => {
    const updated = await insuranceService.updateClaimStatus(req.params.id, req.user, req.body);
    return sendSuccess(res, 'Claim milestone & status updated', updated);
  }),

  getInsuranceStats: asyncHandler(async (req, res) => {
    const stats = await insuranceService.getInsuranceStats(req.user.id, req.user.role);
    return sendSuccess(res, 'Insurance analytics & subsidy metrics retrieved', stats);
  }),
};

export default insuranceController;
