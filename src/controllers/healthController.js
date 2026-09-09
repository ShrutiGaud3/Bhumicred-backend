import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getHealthStatus = (req, res) => {
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbStatus = dbStateMap[mongoose.connection.readyState] || 'unknown';

  const healthData = {
    status: 'healthy',
    service: 'BHUMICRED Sovereign Agro-GIS & Carbon Credit Backend',
    version: '1.0.0',
    environment: env.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      name: mongoose.connection.name || 'bhumicred',
    },
    platformRates: {
      gstRate: `${env.GST_RATE_PERCENT}%`,
      landRegistrationRatePerAcre: `₹${env.LAND_REGISTRATION_RATE_PER_ACRE} / Acre`,
      treeInsuranceBaseRate: `₹${env.TREE_INSURANCE_BASE_RATE_PER_TREE} / Tree / Year`,
    },
    systemModules: {
      authenticationRBAC: 'active',
      onboardingWorkflow: 'active',
      landManagementGIS: 'active',
      treeInsuranceAndClaims: 'active',
      soilTestingLabManagement: 'active',
      marketplaceAndOrders: 'active',
      carbonCreditWorkflow: 'active',
      walletAndBilling: 'active',
      notificationsAndSupport: 'active',
      adminAuditEngine: 'active',
    },
  };

  return sendSuccess(res, 'BHUMICRED Sovereign API is operational and healthy', healthData);
};
