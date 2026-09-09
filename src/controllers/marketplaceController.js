import { marketplaceService } from '../services/marketplaceService.js';

export const getProducts = async (req, res, next) => {
  try {
    const result = await marketplaceService.getProducts(req.query);
    res.status(200).json({
      success: true,
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await marketplaceService.getProductById(req.params.id);
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await marketplaceService.createProduct(req.user, req.body);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await marketplaceService.updateProduct(req.params.id, req.user, req.body);
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const order = await marketplaceService.createOrder(req.user, req.body);
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await marketplaceService.getUserOrders(req.user._id || req.user.id, req.user.role, req.query);
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await marketplaceService.getOrderById(
      req.params.id,
      req.user._id || req.user.id,
      req.user.role
    );
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await marketplaceService.updateOrderStatus(req.params.id, req.user, req.body);
    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getMarketplaceStats = async (req, res, next) => {
  try {
    const stats = await marketplaceService.getMarketplaceStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
