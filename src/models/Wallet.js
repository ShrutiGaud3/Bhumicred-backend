import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    walletAddress: {
      type: String,
      unique: true,
      index: true,
    },
    availableBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    escrowBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    lockedBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    rewardPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    bankAccount: {
      bankName: { type: String, default: 'HDFC Bank' },
      accountNumber: { type: String, default: 'XXXXXX2901' },
      ifscCode: { type: String, default: 'HDFC0001044' },
      accountHolderName: { type: String, default: '' },
      upiId: { type: String, default: '' },
      isVerified: { type: Boolean, default: true },
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'FROZEN', 'RESTRICTED'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

walletSchema.pre('save', function (next) {
  if (!this.walletAddress) {
    const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase();
    this.walletAddress = `BC-WAL-${new Date().getFullYear()}-${randomHex}`;
  }
  next();
});

export const Wallet = mongoose.model('Wallet', walletSchema);
export default Wallet;
