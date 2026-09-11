import mongoose from 'mongoose';

const enrolledLandSchema = new mongoose.Schema(
  {
    landId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Land',
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
    landName: {
      type: String,
      required: true,
    },
    surveyNumber: {
      type: String,
    },
    areaAcres: {
      type: Number,
      default: 1.0,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'VERIFIED', 'AUDITED', 'COMPLETED', 'WITHDRAWN'],
      default: 'ACTIVE',
    },
  },
  { _id: true }
);

const milestoneSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    date: { type: String, required: true },
    targetDate: { type: Date },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    verifiedBy: { type: String },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    projectCode: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    scope: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'CIVIC_AGROFORESTRY',
      trim: true,
    },
    categoryLabel: {
      type: String,
      default: 'Civic Agroforestry',
    },
    location: {
      state: { type: String, default: 'Gujarat' },
      district: { type: String, default: 'Anand' },
      taluka: { type: String, default: 'Anand' },
      gramPanchayat: { type: String, default: 'Mogri' },
      address: { type: String, default: 'Mogri Panchayat, Anand, Gujarat' },
      coordinates: {
        lat: { type: Number, default: 22.5645 },
        lng: { type: Number, default: 72.9289 },
      },
    },
    assignedPartner: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: 'AgriTech Field Services' },
      organization: { type: String, default: 'AgriTech Field Services Pvt Ltd' },
      contactPhone: { type: String, default: '+91 98765 43210' },
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    status: {
      type: String,
      enum: ['PLANNED', 'ENROLLING', 'IN_PROGRESS', 'AUDIT_STAGE', 'COMPLETED', 'ON_HOLD'],
      default: 'IN_PROGRESS',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetCompletion: {
      type: Date,
    },
    carbonCreditEstimatePerAcre: {
      type: Number,
      default: 4.5, // tCO2e / acre / year
    },
    totalHectaresTarget: {
      type: Number,
      default: 50,
    },
    saplingsTarget: {
      type: Number,
      default: 1200,
    },
    saplingsPlanted: {
      type: Number,
      default: 850,
    },
    enrolledLands: [enrolledLandSchema],
    milestones: [milestoneSchema],
    budget: {
      allocatedAmount: { type: Number, default: 500000 },
      disbursedAmount: { type: Number, default: 350000 },
      currency: { type: String, default: 'INR' },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ status: 1, category: 1 });
projectSchema.index({ 'location.district': 1 });

export const Project = mongoose.model('Project', projectSchema);
export default Project;
