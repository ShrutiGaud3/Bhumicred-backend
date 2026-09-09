import mongoose from 'mongoose';

const governmentCampaignSchema = new mongoose.Schema(
  {
    campaignCode: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      default: 'TREE_PLANTATION_DRIVE',
    },
    categoryLabel: {
      type: String,
      default: 'Tree Plantation Drive',
    },
    targetQuota: {
      type: String,
      default: '50,000 Saplings',
    },
    targetCount: {
      type: Number,
      required: true,
      default: 50000,
    },
    achievedCount: {
      type: Number,
      default: 0,
    },
    budget: {
      allocated: { type: Number, default: 2500000 },
      spent: { type: Number, default: 1820000 },
      currency: { type: String, default: 'INR' },
    },
    status: {
      type: String,
      enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'],
      default: 'IN_PROGRESS',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    participatingFarmersCount: {
      type: Number,
      default: 0,
    },
    leadDepartment: {
      type: String,
      default: 'Gujarat State Social Forestry Division',
    },
    district: {
      type: String,
      default: 'Anand',
    },
  },
  {
    timestamps: true,
  }
);

governmentCampaignSchema.index({ status: 1, district: 1 });

export const GovernmentCampaign = mongoose.model('GovernmentCampaign', governmentCampaignSchema);
export default GovernmentCampaign;
