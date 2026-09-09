import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    sku: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'SEEDS',
        'BIO_FERTILIZERS',
        'SOLAR_IRRIGATION',
        'SAPLINGS',
        'FARM_EQUIPMENT',
        'ORGANIC_PESTICIDES',
        'SOIL_AMENDMENTS',
      ],
      default: 'BIO_FERTILIZERS',
    },
    categoryLabel: {
      type: String,
      default: '',
    },
    seller: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, required: true },
      organization: { type: String, default: 'Sovereign Agro Federation' },
      rating: { type: Number, default: 4.8 },
      isVerified: { type: Boolean, default: true },
    },
    pricing: {
      mrp: { type: Number, required: true },
      price: { type: Number, required: true },
      discountPercent: { type: Number, default: 0 },
      taxPercent: { type: Number, default: 5 },
    },
    inventory: {
      stock: { type: Number, default: 100 },
      unit: { type: String, default: 'UNIT' }, // KG, LITER, PACK_25, UNIT, BAG
      lowStockThreshold: { type: Number, default: 10 },
      inStock: { type: Boolean, default: true },
    },
    ratings: {
      average: { type: Number, default: 4.8 },
      count: { type: Number, default: 24 },
    },
    specs: {
      type: Map,
      of: String,
      default: {},
    },
    description: {
      type: String,
      required: true,
    },
    benefits: [
      {
        type: String,
      },
    ],
    usageGuide: {
      type: String,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    deliveryEstimate: {
      type: String,
      default: '3-5 Business Days',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'ARCHIVED'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ category: 1, status: 1 });
productSchema.index({ name: 'text', description: 'text' });

export const Product = mongoose.model('Product', productSchema);
export default Product;
