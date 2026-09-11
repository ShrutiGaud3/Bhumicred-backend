import adminService from '../services/adminService.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const { role, resourceType, status, search, page = 1, limit = 50 } = req.query;
    const result = await adminService.getAuditLogs(
      { role, resourceType, status, search },
      parseInt(page, 10),
      parseInt(limit, 10)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const exportAuditLogsCSV = async (req, res, next) => {
  try {
    const { role, resourceType, status, search } = req.query;
    const csvContent = await adminService.exportAuditLogsCSV({ role, resourceType, status, search });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="bhumicred_audit_trail_${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

export const getSystemSettings = async (req, res, next) => {
  try {
    const settings = await adminService.getSystemSettings();
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSystemSettings = async (req, res, next) => {
  try {
    const actorName = req.user?.name || req.user?.mobile || 'Super Admin';
    const settings = await adminService.updateSystemSettings(req.body, actorName);

    res.json({
      success: true,
      message: 'System settings updated successfully',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const getPlatformTelemetry = async (req, res, next) => {
  try {
    const telemetry = await adminService.getPlatformTelemetry();
    res.json({
      success: true,
      data: telemetry,
    });
  } catch (error) {
    next(error);
  }
};

export const globalSearch = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;
    const results = await adminService.globalSearch(q, parseInt(limit, 10));

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

export const logAuditEvent = async (req, res, next) => {
  try {
    const { action, resource, resourceType, resourceId, details, status } = req.body;
    const actorId = req.user?._id || req.user?.id || null;
    const actorName = req.user?.name || req.user?.mobile || 'User';
    const actorRole = req.user?.role || 'FARMER';
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

    const log = await adminService.logAction({
      actorId,
      actorName,
      actorRole,
      action,
      resource,
      resourceType,
      resourceId,
      ipAddress,
      userAgent: req.headers['user-agent'] || 'BHUMICRED/1.0',
      status: status || 'SUCCESS',
      details: details || {},
    });

    res.status(201).json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};
