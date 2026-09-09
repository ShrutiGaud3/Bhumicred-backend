import { governmentService } from '../services/governmentService.js';

// Schemes Controllers
export const getSchemes = async (req, res, next) => {
  try {
    const schemes = await governmentService.getSchemes(req.query);
    res.status(200).json({
      success: true,
      data: schemes,
    });
  } catch (error) {
    next(error);
  }
};

export const getSchemeById = async (req, res, next) => {
  try {
    const scheme = await governmentService.getSchemeById(req.params.id);
    res.status(200).json({
      success: true,
      data: scheme,
    });
  } catch (error) {
    next(error);
  }
};

export const applyForScheme = async (req, res, next) => {
  try {
    const scheme = await governmentService.applyForScheme(req.params.id, req.user, req.body);
    res.status(201).json({
      success: true,
      message: 'Scheme application submitted successfully',
      data: scheme,
    });
  } catch (error) {
    next(error);
  }
};

// Public Assets Controllers
export const getPublicAssets = async (req, res, next) => {
  try {
    const assets = await governmentService.getPublicAssets(req.query);
    res.status(200).json({
      success: true,
      data: assets,
    });
  } catch (error) {
    next(error);
  }
};

export const createPublicAsset = async (req, res, next) => {
  try {
    const asset = await governmentService.createPublicAsset(req.user, req.body);
    res.status(201).json({
      success: true,
      message: 'Public asset registered successfully',
      data: asset,
    });
  } catch (error) {
    next(error);
  }
};

// Campaigns Controllers
export const getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await governmentService.getCampaigns(req.query);
    res.status(200).json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    next(error);
  }
};

export const createCampaign = async (req, res, next) => {
  try {
    const campaign = await governmentService.createCampaign(req.user, req.body);
    res.status(201).json({
      success: true,
      message: 'District campaign launched successfully',
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

// Farmers Directory in Area
export const getFarmersInArea = async (req, res, next) => {
  try {
    const farmers = await governmentService.getFarmersInArea(req.query);
    res.status(200).json({
      success: true,
      data: farmers,
    });
  } catch (error) {
    next(error);
  }
};

// Government Dashboard Stats
export const getGovernmentDashboardStats = async (req, res, next) => {
  try {
    const stats = await governmentService.getGovernmentDashboardStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
