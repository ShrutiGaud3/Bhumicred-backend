import mongoose from 'mongoose';
import { InsurancePolicy } from '../models/InsurancePolicy.js';
import { InsuranceClaim } from '../models/InsuranceClaim.js';
import { Land } from '../models/Land.js';
import { Document } from '../models/Document.js';
import { AppError } from '../utils/appError.js';

// Base species market valuations
const SPECIES_PRICING = {
  TEAK: { name: 'Indian Teak (Sagwan)', baseVal: 8000, riskMultiplier: 1.0 },
  SANDALWOOD: { name: 'Red Sandalwood (Chandan)', baseVal: 15000, riskMultiplier: 1.2 },
  MANGO: { name: 'Alphonso Mango (Kesar)', baseVal: 4500, riskMultiplier: 0.9 },
  COCONUT: { name: 'Hybrid Coconut Palm', baseVal: 3200, riskMultiplier: 0.85 },
  EUCALYPTUS: { name: 'Clonal Eucalyptus / Nilgiri', baseVal: 2200, riskMultiplier: 0.8 },
  CASUARINA: { name: 'Casuarina (Sarvi)', baseVal: 1800, riskMultiplier: 0.8 },
  OTHER: { name: 'Mixed Agroforestry Timber', baseVal: 5000, riskMultiplier: 1.0 },
};

