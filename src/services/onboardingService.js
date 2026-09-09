import mongoose from 'mongoose';
import { KYCApplication } from '../models/KYCApplication.js';
import { User } from '../models/User.js';
import { Land } from '../models/Land.js';
import { AppError } from '../utils/appError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ROLES, ROLE_PERMISSIONS } from '../constants/roles.js';

export const onboardingService = {
  /**
   * Submit new Citizen / Partner KYC Application
   */
  async submitApplication(data, submittingUser = null) {
    const applicantName = data.fullName || data.applicantName || data.name;
    const cleanMobile = (data.mobile || '').replace(/\D/g, '');

    if (!applicantName || !cleanMobile) {
      throw new AppError('Applicant full name and mobile number are required', HTTP_STATUS.BAD_REQUEST);
    }

    const appId = data.applicationId || `BC-APP-${Math.floor(100000 + Math.random() * 900000)}`;
    const role = data.role || submittingUser?.role || ROLES.FARMER;
    const cleanEmail = data.email && data.email.trim() !== '' ? data.email.trim().toLowerCase() : undefined;

    const payload = {
      applicationId: appId,
      userId: submittingUser?.id || submittingUser?._id,
      type: role === ROLES.PARTNER ? 'PARTNER_ONBOARDING' : 'FARMER_KYC',
      title: `Citizen KYC & Registration - ${applicantName}`,
      applicantName,
      fatherName: data.fatherName || '',
      gender: data.gender || 'MALE',
      mobile: cleanMobile,
      email: cleanEmail,
      role,
      address: {
        country: data.country || 'India',
        state: data.state || 'Gujarat',
        district: data.district || 'Anand',
        city: data.city || 'Anand',
        gramPanchayat: data.gramPanchayat || 'Mogri Gram Panchayat',
        pincode: data.pincode || '388345',
        fullAddress: data.fullAddress || '',
      },
      location: {
        lat: data.deviceLat || data.lat || 22.5645,
        lng: data.deviceLng || data.lng || 72.9281,
      },
      documents: data.documents || (data.photoName ? [{ docType: 'IDENTITY_PROOF', fileName: data.photoName }] : []),
      status: 'PENDING_VERIFICATION',
      riskScore: 'LOW',
      submittedAt: new Date(),
    };

    let application = null;

    if (mongoose.connection.readyState === 1) {
      try {
        // Upsert or create KYCApplication
        application = await KYCApplication.findOneAndUpdate(
          { $or: [{ applicationId: appId }, { mobile: cleanMobile, status: 'PENDING_VERIFICATION' }] },
          payload,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Also ensure User document reflects this submission
        await User.findOneAndUpdate(
          { mobile: cleanMobile },
          {
            name: applicantName,
            fatherName: payload.fatherName,
            gender: payload.gender,
            email: cleanEmail,
            role,
            status: 'PENDING_APPROVAL',
            kycStatus: 'PENDING_VERIFICATION',
            address: payload.address,
            location: payload.location,
            applicationId: appId,
          },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.warn('DB KYC submission warning:', err.message);
      }
    }

    if (!application) {
      application = {
        id: `kyc_${Date.now()}`,
        ...payload,
      };
    }

    return application.toJSON ? application.toJSON() : application;
  },

  /**
   * Get KYC Application status for a specific user
   */
  async getUserApplication(userId, mobile = '') {
    let app = null;
    const cleanMobile = mobile.replace(/\D/g, '');

    if (mongoose.connection.readyState === 1) {
      try {
        const query = [];
        if (userId && !String(userId).startsWith('usr_')) {
          query.push({ userId });
        }
        if (cleanMobile) {
          query.push({ mobile: cleanMobile });
        }

        if (query.length > 0) {
          app = await KYCApplication.findOne({ $or: query }).sort({ createdAt: -1 });
        }
      } catch (e) {
        console.warn('Error fetching KYC status:', e.message);
      }
    }

    return app ? (app.toJSON ? app.toJSON() : app) : null;
  },

  /**
   * Get Admin Verification Queue with Filtering
   */
  async getAdminQueue(filters = {}) {
    let items = [];
    const query = {};

    if (filters.status && filters.status !== 'ALL') {
      query.status = filters.status;
    }
    if (filters.type && filters.type !== 'ALL') {
      query.type = filters.type;
    }
    if (filters.role) {
      query.role = filters.role;
    }
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [{ applicantName: searchRegex }, { title: searchRegex }, { mobile: searchRegex }, { applicationId: searchRegex }];
    }

    if (mongoose.connection.readyState === 1) {
      try {
        items = await KYCApplication.find(query).sort({ createdAt: -1 }).limit(100);
      } catch (err) {
        console.warn('Error reading admin KYC queue:', err.message);
      }
    }

    return items.map((it) => (it.toJSON ? it.toJSON() : it));
  },

  /**
   * Review Application (Approve, Reject, or Query)
   */
  async reviewApplication(applicationId, { status, reviewNotes, reviewerId, reviewerName }) {
    if (!['APPROVED', 'REJECTED', 'QUERY_PENDING'].includes(status)) {
      throw new AppError('Status must be APPROVED, REJECTED, or QUERY_PENDING', HTTP_STATUS.BAD_REQUEST);
    }

    let application = null;

    if (mongoose.connection.readyState === 1) {
      try {
        application = await KYCApplication.findOne({
          $or: [{ applicationId }, { _id: mongoose.isValidObjectId(applicationId) ? applicationId : null }],
        });

        if (application) {
          application.status = status;
          application.reviewNotes = reviewNotes || '';
          if (reviewerId && mongoose.isValidObjectId(reviewerId)) application.reviewedBy = reviewerId;
          application.reviewedByName = reviewerName || 'Admin Officer';
          application.reviewedAt = new Date();
          await application.save();

          // Synchronize User Model Status!
          const userStatus = status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : 'QUERY_PENDING';
          const userKycStatus = status === 'APPROVED' ? 'APPROVED' : 'PENDING_VERIFICATION';

          await User.findOneAndUpdate(
            { $or: [{ mobile: application.mobile }, { _id: application.userId }, { applicationId: application.applicationId }] },
            {
              status: userStatus,
              kycStatus: userKycStatus,
            }
          );
          console.log(`✓ Synchronized User status for application ${application.applicationId} to: ${userStatus}`);

          // If this is a Land Registration application, synchronize the Land collection
          if (application.targetId || application.type === 'LAND_REGISTRATION') {
            const landTarget = application.targetId;
            if (landTarget) {
              const isObjectId = mongoose.isValidObjectId(landTarget);
              await Land.findOneAndUpdate(
                { $or: [{ landId: landTarget }, { _id: isObjectId ? landTarget : null }] },
                {
                  status: status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : 'QUERY_RAISED',
                  'rorVerification.verifiedWithBhulekh': status === 'APPROVED',
                  ...(status === 'APPROVED' ? { 'rorVerification.bhulekhSyncDate': new Date() } : {}),
                  $push: {
                    reviewTrail: {
                      action: status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : 'QUERY_RAISED',
                      reviewerName: reviewerName || 'Admin Officer',
                      remarks: reviewNotes || `Status updated to ${status}`,
                      timestamp: new Date(),
                    },
                  },
                }
              );
              console.log(`✓ Synchronized Land parcel ${landTarget} status to: ${status}`);
            }
          }
        }
      } catch (err) {
        console.error('Error in reviewing KYC application:', err.message);
      }
    }

    if (!application) {
      // Return simulated review payload
      application = {
        applicationId,
        status,
        reviewNotes,
        reviewedByName: reviewerName || 'Admin Officer',
        reviewedAt: new Date().toISOString(),
      };
    }

    return application.toJSON ? application.toJSON() : application;
  },

  /**
   * Resubmit Application with Corrections
   */
  async resubmitApplication(applicationId, updateData) {
    let application = null;

    if (mongoose.connection.readyState === 1) {
      try {
        application = await KYCApplication.findOne({
          $or: [{ applicationId }, { _id: mongoose.isValidObjectId(applicationId) ? applicationId : null }],
        });

        if (!application) {
          throw new AppError('KYC Application not found for resubmission', HTTP_STATUS.NOT_FOUND);
        }

        if (updateData.fatherName) application.fatherName = updateData.fatherName;
        if (updateData.address) application.address = { ...application.address, ...updateData.address };
        if (updateData.documents) application.documents = updateData.documents;
        if (updateData.photoName) {
          application.documents.push({ docType: 'RESUBMITTED_PROOF', fileName: updateData.photoName, uploadedAt: new Date() });
        }

        application.status = 'PENDING_VERIFICATION';
        application.submittedAt = new Date();
        await application.save();
      } catch (e) {
        console.warn('Error resubmitting application:', e.message);
      }
    }

    return application ? (application.toJSON ? application.toJSON() : application) : { applicationId, status: 'PENDING_VERIFICATION' };
  },
};
