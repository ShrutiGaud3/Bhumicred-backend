import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    actorName: {
      type: String,
      required: true,
      trim: true,
    },
    actorRole: {
      type: String,
      enum: ['SUPER_ADMIN', 'ADMIN_STAFF', 'GOVERNMENT', 'PARTNER', 'FARMER', 'SYSTEM'],
      default: 'SYSTEM',
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    resource: {
      type: String,
      required: true,
      trim: true,
    },
    resourceType: {
      type: String,
      enum: ['LAND', 'CLAIM', 'SOIL', 'WALLET', 'CARBON', 'USER', 'SETTING', 'ORDER', 'AUTH', 'SYSTEM', 'DOCUMENT', 'PROJECT', 'SCHEME'],
      default: 'SYSTEM',
      index: true,
    },
    resourceId: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: 'BHUMICRED/1.0',
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE', 'WARNING'],
      default: 'SUCCESS',
      index: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
