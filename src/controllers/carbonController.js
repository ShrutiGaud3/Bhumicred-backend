import { carbonService } from '../services/carbonService.js';

export const carbonController = {
  getCarbonOpportunities: async (req, res, next) => {
    try {
      const opportunities = await carbonService.getCarbonOpportunities(req.query);
      res.status(200).json({
        success: true,
        data: opportunities,
      });
    } catch (error) {
      next(error);
    }
  },

  requestCarbonAudit: async (req, res, next) => {
    try {
      const audit = await carbonService.requestCarbonAudit(req.user, req.body);
      res.status(201).json({
        success: true,
        message: 'Sentinel-2 Satellite MRV biomass scan scheduled successfully',
        data: audit,
      });
    } catch (error) {
      next(error);
    }
  },

  getUserAudits: async (req, res, next) => {
    try {
      const audits = await carbonService.getUserAudits(
        req.user._id || req.user.id,
        req.user.role,
        req.query
      );
      res.status(200).json({
        success: true,
        data: audits,
      });
    } catch (error) {
      next(error);
    }
  },

  getAuditById: async (req, res, next) => {
    try {
      const audit = await carbonService.getAuditById(
        req.params.id,
        req.user._id || req.user.id,
        req.user.role
      );
      res.status(200).json({
        success: true,
        data: audit,
      });
    } catch (error) {
      next(error);
    }
  },

  processSatelliteMRV: async (req, res, next) => {
    try {
      const audit = await carbonService.processSatelliteMRV(req.params.id, req.user, req.body);
      res.status(200).json({
        success: true,
        message: 'Satellite MRV spectral telemetry processed and verified',
        data: audit,
      });
    } catch (error) {
      next(error);
    }
  },

  mintCarbonCredits: async (req, res, next) => {
    try {
      const credit = await carbonService.mintCarbonCredits(req.user, req.body);
      res.status(201).json({
        success: true,
        message: 'Sovereign Carbon Credits (BHUMI-CO2) minted & bond generated',
        data: credit,
      });
    } catch (error) {
      next(error);
    }
  },

  getUserCredits: async (req, res, next) => {
    try {
      const credits = await carbonService.getUserCredits(
        req.user._id || req.user.id,
        req.user.role,
        req.query
      );
      res.status(200).json({
        success: true,
        data: credits,
      });
    } catch (error) {
      next(error);
    }
  },

  getCreditById: async (req, res, next) => {
    try {
      const credit = await carbonService.getCreditById(req.params.id);
      res.status(200).json({
        success: true,
        data: credit,
      });
    } catch (error) {
      next(error);
    }
  },

  retireCarbonCredits: async (req, res, next) => {
    try {
      const credit = await carbonService.retireCarbonCredits(req.params.id, req.user, req.body);
      res.status(200).json({
        success: true,
        message: 'Carbon credits retired successfully for ESG offsetting',
        data: credit,
      });
    } catch (error) {
      next(error);
    }
  },

  getCarbonStats: async (req, res, next) => {
    try {
      const stats = await carbonService.getCarbonStats(
        req.user._id || req.user.id,
        req.user.role
      );
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default carbonController;
