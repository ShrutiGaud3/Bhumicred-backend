import mongoose from 'mongoose';

const insurancePolicySchema = new mongoose.Schema(
  {
    policyNumber: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userName: {
      type: String,
      trim: true,
    },
    userMobile: {
      type: String,
      trim: true,
    },
    landId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Land',
      required: true,
      index: true,
    },
    landName: {
      type: String,
      trim: true,
    },
    surveyNumber: {
      type: String,
      trim: true,
    },
    khasraNumber: {
      type: String,
      trim: true,
    },
    planName: {
      type: String,
      required: [true, 'Policy plan name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'Commercial Agroforestry',
        'Single Tree Cluster',
        'Orchard Protection',
        'General Plantation',
        'High-Value Timber Cover',
      ],
      default: 'Commercial Agroforestry',
      index: true,
    },
    insuredTreeCount: {
      type: Number,
      required: true,
      min: [1, 'Must insure at least 1 tree'],
    },
    speciesSummary: {
      type: String,
      default: 'Indian Teak & Mixed Agroforestry',
    },
    speciesBreakdown: [
      {
        species: { type: String, default: 'Indian Teak' },
        count: { type: Number, default: 50 },
        ageYears: { type: Number, default: 4 },
        valuePerTree: { type: Number, default: 8000 },
      },
    ],
    sumInsured: {
      type: Number,
      required: true,
      min: [1000, 'Sum insured must be at least ₹1,000'],
    },
    annualPremium: {
      type: Number,
      required: true,
    },
    grossPremium: {
      type: Number,
      required: true,
    },
    governmentSubsidyPercent: {
      type: Number,
      default: 40, // 40% Government Subsidized Under PM-KMY Agroforestry Scheme
    },
    governmentSubsidyAmount: {
      type: Number,
      default: 0,
    },
    farmerNetPayable: {
      type: Number,
      required: true,
    },
    durationMonths: {
      type: Number,
      default: 36, // 3 Years
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING_APPROVAL', 'CLAIM_IN_PROGRESS', 'EXPIRED', 'CANCELLED'],
      default: 'ACTIVE',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'PENDING', 'SUBSIDY_APPLIED'],
      default: 'PAID',
    },
    coverageDetails: {
      type: [String],
      default: [
        'Storm, Cyclone & Windthrow (>70 km/h)',
        'Forest & Agro Fire Perils',
        'Stem Borer Infestation & Root Rot Outbreaks',
        'Severe Drought Stress (Revenue Trigger)',
        'Lightning Strike & Frost Damage',
      ],
    },
    certificateDocId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    policyDocumentUrl: {
      type: String,
      default: '',
    },
    underwritingScore: {
      type: Number,
      default: 92, // 0 - 100
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

insurancePolicySchema.pre('validate', function (next) {
  if (!this.policyNumber) {
    this.policyNumber = `BC-POL-${new Date().getFullYear()}-${Math.floor(
      10000 + Math.random() * 90000
    )}`;
  }
  if (!this.endDate) {
    const end = new Date();
    end.setMonth(end.getMonth() + (this.durationMonths || 36));
    this.endDate = end;
  }
  next();
});

export const InsurancePolicy = mongoose.model('InsurancePolicy', insurancePolicySchema);
export default InsurancePolicy;
