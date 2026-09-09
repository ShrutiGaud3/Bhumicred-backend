import mongoose from 'mongoose';

const schemeApplicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmerName: {
      type: String,
      required: true,
    },
    farmerMobile: {
      type: String,
    },
    landId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Land',
    },
    landName: {
      type: String,
    },
    surveyNumber: {
      type: String,
    },
    areaAcres: {
      type: Number,
      default: 1.0,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'APPROVED', 'DISBURSED', 'REJECTED'],
      default: 'SUBMITTED',
    },
    subsidyAmount: {
      type: Number,
      default: 0,
    },
    disbursementRef: {
      type: String,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const schemeSchema = new mongoose.Schema(
  {
    schemeCode: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Scheme title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    authority: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    benefits: {
      type: String,
      required: true,
    },
    subsidyPercent: {
      type: Number,
      default: 50,
    },
    subsidyMaxAmount: {
      type: Number,
      default: 25000,
    },
    eligibility: {
      type: String,
      required: true,
    },
    requiredDocuments: [
      {
        type: String,
      },
    ],
    deadline: {
      type: String,
      default: 'Rolling Continuous Enrollment',
    },
    geography: {
      type: String,
      default: 'Gujarat / National',
    },
    category: {
      type: String,
      required: true,
      enum: [
        'DIRECT_INCOME',
        'ORGANIC_FARMING',
        'AGROFORESTRY_SUBSIDY',
        'SOLAR_IRRIGATION',
        'CROP_INSURANCE',
        'SOIL_HEALTH',
        'SUSTAINABLE_AGRICULTURE',
      ],
      default: 'DIRECT_INCOME',
    },
    categoryLabel: {
      type: String,
      default: 'Direct Income Support',
    },
    applications: [schemeApplicationSchema],
    totalDisbursedFunds: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'CLOSED'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

schemeSchema.index({ category: 1, status: 1 });

export const Scheme = mongoose.model('Scheme', schemeSchema);
export default Scheme;
