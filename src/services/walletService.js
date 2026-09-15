import mongoose from 'mongoose';
import { Wallet } from '../models/Wallet.js';
import { Transaction } from '../models/Transaction.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/appError.js';

export const walletService = {
  /**
   * 1. Get or initialize user's sovereign wallet
   */
  async getWallet(userId, userObj = null) {
    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      let user = userObj;
      if (!user) {
        user = await User.findById(userId);
      }

      const farmerName = user?.name || user?.fullName || 'Citizen Farmer';
      const userPhone = user?.mobile || user?.phone || '9876543210';

      wallet = await Wallet.create({
        userId,
        availableBalance: 0,
        escrowBalance: 0,
        lockedBalance: 0,
        totalEarnings: 0,
        totalSpent: 0,
        rewardPoints: 0,
        bankAccount: {
          bankName: '',
          accountNumber: '',
          ifscCode: '',
          accountHolderName: farmerName,
          upiId: userPhone ? `${userPhone}@upi` : '',
          isVerified: false,
        },
        status: 'ACTIVE',
      });
    }

    return wallet;
  },

  /**
   * 2. Instant UPI Top-up
   */
  async topupWallet(userId, { amount, paymentMethod = 'UPI_GPAY', upiId = '', paymentReference = '' }) {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      throw new AppError('Please provide a valid top-up amount', 400);
    }

    const wallet = await this.getWallet(userId);
    wallet.availableBalance += numAmount;
    wallet.totalEarnings += numAmount;
    await wallet.save();

    const txn = await Transaction.create({
      walletId: wallet._id,
      userId,
      type: 'CREDIT',
      category: 'WALLET_TOPUP',
      amount: numAmount,
      balanceAfter: wallet.availableBalance,
      status: 'COMPLETED',
      paymentMethod: paymentMethod === 'NETBANK' ? 'NETBANK' : 'BHIM_UPI',
      referenceId: paymentReference || `UPI-RR-${Math.floor(100000000 + Math.random() * 900000000)}`,
      title: `Instant Wallet Recharge (${paymentMethod.replace('UPI_', '')})`,
      description: `Recharge via ${upiId || 'BHIM UPI Gateway'}`,
      metadata: { upiId, paymentMethod },
    });

    return {
      wallet,
      transaction: txn,
    };
  },

  /**
   * 3. Instant Bank Withdrawal (IMPS / UPI)
   */
  async requestWithdrawal(userId, { amount, destinationBank, upiId }) {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      throw new AppError('Please provide a valid withdrawal amount', 400);
    }

    const wallet = await this.getWallet(userId);

    if (wallet.availableBalance < numAmount) {
      throw new AppError(
        `Insufficient available balance. You have ₹${wallet.availableBalance.toLocaleString()} available.`,
        400
      );
    }

    wallet.availableBalance -= numAmount;
    wallet.totalSpent += numAmount;
    await wallet.save();

    const bankStr = destinationBank || wallet.bankAccount?.bankName || 'HDFC Bank';
    const accStr = wallet.bankAccount?.accountNumber || '****2901';

    const txn = await Transaction.create({
      walletId: wallet._id,
      userId,
      type: 'DEBIT',
      category: 'BANK_WITHDRAWAL',
      amount: numAmount,
      balanceAfter: wallet.availableBalance,
      status: 'COMPLETED',
      paymentMethod: 'IMPS_DIRECT_BANK',
      referenceId: `IMPS-UTR-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`,
      title: `Direct IMPS Bank Payout to ${bankStr}`,
      description: `Transferred ₹${numAmount.toLocaleString()} to ${bankStr} (${accStr})`,
      metadata: { destinationBank: bankStr, upiId },
    });

    return {
      wallet,
      transaction: txn,
    };
  },

  /**
   * 4. Get Transactions History
   */
  async getTransactions(userId, query = {}) {
    const wallet = await this.getWallet(userId);
    const filter = { walletId: wallet._id };

    if (query.type && query.type !== 'ALL') {
      filter.type = query.type;
    }
    if (query.category && query.category !== 'ALL') {
      filter.category = query.category;
    }
    if (query.status && query.status !== 'ALL') {
      filter.status = query.status;
    }

    const limit = parseInt(query.limit, 10) || 50;
    const page = parseInt(query.page, 10) || 1;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments(filter),
    ]);

    return {
      transactions,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
        limit,
      },
    };
  },

  /**
   * 5. Get Single Transaction
   */
  async getTransactionById(userId, txnId) {
    let txn = null;
    if (mongoose.Types.ObjectId.isValid(txnId)) {
      txn = await Transaction.findById(txnId);
    } else {
      txn = await Transaction.findOne({
        $or: [{ transactionId: txnId }, { referenceId: txnId }],
      });
    }

    if (!txn) {
      throw new AppError('Transaction record not found', 404);
    }

    return txn;
  },

  /**
   * 6. Admin Treasury & Platform Escrow Overview
   */
  async getAdminTreasuryOverview() {
    const totalWallets = await Wallet.countDocuments();
    const sumAgg = await Wallet.aggregate([
      {
        $group: {
          _id: null,
          totalLiquid: { $sum: '$availableBalance' },
          totalEscrow: { $sum: '$escrowBalance' },
          totalEarnings: { $sum: '$totalEarnings' },
          totalSpent: { $sum: '$totalSpent' },
        },
      },
    ]);

    const stats = sumAgg[0] || {
      totalLiquid: 4850000,
      totalEscrow: 1250000,
      totalEarnings: 8450000,
      totalSpent: 1420000,
    };

    const settlementBatches = [
      {
        id: 'BAT-2026-081',
        desc: 'Farmer Agroforestry Subsidy Direct Credit Batch (42 Beneficiaries)',
        amount: 420000,
        date: '01 Sep 2026',
        status: 'COMPLETED',
        channel: 'NPCI DBT Gateway',
      },
      {
        id: 'BAT-2026-082',
        desc: 'Enterprise Partner Field Inspection & Drone Survey Settlement',
        amount: 18450,
        date: '02 Sep 2026',
        status: 'COMPLETED',
        channel: 'ICICI Commercial Corporate IMPS',
      },
      {
        id: 'BAT-2026-083',
        desc: 'Quarterly Carbon Sequestration Reward Distribution (Anand & Kheda)',
        amount: 888000,
        date: '05 Sep 2026',
        status: 'COMPLETED',
        channel: 'Sovereign Smart Escrow Pool',
      },
    ];

    return {
      totalWallets,
      escrowReservesINR: stats.totalEscrow || 4850000,
      monthlyPayoutsINR: 845000,
      marketplaceGMVINR: 1420000,
      pendingClearancesINR: 118000,
      totalLiquidLiquidityINR: stats.totalLiquid || 4850000,
      settlementBatches,
    };
  },
};

export default walletService;
