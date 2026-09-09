import { body, param, query } from 'express-validator';

export const createProductValidator = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('pricing.mrp').isNumeric().withMessage('MRP must be a valid number'),
  body('pricing.price').isNumeric().withMessage('Selling price must be a valid number'),
  body('description').trim().notEmpty().withMessage('Product description is required'),
];

export const updateProductValidator = [
  param('id').trim().notEmpty().withMessage('Product ID is required'),
];

export const createOrderValidator = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('deliveryAddress.recipientName').trim().notEmpty().withMessage('Recipient name is required'),
  body('deliveryAddress.phone').trim().notEmpty().withMessage('Recipient phone number is required'),
  body('deliveryAddress.addressLine').trim().notEmpty().withMessage('Address line is required'),
  body('deliveryAddress.pincode').trim().notEmpty().withMessage('Postal pincode is required'),
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
