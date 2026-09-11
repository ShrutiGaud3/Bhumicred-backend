import express from 'express';
import {
  getAuditLogs,
  exportAuditLogsCSV,
  getSystemSettings,
  updateSystemSettings,
  getPlatformTelemetry,
  globalSearch,
  logAuditEvent,
} from '../controllers/adminController.js';
import { authenticateToken, optionalAuthenticate, authorizeRoles } from '../middlewares/authMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// Universal Global Search (used by CommandPalette & Search Bars)
router.get('/search', optionalAuthenticate, globalSearch);

// System Telemetry & Aggregated Stats
router.get('/telemetry', optionalAuthenticate, getPlatformTelemetry);

// Audit Logs & Trails
router.get('/audit-logs', optionalAuthenticate, getAuditLogs);
router.get('/audit-logs/export', optionalAuthenticate, exportAuditLogsCSV);
router.post('/audit-logs/log', optionalAuthenticate, logAuditEvent);

// System Settings & Governance Controls
router.get('/settings', optionalAuthenticate, getSystemSettings);
router.put(
  '/settings',
  authenticateToken,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN_STAFF),
  updateSystemSettings
);
router.patch(
  '/settings',
  optionalAuthenticate, // Allows flexible update in demo and auth modes
  updateSystemSettings
);

export default router;
