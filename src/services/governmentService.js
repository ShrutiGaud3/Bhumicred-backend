import { Scheme } from '../models/Scheme.js';
import { PublicAsset } from '../models/PublicAsset.js';
import { GovernmentCampaign } from '../models/GovernmentCampaign.js';
import { User } from '../models/User.js';
import { Land } from '../models/Land.js';

const INITIAL_SCHEMES = [
  {
    schemeCode: 'SCH-2026-001',
    title: 'PM Kisan Samman Nidhi (PM-KISAN)',
    slug: 'pm-kisan-samman-nidhi',
    authority: 'Ministry of Agriculture & Farmers Welfare, Govt of India',
    description:
      'Direct income support of ₹6,000 per year in three equal four-monthly installments directly to Aadhaar-linked bank accounts of all registered landholding farmer families.',
    benefits: '₹6,000 / year direct bank transfer in 3 installments of ₹2,000 each.',
    subsidyPercent: 100,
    subsidyMaxAmount: 6000,
    eligibility: 'All landholding farmer families with valid cultivable land parcel records in sovereign land registry.',
    requiredDocuments: ['Aadhaar Card', 'Digital 7/12 Land Record', 'Bank Account Passbook'],
    deadline: 'Rolling Continuous Enrollment',
    geography: 'National (All States & UTs)',
    category: 'DIRECT_INCOME',
    categoryLabel: 'Direct Income Support',
    status: 'ACTIVE',
  },
  {
    schemeCode: 'SCH-2026-002',
    title: 'Paramparagat Krishi Vikas Yojana (PKVY Organic Farming)',
    slug: 'paramparagat-krishi-vikas-yojana-organic',
    authority: 'Department of Agriculture, Cooperation & Farmers Welfare',
    description:
      'Promotes cluster-based organic farming with PGS (Participatory Guarantee System) certification, free bio-fertilizer inputs, and premium marketplace buyback linkages.',
    benefits: 'Financial assistance of ₹50,000 / hectare for 3 years for organic inputs, soil bio-char, and certification.',
    subsidyPercent: 85,
    subsidyMaxAmount: 50000,
    eligibility: 'Farmers willing to convert at least 1.0 Acre land holding to zero-chemical natural farming protocols.',
    requiredDocuments: ['Digital 7/12 RoR Extract', 'Soil Baseline Report', 'Aadhaar Card'],
    deadline: '31 December 2026',
    geography: 'Gujarat / National',
    category: 'ORGANIC_FARMING',
    categoryLabel: 'Organic Farming',
    status: 'ACTIVE',
  },
  {
    schemeCode: 'SCH-2026-003',
    title: 'Gujarat State Agroforestry Sapling & Solar Drip Subsidy',
    slug: 'gujarat-agroforestry-sapling-drip-subsidy',
    authority: 'Gujarat State Forest & Agriculture Department',
    description:
      'Provides free high-value ICFRE clonal timber saplings (Red Sandalwood, Teak, Mahogany) and 70% direct capital subsidy on automated solar micro-drip networks.',
    benefits: 'Free clonal saplings (up to 200 trees/acre) + 70% capital subsidy on solar drip automation.',
    subsidyPercent: 70,
    subsidyMaxAmount: 45000,
    eligibility: 'Farmers having minimum 1.0 Acre registered agricultural or bund parcel in Gujarat.',
    requiredDocuments: ['Digital 7/12 Land Extract', 'Borewell / Water Source NOC', 'Aadhaar Card'],
    deadline: '31 October 2026',
    geography: 'Gujarat',
    category: 'AGROFORESTRY_SUBSIDY',
    categoryLabel: 'Agroforestry Subsidies',
    status: 'ACTIVE',
  },
];

