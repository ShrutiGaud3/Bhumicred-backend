import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      index: true,
    },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['CREDIT', 'DEBIT'],
      required: true,
    },
    category: {
      type: String,
      enum: [
        'CARBON_CREDIT_SALE',
        'GOVT_SUBSIDY_DIRECT_TRANSFER',
        'MARKETPLACE_PURCHASE',
        'SOIL_TESTING_FEE',
        'TREE_INSURANCE_PREMIUM',
        'INSURANCE_CLAIM_PAYOUT',
        'PROJECT_MILESTONE_GRANT',
        'WALLET_TOPUP',
        'BANK_WITHDRAWAL',
        'REWARD_REFERRAL',
        'OTHER',
      ],
      default: 'OTHER',
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['COMPLETED', 'PENDING', 'FAILED', 'REVERSED'],
      default: 'COMPLETED',
    },
    paymentMethod: {
      type: String,
      enum: [
        'BHIM_UPI',
        'UPI_GPAY',
        'UPI_PHONEPE',
        'UPI_ID',
        'IMPS_DIRECT_BANK',
        'NETBANK',
        'SMART_ESCROW_CONTRACT',
        'SOVEREIGN_TOKEN',
        'INTERNAL_TRANSFER',
      ],
      default: 'BHIM_UPI',
    },
    referenceId: {
      type: String,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.pre('save', function (next) {
  if (!this.transactionId) {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    this.transactionId = `TXN-WAL-${new Date().getFullYear()}-${randomSuffix}`;
  }
  if (!this.referenceId) {
    this.referenceId = `REF-BC-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;
  }
  next();
});

export const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
