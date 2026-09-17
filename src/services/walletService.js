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
   * 6. Admin Treasury & Platform Escrow Overview (from MongoDB)
   */
  async getAdminTreasuryOverview() {
    const totalWallets = await Wallet.countDocuments();
    const sumAgg = await Wallet.aggregate([
      {
        $group: {
          _id: null,
          totalLiquid: { $sum: '$availableBalance' },
          totalEscrow: { $sum: '$escrowBalance' },
          totalLocked: { $sum: '$lockedBalance' },
          totalEarnings: { $sum: '$totalEarnings' },
          totalSpent: { $sum: '$totalSpent' },
        },
      },
    ]);

    const stats = sumAgg[0] || {
      totalLiquid: 0,
      totalEscrow: 0,
      totalLocked: 0,
      totalEarnings: 0,
      totalSpent: 0,
    };

    // Calculate actual 30-day monthly payouts from Transaction collection
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyPayoutAgg = await Transaction.aggregate([
      {
        $match: {
          type: 'DEBIT',
          status: 'COMPLETED',
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: null,
          totalMonthlyPayout: { $sum: '$amount' },
        },
      },
    ]);
    const monthlyPayouts = monthlyPayoutAgg[0]?.totalMonthlyPayout ?? stats.totalSpent ?? 0;

    // Marketplace GMV from real completed purchases
    const gmvAgg = await Transaction.aggregate([
      {
        $match: {
          category: 'MARKETPLACE_PURCHASE',
          status: 'COMPLETED',
        },
      },
      {
        $group: {
          _id: null,
          totalGMV: { $sum: '$amount' },
        },
      },
    ]);
    const marketplaceGMV = gmvAgg[0]?.totalGMV ?? 0;

    // Query real settlement batches / payout transactions from database
    const recentTxns = await Transaction.find({
      type: { $in: ['DEBIT', 'CREDIT'] },
    })
      .sort({ createdAt: -1 })
      .limit(10);

    const settlementBatches = recentTxns.map((tx) => ({
      id: tx.transactionId || tx.referenceId || `BAT-${tx._id.toString().slice(-6).toUpperCase()}`,
      desc: tx.title || tx.description || 'Treasury Disbursal Settlement',
      amount: tx.amount || 0,
      date: new Date(tx.createdAt || tx.timestamp).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      status: tx.status || 'COMPLETED',
      channel: tx.paymentMethod ? tx.paymentMethod.replace(/_/g, ' ') : 'NPCI DBT Gateway',
    }));

    return {
      totalWallets,
      escrowReservesINR: stats.totalEscrow || 0,
      monthlyPayoutsINR: monthlyPayouts || 0,
      marketplaceGMVINR: marketplaceGMV || 0,
      pendingClearancesINR: stats.totalLocked || 0,
      totalLiquidLiquidityINR: stats.totalLiquid || 0,
      settlementBatches,
    };
  },
};

export default walletService;
