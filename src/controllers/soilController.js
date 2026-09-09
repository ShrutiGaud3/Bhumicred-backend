import { soilService } from '../services/soilService.js';

export const soilController = {
  async bookSoilTest(req, res, next) {
    try {
      const user = {
        _id: req.user.id || req.user._id,
        id: req.user.id || req.user._id,
        name: req.user.fullName || req.user.name || 'Citizen Farmer',
        mobileNumber: req.user.phone || req.user.mobile || '',
        role: req.user.role,
      };
      const result = await soilService.bookSoilTest(user, req.body);
      res.status(201).json({
        success: true,
        message: 'Soil sample collection scheduled & health card generated successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async getUserSoilTests(req, res, next) {
    try {
      const userId = req.user.id || req.user._id;
      const results = await soilService.getUserSoilTests(userId, req.user.role, req.query);
      res.status(200).json({
        success: true,
        count: results.length,
        data: results,
      });
    } catch (err) {
      next(err);
    }
  },

  async getSoilTestById(req, res, next) {
    try {
      const userId = req.user.id || req.user._id;
      const result = await soilService.getSoilTestById(
        req.params.id,
        userId,
        req.user.role
      );
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateSoilTestReport(req, res, next) {
    try {
      const result = await soilService.updateSoilTestReport(
        req.params.id,
        req.user,
        req.body
      );
      res.status(200).json({
        success: true,
        message: 'Soil diagnostic report updated successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async dispatchMobileVan(req, res, next) {
    try {
      const result = await soilService.dispatchMobileVan(req.user, req.body);
      res.status(201).json({
        success: true,
        message: 'Mobile Soil Testing Van successfully scheduled & dispatched',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async getMobileVanDispatches(req, res, next) {
    try {
      const results = await soilService.getMobileVanDispatches();
      res.status(200).json({
        success: true,
        count: results.length,
        data: results,
      });
    } catch (err) {
      next(err);
    }
  },

  async getSoilStats(req, res, next) {
    try {
      const userId = req.user.id || req.user._id;
      const stats = await soilService.getSoilStats(userId, req.user.role);
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default soilController;
