import { landService } from '../services/landService.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';

export const landController = {
  /**
   * POST /api/v1/lands
   * Register a new land parcel
   */
  async registerLand(req, res, next) {
    try {
      const userId = req.user?.id || req.user?._id;
      const land = await landService.registerLand(userId, req.body, req.user);
      return sendCreated(res, 'Land parcel registered successfully and queued for cadastral verification.', land);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/lands/my
   * Get all registered lands for logged-in user
   */
  async getMyLands(req, res, next) {
    try {
      const userId = req.user?.id || req.user?._id;
      const result = await landService.getMyLands(userId, req.query);
      return sendSuccess(res, 'Registered land parcels retrieved successfully.', result.lands, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/lands/stats/gis
   * Aggregated GIS and acreage statistics
   */
  async getGisStats(req, res, next) {
    try {
      const stats = await landService.getGisStats();
      return sendSuccess(res, 'GIS stats retrieved successfully.', stats);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/lands/:id
   * Get land details by ID
   */
  async getLandById(req, res, next) {
    try {
      const userId = req.user?.id || req.user?._id;
      const land = await landService.getLandById(req.params.id, userId, req.user?.role);
      return sendSuccess(res, 'Land details retrieved successfully.', land);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/lands
   * Admin / Officer search & filter all lands
   */
  async getAllLands(req, res, next) {
    try {
      const result = await landService.getAllLands(req.query, req.user?.role);
      return sendSuccess(res, 'All cadastral registry lands retrieved successfully.', result.lands, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/lands/:id/verify
   * Admin / Officer verify and review land parcel
   */
  async verifyLand(req, res, next) {
    try {
      const land = await landService.verifyLand(req.params.id, req.user, req.body);
      return sendSuccess(res, 'Land verification status updated successfully.', land);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/lands/:id
   * Update land parcel details
   */
  async updateLand(req, res, next) {
    try {
      const userId = req.user?.id || req.user?._id;
      const land = await landService.updateLand(req.params.id, userId, req.body, req.user?.role);
      return sendSuccess(res, 'Land details updated successfully.', land);
    } catch (error) {
      next(error);
    }
  },
};

export default landController;
