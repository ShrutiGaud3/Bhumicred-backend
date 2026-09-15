import mongoose from 'mongoose';
import { Land } from '../models/Land.js';
import { User } from '../models/User.js';
import { KYCApplication } from '../models/KYCApplication.js';
import { InsurancePolicy } from '../models/InsurancePolicy.js';
import { AppError } from '../utils/appError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ROLES } from '../constants/roles.js';

/**
 * Generate a unique Land ID (e.g. LND-54218)
 */
const generateLandId = async () => {
  let isUnique = false;
  let generatedId = '';

  while (!isUnique) {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    generatedId = `LND-${randomSuffix}`;
    const existing = await Land.findOne({ landId: generatedId });
    if (!existing) {
      isUnique = true;
    }
  }

  return generatedId;
};

/**
 * Calculate simple centroid from coordinate pairs [[lng, lat], ...]
 */
const calculateCentroid = (coords) => {
  if (!coords || !Array.isArray(coords) || coords.length === 0) {
    return [72.9281, 22.5645]; // Default fallback
  }

  let totalLng = 0;
  let totalLat = 0;
  const count = coords.length;

  for (const pt of coords) {
    totalLng += Number(pt[0]);
    totalLat += Number(pt[1]);
  }

  return [Number((totalLng / count).toFixed(6)), Number((totalLat / count).toFixed(6))];
};

