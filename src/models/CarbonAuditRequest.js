import mongoose from 'mongoose';

const carbonAuditRequestSchema = new mongoose.Schema(
  {
    auditId: {
      type: String,
      unique: true,
      required: true,
      index: true,
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
      default: '',
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
    farmerMobile: {
      type: String,
      default: '',
    },
    agroforestryType: {
      type: String,
      default: 'High-Resin Teak & Mixed Hardwood',
    },
    estimatedTreeCount: {
      type: Number,
      default: 150,
      min: 1,
    },
    areaAcres: {
      type: Number,
      default: 2.5,
    },
    status: {
      type: String,
      enum: [
        'SUBMITTED',
        'SATELLITE_SCANNING',
        'SPECTRAL_PROCESSED',
        'VERIFIED_MINT_READY',
        'MINTED',
        'REJECTED',
      ],
      default: 'SUBMITTED',
      index: true,
    },
    satelliteDetails: {
      satelliteName: { type: String, default: 'Sentinel-2 Multispectral MSI' },
      bandConfiguration: { type: String, default: 'B4 (Red) + B8 (NIR) + B11 (SWIR)' },
      lastPassDate: { type: Date, default: Date.now },
      cloudCoverPercent: { type: Number, default: 2.4 },
      resolutionMeters: { type: Number, default: 10 },
    },
    spectralMetrics: {
      ndviMean: { type: Number, default: 0.76 }, // 0 to 1
      eviMean: { type: Number, default: 0.68 },
      ndreMean: { type: Number, default: 0.54 }, // Red Edge Canopy Index
      canopyCoverPercent: { type: Number, default: 72 },
      estimatedBiomassPerHectareTons: { type: Number, default: 48.5 },
    },
    carbonSequestration: {
      annualSequestrationRateTons: { type: Number, default: 18.5 }, // tCO2e/yr
      totalEstimatedTCO2e: { type: Number, default: 55.5 }, // over 3 years
      verifiedMintableCredits: { type: Number, default: 18.5 },
      baselineEmissionFactor: { type: Number, default: 0.12 },
    },
    verificationNotes: {
      type: String,
      default: 'Multispectral NDVI analysis confirms healthy canopy growth compliant with VCS Methodology VM0042.',
    },
    auditedBy: {
      type: String,
      default: 'National Agro-Biomass Satellite MRV Directorate, ISRO / Space Applications Centre',
    },
    auditedAt: {
      type: Date,
    },
    certificateDocId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    mintedCreditId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CarbonCredit',
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

carbonAuditRequestSchema.pre('validate', function (next) {
  if (!this.auditId) {
    this.auditId = `AUD-MRV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}${Math.floor(
      1000 + Math.random() * 9000
    )}`;
  }
  next();
});

export const CarbonAuditRequest = mongoose.model('CarbonAuditRequest', carbonAuditRequestSchema);
export default CarbonAuditRequest;
