import mongoose from 'mongoose';

const carbonCreditSchema = new mongoose.Schema(
  {
    creditId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    tokenSymbol: {
      type: String,
      default: 'BHUMI-CO2',
    },
    vintageYear: {
      type: Number,
      default: () => new Date().getFullYear(),
      index: true,
    },
    tCO2e: {
      type: Number,
      required: true,
      min: [0.1, 'Tonnes of CO2 must be at least 0.1'],
    },
    pricePerCredit: {
      type: Number,
      default: 1450, // ₹1,450 per tonne CO2e
    },
    totalValue: {
      type: Number,
      default: function () {
        return Math.round(this.tCO2e * (this.pricePerCredit || 1450));
      },
    },
    creditStandard: {
      type: String,
      default: 'Sovereign Agro-Carbon Registry (VCS/GS Equivalent)',
    },
    methodology: {
      type: String,
      default: 'Sentinel-2 Multi-Spectral Biomass Sequestration Model (AF-041)',
    },
    status: {
      type: String,
      enum: ['MINTED', 'LISTED', 'RESERVED', 'SOLD', 'RETIRED'],
      default: 'MINTED',
      index: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    farmerName: {
      type: String,
      default: 'Citizen Farmer',
    },
    landId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Land',
      required: true,
      index: true,
    },
    landName: {
      type: String,
      default: 'Agroforestry Land Parcel',
    },
    surveyNumber: {
      type: String,
      default: '612/A',
    },
    treeCount: {
      type: Number,
      default: 150,
    },
    treeSpecies: {
      type: String,
      default: 'Indian Teak & Mixed Agroforestry',
    },
    auditRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CarbonAuditRequest',
    },
    certificateDocId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    certificateNumber: {
      type: String,
      default: '',
    },
    mintedAt: {
      type: Date,
      default: Date.now,
    },
    retiredAt: {
      type: Date,
    },
    beneficiary: {
      organizationName: { type: String, default: '' },
      purpose: { type: String, default: '' },
      offsetReason: { type: String, default: '' },
      retirementTxHash: { type: String, default: '' },
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

carbonCreditSchema.pre('validate', function (next) {
  if (!this.creditId) {
    this.creditId = `BC-CARB-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}${Math.floor(
      1000 + Math.random() * 9000
    )}`;
  }
  if (!this.certificateNumber) {
    this.certificateNumber = `CERT-CO2-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}${Math.floor(
      10000 + Math.random() * 90000
    )}`;
  }
  if (!this.totalValue && this.tCO2e) {
    this.totalValue = Math.round(this.tCO2e * (this.pricePerCredit || 1450));
  }
  next();
});

export const CarbonCredit = mongoose.model('CarbonCredit', carbonCreditSchema);
export default CarbonCredit;
