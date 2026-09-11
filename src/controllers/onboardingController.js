import { onboardingService } from '../services/onboardingService.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';

export const onboardingController = {
  async submitKyc(req, res, next) {
    try {
      const result = await onboardingService.submitApplication(req.body, req.user);
      return sendCreated(
        res,
        'KYC application submitted successfully and sent to Admin Approvals Queue',
        result
      );
    } catch (error) {
      next(error);
    }
  },

  async getMyKycStatus(req, res, next) {
    try {
      const result = await onboardingService.getUserApplication(
        req.user?.id,
        req.user?.mobile || req.query.mobile
      );
      return sendSuccess(res, 'KYC application status fetched successfully', result || {});
    } catch (error) {
      next(error);
    }
  },

  async getAdminQueue(req, res, next) {
    try {
      const result = await onboardingService.getAdminQueue(req.query);
      return sendSuccess(
        res,
        `Retrieved ${result.length} KYC application items in verification queue`,
        result
      );
    } catch (error) {
      next(error);
    }
  },

  async reviewKyc(req, res, next) {
    try {
      const result = await onboardingService.reviewApplication(req.params.id, {
        status: req.body.status,
        reviewNotes: req.body.reviewNotes,
        landData: req.body.landData,
        reviewerId: req.user?.id,
        reviewerName: req.user?.name || 'Super Admin Officer',
      });

      return sendSuccess(
        res,
        `Application ${req.params.id} has been marked as ${req.body.status}`,
        result
      );
    } catch (error) {
      next(error);
    }
  },

  async resubmitKyc(req, res, next) {
    try {
      const result = await onboardingService.resubmitApplication(req.params.id, req.body);
      return sendSuccess(
        res,
        'KYC application resubmitted successfully for administrative review',
        result
      );
    } catch (error) {
      next(error);
    }
  },
};
