import express from 'express';
// BHUMICRED Sovereign Routes
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import onboardingRoutes from './onboardingRoutes.js';
import landRoutes from './landRoutes.js';
import documentRoutes from './documentRoutes.js';
import gisRoutes from './gisRoutes.js';
import insuranceRoutes from './insuranceRoutes.js';

import soilRoutes from './soilRoutes.js';
import marketplaceRoutes from './marketplaceRoutes.js';
import projectRoutes from './projectRoutes.js';
import governmentRoutes from './governmentRoutes.js';
import schemeRoutes from './schemeRoutes.js';
import carbonRoutes from './carbonRoutes.js';
import walletRoutes from './walletRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import adminRoutes from './adminRoutes.js';

const apiRouter = express.Router();

// Base Health Check
apiRouter.use('/health', healthRoutes);

// Phase 2: Authentication, Users & RBAC
apiRouter.use('/auth', authRoutes);

// Phase 3: Citizen & Partner Onboarding & KYC Management
apiRouter.use('/onboarding', onboardingRoutes);

// Phase 4: Land Registry, Cadastral GIS & RoR Integration
apiRouter.use('/lands', landRoutes);

// Phase 5: Sovereign Document Vault & Verification Subsystem
apiRouter.use('/documents', documentRoutes);

// Phase 6: Sovereign Cadastral GIS Engine & Satellite Subsystem
apiRouter.use('/gis', gisRoutes);

// Phase 7: Sovereign Parametric Tree Insurance & Claim Subsystem
apiRouter.use('/insurance', insuranceRoutes);

// Phase 8: Soil Intelligence, Laboratory Testing & Health Card Subsystem
apiRouter.use('/soil', soilRoutes);

// Phase 9: Agri Marketplace, Logistics & Organic Inputs Subsystem
apiRouter.use('/marketplace', marketplaceRoutes);

// Phase 10: Community Sustainability & Agroforestry Projects Subsystem
apiRouter.use('/projects', projectRoutes);

// Phase 11: Government Governance, Public Assets & Schemes Engine
apiRouter.use('/government', governmentRoutes);
apiRouter.use('/schemes', schemeRoutes);

// Phase 12: Sovereign Carbon Registry, Satellite MRV & Green Credits
apiRouter.use('/carbon', carbonRoutes);

// Phase 13: Sovereign Smart Wallet & Payout Subsystem
apiRouter.use('/wallet', walletRoutes);

// Phase 14: Sovereign Notifications, Webhooks & Real-Time Alerts Subsystem
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/support', notificationRoutes);

// Phase 15: System Audit Logs, Global Search & Platform Telemetry
apiRouter.use('/admin', adminRoutes);

export default apiRouter;
