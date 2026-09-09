import mongoose from 'mongoose';

const publicAssetSchema = new mongoose.Schema(
  {
    assetCode: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      default: 'COMMUNITY_GREEN_BELT',
    },
    categoryLabel: {
      type: String,
      default: 'Community Green Belt',
    },
    state: {
      type: String,
      default: 'Gujarat',
    },
    district: {
      type: String,
      default: 'Anand',
    },
    taluka: {
      type: String,
      default: 'Anand',
    },
    gramPanchayat: {
      type: String,
      default: 'Mogri',
    },
    areaHectares: {
      type: Number,
      required: true,
      default: 14.2,
    },
    treeCount: {
      type: Number,
      default: 3450,
    },
    speciesSummary: {
      type: String,
      default: 'Neem (1,400), Shisham (1,200), Peepal (850)',
    },
    healthStatus: {
      type: String,
      enum: ['HEALTHY', 'MONITORED', 'STRESSED', 'DEGRADED'],
      default: 'HEALTHY',
    },
    lastSurvey: {
      type: Date,
      default: Date.now,
    },
    encroachmentStatus: {
      type: String,
      enum: ['CLEAR', 'DISPUTE_FLAGGED', 'ENCROACHMENT_EVICTED'],
      default: 'CLEAR',
    },
    coordinates: {
      type: [[Number]], // Array of [lng, lat] pairs
      default: [
        [72.93, 22.565],
        [72.938, 22.568],
        [72.936, 22.561],
        [72.929, 22.56],
      ],
    },
    managingDepartment: {
      type: String,
      default: 'Gujarat State Social Forestry Division',
    },
  },
  {
    timestamps: true,
  }
);

publicAssetSchema.index({ district: 1, taluka: 1 });
publicAssetSchema.index({ category: 1, healthStatus: 1 });

export const PublicAsset = mongoose.model('PublicAsset', publicAssetSchema);
export default PublicAsset;
