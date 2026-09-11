import { walletService } from '../services/walletService.js';

export const walletController = {
  getWallet: async (req, res, next) => {
    try {
      const wallet = await walletService.getWallet(req.user._id || req.user.id, req.user);
      res.status(200).json({
        success: true,
        data: wallet,
      });
    } catch (error) {
      next(error);
    }
  },

  topupWallet: async (req, res, next) => {
    try {
      const result = await walletService.topupWallet(req.user._id || req.user.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Wallet topped up successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  requestWithdrawal: async (req, res, next) => {
    try {
      const result = await walletService.requestWithdrawal(req.user._id || req.user.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Withdrawal payout processed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  getTransactions: async (req, res, next) => {
    try {
      const result = await walletService.getTransactions(req.user._id || req.user.id, req.query);
      res.status(200).json({
        success: true,
        data: result.transactions,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  getTransactionById: async (req, res, next) => {
    try {
      const txn = await walletService.getTransactionById(req.user._id || req.user.id, req.params.id);
      res.status(200).json({
        success: true,
        data: txn,
      });
    } catch (error) {
      next(error);
    }
  },

  getAdminTreasuryOverview: async (req, res, next) => {
    try {
      const treasury = await walletService.getAdminTreasuryOverview();
      res.status(200).json({
        success: true,
        data: treasury,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default walletController;
