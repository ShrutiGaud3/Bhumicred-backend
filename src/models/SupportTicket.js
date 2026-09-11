import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    senderName: {
      type: String,
      required: true,
    },
    senderRole: {
      type: String,
      default: 'SUPER_ADMIN',
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const supportTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['LAND_DISPUTE', 'CLAIM_PAYOUT', 'SOIL_SAMPLE', 'MARKETPLACE_ORDER', 'WALLET_KYC', 'PORTAL_BUG', 'GENERAL'],
      default: 'GENERAL',
    },
    subject: {
      type: String,
      default: 'General Grievance / Inquire Request',
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
      default: 'NORMAL',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    responses: [responseSchema],
  },
  {
    timestamps: true,
  }
);

supportTicketSchema.index({ createdAt: -1 });

export const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
export default SupportTicket;