export const insuranceService = {
  /**
   * Calculate live parametric insurance premium quote
   */
  calculateQuote: async (quoteData) => {
    const {
      treeCount = 100,
      species = 'TEAK',
      ageYears = 4,
      durationMonths = 36,
      category = 'Commercial Agroforestry',
    } = quoteData;

    const count = Math.max(1, parseInt(treeCount, 10));
    const speciesKey = Object.keys(SPECIES_PRICING).includes(species.toUpperCase())
      ? species.toUpperCase()
      : 'TEAK';

    const speciesInfo = SPECIES_PRICING[speciesKey];
    const ageFactor = Math.min(2.5, 1.0 + (parseFloat(ageYears) || 4) * 0.08);
    const valuePerTree = Math.round(speciesInfo.baseVal * ageFactor);
    const sumInsured = count * valuePerTree;

    // Premium calculation (1.25% base rate per annum)
    const baseAnnualRate = 0.0125 * speciesInfo.riskMultiplier;
    const annualPremium = Math.round(sumInsured * baseAnnualRate);
    const durationYears = durationMonths / 12;

    // Multi-year duration discount (10% off for 3 years)
    const durationDiscount = durationMonths >= 36 ? 0.9 : 1.0;
    const grossPremium = Math.round(annualPremium * durationYears * durationDiscount);

    // 40% Government Subsidized Under PM-KMY Agroforestry Scheme
    const subsidyPercent = 40;
    const subsidyAmount = Math.round(grossPremium * (subsidyPercent / 100));
    const farmerNetPayable = grossPremium - subsidyAmount;

    return {
      planName: `Parametric ${speciesInfo.name} Sovereign Cover`,
      species: speciesInfo.name,
      treeCount: count,
      ageYears: parseFloat(ageYears) || 4,
      valuePerTree,
      sumInsured,
      annualPremium,
      grossPremium,
      governmentSubsidyPercent: subsidyPercent,
      governmentSubsidyAmount: subsidyAmount,
      farmerNetPayable,
      durationMonths,
      recommendedPerils: [
        'Storm, Cyclone & Windthrow (>70 km/h)',
        'Forest & Agro Fire Perils',
        'Stem Borer Infestation & Root Rot Outbreaks',
        'Severe Drought Stress (Revenue Trigger)',
        'Lightning Strike & Frost Damage',
      ],
    };
  },

  /**
   * Apply / purchase a new tree insurance policy
   */
  applyPolicy: async (user, policyData) => {
    const {
      landId,
      planName,
      category = 'Commercial Agroforestry',
      insuredTreeCount,
      speciesSummary = 'Indian Teak Agroforestry',
      speciesBreakdown = [],
      sumInsured,
      annualPremium,
      grossPremium,
      farmerNetPayable,
      durationMonths = 36,
      coverageDetails = [],
    } = policyData;

    // 1. Verify Land Parcel exists
    const land = await Land.findById(landId);
    if (!land) {
      throw new AppError('Referenced Land Parcel not found', 404);
    }

    const calculatedAnnual = annualPremium || Math.round((farmerNetPayable || 12000) / (durationMonths / 12));
    const calculatedGross = grossPremium || Math.round(calculatedAnnual * (durationMonths / 12) * 1.66);
    const subsidyAmount = calculatedGross - (farmerNetPayable || Math.round(calculatedGross * 0.6));

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + parseInt(durationMonths, 10));

    // 2. Create Policy Record in DB
    const policy = await InsurancePolicy.create({
      userId: user.id || user._id,
      userName: user.fullName || user.name || 'Citizen Farmer',
      userMobile: user.mobile || user.phone || '',
      landId: land._id,
      landName: land.landName,
      surveyNumber: land.surveyNumber,
      khasraNumber: land.khasraNumber,
      planName,
      category,
      insuredTreeCount: parseInt(insuredTreeCount, 10),
      speciesSummary,
      speciesBreakdown: speciesBreakdown.length > 0 ? speciesBreakdown : [
        { species: speciesSummary, count: parseInt(insuredTreeCount, 10), ageYears: 4, valuePerTree: Math.round(sumInsured / insuredTreeCount) }
      ],
      sumInsured: Number(sumInsured),
      annualPremium: Number(calculatedAnnual),
      grossPremium: Number(calculatedGross),
      governmentSubsidyPercent: 40,
      governmentSubsidyAmount: Number(subsidyAmount),
      farmerNetPayable: Number(farmerNetPayable),
      durationMonths: parseInt(durationMonths, 10),
      startDate,
      endDate,
      status: 'ACTIVE',
      paymentStatus: 'PAID',
      coverageDetails: coverageDetails.length > 0 ? coverageDetails : [
        'Storm, Cyclone & Windthrow (>70 km/h)',
        'Forest & Agro Fire Perils',
        'Stem Borer Infestation & Root Rot Outbreaks',
        'Severe Drought Stress (Revenue Trigger)',
        'Lightning Strike & Frost Damage',
      ],
      underwritingScore: 94,
    });

    // 3. Auto-link to Document Vault
    try {
      const doc = await Document.create({
        userId: user.id || user._id,
        userName: user.fullName || user.name,
        userRole: user.role || 'FARMER',
        landId: land._id,
        title: `Tree Insurance Policy Bond ${policy.policyNumber}.pdf`,
        category: 'INSURANCE',
        documentType: 'TREE_POLICY',
        fileName: `${policy.policyNumber}_Certificate.pdf`,
        fileSize: '2.1 MB',
        status: 'VERIFIED',
        verifiedBy: 'National Agro-Insurance Underwriting Board',
        verificationNotes: `Subsidized under PM-KMY (₹${subsidyAmount.toLocaleString('en-IN')} Govt Grant Applied).`,
      });
      policy.certificateDocId = doc._id;
      await policy.save();
    } catch (e) {
      // Non-blocking
    }

    // 4. Update Land Model agronomic details
    land.agronomicDetails.treesInsured = true;
    land.agronomicDetails.treeCount = Math.max(land.agronomicDetails.treeCount || 0, parseInt(insuredTreeCount, 10));
    await land.save();

    return policy;
  },

  /**
   * Get list of policies for user or admin
   */
  getUserPolicies: async (userId, userRole, query = {}) => {
    const filter = {};
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'GOVERNMENT_OFFICIAL' && userRole !== 'GOVERNMENT') {
      filter.userId = userId;
    } else if (query.userId) {
      filter.userId = query.userId;
    }

    if (query.status && query.status !== 'ALL') {
      filter.status = query.status;
    }

    if (query.landId) {
      filter.landId = query.landId;
    }

    let policies = await InsurancePolicy.find(filter)
      .sort({ createdAt: -1 })
      .populate('landId', 'landName surveyNumber khasraNumber area boundaries');

    // Seed default starter policy if none exist for demo
    if (policies.length === 0 && (userRole === 'FARMER' || userRole === 'SUPER_ADMIN')) {
      const anyLand = await Land.findOne({ ownerId: userId }) || await Land.findOne();
      if (anyLand) {
        const seedPolicy = await InsurancePolicy.create({
          policyNumber: `BC-POL-${new Date().getFullYear()}-00481`,
          userId: userId,
          userName: 'Simran Sonaniya',
          userMobile: '9575261938',
          landId: anyLand._id,
          landName: anyLand.landName,
          surveyNumber: anyLand.surveyNumber,
          khasraNumber: anyLand.khasraNumber,
          planName: 'Comprehensive Teak & Sandalwood Cover',
          category: 'Commercial Agroforestry',
          insuredTreeCount: 180,
          speciesSummary: '120 Indian Teak + 60 Red Sandalwood',
          sumInsured: 1450000,
          annualPremium: 18200,
          grossPremium: 54600,
          governmentSubsidyPercent: 40,
          governmentSubsidyAmount: 21840,
          farmerNetPayable: 32760,
          durationMonths: 36,
          startDate: new Date('2026-06-01'),
          endDate: new Date('2029-05-31'),
          status: 'ACTIVE',
        });
        policies = [seedPolicy];
      }
    }

    return policies;
  },

  /**
   * Get single policy by ID or Policy Number
   */
  getPolicyById: async (policyIdOrNumber, userId, userRole) => {
    let policy = null;
    if (policyIdOrNumber.match(/^[0-9a-fA-F]{24}$/)) {
      policy = await InsurancePolicy.findById(policyIdOrNumber).populate('landId');
    } else {
      policy = await InsurancePolicy.findOne({ policyNumber: policyIdOrNumber }).populate('landId');
    }

    if (!policy) {
      throw new AppError('Insurance Policy not found', 404);
    }

    if (
      userRole !== 'SUPER_ADMIN' &&
      userRole !== 'GOVERNMENT' &&
      userRole !== 'PARTNER' &&
      policy.userId.toString() !== userId.toString()
    ) {
      throw new AppError('Access denied to policy details', 403);
    }

    return policy;
  },

  /**
   * Raise a new emergency insurance claim
   */
  raiseClaim: async (user, claimData) => {
    const {
      policyId,
      incidentType,
      incidentDate,
      affectedTreeCount,
      estimatedLoss,
      claimDescription = '',
      damagePhotos = [],
    } = claimData;

    let policy = null;
    if (policyId.match(/^[0-9a-fA-F]{24}$/)) {
      policy = await InsurancePolicy.findById(policyId);
    } else {
      policy = await InsurancePolicy.findOne({ policyNumber: policyId });
    }

    if (!policy) {
      throw new AppError('Active Insurance Policy not found for this claim', 404);
    }

    const claim = await InsuranceClaim.create({
      policyId: policy._id,
      policyNumber: policy.policyNumber,
      userId: user.id || user._id,
      userName: user.fullName || user.name || 'Citizen Farmer',
      userMobile: user.mobile || user.phone || '',
      landId: policy.landId,
      incidentType,
      incidentDate: new Date(incidentDate),
      affectedTreeCount: parseInt(affectedTreeCount, 10),
      estimatedLoss: Number(estimatedLoss),
      claimDescription,
      damagePhotos,
      status: 'SUBMITTED',
      assignedPartnerName: 'AgriTech Field Services Central',
      inspectorName: 'Devang Joshi (Senior Agronomist)',
      inspectionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // in 3 days
    });

    policy.status = 'CLAIM_IN_PROGRESS';
    await policy.save();

    return claim;
  },

  /**
   * Get list of claims
   */
  getUserClaims: async (userId, userRole, query = {}) => {
    const filter = {};
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'GOVERNMENT_OFFICIAL' && userRole !== 'PARTNER') {
      filter.userId = userId;
    }

    if (query.status && query.status !== 'ALL') {
      filter.status = query.status;
    }

    let claims = await InsuranceClaim.find(filter)
      .sort({ createdAt: -1 })
      .populate('policyId', 'planName sumInsured policyNumber');

    // Seed default claim if none exists
    if (claims.length === 0 && (userRole === 'FARMER' || userRole === 'SUPER_ADMIN')) {
      const anyPolicy = await InsurancePolicy.findOne({ userId });
      if (anyPolicy) {
        const seedClaim = await InsuranceClaim.create({
          claimNumber: `CLM-${new Date().getFullYear()}-0811`,
          policyId: anyPolicy._id,
          policyNumber: anyPolicy.policyNumber,
          userId: userId,
          userName: 'Simran Sonaniya',
          userMobile: '9575261938',
          landId: anyPolicy.landId,
          incidentType: 'Severe Hailstorm & Windthrow',
          incidentDate: new Date('2026-07-18'),
          affectedTreeCount: 18,
          estimatedLoss: 125000,
          status: 'INSPECTION_SCHEDULED',
          assignedPartnerName: 'AgriTech Field Services',
          inspectorName: 'Devang Joshi',
          inspectionDate: new Date('2026-09-12'),
        });
        claims = [seedClaim];
      }
    }

    return claims;
  },

  /**
   * Get single claim details
   */
  getClaimById: async (claimIdOrNumber, userId, userRole) => {
    let claim = null;
    if (claimIdOrNumber.match(/^[0-9a-fA-F]{24}$/)) {
      claim = await InsuranceClaim.findById(claimIdOrNumber).populate('policyId');
    } else {
      claim = await InsuranceClaim.findOne({ claimNumber: claimIdOrNumber }).populate('policyId');
    }

    if (!claim) {
      throw new AppError('Insurance claim not found', 404);
    }

    return claim;
  },

  /**
   * Update claim status and milestone timeline
   */
  updateClaimStatus: async (claimId, adminUser, updateData) => {
    const { status, approvedPayoutAmount, remarks, inspectorName, inspectionDate } = updateData;

    let claim = null;
    if (claimId.match(/^[0-9a-fA-F]{24}$/)) {
      claim = await InsuranceClaim.findById(claimId);
    } else {
      claim = await InsuranceClaim.findOne({ claimNumber: claimId });
    }

    if (!claim) {
      throw new AppError('Insurance claim not found', 404);
    }

    claim.status = status;
    if (approvedPayoutAmount !== undefined) claim.approvedPayoutAmount = approvedPayoutAmount;
    if (inspectorName) claim.inspectorName = inspectorName;
    if (inspectionDate) claim.inspectionDate = new Date(inspectionDate);

    // Update timeline
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    if (status === 'DESK_REVIEW') {
      claim.timeline[1] = { title: 'Desk Review Completed', timestamp: today, completed: true, remarks: remarks || 'Desk validation passed' };
    } else if (status === 'INSPECTION_SCHEDULED') {
      claim.timeline[2] = { title: 'Field Partner Assigned', timestamp: today, completed: true, remarks: `Assigned to ${claim.inspectorName}` };
    } else if (status === 'APPROVED' || status === 'SETTLED') {
      claim.timeline[3] = { title: 'On-Site GPS Inspection', timestamp: today, completed: true, remarks: 'Verified damage on GPS grid' };
      claim.timeline[4] = { title: 'Settlement Decision', timestamp: today, completed: true, remarks: `₹${claim.approvedPayoutAmount || claim.estimatedLoss} approved` };
      claim.settlementDetails.creditedToWallet = true;
      claim.settlementDetails.settledAt = new Date();
      claim.settlementDetails.payoutTxnId = `TXN-CLAIM-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    await claim.save();
    return claim;
  },

  /**
   * Macro Insurance & Claim Analytics
   */
  getInsuranceStats: async (userId, userRole) => {
    const filter = {};
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'GOVERNMENT' && userRole !== 'GOVERNMENT_OFFICIAL') {
      filter.userId = new mongoose.Types.ObjectId(userId);
    }

    const totalPolicies = await InsurancePolicy.countDocuments(filter);
    const activePolicies = await InsurancePolicy.countDocuments({ ...filter, status: 'ACTIVE' });

    const totalClaims = await InsuranceClaim.countDocuments(filter);
    const settledClaims = await InsuranceClaim.countDocuments({ ...filter, status: 'SETTLED' });

    const sumAgg = await InsurancePolicy.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalSumInsured: { $sum: '$sumInsured' },
          totalTrees: { $sum: '$insuredTreeCount' },
          totalSubsidy: { $sum: '$governmentSubsidyAmount' },
        },
      },
    ]);

    return {
      totalPolicies,
      activePolicies,
      totalClaims,
      settledClaims,
      totalSumInsured: sumAgg[0]?.totalSumInsured || 1830000,
      totalInsuredTrees: sumAgg[0]?.totalTrees || 225,
      totalGovernmentSubsidyDisbursed: sumAgg[0]?.totalSubsidy || 42800,
      claimsSettlementRatio: '98.4%',
    };
  },
};

export default insuranceService;
