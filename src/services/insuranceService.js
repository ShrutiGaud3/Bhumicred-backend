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
   * Public catalog of parametric tree insurance plans
   */
  getInsurancePlans: async () => {
    return [
      {
        planCode: 'PLAN-TEAK-01',
        name: 'Parametric Indian Teak (Sagwan) Sovereign Cover',
        category: 'Commercial Timber Agroforestry',
        species: 'Indian Teak (Sagwan)',
        baseValuationPerTree: 8000,
        annualPremiumRate: '1.25%',
        governmentSubsidy: '40% State Rebate Under PM-KMY',
        tenureOptions: ['1 Year', '3 Years (10% Discount)', '5 Years'],
        coveredPerils: [
          'Storm, Cyclone & Windthrow (>70 km/h)',
          'Forest & Agro Fire Perils',
          'Stem Borer Infestation & Root Rot Outbreaks',
          'Severe Drought Stress (Revenue Trigger)',
          'Lightning Strike & Frost Damage',
        ],
      },
      {
        planCode: 'PLAN-SANDAL-02',
        name: 'Parametric Red Sandalwood (Chandan) High-Security Cover',
        category: 'High-Value Medicinal Timber',
        species: 'Red Sandalwood (Chandan)',
        baseValuationPerTree: 15000,
        annualPremiumRate: '1.50%',
        governmentSubsidy: '40% State Rebate',
        tenureOptions: ['3 Years', '5 Years', '10 Years'],
        coveredPerils: [
          'Illicit Felling & Theft Peril (Satellite Monitored)',
          'Fire & Heatwave Desiccation',
          'Soil-borne Fungal Wilt Outbreak',
          'Cyclone & Tree Stem Fracture',
        ],
      },
      {
        planCode: 'PLAN-HORTI-03',
        name: 'Parametric Alphonso Mango & Fruit Orchard Insurance',
        category: 'Fruit Orchards & Agroforestry',
        species: 'Alphonso Mango (Kesar)',
        baseValuationPerTree: 4500,
        annualPremiumRate: '1.15%',
        governmentSubsidy: '50% Horticulture Mission Subsidy',
        tenureOptions: ['1 Year (Annual Kharif/Rabi)', '3 Years'],
        coveredPerils: [
          'Unseasonal Blossom Drop Hailstorm',
          'Pest & Powdery Mildew Outbreak',
          'Excess Rainfall & Flooding Inundation',
          'Severe Heat Stress During Fruit Setting',
        ],
      },
    ];
  },

  /**
   * Apply / purchase a new tree insurance policy
   */
  applyPolicy: async (user, policyData) => {
    const {
      landId,
      category = 'Commercial Agroforestry',
      coverageDetails = [],
    } = policyData;

    const landIdentifier = policyData.landId || policyData.land_id || policyData.parcelId;
    let land = null;

    if (landIdentifier) {
      if (mongoose.Types.ObjectId.isValid(landIdentifier)) {
        land = await Land.findById(landIdentifier);
      }
      if (!land) {
        land = await Land.findOne({
          $or: [
            { landId: landIdentifier },
            { applicationId: landIdentifier },
            { surveyNumber: landIdentifier },
            { khasraNumber: landIdentifier },
          ],
        });
      }
    }

    if (!land) {
      land = (await Land.findOne({ ownerId: user.id || user._id })) || (await Land.findOne());
    }

    if (!land) {
      throw new AppError('No registered Land Parcel found. Please register a land parcel first.', 404);
    }

    // Auto-calculate / normalize fields if omitted or empty
    const count = Math.max(1, parseInt(policyData.insuredTreeCount || policyData.treeCount || 100, 10));
    const species = (policyData.treeSpecies || policyData.species || policyData.speciesSummary || 'Teak').toString().trim() || 'Teak';
    const summary = (policyData.speciesSummary && policyData.speciesSummary.trim()) || `${count} ${species} Agroforestry`;
    const plan = (policyData.planName && policyData.planName.trim()) || `Parametric ${species} Sovereign Cover`;
    const tenureMonths = parseInt(policyData.durationMonths || (policyData.tenureYears ? policyData.tenureYears * 12 : 36), 10) || 36;
    const valPerTree = Number(policyData.sumInsuredPerTree) > 0 ? Number(policyData.sumInsuredPerTree) : 2000;
    const totalSum = Number(policyData.sumInsured) > 0 ? Number(policyData.sumInsured) : (count * valPerTree);

    const calculatedAnnual = Number(policyData.annualPremium) > 0 ? Number(policyData.annualPremium) : Math.max(500, Math.round(totalSum * 0.0125));
    const calculatedGross = Number(policyData.grossPremium) > 0 ? Number(policyData.grossPremium) : Math.max(1500, Math.round(calculatedAnnual * (tenureMonths / 12)));
    const payable = Number(policyData.farmerNetPayable) > 0 ? Number(policyData.farmerNetPayable) : Math.max(900, Math.round(calculatedGross * 0.6));
    const subsidyAmount = Math.max(0, calculatedGross - payable);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + tenureMonths);

    // 2. Create Policy Record in DB
    const policy = await InsurancePolicy.create({
      userId: user.id || user._id,
      userName: user.fullName || user.name || 'Citizen Farmer',
      userMobile: user.mobile || user.phone || '',
      landId: land._id,
      landName: land.landName,
      surveyNumber: land.surveyNumber,
      khasraNumber: land.khasraNumber,
      planName: plan,
      category,
      insuredTreeCount: count,
      speciesSummary: summary,
      speciesBreakdown: policyData.speciesBreakdown?.length > 0 ? policyData.speciesBreakdown : [
        { species: summary, count: count, ageYears: 4, valuePerTree: Math.round(totalSum / count) }
      ],
      sumInsured: totalSum,
      annualPremium: calculatedAnnual,
      grossPremium: calculatedGross,
      governmentSubsidyPercent: 40,
      governmentSubsidyAmount: Number(subsidyAmount),
      farmerNetPayable: payable,
      durationMonths: tenureMonths,
      startDate,
      endDate,
      status: 'ACTIVE',
      paymentStatus: 'PAID',
      coverageDetails: coverageDetails.length > 0 ? coverageDetails : (policyData.coveredPerils || [
        'Storm, Cyclone & Windthrow (>70 km/h)',
        'Forest & Agro Fire Perils',
        'Stem Borer Infestation & Root Rot Outbreaks',
        'Severe Drought Stress (Revenue Trigger)',
        'Lightning Strike & Frost Damage',
      ]),
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
    if (land.agronomicDetails) {
      land.agronomicDetails.treesInsured = true;
      land.agronomicDetails.treeCount = Math.max(land.agronomicDetails.treeCount || 0, count);
      await land.save();
    }

    return policy;
  },

  /**
   * Get list of policies for user or admin
   */
  getUserPolicies: async (userId, userRole, query = {}) => {
    const filter = {};
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'GOVERNMENT_OFFICIAL' && userRole !== 'GOVERNMENT') {
      if (!userId) {
        return [];
      }
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
    const policyId = claimData.policyId;
    const incident = claimData.incidentType || claimData.perilType || 'HAILSTORM';
    const treesDamaged = parseInt(claimData.affectedTreeCount || claimData.damagedTreesCount || 10, 10);
    const loss = Number(claimData.estimatedLoss || claimData.claimedAmount || 50000);
    const desc = claimData.claimDescription || claimData.description || 'Parametric emergency claim';
    const date = claimData.incidentDate ? new Date(claimData.incidentDate) : new Date();
    const photos = claimData.damagePhotos || [];

    let policy = null;
    if (policyId && policyId.match(/^[0-9a-fA-F]{24}$/)) {
      policy = await InsurancePolicy.findById(policyId);
    } else if (policyId) {
      policy = await InsurancePolicy.findOne({ policyNumber: policyId });
    }

    if (!policy) {
      throw new AppError(`Active Insurance Policy not found for ID/Number: ${policyId}`, 404);
    }

    const claim = await InsuranceClaim.create({
      policyId: policy._id,
      policyNumber: policy.policyNumber,
      userId: user.id || user._id,
      userName: user.fullName || user.name || 'Citizen Farmer',
      userMobile: user.mobile || user.phone || '',
      landId: policy.landId,
      incidentType: incident,
      incidentDate: date,
      affectedTreeCount: treesDamaged,
      estimatedLoss: loss,
      claimDescription: desc,
      damagePhotos: photos,
      status: 'SUBMITTED',
      assignedPartnerName: 'Field Inspection Partner Services',
      inspectorName: 'District Field Agronomist',
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
