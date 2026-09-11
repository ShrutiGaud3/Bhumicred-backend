import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, ROLE_LIST, ROLE_PERMISSIONS } from '../constants/roles.js';

const userSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Full name is required'],
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
      required: [true, 'Mobile number is required'],
      index: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      set: (v) => (v && typeof v === 'string' && v.trim() !== '' ? v.trim().toLowerCase() : undefined),
    },
    password: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ROLE_LIST,
      default: ROLES.FARMER,
      index: true,
    },
    permissions: {
      type: [String],
      default: function () {
        return ROLE_PERMISSIONS[this.role] || [];
      },
    },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'PENDING_APPROVAL',
        'PENDING_VERIFICATION',
        'APPROVED',
        'ACTIVE',
        'QUERY_RAISED',
        'REJECTED',
        'SUSPENDED',
      ],
      default: 'APPROVED',
      index: true,
    },
    kycStatus: {
      type: String,
      enum: ['PENDING_VERIFICATION', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
      default: 'APPROVED',
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
    avatarUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    },
    photoName: {
      type: String,
      default: 'profile_kyc.jpg',
    },
    documents: [
      {
        name: String,
        category: String,
        url: String,
        verified: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    otp: {
      code: String,
      expiresAt: Date,
    },
    stats: {
      landsCount: { type: Number, default: 1 },
      totalAcres: { type: Number, default: 12.4 },
      carbonCredits: { type: Number, default: 18.6 },
      walletBalance: { type: Number, default: 2450.0 },
      insuranceActiveCount: { type: Number, default: 1 },
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    approvedAt: Date,
    lastLoginAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.otp;
        return ret;
      },
    },
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
export default User;