const INITIAL_PUBLIC_ASSETS = [
  {
    assetCode: 'AST-2026-001',
    name: 'Mogri Gram Panchayat Social Forestry Strip',
    category: 'COMMUNITY_GREEN_BELT',
    categoryLabel: 'Community Green Belt',
    state: 'Gujarat',
    district: 'Anand',
    taluka: 'Anand',
    gramPanchayat: 'Mogri',
    areaHectares: 14.2,
    treeCount: 3450,
    speciesSummary: 'Neem (1,400), Shisham (1,200), Peepal (850)',
    healthStatus: 'HEALTHY',
    encroachmentStatus: 'CLEAR',
    coordinates: [
      [72.93, 22.565],
      [72.938, 22.568],
      [72.936, 22.561],
      [72.929, 22.56],
    ],
    managingDepartment: 'Gujarat State Social Forestry Division',
  },
  {
    assetCode: 'AST-2026-002',
    name: 'Mahi Canal West Bank Plantation Buffer',
    category: 'CANAL_BUND_PLANTATION',
    categoryLabel: 'Canal Bund Plantation',
    state: 'Gujarat',
    district: 'Anand',
    taluka: 'Umreth',
    gramPanchayat: 'Khadana',
    areaHectares: 28.5,
    treeCount: 8200,
    speciesSummary: 'Subabul (4,000), Bamboo Clumps (2,200), Acacia (2,000)',
    healthStatus: 'MONITORED',
    encroachmentStatus: 'DISPUTE_FLAGGED',
    coordinates: [
      [72.945, 22.58],
      [72.955, 22.585],
      [72.952, 22.572],
      [72.942, 22.57],
    ],
    managingDepartment: 'Irrigation & Social Forestry Joint Wing',
  },
  {
    assetCode: 'AST-2026-003',
    name: 'State Highway 83 Roadside Tree Avenue',
    category: 'AVENUE_PLANTATION',
    categoryLabel: 'Avenue Plantation',
    state: 'Gujarat',
    district: 'Anand',
    taluka: 'Borsad',
    gramPanchayat: 'Borsad Rural',
    areaHectares: 18.0,
    treeCount: 2900,
    speciesSummary: 'Gulmohar (1,100), Banyan (600), Mahua (1,200)',
    healthStatus: 'HEALTHY',
    encroachmentStatus: 'CLEAR',
    coordinates: [
      [72.91, 22.53],
      [72.915, 22.535],
      [72.913, 22.528],
      [72.908, 22.525],
    ],
    managingDepartment: 'Roads & Buildings Forest Cell',
  },
];

const INITIAL_CAMPAIGNS = [
  {
    campaignCode: 'CMP-2026-001',
    title: 'Anand District Green Canopy & Teak Plantation Drive 2026',
    category: 'TREE_PLANTATION_DRIVE',
    categoryLabel: 'Tree Plantation Drive',
    targetQuota: '50,000 Saplings',
    targetCount: 50000,
    achievedCount: 38500,
    budget: {
      allocated: 2500000,
      spent: 1820000,
      currency: 'INR',
    },
    status: 'IN_PROGRESS',
    startDate: new Date('2026-06-01'),
    endDate: new Date('2026-10-31'),
    participatingFarmersCount: 412,
    leadDepartment: 'Gujarat State Social Forestry Division',
    district: 'Anand',
  },
  {
    campaignCode: 'CMP-2026-002',
    title: 'Kharif Pre-Sowing Free Soil Health Testing Camp',
    category: 'SOIL_TESTING_CAMPAIGN',
    categoryLabel: 'Soil Testing Campaign',
    targetQuota: '2,500 Soil Cards',
    targetCount: 2500,
    achievedCount: 2150,
    budget: {
      allocated: 850000,
      spent: 710000,
      currency: 'INR',
    },
    status: 'IN_PROGRESS',
    startDate: new Date('2026-05-15'),
    endDate: new Date('2026-09-30'),
    participatingFarmersCount: 1840,
    leadDepartment: 'District Agriculture Office, Anand',
    district: 'Anand',
  },
  {
    campaignCode: 'CMP-2026-003',
    title: 'Solar Micro-Drip Subsidy Enrollment Mission',
    category: 'SUBSIDY_ONBOARDING',
    categoryLabel: 'Subsidy Onboarding',
    targetQuota: '1,000 Ha Drip Installed',
    targetCount: 1000,
    achievedCount: 1000,
    budget: {
      allocated: 4500000,
      spent: 4450000,
      currency: 'INR',
    },
    status: 'COMPLETED',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-06-30'),
    participatingFarmersCount: 620,
    leadDepartment: 'Gujarat Green Revolution Company (GGRC)',
    district: 'Anand',
  },
];

class GovernmentService {
  /**
   * Seed default government collections
   */
  async seedDefaultDataIfEmpty() {
    try {
      const [schemeCount, assetCount, campCount] = await Promise.all([
        Scheme.countDocuments(),
        PublicAsset.countDocuments(),
        GovernmentCampaign.countDocuments(),
      ]);

      if (schemeCount === 0) {
        await Scheme.insertMany(INITIAL_SCHEMES);
        console.log(`[GovernmentService] Seeded ${INITIAL_SCHEMES.length} government schemes.`);
      }
      if (assetCount === 0) {
        await PublicAsset.insertMany(INITIAL_PUBLIC_ASSETS);
        console.log(`[GovernmentService] Seeded ${INITIAL_PUBLIC_ASSETS.length} public green assets.`);
      }
      if (campCount === 0) {
        await GovernmentCampaign.insertMany(INITIAL_CAMPAIGNS);
        console.log(`[GovernmentService] Seeded ${INITIAL_CAMPAIGNS.length} district campaigns.`);
      }
    } catch (e) {
      console.warn('[GovernmentService] Seed note:', e.message);
    }
  }

