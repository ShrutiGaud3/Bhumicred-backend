import { gisService } from '../services/gisService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';

export const gisController = {
  getGisLayers: asyncHandler(async (req, res) => {
    const layers = await gisService.getGisLayers(req.query);
    return sendSuccess(res, 'GIS spatial layers retrieved successfully', layers);
  }),

  getParcelSpatialData: asyncHandler(async (req, res) => {
    const parcelData = await gisService.getParcelSpatialData(req.params.landId);
    return sendSuccess(res, 'Parcel GIS geometry & NDVI audit retrieved', parcelData);
  }),

  analyzePolygon: asyncHandler(async (req, res) => {
    const analysis = await gisService.analyzePolygon(req.body.coordinates);
    return sendSuccess(res, 'Polygon geometry analyzed with geodesic calculations', analysis);
  }),

  getMacroMetrics: asyncHandler(async (req, res) => {
    const metrics = await gisService.getMacroGisMetrics(req.query.district);
    return sendSuccess(res, 'Macro GIS & satellite metrics retrieved successfully', metrics);
  }),

  createGisLayer: asyncHandler(async (req, res) => {
    const layer = await gisService.createGisLayer(req.body);
    return sendCreated(res, 'GIS spatial layer created successfully', layer);
  }),
};

export default gisController;
