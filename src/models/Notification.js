import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null indicates a broadcast notification to a targetRole
      index: true,
    },
    targetRole: {
      type: String,
      enum: ['ALL', 'FARMER', 'GOVERNMENT', 'PARTNER', 'SUPER_ADMIN', 'ADMIN_STAFF'],
      default: 'ALL',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['LAND', 'SOIL', 'INSURANCE', 'MARKETPLACE', 'CARBON', 'WALLET', 'SYSTEM', 'SCHEME', 'TASK', 'SUPPORT'],
      default: 'SYSTEM',
    },
    priority: {
      type: String,
      enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
      default: 'NORMAL',
    },
    link: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