export const landService = {
  /**
   * Register a new land parcel
   */
  async registerLand(userId, landData, userObj) {
    let user = null;
    if (userId && mongoose.isValidObjectId(userId)) {
      user = await User.findById(userId);
    }
    if (!user && (userObj?.phone || userObj?.mobile || landData.ownerMobile)) {
      const cleanPhone = (userObj?.phone || userObj?.mobile || landData.ownerMobile).replace(/\D/g, '');
      user = await User.findOne({ mobile: cleanPhone });
    }
    if (!user) {
      user = userObj || {
        _id: mongoose.isValidObjectId(userId) ? userId : new mongoose.Types.ObjectId(),
        name: landData.ownerName || 'Citizen Farmer',
        mobile: landData.ownerMobile || '',
        role: ROLES.FARMER,
      };
    }

    const landId = await generateLandId();

    // Prepare coordinates
    let simpleCoordinates = [];
    let geoJsonCoordinates = [];

    if (Array.isArray(landData.coordinates) && landData.coordinates.length > 0) {
      simpleCoordinates = landData.coordinates;
      // Close the polygon ring if not closed
      const ring = [...landData.coordinates];
      if (
        ring.length >= 3 &&
        (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])
      ) {
        ring.push(ring[0]);
      }
      geoJsonCoordinates = [ring];
    } else if (Array.isArray(landData.simpleCoordinates) && landData.simpleCoordinates.length > 0) {
      simpleCoordinates = landData.simpleCoordinates;
      const ring = [...landData.simpleCoordinates];
      if (
        ring.length >= 3 &&
        (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])
      ) {
        ring.push(ring[0]);
      }
      geoJsonCoordinates = [ring];
    }

    const centroid = calculateCentroid(simpleCoordinates);

    const validOwnerId = mongoose.isValidObjectId(user?._id)
      ? user._id
      : mongoose.isValidObjectId(userId)
      ? userId
      : new mongoose.Types.ObjectId();

    const newLand = new Land({
      landId,
      ownerId: validOwnerId,
      ownerName: user?.name || landData.ownerName || 'Citizen Farmer',
      ownerMobile: user?.mobile || landData.ownerMobile || '',
      landName: landData.landName,
      surveyNumber: landData.surveyNumber,
      khasraNumber: landData.khasraNumber,
      khatauniNumber: landData.khatauniNumber || '',
      landType: landData.landType || 'Agricultural (Irrigated)',
      ownershipType: landData.ownershipType || 'Individual Owner',
      area: Number(landData.area || landData.areaAcres || 1),
      areaUnit: landData.areaUnit || 'Acres',
      location: {
        country: 'India',
        state: landData.state || landData.location?.state || user.address?.state || 'Gujarat',
        district: landData.district || landData.location?.district || user.address?.district || 'Anand',
        taluka: landData.taluka || landData.location?.taluka || user.address?.taluka || '',
        village: landData.village || landData.location?.village || user.address?.village || 'Mogri',
        pincode: landData.pincode || landData.location?.pincode || user.address?.pincode || '',
        address: landData.address || landData.location?.address || '',
      },
      boundaries: {
        type: 'Polygon',
        coordinates: geoJsonCoordinates,
        simpleCoordinates,
        centroid,
      },
      agronomicDetails: {
        soilType: landData.soilType || landData.agronomicDetails?.soilType || 'Alluvial Loam',
        irrigationSource:
          landData.irrigationSource ||
          landData.agronomicDetails?.irrigationSource ||
          'Borewell & Drip Irrigation',
        primaryCrops:
          landData.primaryCrops ||
          landData.agronomicDetails?.primaryCrops ||
          ['Cotton', 'Wheat', 'Paddy'],
        treeCount: Number(landData.treeCount || landData.agronomicDetails?.treeCount || 0),
        treesInsured: Boolean(landData.treesInsured ?? landData.agronomicDetails?.treesInsured ?? false),
        soilReportStatus:
          landData.soilReportStatus ||
          landData.agronomicDetails?.soilReportStatus ||
          'NOT_REQUESTED',
        soilHealthCardNumber:
          landData.soilHealthCardNumber ||
          landData.agronomicDetails?.soilHealthCardNumber ||
          '',
      },
      rorVerification: {
        statePortal: landData.statePortal || landData.rorVerification?.statePortal || 'AnyRoR Gujarat',
        rorDocumentUrl: landData.rorDocumentUrl || landData.rorVerification?.rorDocumentUrl || '',
        verifiedWithBhulekh: Boolean(landData.verifiedWithBhulekh ?? false),
        bhulekhSyncDate: landData.verifiedWithBhulekh ? new Date() : null,
      },
      status: 'PENDING_VERIFICATION',
      riskScore: 'LOW',
      reviewTrail: [
        {
          action: 'SUBMITTED',
          reviewerId: user._id,
          reviewerName: user.name || 'Applicant',
          remarks: 'New land parcel cadastral registration submitted for verification.',
          timestamp: new Date(),
        },
      ],
    });

    await newLand.save();

    // Also automatically register in Admin Approval Queue (KYCApplication collection)
    let validUserId = undefined;
    try {
      validUserId = mongoose.isValidObjectId(user._id)
        ? user._id
        : mongoose.isValidObjectId(userId)
        ? userId
        : undefined;

      const kycApp = new KYCApplication({
        applicationId: `APP-LND-${newLand.landId}`,
        userId: validUserId,
        type: 'LAND_REGISTRATION',
        title: `Land Title Registration - Khasra ${newLand.khasraNumber} (Survey ${newLand.surveyNumber})`,
        applicantName: user.name || newLand.ownerName || 'Citizen Farmer',
        fatherName: user.fatherName || '',
        gender: user.gender || 'MALE',
        mobile: user.mobile || newLand.ownerMobile || '',
        email: user.email || '',
        role: user.role || 'FARMER',
        address: {
          country: newLand.location?.country || 'India',
          state: newLand.location?.state || 'Gujarat',
          district: newLand.location?.district || 'Anand',
          city: newLand.location?.district || 'Anand',
          gramPanchayat: `${newLand.location?.village || 'Mogri'} Gram Panchayat`,
          pincode: newLand.location?.pincode || '388345',
          fullAddress: newLand.location?.address || `${newLand.location?.village || ''}, ${newLand.location?.district || ''}`,
        },
        status: 'PENDING_VERIFICATION',
        riskScore: 'LOW',
        targetId: newLand.landId,
        submittedAt: new Date(),
      });
      await kycApp.save();
      console.log(`✓ Admin KYCApplication created for land registration: APP-LND-${newLand.landId}`);
    } catch (queueErr) {
      console.warn('KYC queue sync warning for land registration:', queueErr?.message);
    }

    // If tree insurance was selected during registration, automatically create active Insurance Policy
    if (landData.optInsurance || landData.treesInsured || landData.agronomicDetails?.treesInsured) {
      try {
        const insuredTreeCount = Number(landData.insuredTreeCount || landData.standingTreeCount || landData.treeCount || 50);
        const sumInsured = insuredTreeCount * 8000;
        const grossPremium = Math.round(sumInsured * 0.0125 * 3 * 0.9);
        const subsidyAmount = Math.round(grossPremium * 0.4);
        const netPayable = grossPremium - subsidyAmount;

        const policy = new InsurancePolicy({
          policyNumber: `BC-POL-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
          userId: validUserId || new mongoose.Types.ObjectId(),
          userName: user?.name || newLand.ownerName || 'Citizen Farmer',
          userMobile: user?.mobile || newLand.ownerMobile || '',
          landId: newLand._id,
          landName: newLand.landName,
          surveyNumber: newLand.surveyNumber,
          khasraNumber: newLand.khasraNumber,
          planName: landData.insurancePlan || 'Parametric Agroforestry Sovereign Cover',
          category: 'Commercial Agroforestry',
          insuredTreeCount,
          speciesSummary: 'Indian Teak & High-Yield Agroforestry',
          sumInsured,
          annualPremium: Math.round(sumInsured * 0.0125),
          grossPremium,
          governmentSubsidyPercent: 40,
          governmentSubsidyAmount: subsidyAmount,
          farmerNetPayable: netPayable,
          durationMonths: 36,
          startDate: new Date(),
          endDate: new Date(Date.now() + 36 * 30 * 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
          paymentStatus: 'PAID',
        });
        await policy.save();
        console.log(`✓ Active Tree Insurance Policy created for land: ${policy.policyNumber}`);
      } catch (polErr) {
        console.warn('Policy creation note on land registration:', polErr?.message);
      }
    }

    // Increment user's totalLandAcres / totalLands count if tracked
    if (user.stats) {
      user.stats.totalLands = (user.stats.totalLands || 0) + 1;
      user.stats.totalAcres = (user.stats.totalAcres || 0) + newLand.area;
      await user.save();
    }

    return newLand;
  },

  /**
   * Get all registered lands for the logged-in user
   */
  async getMyLands(userId, query = {}) {
    const { search, status, page = 1, limit = 20 } = query;

    const isObjectId = mongoose.isValidObjectId(userId);
    let ownerQueries = [];
    if (isObjectId) {
      ownerQueries.push({ ownerId: userId });
      const user = await User.findById(userId);
      if (user?.mobile) ownerQueries.push({ ownerMobile: user.mobile });
    } else if (userId) {
      ownerQueries.push({ ownerId: userId });
      const user = await User.findOne({ $or: [{ mobile: userId }, { name: userId }] });
      if (user) {
        ownerQueries.push({ ownerId: user._id });
        if (user.mobile) ownerQueries.push({ ownerMobile: user.mobile });
      }
    }

    // If no owner match found for the logged-in user, return empty results
    if (ownerQueries.length === 0) {
      return {
        lands: [],
        pagination: {
          total: 0,
          page: parseInt(page, 10) || 1,
          limit: parseInt(limit, 10) || 20,
          pages: 0,
        },
      };
    }

    const filter = { $or: ownerQueries };

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { landName: searchRegex },
        { surveyNumber: searchRegex },
        { khasraNumber: searchRegex },
        { 'location.village': searchRegex },
        { 'location.district': searchRegex },
      ];
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const [lands, total] = await Promise.all([
      Land.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit),
      Land.countDocuments(filter),
    ]);

    return {
      lands,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit) || 1,
      },
    };
  },

  /**
   * Get land details by ID (either MongoDB _id or custom landId)
   */
  async getLandById(identifier, userId, userRole) {
    const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);
    const filter = isObjectId ? { _id: identifier } : { landId: identifier };

    const land = await Land.findOne(filter).populate('ownerId', 'name mobile email role kycStatus');
    if (!land) {
      throw new AppError(`Land parcel not found for identifier: ${identifier}`, HTTP_STATUS.NOT_FOUND);
    }

    // Authorization check: allow owner or admin/officers
    const administrativeRoles = [
      ROLES.SUPER_ADMIN,
      ROLES.OPERATIONS_ADMIN,
      ROLES.VERIFICATION_ADMIN,
      ROLES.ADMIN_STAFF,
      ROLES.GOVERNMENT_OFFICIAL,
      ROLES.FIELD_AGENT,
      ROLES.INSURANCE_OFFICER,
    ];

    const isOwner = land.ownerId?._id?.toString() === userId?.toString() || land.ownerId?.toString() === userId?.toString();
    const isAdmin = administrativeRoles.includes(userRole);

    if (!isOwner && !isAdmin) {
      throw new AppError('You do not have permission to view this land parcel.', HTTP_STATUS.FORBIDDEN);
    }

    return land;
  },

  /**
   * Admin / Officer view of all land parcels across the sovereign registry
   */
  async getAllLands(query = {}) {
    const { search, status, state, district, village, page = 1, limit = 20 } = query;

    const filter = {};

    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (state) filter['location.state'] = new RegExp(state, 'i');
    if (district) filter['location.district'] = new RegExp(district, 'i');
    if (village) filter['location.village'] = new RegExp(village, 'i');

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { landName: searchRegex },
        { surveyNumber: searchRegex },
        { khasraNumber: searchRegex },
        { ownerName: searchRegex },
        { ownerMobile: searchRegex },
        { landId: searchRegex },
      ];
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const [lands, total] = await Promise.all([
      Land.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit),
      Land.countDocuments(filter),
    ]);

    return {
      lands,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit) || 1,
      },
    };
  },

  /**
   * Admin or Revenue Officer verifies and reviews land parcel
   */
  async verifyLand(identifier, reviewerUser, { action, status, remarks, verifiedWithBhulekh }) {
    const cleanId = String(identifier).replace(/^APP-LND-/, '');
    const isObjectId = mongoose.isValidObjectId(cleanId);
    const filter = isObjectId ? { $or: [{ _id: cleanId }, { landId: cleanId }, { landId: identifier }] } : { $or: [{ landId: cleanId }, { landId: identifier }] };

    const land = await Land.findOne(filter);
    if (!land) {
      throw new AppError('Land parcel not found', HTTP_STATUS.NOT_FOUND);
    }

    let targetStatus = status;
    if (action === 'APPROVE') targetStatus = 'APPROVED';
    if (action === 'REJECT') targetStatus = 'REJECTED';
    if (action === 'QUERY_RAISED' || action === 'REQUEST_CHANGES') targetStatus = 'QUERY_RAISED';

    if (!targetStatus) {
      targetStatus = 'APPROVED';
    }

    land.status = targetStatus;

    if (typeof verifiedWithBhulekh === 'boolean') {
      land.rorVerification.verifiedWithBhulekh = verifiedWithBhulekh;
      if (verifiedWithBhulekh) {
        land.rorVerification.bhulekhSyncDate = new Date();
      }
    } else if (targetStatus === 'APPROVED') {
      land.rorVerification.verifiedWithBhulekh = true;
      land.rorVerification.bhulekhSyncDate = new Date();
    }

    land.reviewTrail.push({
      action: action || targetStatus,
      reviewerId: mongoose.isValidObjectId(reviewerUser?._id) ? reviewerUser._id : (mongoose.isValidObjectId(reviewerUser?.id) ? reviewerUser.id : undefined),
      reviewerName: reviewerUser?.name || reviewerUser?.role || 'Admin Officer',
      remarks: remarks || `Status updated to ${targetStatus}`,
      timestamp: new Date(),
    });

    await land.save();
    return land;
  },

  /**
   * Update land parcel details
   */
  async updateLand(identifier, userId, updateData, userRole) {
    const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);
    const filter = isObjectId ? { _id: identifier } : { landId: identifier };

    const land = await Land.findOne(filter);
    if (!land) {
      throw new AppError('Land parcel not found', HTTP_STATUS.NOT_FOUND);
    }

    const isOwner = land.ownerId.toString() === userId.toString();
    const isAdmin = [ROLES.SUPER_ADMIN, ROLES.OPERATIONS_ADMIN, ROLES.VERIFICATION_ADMIN].includes(userRole);

    if (!isOwner && !isAdmin) {
      throw new AppError('Unauthorized to update this land parcel', HTTP_STATUS.FORBIDDEN);
    }

    // Updatable fields
    if (updateData.landName) land.landName = updateData.landName;
    if (updateData.landType) land.landType = updateData.landType;
    if (updateData.ownershipType) land.ownershipType = updateData.ownershipType;
    if (updateData.area) land.area = Number(updateData.area);
    if (updateData.agronomicDetails) {
      land.agronomicDetails = { ...land.agronomicDetails.toObject(), ...updateData.agronomicDetails };
    }
    if (updateData.coordinates && Array.isArray(updateData.coordinates)) {
      land.boundaries.simpleCoordinates = updateData.coordinates;
      land.boundaries.centroid = calculateCentroid(updateData.coordinates);
    }

    land.reviewTrail.push({
      action: 'UPDATED',
      reviewerId: userId,
      reviewerName: 'Owner/Editor',
      remarks: 'Land details updated.',
      timestamp: new Date(),
    });

    await land.save();
    return land;
  },

  /**
   * Aggregated GIS Statistics for Dashboard
   */
  async getGisStats() {
    const totalParcels = await Land.countDocuments();
    const approvedParcels = await Land.countDocuments({ status: 'APPROVED' });
    const pendingParcels = await Land.countDocuments({ status: 'PENDING_VERIFICATION' });

    const totalAcresResult = await Land.aggregate([
      { $group: { _id: null, totalAcres: { $sum: '$area' }, totalTrees: { $sum: '$agronomicDetails.treeCount' } } },
    ]);

    const totalAcres = totalAcresResult[0]?.totalAcres || 0;
    const totalTrees = totalAcresResult[0]?.totalTrees || 0;

    const districtDistribution = await Land.aggregate([
      { $group: { _id: '$location.district', count: { $sum: 1 }, totalArea: { $sum: '$area' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return {
      totalParcels,
      approvedParcels,
      pendingParcels,
      totalAcres: Number(totalAcres.toFixed(2)),
      totalTrees,
      districtDistribution,
    };
  },
};

export default landService;
