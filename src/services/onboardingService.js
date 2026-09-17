import mongoose from 'mongoose';
import { KYCApplication } from '../models/KYCApplication.js';
import { User } from '../models/User.js';
import { Land } from '../models/Land.js';
import { InsuranceClaim } from '../models/InsuranceClaim.js';
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

    // Status filter mapping
    if (filters.status && filters.status !== 'ALL') {
      if (filters.status === 'PENDING') {
        query.status = { $in: ['PENDING_VERIFICATION', 'PENDING_REVIEW', 'PENDING_APPROVAL', 'SUBMITTED', 'UNDER_REVIEW'] };
      } else if (filters.status === 'APPROVED') {
        query.status = { $in: ['APPROVED', 'ACTIVE', 'VERIFIED'] };
      } else if (filters.status === 'QUERY_REJECT') {
        query.status = { $in: ['QUERY_PENDING', 'QUERY_RAISED', 'REJECTED'] };
      } else {
        query.status = filters.status;
      }
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
        const kycItems = await KYCApplication.find(query).sort({ createdAt: -1 }).limit(100);
        items = kycItems.map((it) => (it.toJSON ? it.toJSON() : it));

        // Also query registered Users to ensure all officers/partners/farmers are accounted for
        if (!filters.type || filters.type === 'ALL' || filters.type === 'GOVERNMENT_ONBOARDING' || filters.type === 'PARTNER_ONBOARDING' || filters.type === 'FARMER_KYC') {
          const userQuery = { role: { $in: ['FARMER', 'GOVERNMENT', 'PARTNER'] } };
          if (filters.search) {
            const searchRegex = new RegExp(filters.search, 'i');
            userQuery.$or = [{ name: searchRegex }, { mobile: searchRegex }, { email: searchRegex }];
          }
          const allUsers = await User.find(userQuery).lean();
          for (const u of allUsers) {
            const cleanM = (u.mobile || '').replace(/\D/g, '');
            const existing = items.find(
              (it) => (it.mobile && it.mobile.replace(/\D/g, '') === cleanM) || (it.userId && String(it.userId) === String(u._id))
            );
            if (!existing) {
              const uType = u.role === 'GOVERNMENT' ? 'GOVERNMENT_ONBOARDING' : u.role === 'PARTNER' ? 'PARTNER_ONBOARDING' : 'FARMER_KYC';
              if (!filters.type || filters.type === 'ALL' || filters.type === uType) {
                items.push({
                  _id: u._id,
                  applicationId: u.applicationId || `BC-APP-${u._id.toString().slice(-6).toUpperCase()}`,
                  userId: u._id,
                  type: uType,
                  title: `${u.role === 'GOVERNMENT' ? 'Government Official Verification' : u.role === 'PARTNER' ? 'Enterprise Partner Verification' : 'Farmer KYC Verification'} - ${u.name}`,
                  applicantName: u.name,
                  fatherName: u.fatherName || '',
                  gender: u.gender || 'MALE',
                  mobile: u.mobile,
                  email: u.email || '',
                  role: u.role,
                  address: u.address || { city: 'Anand', state: 'Gujarat' },
                  status: u.kycStatus || u.status || 'APPROVED',
                  riskScore: 'LOW',
                  submittedAt: u.createdAt || new Date(),
                });
              }
            }
          }
        }

        // Also query Lands from Land collection if filter allows LAND_REGISTRATION
        if (!filters.type || filters.type === 'ALL' || filters.type === 'LAND_REGISTRATION') {
          const landQuery = {};
          if (filters.status && filters.status !== 'ALL') {
            if (filters.status === 'PENDING') {
              landQuery.status = { $in: ['PENDING_VERIFICATION', 'PENDING_REVIEW', 'SUBMITTED', 'UNDER_REVIEW'] };
            } else if (filters.status === 'APPROVED') {
              landQuery.status = { $in: ['APPROVED', 'ACTIVE', 'VERIFIED'] };
            } else if (filters.status === 'QUERY_REJECT') {
              landQuery.status = { $in: ['REJECTED', 'QUERY_RAISED', 'QUERY_PENDING'] };
            } else {
              landQuery.status = filters.status;
            }
          }

          if (filters.search) {
            const searchRegex = new RegExp(filters.search, 'i');
            landQuery.$or = [
              { landName: searchRegex },
              { khasraNumber: searchRegex },
              { surveyNumber: searchRegex },
              { ownerName: searchRegex },
              { ownerMobile: searchRegex },
              { landId: searchRegex },
            ];
          }

          const allLands = await Land.find(landQuery).sort({ createdAt: -1 }).limit(100);
          for (const l of allLands) {
            const existingIndex = items.findIndex(
              (it) => it.targetId === l.landId || it.applicationId === `APP-LND-${l.landId}`
            );
            const landItem = {
              _id: l._id,
              applicationId: `APP-LND-${l.landId}`,
              userId: l.ownerId,
              type: 'LAND_REGISTRATION',
              title: `Land Title Registration - ${l.landName || 'Parcel'} (Khasra ${l.khasraNumber || 'N/A'}, Survey ${l.surveyNumber || 'N/A'})`,
              applicantName: l.ownerName || 'Citizen Farmer',
              mobile: l.ownerMobile || '',
              role: 'FARMER',
              address: l.location,
              details: `${l.area || 0} Acres in ${l.location?.village || 'Local'}, ${l.location?.district || 'Anand'} • Soil: ${l.agronomicDetails?.soilType || 'Alluvial'}`,
              status: l.status || 'APPROVED',
              riskScore: l.riskScore || 'LOW',
              targetId: l.landId,
              submittedAt: l.createdAt || new Date(),
            };

            if (existingIndex >= 0) {
              // Sync status with land document
              items[existingIndex] = { ...items[existingIndex], ...landItem, status: l.status || items[existingIndex].status };
            } else {
              items.push(landItem);
            }
          }
        }

        // Also query Insurance Claims if filter allows INSURANCE_CLAIM
        if (!filters.type || filters.type === 'ALL' || filters.type === 'INSURANCE_CLAIM') {
          const claimQuery = {};
          if (filters.status && filters.status !== 'ALL') {
            if (filters.status === 'PENDING') {
              claimQuery.status = { $in: ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_VERIFICATION', 'INSPECTION_SCHEDULED'] };
            } else if (filters.status === 'APPROVED') {
              claimQuery.status = { $in: ['APPROVED', 'SETTLED', 'PAID'] };
            } else if (filters.status === 'QUERY_REJECT') {
              claimQuery.status = { $in: ['REJECTED', 'QUERY_PENDING'] };
            } else {
              claimQuery.status = filters.status;
            }
          }

          if (filters.search) {
            const searchRegex = new RegExp(filters.search, 'i');
            claimQuery.$or = [
              { claimNumber: searchRegex },
              { userName: searchRegex },
              { userMobile: searchRegex },
              { policyNumber: searchRegex },
              { incidentType: searchRegex },
            ];
          }

          const allClaims = await InsuranceClaim.find(claimQuery).sort({ createdAt: -1 }).limit(100);
          for (const c of allClaims) {
            const existingInQueue = items.some(
              (it) => it.targetId === c._id.toString() || it.targetId === c.claimNumber || it.applicationId === `APP-CLM-${c.claimNumber}` || it.id === c.claimNumber
            );
            if (!existingInQueue) {
              items.push({
                _id: c._id,
                applicationId: `APP-CLM-${c.claimNumber}`,
                userId: c.userId,
                type: 'INSURANCE_CLAIM',
                title: `Tree Loss Insurance Claim - ${c.incidentType || 'Claim'} (${c.affectedTreeCount || 0} Trees)`,
                applicantName: c.userName || 'Insured Farmer',
                mobile: c.userMobile || '',
                role: 'FARMER',
                details: `Policy: ${c.policyNumber || 'N/A'} • Estimated Loss: ₹${(Number(c.estimatedLoss) || 0).toLocaleString('en-IN')}`,
                status: c.status === 'SETTLED' ? 'APPROVED' : c.status === 'SUBMITTED' ? 'PENDING_VERIFICATION' : c.status,
                riskScore: 'LOW',
                targetId: c.claimNumber || c._id.toString(),
                submittedAt: c.createdAt || c.incidentDate || new Date(),
              });
            }
          }
        }
      } catch (err) {
        console.warn('Error reading admin KYC queue:', err.message);
      }
    }

    // Sort descending by submission/creation time
    items.sort((a, b) => new Date(b.submittedAt || b.createdAt || 0) - new Date(a.submittedAt || a.createdAt || 0));

    return items;
  },

  /**
   * Review Application (Approve, Reject, or Query)
   */
  async reviewApplication(applicationId, { status, reviewNotes, landData, reviewerId, reviewerName }) {
    if (!['APPROVED', 'REJECTED', 'QUERY_PENDING'].includes(status)) {
      throw new AppError('Status must be APPROVED, REJECTED, or QUERY_PENDING', HTTP_STATUS.BAD_REQUEST);
    }

    let application = null;

    if (mongoose.connection.readyState === 1) {
      try {
        const cleanMobileFromId = String(applicationId || '').replace(/\D/g, '');
        const isAppObjectId = mongoose.isValidObjectId(applicationId);

        // Find application by ID, appId, mobile, or targetId
        application = await KYCApplication.findOne({
          $or: [
            { applicationId },
            { _id: isAppObjectId ? applicationId : null },
            ...(cleanMobileFromId.length >= 10 ? [{ mobile: cleanMobileFromId }, { mobile: `+91${cleanMobileFromId}` }] : []),
            { targetId: applicationId },
          ],
        });

        const userStatus = status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : 'QUERY_PENDING';
        const userKycStatus = status === 'APPROVED' ? 'APPROVED' : 'PENDING_VERIFICATION';

        if (application) {
          application.status = status;
          application.reviewNotes = reviewNotes || '';
          if (reviewerId && mongoose.isValidObjectId(reviewerId)) application.reviewedBy = reviewerId;
          application.reviewedByName = reviewerName || 'Admin Officer';
          application.reviewedAt = new Date();
          await application.save();

          // Synchronize User Model Status!
          await User.findOneAndUpdate(
            {
              $or: [
                { mobile: application.mobile },
                { mobile: cleanMobileFromId },
                { _id: application.userId },
                { applicationId: application.applicationId },
              ],
            },
            {
              status: userStatus,
              kycStatus: userKycStatus,
            }
          );
          console.log(`✓ Synchronized User & KYC status for application ${application.applicationId} to: ${userStatus}`);

          // If this is a Land Registration application, synchronize the Land collection
          if (application.targetId || application.type === 'LAND_REGISTRATION') {
            const landTarget = application.targetId || application.applicationId?.replace(/^APP-LND-/, '');
            if (landTarget) {
              const isLandObjectId = mongoose.isValidObjectId(landTarget);
              await Land.findOneAndUpdate(
                { $or: [{ landId: landTarget }, { _id: isLandObjectId ? landTarget : null }] },
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
        } else {
          // If no direct KYCApplication document found, check if a User matches this ID/mobile
          const userDoc = await User.findOne({
            $or: [
              { applicationId },
              { _id: isAppObjectId ? applicationId : null },
              ...(cleanMobileFromId.length >= 10 ? [{ mobile: cleanMobileFromId }, { mobile: `+91${cleanMobileFromId}` }] : []),
            ],
          });

          if (userDoc) {
            userDoc.status = userStatus;
            userDoc.kycStatus = userKycStatus;
            await userDoc.save();

            // Create or update KYC application record so it shows as approved in MongoDB queries
            application = await KYCApplication.findOneAndUpdate(
              {
                $or: [
                  { userId: userDoc._id },
                  { mobile: userDoc.mobile },
                  { applicationId: userDoc.applicationId || applicationId },
                ],
              },
              {
                applicationId: userDoc.applicationId || applicationId,
                userId: userDoc._id,
                type: userDoc.role === 'PARTNER' ? 'PARTNER_ONBOARDING' : userDoc.role === 'GOVERNMENT' ? 'GOVERNMENT_ONBOARDING' : 'FARMER_KYC',
                title: `${userDoc.role || 'Citizen'} Verification - ${userDoc.name}`,
                applicantName: userDoc.name,
                mobile: userDoc.mobile,
                role: userDoc.role,
                status,
                reviewNotes: reviewNotes || '',
                reviewedByName: reviewerName || 'Admin Officer',
                reviewedAt: new Date(),
              },
              { upsert: true, new: true }
            );
            console.log(`✓ Synchronized User ${userDoc.name} (${userDoc.mobile}) to status: ${userStatus}`);
          }
          // Check if this application corresponds directly to a Land
          const rawLandId = applicationId?.replace(/^APP-LND-/, '');
          const isLandDocObjectId = mongoose.isValidObjectId(rawLandId);
          let landDoc = await Land.findOne({
            $or: [{ landId: rawLandId }, { landId: applicationId }, { _id: isLandDocObjectId ? rawLandId : null }],
          });

          if (landDoc) {
            landDoc.status = status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : 'QUERY_RAISED';
            if (status === 'APPROVED') {
              landDoc.rorVerification = landDoc.rorVerification || {};
              landDoc.rorVerification.verifiedWithBhulekh = true;
              landDoc.rorVerification.bhulekhSyncDate = new Date();
            }
            landDoc.reviewTrail.push({
              action: status,
              reviewerName: reviewerName || 'Admin Officer',
              remarks: reviewNotes || `Land status updated to ${status}`,
              timestamp: new Date(),
            });
            await landDoc.save();
            console.log(`✓ Direct Land parcel ${landDoc.landId} reviewed and saved to MongoDB with status: ${status}`);

            application = {
              applicationId,
              status,
              reviewNotes,
              targetId: landDoc.landId,
              type: 'LAND_REGISTRATION',
            };
          }

          // Check if this application corresponds to an Insurance Claim
          const rawClaimId = applicationId?.replace(/^APP-CLM-/, '');
          const isClaimObjectId = mongoose.isValidObjectId(rawClaimId);
          let claimDoc = await InsuranceClaim.findOne({
            $or: [{ claimNumber: rawClaimId }, { claimNumber: applicationId }, { _id: isClaimObjectId ? rawClaimId : null }],
          });

          if (claimDoc) {
            const claimStatus = status === 'APPROVED' ? 'SETTLED' : status === 'REJECTED' ? 'REJECTED' : 'UNDER_REVIEW';
            claimDoc.status = claimStatus;
            const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            if (claimStatus === 'SETTLED') {
              claimDoc.approvedPayoutAmount = claimDoc.estimatedLoss;
              claimDoc.settlementDetails = {
                creditedToWallet: true,
                settledAt: new Date(),
                payoutTxnId: `TXN-CLAIM-${Math.floor(100000 + Math.random() * 900000)}`,
              };
              claimDoc.timeline.push({
                title: 'Settlement Decision',
                timestamp: today,
                completed: true,
                remarks: reviewNotes || 'Claim DBT payout authorized by Super Admin',
              });
            } else if (claimStatus === 'REJECTED') {
              claimDoc.timeline.push({
                title: 'Claim Rejected',
                timestamp: today,
                completed: true,
                remarks: reviewNotes || 'Claim rejected by Super Admin Desk',
              });
            }
            await claimDoc.save();
            console.log(`✓ Synchronized Insurance Claim ${claimDoc.claimNumber} to status: ${claimStatus}`);

            application = {
              applicationId,
              status,
              reviewNotes,
              targetId: claimDoc.claimNumber,
              type: 'INSURANCE_CLAIM',
            };
          } else if (landData && !landDoc) {
            // Upsert / Save new approved land parcel directly to MongoDB Atlas!
            try {
              let user = null;
              if (landData.ownerMobile) {
                user = await User.findOne({ mobile: landData.ownerMobile.replace(/\D/g, '') });
              }
              const createdLand = new Land({
                landId: landData.id || landData.landId || rawLandId || `LND-${Math.floor(10000 + Math.random() * 90000)}`,
                ownerId: user?._id || new mongoose.Types.ObjectId(),
                ownerName: landData.ownerName || user?.name || 'Citizen Farmer',
                ownerMobile: landData.ownerMobile || user?.mobile || '',
                landName: landData.landName || 'Registered Agricultural Plot',
                surveyNumber: landData.surveyNumber || '108/A',
                khasraNumber: landData.khasraNumber || '412/9',
                landType: landData.landType || 'Agricultural (Irrigated)',
                ownershipType: landData.ownershipType || 'Individual Owner',
                area: Number(landData.area || landData.areaAcres || 5),
                areaUnit: landData.areaUnit || 'Acres',
                location: {
                  country: 'India',
                  state: landData.state || 'Gujarat',
                  district: landData.district || 'Anand',
                  village: landData.village || 'Mogri',
                  address: landData.address || `${landData.village || ''}, ${landData.district || 'Anand'}`,
                },
                agronomicDetails: {
                  soilType: landData.soilType || 'Alluvial Loam',
                  irrigationSource: landData.irrigationSource || 'Borewell & Drip Irrigation',
                  treeCount: Number(landData.treeCount || 0),
                  treesInsured: Boolean(landData.treesInsured),
                  soilReportStatus: 'NOT_REQUESTED',
                },
                rorVerification: {
                  statePortal: 'AnyRoR Gujarat',
                  verifiedWithBhulekh: status === 'APPROVED',
                  bhulekhSyncDate: status === 'APPROVED' ? new Date() : null,
                },
                status: status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : 'QUERY_RAISED',
                riskScore: 'LOW',
                reviewTrail: [
                  {
                    action: status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : 'QUERY_RAISED',
                    reviewerName: reviewerName || 'Admin Officer',
                    remarks: reviewNotes || `Land approved and saved in MongoDB Database by Admin`,
                    timestamp: new Date(),
                  },
                ],
              });
              await createdLand.save();
              console.log(`✓ Created and Approved Land parcel ${createdLand.landId} in MongoDB Atlas Database!`);

              application = {
                applicationId,
                status,
                reviewNotes,
                targetId: createdLand.landId,
                type: 'LAND_REGISTRATION',
              };
            } catch (createErr) {
              console.warn('Error persisting approved land to database:', createErr?.message);
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
