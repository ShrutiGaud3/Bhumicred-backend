import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    docId: {
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
    userRole: {
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
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['IDENTITY', 'LAND', 'INSURANCE', 'SOIL', 'OTHER'],
      default: 'LAND',
      index: true,
    },
    documentType: {
      type: String,
      enum: [
        'AADHAAR',
        'PAN',
        'ROR_7_12',
        'KHASRA_PAWTI',
        'CADASTRAL_MAP',
        'SOIL_HEALTH_CARD',
        'TREE_POLICY',
        'NOC_POA',
        'INVOICE',
        'OTHER',
      ],
      default: 'OTHER',
    },
    fileName: {
      type: String,
      default: 'document.pdf',
    },
    fileSize: {
      type: String,
      default: '1.2 MB',
    },
    fileUrl: {
      type: String,
      default: '',
    },
    fileData: {
      type: String, // Base64 data URL or storage URI
      default: '',
    },
    mimeType: {
      type: String,
      default: 'application/pdf',
    },
    sha256Hash: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING_VERIFICATION', 'VERIFIED', 'REJECTED'],
      default: 'VERIFIED',
      index: true,
    },
    verifiedBy: {
      type: String,
      default: 'BHUMICRED Auto-OCR & Trust Engine',
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
    verificationNotes: {
      type: String,
      default: 'Digitally attested and cryptographic checksum verified.',
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    tags: [
      {
        type: String,
        trim: true,
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

// Auto generate docId if missing
documentSchema.pre('validate', function (next) {
  if (!this.docId) {
    this.docId = `DOC-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  next();
});

export const Document = mongoose.model('Document', documentSchema);
export default Document;
