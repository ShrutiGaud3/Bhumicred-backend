import mongoose from 'mongoose';

const landSchema = new mongoose.Schema(
  {
    landId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ownerName: {
      type: String,
      trim: true,
    },
    ownerMobile: {
      type: String,
      trim: true,
      index: true,
    },
    landName: {
      type: String,
      required: [true, 'Land name / plot title is required'],
      trim: true,
    },
    surveyNumber: {
      type: String,
      required: [true, 'Survey number is required'],
      trim: true,
      index: true,
    },
    khasraNumber: {
      type: String,
      required: [true, 'Khasra number is required'],
      trim: true,
      index: true,
    },
    khatauniNumber: {
      type: String,
      trim: true,
    },
    landType: {
      type: String,
      default: 'Agricultural (Irrigated)',
      trim: true,
    },
    ownershipType: {
      type: String,
      default: 'Individual Owner',
      trim: true,
    },
    area: {
      type: Number,
      required: [true, 'Land area is required'],
      min: [0.01, 'Area must be greater than 0'],
    },
    areaUnit: {
      type: String,
      enum: ['Acres', 'Bigha', 'Hectares', 'Sq Meters'],
      default: 'Acres',
    },
    location: {
      country: { type: String, default: 'India' },
      state: { type: String, default: 'Gujarat' },
      district: { type: String, required: true },
      taluka: { type: String, default: '' },
      village: { type: String, required: true },
      pincode: { type: String, default: '' },
      address: { type: String, default: '' },
    },
    boundaries: {
      type: {
        type: String,
        enum: ['Polygon', 'MultiPolygon'],
        default: 'Polygon',
      },
      coordinates: {
        type: [[[Number]]], // GeoJSON Polygon: Array of LinearRing coordinate arrays [[ [lng, lat], [lng, lat], ... ]]
        default: [],
      },
      simpleCoordinates: {
        type: [[Number]], // Array of [lng, lat] pairs for easy Leaflet consumption
        default: [],
      },
      centroid: {
        type: [Number], // [lng, lat]
        default: [72.9281, 22.5645],
      },
    },
    agronomicDetails: {
      soilType: {
        type: String,
        default: 'Alluvial Loam',
      },
      irrigationSource: {
        type: String,
        default: 'Borewell & Drip Irrigation',
      },
      primaryCrops: {
        type: [String],
        default: ['Wheat', 'Paddy'],
      },
      treeCount: {
        type: Number,
        default: 0,
      },
      treesInsured: {
        type: Boolean,
        default: false,
      },
      soilReportStatus: {
        type: String,
        enum: [
          'NOT_REQUESTED',
          'REQUESTED',
          'SAMPLE_COLLECTION_SCHEDULED',
          'SAMPLE_COLLECTED',
          'TESTING',
          'REPORT_READY',
        ],
        default: 'NOT_REQUESTED',
      },
      soilHealthCardNumber: {
        type: String,
        default: '',
      },
    },
    rorVerification: {
      statePortal: {
        type: String,
        enum: [
          'Bhulekh UP',
          'AnyRoR Gujarat',
          'Bhoomi Karnataka',
          'MahaBhulekh Maharashtra',
          'Meebhoomi Andhra Pradesh',
          'Direct RoR Manual',
        ],
        default: 'AnyRoR Gujarat',
      },
      rorDocumentUrl: {
        type: String,
        default: '',
      },
      verifiedWithBhulekh: {
        type: Boolean,
        default: false,
      },
      bhulekhSyncDate: {
        type: Date,
      },
    },
    status: {
      type: String,
      enum: ['PENDING_VERIFICATION', 'APPROVED', 'REJECTED', 'QUERY_RAISED'],
      default: 'PENDING_VERIFICATION',
      index: true,
    },
    riskScore: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'LOW',
    },
    reviewTrail: [
      {
        action: {
          type: String,
          enum: ['SUBMITTED', 'APPROVE', 'APPROVED', 'REJECT', 'REJECTED', 'QUERY_RAISED', 'REQUEST_CHANGES', 'UPDATED'],
          required: true,
        },
        reviewerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reviewerName: {
          type: String,
        },
        remarks: {
          type: String,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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

// Compound index for unique land parcels per village
landSchema.index({ 'location.district': 1, 'location.village': 1, surveyNumber: 1, khasraNumber: 1 });

export const Land = mongoose.model('Land', landSchema);
export default Land;
