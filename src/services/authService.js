import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { KYCApplication } from '../models/KYCApplication.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ROLES, ROLE_PERMISSIONS } from '../constants/roles.js';

export const generateJwtToken = (user) => {
  const payload = {
    id: user.id || user._id,
    name: user.name,
    role: user.role,
    mobile: user.mobile,
    email: user.email,
    status: user.status,
    kycStatus: user.kycStatus,
    permissions: user.permissions || ROLE_PERMISSIONS[user.role] || [],
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

const ROLE_DISPLAY_NAMES = {
  [ROLES.FARMER]: 'Farmer / Land Owner',
  [ROLES.GOVERNMENT]: 'Government Body',
  [ROLES.PARTNER]: 'Enterprise Partner',
  [ROLES.SUPER_ADMIN]: 'Admin Portal',
  [ROLES.OPERATIONS_ADMIN]: 'Admin Portal',
  [ROLES.VERIFICATION_ADMIN]: 'Admin Portal',
  [ROLES.FINANCE_ADMIN]: 'Admin Portal',
  [ROLES.ADMIN_STAFF]: 'Admin Portal',
};

export const authService = {
  async sendOtp(mobile, role = ROLES.FARMER) {
    const cleanMobile = mobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length !== 10) {
      throw new AppError('Please provide a valid 10-digit mobile number', HTTP_STATUS.BAD_REQUEST);
    }

    // Standard development OTP
    const devOtp = '123456';
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // If MongoDB is connected, verify user exists and match requested role
    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({
        $or: [{ mobile: cleanMobile }, { mobile: `+91${cleanMobile}` }, { mobile: new RegExp(cleanMobile) }]
      });

      if (existingUser) {
        const userRole = existingUser.role;
        const isAdminUser = [
          ROLES.SUPER_ADMIN,
          ROLES.OPERATIONS_ADMIN,
          ROLES.VERIFICATION_ADMIN,
          ROLES.FINANCE_ADMIN,
          ROLES.ADMIN_STAFF
        ].includes(userRole);

        const isRequestedAdmin = [
          ROLES.SUPER_ADMIN,
          ROLES.OPERATIONS_ADMIN,
          ROLES.VERIFICATION_ADMIN,
          ROLES.FINANCE_ADMIN,
          ROLES.ADMIN_STAFF
        ].includes(role);

        if (role && userRole) {
          if (isAdminUser && isRequestedAdmin) {
            // Admin authentication allowed
          } else if (userRole !== role) {
            const currentPortalName = ROLE_DISPLAY_NAMES[role] || role;
            const registeredPortalName = ROLE_DISPLAY_NAMES[userRole] || userRole;
            throw new AppError(
              `Yeh mobile number (${cleanMobile}) '${registeredPortalName}' portal ke liye registered hai. Aap '${currentPortalName}' portal par login nahi kar sakte. Kripya '${registeredPortalName}' portal select karein.`,
              HTTP_STATUS.FORBIDDEN
            );
          }
        }

        existingUser.otp = { code: devOtp, expiresAt };
        await existingUser.save();
      } else {
        throw new AppError(
          `No registered account found for mobile number +91 ${cleanMobile}. Kripya pehle Register / Create Profile karein.`,
          HTTP_STATUS.NOT_FOUND
        );
      }
    }

    return {
      mobile: cleanMobile,
      devOtp,
      expiresAt: expiresAt.toISOString(),
      role,
    };
  },

  async verifyOtp(mobile, otp, requestedRole = ROLES.FARMER) {
    const cleanMobile = mobile.replace(/\D/g, '');

    // Allow dev OTP 123456
    if (otp !== '123456') {
      throw new AppError('Invalid OTP. Please enter valid verification code (123456 for demo).', HTTP_STATUS.UNAUTHORIZED);
    }

    let user = null;

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({
          $or: [
            { mobile: cleanMobile },
            { mobile: `+91${cleanMobile}` },
            { mobile: new RegExp(cleanMobile) }
          ]
        });
      } catch (e) {
        console.warn('DB search notice:', e.message);
      }
    }

    if (!user) {
      throw new AppError(
        `No account found registered with mobile number +91 ${cleanMobile}. Please create your profile via Register first.`,
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Role verification enforcement
    const userRole = user.role;
    const isAdminUser = [
      ROLES.SUPER_ADMIN,
      ROLES.OPERATIONS_ADMIN,
      ROLES.VERIFICATION_ADMIN,
      ROLES.FINANCE_ADMIN,
      ROLES.ADMIN_STAFF
    ].includes(userRole);

    const isRequestedAdmin = [
      ROLES.SUPER_ADMIN,
      ROLES.OPERATIONS_ADMIN,
      ROLES.VERIFICATION_ADMIN,
      ROLES.FINANCE_ADMIN,
      ROLES.ADMIN_STAFF
    ].includes(requestedRole);

    if (requestedRole && userRole) {
      if (isAdminUser && isRequestedAdmin) {
        // Admin authentication allowed
      } else if (userRole !== requestedRole) {
        const currentPortalName = ROLE_DISPLAY_NAMES[requestedRole] || requestedRole;
        const registeredPortalName = ROLE_DISPLAY_NAMES[userRole] || userRole;
        throw new AppError(
          `Yeh account '${registeredPortalName}' portal ke liye registered hai, '${currentPortalName}' portal ke liye nahi. Kripya '${registeredPortalName}' portal select karke login karein.`,
          HTTP_STATUS.FORBIDDEN
        );
      }
    }

    user.lastLoginAt = new Date();

    try {
      await user.save();
      console.log(`✓ Authenticated user session for mobile ${cleanMobile} (${user.role}):`, user._id);
    } catch (e) {
      console.warn('User update save error:', e.message);
    }

    const accessToken = generateJwtToken(user);
    const refreshToken = `refresh_${Date.now()}_${user.id || user._id}`;

    return {
      user: user.toJSON ? user.toJSON() : user,
      accessToken,
      refreshToken,
    };
  },

  async register(userData) {
    const fullName = userData.fullName || userData.name;
    if (!fullName || !userData.mobile) {
      throw new AppError('Full name and mobile number are required', HTTP_STATUS.BAD_REQUEST);
    }

    const cleanMobile = userData.mobile.replace(/\D/g, '');
    const role = userData.role || ROLES.FARMER;
    const appId = `BC-APP-${Math.floor(100000 + Math.random() * 900000)}`;
    const cleanEmail = userData.email && userData.email.trim() !== '' ? userData.email.trim().toLowerCase() : undefined;

    let user = null;

    try {
      user = await User.findOne({ mobile: cleanMobile });
    } catch (e) {
      console.warn('DB search error:', e.message);
    }

    if (user) {
      // User already exists, update their KYC / Registration profile
      user.name = fullName;
      if (userData.fatherName) user.fatherName = userData.fatherName;
      if (userData.gender) user.gender = userData.gender;
      if (cleanEmail) user.email = cleanEmail;
      user.role = role;
      user.permissions = ROLE_PERMISSIONS[role] || [];
      user.status = 'PENDING_APPROVAL';
      user.kycStatus = 'PENDING_VERIFICATION';
      user.address = {
        country: userData.country || user.address?.country || 'India',
        state: userData.state || user.address?.state || 'Gujarat',
        district: userData.district || user.address?.district || 'Anand',
        city: userData.city || user.address?.city || 'Anand',
        gramPanchayat: userData.gramPanchayat || user.address?.gramPanchayat || 'Mogri Gram Panchayat',
        pincode: userData.pincode || user.address?.pincode || '388345',
        fullAddress: userData.fullAddress || user.address?.fullAddress || '',
      };
      if (userData.deviceLat && userData.deviceLng) {
        user.location = { lat: userData.deviceLat, lng: userData.deviceLng };
      }
      if (userData.photoName) user.photoName = userData.photoName;
      user.submittedAt = new Date();

      try {
        await user.save();
        console.log(`✓ Updated existing registered user in DB: ${cleanMobile} (${user._id})`);

        // Also update/upsert KYC application
        await KYCApplication.findOneAndUpdate(
          { mobile: cleanMobile },
          {
            applicationId: user.applicationId || appId,
            userId: user._id,
            type: role === ROLES.PARTNER ? 'PARTNER_ONBOARDING' : 'FARMER_KYC',
            title: `Citizen KYC & Registration - ${fullName}`,
            applicantName: fullName,
            fatherName: userData.fatherName,
            gender: userData.gender || 'MALE',
            mobile: cleanMobile,
            email: cleanEmail,
            role,
            address: user.address,
            location: user.location,
            status: 'PENDING_VERIFICATION',
            submittedAt: new Date(),
          },
          { upsert: true }
        );
      } catch (err) {
        console.error('Error updating user in DB:', err.message);
      }
    } else {
      // Create new user in DB
      try {
        user = await User.create({
          applicationId: appId,
          name: fullName,
          fatherName: userData.fatherName,
          gender: userData.gender || 'MALE',
          mobile: cleanMobile,
          email: cleanEmail,
          role: role,
          permissions: ROLE_PERMISSIONS[role] || [],
          status: 'PENDING_APPROVAL',
          kycStatus: 'PENDING_VERIFICATION',
          address: {
            country: userData.country || 'India',
            state: userData.state || 'Gujarat',
            district: userData.district || 'Anand',
            city: userData.city || 'Anand',
            gramPanchayat: userData.gramPanchayat || 'Mogri Gram Panchayat',
            pincode: userData.pincode || '388345',
            fullAddress: userData.fullAddress || '',
          },
          location: {
            lat: userData.deviceLat || 22.5645,
            lng: userData.deviceLng || 72.9281,
          },
          photoName: userData.photoName || 'profile_kyc.jpg',
          submittedAt: new Date(),
          stats: {
            landsCount: 0,
            totalAcres: 0,
            carbonCredits: 0,
            walletBalance: 0,
            insuranceActiveCount: 0,
          },
        });
        console.log(`✓ Created new registered user in DB: ${cleanMobile} (${user._id})`);

        // Also create KYC Application record
        await KYCApplication.create({
          applicationId: appId,
          userId: user._id,
          type: role === ROLES.PARTNER ? 'PARTNER_ONBOARDING' : 'FARMER_KYC',
          title: `Citizen KYC & Registration - ${fullName}`,
          applicantName: fullName,
          fatherName: userData.fatherName,
          gender: userData.gender || 'MALE',
          mobile: cleanMobile,
          email: cleanEmail,
          role,
          address: user.address,
          location: user.location,
          status: 'PENDING_VERIFICATION',
          submittedAt: new Date(),
        });
      } catch (err) {
        console.error('Error creating user in DB:', err.message);
        // Fallback user object
        user = {
          id: `usr_${Date.now()}`,
          applicationId: appId,
          name: fullName,
          fatherName: userData.fatherName,
          gender: userData.gender || 'MALE',
          mobile: cleanMobile,
          email: cleanEmail || '',
          role: role,
          permissions: ROLE_PERMISSIONS[role] || [],
          status: 'PENDING_APPROVAL',
          kycStatus: 'PENDING_VERIFICATION',
          address: {
            country: userData.country || 'India',
            state: userData.state || 'Gujarat',
            district: userData.district || 'Anand',
            city: userData.city || 'Anand',
            gramPanchayat: userData.gramPanchayat || 'Mogri Gram Panchayat',
            pincode: userData.pincode || '388345',
          },
          location: {
            lat: userData.deviceLat || 22.5645,
            lng: userData.deviceLng || 72.9281,
          },
          photoName: userData.photoName || 'profile_kyc.jpg',
          submittedAt: new Date(),
        };
      }
    }

    const accessToken = generateJwtToken(user);
    const refreshToken = `refresh_${Date.now()}_${user.id || user._id}`;

    return {
      user: user.toJSON ? user.toJSON() : user,
      accessToken,
      refreshToken,
    };
  },

  async loginWithPassword(identifier, password) {
    let user = null;
    const isEmail = identifier.includes('@');

    if (mongoose.connection.readyState === 1) {
      try {
        const query = isEmail ? { email: identifier.toLowerCase() } : { mobile: identifier.replace(/\D/g, '') };
        user = await User.findOne(query).select('+password');
      } catch (e) {
        console.warn('DB error:', e.message);
      }
    }

    if (!user || !user.password) {
      throw new AppError('Invalid credentials. Please verify your identifier and password or login with OTP.', HTTP_STATUS.UNAUTHORIZED);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid password credentials.', HTTP_STATUS.UNAUTHORIZED);
    }

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = generateJwtToken(user);
    const refreshToken = `refresh_${Date.now()}_${user.id}`;

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  },

  async getCurrentUser(userId, tokenPayload = {}) {
    let user = null;

    if (mongoose.connection.readyState === 1 && userId && !userId.startsWith('usr_')) {
      try {
        user = await User.findById(userId);
      } catch (e) {
        // Fallback
      }
    }

    if (!user) {
      // Return decoded session token user
      const userRole = tokenPayload.role || ROLES.FARMER;
      return {
        id: userId || 'usr_session',
        name: tokenPayload.name || 'Citizen User',
        mobile: tokenPayload.mobile || '',
        email: tokenPayload.email || '',
        role: userRole,
        permissions: tokenPayload.permissions || ROLE_PERMISSIONS[userRole] || [],
        status: tokenPayload.status || 'APPROVED',
        kycStatus: tokenPayload.kycStatus || 'APPROVED',
      };
    }

    return user.toJSON ? user.toJSON() : user;
  },

  async updateProfile(userId, updateData) {
    let user = null;

    if (mongoose.connection.readyState === 1 && userId && !userId.startsWith('usr_')) {
      try {
        user = await User.findById(userId);
        if (user) {
          if (updateData.name) user.name = updateData.name;
          if (updateData.fatherName !== undefined) user.fatherName = updateData.fatherName;
          if (updateData.email !== undefined) user.email = updateData.email;
          if (updateData.gender) user.gender = updateData.gender;
          if (updateData.address) {
            user.address = {
              ...(user.address?.toObject ? user.address.toObject() : user.address),
              ...updateData.address,
            };
          }
          await user.save();
        }
      } catch (e) {
        console.warn('DB update user error:', e.message);
      }
    }

    if (!user) {
      user = {
        id: userId,
        _id: userId,
        name: updateData.name || 'Citizen Farmer',
        mobile: updateData.mobile || '',
        email: updateData.email || '',
        fatherName: updateData.fatherName || '',
        gender: updateData.gender || 'Male',
        address: updateData.address || {},
        role: updateData.role || ROLES.FARMER,
        status: 'APPROVED',
        kycStatus: 'APPROVED',
      };
    }

    return user.toJSON ? user.toJSON() : user;
  },
};
