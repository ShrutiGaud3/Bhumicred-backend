import mongoose from 'mongoose';

const insuranceClaimSchema = new mongoose.Schema(
  {
    claimNumber: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    policyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InsurancePolicy',
      required: true,
      index: true,
    },
    policyNumber: {
      type: String,
      required: true,
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
    },
    incidentType: {
      type: String,
      enum: [
        'Severe Hailstorm & Windthrow',
        'Forest & Agro Fire Peril',
        'Pest & Pathogen Infestation (Stem Borer / Root Rot)',
        'Severe Drought / Water Stress',
        'Lightning Strike Damage',
        'Wild Animal Depredation',
        'Frost & Temperature Shock',
      ],
      required: true,
    },
    incidentDate: {
      type: Date,
      required: true,
    },
    affectedTreeCount: {
      type: Number,
      required: true,
      min: [1, 'Must report at least 1 affected tree'],
    },
    estimatedLoss: {
      type: Number,
      required: true,
    },
    approvedPayoutAmount: {
      type: Number,
      default: 0,
    },
    claimDescription: {
      type: String,
      trim: true,
    },
    damagePhotos: [
      {
        type: String, // Data URI or URL
      },
    ],
    status: {
      type: String,
      enum: [
        'SUBMITTED',
        'DESK_REVIEW',
        'INSPECTION_SCHEDULED',
        'INSPECTED',
        'APPROVED',
        'REJECTED',
        'SETTLED',
      ],
      default: 'SUBMITTED',
      index: true,
    },
    assignedPartnerName: {
      type: String,
      default: 'AgriTech Field Services',
    },
    inspectorName: {
      type: String,
      default: 'Field Inspection Agronomist',
    },
    inspectionDate: {
      type: Date,
    },
    inspectionReport: {
      fieldObservations: { type: String, default: '' },
      verifiedDamagedTrees: { type: Number, default: 0 },
      recommendedPayout: { type: Number, default: 0 },
      gpsTaggedEvidence: [{ type: String }],
    },
    timeline: [
      {
        title: { type: String, required: true },
        timestamp: { type: String, required: true },
        completed: { type: Boolean, default: false },
        remarks: { type: String, default: '' },
      },
    ],
    settlementDetails: {
      payoutTxnId: { type: String, default: '' },
      creditedToWallet: { type: Boolean, default: false },
      settledAt: { type: Date },
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

insuranceClaimSchema.pre('validate', function (next) {
  if (!this.claimNumber) {
    this.claimNumber = `CLM-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;
  }
  if (!this.timeline || this.timeline.length === 0) {
    const today = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    this.timeline = [
      { title: 'Claim Submitted', timestamp: today, completed: true, remarks: 'Initiated by citizen' },
      { title: 'Desk Review Completed', timestamp: 'In Progress', completed: false, remarks: 'Nodal desk reviewing evidence' },
      { title: 'Field Partner Assigned', timestamp: 'Pending', completed: false, remarks: 'GPS surveyor assignment' },
      { title: 'On-Site GPS Inspection', timestamp: 'Pending', completed: false, remarks: 'Damage validation on field' },
      { title: 'Settlement Decision', timestamp: 'Pending', completed: false, remarks: 'Wallet payout transfer' },
    ];
  }
  next();
});

export const InsuranceClaim = mongoose.model('InsuranceClaim', insuranceClaimSchema);
export default InsuranceClaim;
