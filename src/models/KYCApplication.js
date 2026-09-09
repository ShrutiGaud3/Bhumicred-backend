import mongoose from 'mongoose';
import { ROLES, ROLE_LIST } from '../constants/roles.js';

const kycApplicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    type: {
      type: String,
      enum: ['FARMER_KYC', 'LAND_REGISTRATION', 'PARTNER_ONBOARDING', 'INSURANCE_CLAIM'],
      default: 'FARMER_KYC',
      index: true,
    },
    title: {
      type: String,
      trim: true,
    },
    targetId: {
      type: String,
      index: true,
    },
    applicantName: {
      type: String,
      required: [true, 'Applicant name is required'],
      trim: true,
    },
    fatherName: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      default: 'MALE',
    },
    mobile: {
      type: String,
      required: [true, 'Contact mobile number is required'],
      index: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ROLE_LIST,
      default: ROLES.FARMER,
      index: true,
    },
    address: {
      country: { type: String, default: 'India' },
      state: { type: String, default: 'Gujarat' },
      district: { type: String, default: 'Anand' },
      city: { type: String, default: 'Anand' },
      gramPanchayat: { type: String, default: 'Mogri Gram Panchayat' },
      pincode: { type: String, default: '388345' },
      fullAddress: { type: String, default: '' },
    },
    location: {
      lat: { type: Number, default: 22.5645 },
      lng: { type: Number, default: 72.9281 },
    },
    documents: [
      {
        docType: { type: String, default: 'IDENTITY_PROOF' },
        fileName: { type: String },
        fileUrl: { type: String },
        uploadedAt: { type: Date, default: Date.now },
        isVerified: { type: Boolean, default: false },
      },
    ],
    status: {
      type: String,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'PENDING_VERIFICATION',
        'APPROVED',
        'REJECTED',
        'QUERY_PENDING',
      ],
      default: 'PENDING_VERIFICATION',
      index: true,
    },
    riskScore: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'LOW',
    },
    reviewNotes: {
      type: String,
      trim: true,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedByName: {
      type: String,
      default: '',
    },
    reviewedAt: {
      type: Date,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Pre-save to auto-fill title if empty
kycApplicationSchema.pre('save', function (next) {
  if (!this.title) {
    this.title = `Citizen KYC & Registration - ${this.applicantName}`;
  }
  next();
});

export const KYCApplication = mongoose.model('KYCApplication', kycApplicationSchema);
