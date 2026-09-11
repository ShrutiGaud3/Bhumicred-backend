import { body, param, query } from 'express-validator';

export const createProductValidator = [
  body('name').optional().trim(),
  body('category').optional().trim(),
  body('pricing.mrp').optional().isNumeric(),
  body('pricing.price').optional().isNumeric(),
  body('mrp').optional().isNumeric(),
  body('price').optional().isNumeric(),
  body('description').optional().trim(),
];

export const updateProductValidator = [
  param('id').trim().notEmpty().withMessage('Product ID is required'),
];

export const createOrderValidator = [
  body('items').optional().isArray(),
  body('deliveryAddress.recipientName').optional().trim(),
  body('deliveryAddress.phone').optional().trim(),
  body('deliveryAddress.addressLine').optional().trim(),
  body('deliveryAddress.pincode').optional().trim(),
];

export const updateOrderStatusValidator = [
  param('id').trim().notEmpty().withMessage('Order ID is required'),
  body('status')
    .optional()
    .isIn([
      'PLACED',
      'CONFIRMED',
      'PACKING',
      'DISPATCHED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ])
    .withMessage('Invalid order status'),
];