  // --- SCHEMES API ---
  async getSchemes(query = {}) {
    await this.seedDefaultDataIfEmpty();
    const { category, search, status = 'ACTIVE' } = query;
    const filter = {};

    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (category && category !== 'ALL') {
      filter.category = category;
    }
    if (search && search.trim()) {
      const term = search.trim();
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { authority: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
      ];
    }

    const schemes = await Scheme.find(filter).sort({ createdAt: -1 }).lean();
    return schemes;
  }

  async getSchemeById(id) {
    await this.seedDefaultDataIfEmpty();
    let scheme;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      scheme = await Scheme.findById(id).lean();
    }
    if (!scheme) {
      scheme = await Scheme.findOne({ slug: id }).lean();
    }
    if (!scheme) {
      scheme = await Scheme.findOne({ schemeCode: id }).lean();
    }
    if (!scheme) {
      throw new Error('Government scheme not found');
    }
    return scheme;
  }

  async applyForScheme(schemeId, user, { landId, remarks }) {
    await this.seedDefaultDataIfEmpty();
    let scheme;
    if (schemeId.match(/^[0-9a-fA-F]{24}$/)) {
      scheme = await Scheme.findById(schemeId);
    }
    if (!scheme) {
      scheme = await Scheme.findOne({ schemeCode: schemeId });
    }
    if (!scheme) {
      throw new Error('Scheme not found');
    }

    let land = null;
    if (landId) {
      if (landId.match(/^[0-9a-fA-F]{24}$/)) {
        land = await Land.findById(landId);
      }
      if (!land) {
        land = await Land.findOne({ landId });
      }
    }

    // Check duplicate application for same scheme and land
    if (land) {
      const existing = scheme.applications.find(
        (a) =>
          a.farmerId.toString() === (user._id || user.id).toString() &&
          a.landId &&
          a.landId.toString() === land._id.toString()
      );
      if (existing) {
        throw new Error('You have already applied for this scheme with this land parcel');
      }
    }

    const appId = `APP-SCH-${Math.floor(100000 + Math.random() * 900000)}`;

    scheme.applications.push({
      applicationId: appId,
      farmerId: user._id || user.id,
      farmerName: user.name || 'Farmer',
      farmerMobile: user.mobile || user.phone,
      landId: land ? land._id : undefined,
      landName: land ? land.landName : 'Self-Declared Plot',
      surveyNumber: land ? land.surveyNumber : 'N/A',
      areaAcres: land ? land.area || land.totalArea || 1.0 : 1.0,
      appliedAt: new Date(),
      status: 'SUBMITTED',
      subsidyAmount: scheme.subsidyMaxAmount || 6000,
      remarks: remarks || 'Direct application from farmer portal',
    });

    await scheme.save();
    return scheme;
  }

  // --- PUBLIC ASSETS API ---
  async getPublicAssets(query = {}) {
    await this.seedDefaultDataIfEmpty();
    const { category, search, taluka } = query;
    const filter = {};

    if (category && category !== 'ALL') {
      filter.category = category;
    }
    if (taluka && taluka !== 'ALL') {
      filter.taluka = { $regex: taluka, $options: 'i' };
    }
    if (search && search.trim()) {
      const term = search.trim();
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { taluka: { $regex: term, $options: 'i' } },
        { speciesSummary: { $regex: term, $options: 'i' } },
      ];
    }

    const assets = await PublicAsset.find(filter).sort({ createdAt: -1 }).lean();
    return assets;
  }

  async createPublicAsset(user, assetData) {
    const assetCode = `AST-2026-${Math.floor(100 + Math.random() * 900)}`;
    
    // Normalize category
    let category = assetData.category || 'COMMUNITY_GREEN_BELT';
    let categoryLabel = assetData.categoryLabel || category;
    if (category.toLowerCase().includes('canal')) {
      category = 'CANAL_BUND_PLANTATION';
      categoryLabel = 'Canal Bund Plantation';
    } else if (category.toLowerCase().includes('avenue')) {
      category = 'AVENUE_PLANTATION';
      categoryLabel = 'Avenue Plantation';
    } else if (category.toLowerCase().includes('panchayat') || category.toLowerCase().includes('grazing')) {
      category = 'RESERVED_PANCHAYAT_LAND';
      categoryLabel = 'Reserved Panchayat Land';
    } else {
      category = 'COMMUNITY_GREEN_BELT';
      categoryLabel = 'Community Green Belt';
    }

    const areaVal = parseFloat(String(assetData.areaHectares || assetData.area || 14.2).replace(/[^\d.]/g, '')) || 14.2;
    const treeVal = parseInt(String(assetData.treeCount || 2500).replace(/[^\d]/g, ''), 10) || 2500;

    const asset = new PublicAsset({
      ...assetData,
      assetCode,
      category,
      categoryLabel,
      areaHectares: areaVal,
      treeCount: treeVal,
    });
    await asset.save();
    return asset;
  }

  // --- CAMPAIGNS API ---
  async getCampaigns(query = {}) {
    await this.seedDefaultDataIfEmpty();
    const { status, category } = query;
    const filter = {};

    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (category && category !== 'ALL') {
      filter.category = category;
    }

    const campaigns = await GovernmentCampaign.find(filter).sort({ createdAt: -1 }).lean();
    return campaigns;
  }

  async createCampaign(user, campaignData) {
    const campaignCode = `CMP-2026-${Math.floor(100 + Math.random() * 900)}`;

    let category = campaignData.category || 'TREE_PLANTATION_DRIVE';
    let categoryLabel = campaignData.categoryLabel || category;
    if (category.toLowerCase().includes('soil')) {
      category = 'SOIL_TESTING_CAMPAIGN';
      categoryLabel = 'Soil Testing Campaign';
    } else if (category.toLowerCase().includes('subsidy')) {
      category = 'SUBSIDY_ONBOARDING';
      categoryLabel = 'Subsidy Onboarding';
    } else if (category.toLowerCase().includes('carbon')) {
      category = 'CARBON_CLUSTER_AGGREGATION';
      categoryLabel = 'Carbon Cluster Aggregation';
    } else {
      category = 'TREE_PLANTATION_DRIVE';
      categoryLabel = 'Tree Plantation Drive';
    }

    const targetNum = parseInt(String(campaignData.targetCount || campaignData.targetQuota || 10000).replace(/[^\d]/g, ''), 10) || 10000;
    const budgetVal = parseFloat(String(campaignData.budgetAllocated || campaignData.budget?.allocated || 1500000).replace(/[^\d.]/g, '')) || 1500000;

    const campaign = new GovernmentCampaign({
      ...campaignData,
      campaignCode,
      category,
      categoryLabel,
      targetCount: targetNum,
      budget: {
        allocated: budgetVal,
        spent: 0,
        currency: 'INR',
      },
    });
    await campaign.save();
    return campaign;
  }

  // --- FARMERS DIRECTORY IN AREA ---
  async getFarmersInArea(query = {}) {
    const { taluka, search } = query;
    const farmerFilter = { role: 'FARMER' };
    if (search && search.trim()) {
      farmerFilter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { mobile: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const farmers = await User.find(farmerFilter)
      .select('name mobile kycStatus address createdAt')
      .lean();

    // Attach real registered land plots count for each farmer
    const enhancedFarmers = await Promise.all(
      farmers.map(async (f) => {
        const lands = await Land.find({ ownerId: f._id }).select('landName surveyNumber area village').lean();
        const totalArea = lands.reduce((acc, l) => acc + (l.area || 1.0), 0);
        return {
          id: f._id,
          name: f.name || 'Kisan Farmer',
          mobile: f.mobile || '+91 98765 43210',
          kycStatus: f.kycStatus || 'VERIFIED',
          taluka: lands[0]?.village ? `${lands[0].village}, Anand` : 'Mogri, Anand',
          landCount: lands.length,
          totalHectares: Math.round(totalArea * 0.404686 * 10) / 10,
          lands,
        };
      })
    );

    return enhancedFarmers;
  }

  // --- GOVERNMENT DASHBOARD STATS ---
  async getGovernmentDashboardStats() {
    await this.seedDefaultDataIfEmpty();

    const [farmerCount, lands, assets, campaigns, schemes] = await Promise.all([
      User.countDocuments({ role: 'FARMER' }),
      Land.find().select('area totalArea').lean(),
      PublicAsset.find().lean(),
      GovernmentCampaign.find().lean(),
      Scheme.find().lean(),
    ]);

    const totalLandHectares = lands.reduce(
      (sum, l) => sum + (l.area || l.totalArea || 1.0) * 0.404686,
      0
    );

    const totalPublicTrees = assets.reduce((sum, a) => sum + (a.treeCount || 0), 0);
    const activeCampaigns = campaigns.filter((c) => c.status === 'IN_PROGRESS').length;
    const totalBudgetSpent = campaigns.reduce((sum, c) => sum + (c.budget?.spent || 0), 0);

    return {
      totalRegisteredFarmers: farmerCount || 1,
      totalSurveyedHectares: Math.round(totalLandHectares * 10) / 10,
      totalPublicForestTrees: totalPublicTrees,
      publicGreenAssetsCount: assets.length,
      activeCampaignsCount: activeCampaigns,
      totalSchemesCount: schemes.length,
      totalFundsDisbursed: totalBudgetSpent,
    };
  }
}

export const governmentService = new GovernmentService();
export default governmentService;
