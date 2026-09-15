import mongoose from 'mongoose';

const soilTestRequestSchema = new mongoose.Schema(
  {
    requestNumber: {
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
    packageId: {
      type: String,
      default: 'pkg_standard',
    },
    packageType: {
      type: String,
      required: [true, 'Soil testing package type is required'],
      default: 'Standard Basic Soil Collection',
    },
    parameters: {
      type: [String],
      default: [
        'Soil Reaction (pH)',
        'Electrical Conductivity (EC)',
        'Organic Carbon (OC)',
        'Available Nitrogen (N)',
        'Available Phosphorus (P)',
        'Available Potassium (K)',
      ],
    },
    fee: {
      type: Number,
      default: 0,
      min: [0, 'Fee cannot be negative'],
    },
    paymentStatus: {
      type: String,
      enum: ['FREE', 'PAID', 'PENDING'],
      default: 'FREE',
    },
    status: {
      type: String,
      enum: [
        'SUBMITTED',
        'SAMPLE_COLLECTION_SCHEDULED',
        'SAMPLE_COLLECTED',
        'TESTING',
        'REPORT_READY',
        'REJECTED',
      ],
      default: 'REPORT_READY',
      index: true,
    },
    pickupDate: {
      type: String,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    pickupTimeSlot: {
      type: String,
      default: '09:00 AM - 12:00 PM',
    },
    assignedLab: {
      type: String,
      default: 'TerraAgri NABL Accredited Regional Laboratory, Anand',
    },
    labRegNo: {
      type: String,
      default: 'NABL/TC-9042',
    },
    assignedCollector: {
      type: String,
      default: 'District Agronomy Specialist',
    },
    sampleCollectedAt: {
      type: Date,
      default: Date.now,
    },
    reportReadyAt: {
      type: Date,
      default: Date.now,
    },
    healthScore: {
      type: Number,
      default: 84, // 0 - 100
      min: 0,
      max: 100,
    },
    reportData: {
      pH: {
        value: { type: Number, default: 6.8 },
        rating: { type: String, default: 'Optimal (Neutral)' },
        range: { type: String, default: '6.5 - 7.5' },
      },
      ec: {
        value: { type: String, default: '0.45 dS/m' },
        rating: { type: String, default: 'Normal (Non-Saline)' },
        range: { type: String, default: '< 1.0 dS/m' },
      },
      organicCarbon: {
        value: { type: String, default: '0.82%' },
        rating: { type: String, default: 'High Fertility' },
        range: { type: String, default: '> 0.75%' },
      },
      nitrogen: {
        value: { type: String, default: '280 kg/ha' },
        rating: { type: String, default: 'Medium Adequate' },
        range: { type: String, default: '280 - 560 kg/ha' },
      },
      phosphorus: {
        value: { type: String, default: '24 kg/ha' },
        rating: { type: String, default: 'High' },
        range: { type: String, default: '14 - 28 kg/ha' },
      },
      potassium: {
        value: { type: String, default: '310 kg/ha' },
        rating: { type: String, default: 'High' },
        range: { type: String, default: '150 - 300 kg/ha' },
      },
      zinc: {
        value: { type: String, default: '1.1 ppm' },
        rating: { type: String, default: 'Adequate' },
        range: { type: String, default: '> 0.6 ppm' },
      },
      iron: {
        value: { type: String, default: '5.4 ppm' },
        rating: { type: String, default: 'Adequate' },
        range: { type: String, default: '> 4.5 ppm' },
      },
      recommendation: {
        type: String,
        default:
          'Soil is in prime health for cotton & agroforestry rotation. Supplement with 20kg/acre organic bio-potash and split nitrogen dose during flowering.',
      },
      dosageAdvice: [
        {
          stage: { type: String, default: 'Basal Application' },
          treatment: { type: String, default: '50kg DAP + 25kg MOP per acre' },
        },
        {
          stage: { type: String, default: 'Micronutrient Spray' },
          treatment: { type: String, default: 'Zinc Sulfate 0.5% at vegetative stage' },
        },
        {
          stage: { type: String, default: 'Nitrogen Timing' },
          treatment: { type: String, default: 'Split dose at 30 & 60 DAS' },
        },
      ],
    },
    certificateDocId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    notes: {
      type: String,
      trim: true,
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

soilTestRequestSchema.pre('validate', function (next) {
  if (!this.requestNumber) {
    this.requestNumber = `SR-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;
  }
  next();
});

export const SoilTestRequest = mongoose.model('SoilTestRequest', soilTestRequestSchema);
export default SoilTestRequest;
