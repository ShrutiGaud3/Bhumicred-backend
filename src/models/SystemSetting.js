import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'GLOBAL_CONFIG',
    },
    // Governance & Auto-Approval Controls
    autoApproveLowRiskKYC: {
      type: Boolean,
      default: true,
    },
    maxAutoApprovedAcreage: {
      type: Number,
      default: 5.0, // Auto approve plots <= 5 acres if GIS checks match
    },
    requireDualSignoffAboveAmount: {
      type: Number,
      default: 100000, // INR ₹1,00,000
    },

    // Parametric Insurance & Weather Triggers
    satelliteTriggerSensitivity: {
      type: String,
      enum: ['LOW', 'STANDARD', 'HIGH'],
      default: 'STANDARD',
    },
    claimSlaHours: {
      type: Number,
      default: 48,
    },

    // Smart Wallet & Finance
    dailyWithdrawalLimit: {
      type: Number,
      default: 50000, // INR ₹50,000
    },
    platformTreasuryReservePercent: {
      type: Number,
      default: 15, // 15% liquid escrow buffer
    },
    carbonRetirementFeePercent: {
      type: Number,
      default: 2.5, // 2.5% platform fee
    },

    // Security & Access Controls
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    sessionTimeoutMinutes: {
      type: Number,
      default: 120,
    },
    enableBiometricOtp: {
      type: Boolean,
      default: true,
    },

    // Updated By metadata
    lastUpdatedBy: {
      type: String,
      default: 'Super Admin (System)',
    },
  },
  {
    timestamps: true,
  }
);

export const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);
export default SystemSetting;
