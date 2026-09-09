import mongoose from 'mongoose';

const mobileVanDispatchSchema = new mongoose.Schema(
  {
    dispatchId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    vanId: {
      type: String,
      required: true,
      default: 'GUJ-SOIL-VAN-04',
    },
    vanName: {
      type: String,
      default: 'Gujarat Mobile Soil Testing Lab 04 (AAS Spectrometer Equipped)',
    },
    targetVillage: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      default: 'Anand',
      trim: true,
    },
    scheduledDate: {
      type: String,
      required: true,
    },
    dispatchedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    operatorName: {
      type: String,
      default: 'Er. Rajesh Varma (Field Diagnostic In-charge)',
    },
    samplesTarget: {
      type: Number,
      default: 50,
    },
    samplesCollected: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'EN_ROUTE', 'ACTIVE_CAMP', 'COMPLETED'],
      default: 'SCHEDULED',
      index: true,
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

mobileVanDispatchSchema.pre('validate', function (next) {
  if (!this.dispatchId) {
    this.dispatchId = `DISP-VAN-${new Date().getFullYear()}-${Math.floor(
      100 + Math.random() * 900
    )}`;
  }
  next();
});

export const MobileVanDispatch = mongoose.model('MobileVanDispatch', mobileVanDispatchSchema);
export default MobileVanDispatch;
