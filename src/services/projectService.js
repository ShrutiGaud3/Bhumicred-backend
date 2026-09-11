import { Project } from '../models/Project.js';
import { Land } from '../models/Land.js';

const INITIAL_PROJECTS = [
  {
    projectCode: 'PRJ-2026-001',
    title: 'Mogri Gram Cluster Agroforestry & Carbon Sequestration',
    slug: 'mogri-gram-cluster-agroforestry',
    scope:
      'Community bund planting of 1,200 native timber & fruit saplings (Red Sandalwood, Teak, Neem, and Mahua) with GPS polygon telemetry and satellite MRV carbon tracking.',
    category: 'CIVIC_AGROFORESTRY',
    categoryLabel: 'Civic Agroforestry',
    location: {
      state: 'Gujarat',
      district: 'Anand',
      taluka: 'Anand',
      gramPanchayat: 'Mogri',
      address: 'Mogri Panchayat, Anand, Gujarat',
      coordinates: { lat: 22.5645, lng: 72.9289 },
    },
    assignedPartner: {
      name: 'AgriTech Field Services',
      organization: 'AgriTech Field Solutions Pvt Ltd',
      contactPhone: '+91 98765 43210',
    },
    progress: 75,
    status: 'IN_PROGRESS',
    startDate: new Date('2026-02-01'),
    targetCompletion: new Date('2026-11-30'),
    carbonCreditEstimatePerAcre: 5.2,
    totalHectaresTarget: 45,
    saplingsTarget: 1200,
    saplingsPlanted: 920,
    budget: {
      allocatedAmount: 650000,
      disbursedAmount: 480000,
      currency: 'INR',
    },
    milestones: [
      {
        title: 'Site GIS Mapping & Soil Baseline',
        description: 'Drone cadastral survey and 12-parameter soil organic carbon baseline sampling.',
        date: '15 Feb 2026',
        completed: true,
        completedAt: new Date('2026-02-15'),
        verifiedBy: 'Govt Agroforestry Inspector',
      },
      {
        title: 'Sapling Procurement & Pit Preparation',
        description: 'Delivery of 1,200 ICFRE certified clonal saplings and mycorrhizal root dips.',
        date: '10 Apr 2026',
        completed: true,
        completedAt: new Date('2026-04-10'),
        verifiedBy: 'District Forest Officer',
      },
      {
        title: 'Drip Network Installation & Planting',
        description: 'Solar precision drip pulse lines installed along farm bund perimeters.',
        date: '25 Jun 2026',
        completed: true,
        completedAt: new Date('2026-06-25'),
        verifiedBy: 'AgriTech Lead Field Engineer',
      },
      {
        title: 'First-Quarter Survival Audit & Geotagging',
        description: 'Individual tree geotagging and canopy height assessment.',
        date: '15 Oct 2026',
        completed: false,
      },
      {
        title: 'Carbon Baseline Issuance & Registry Listing',
        description: 'Independent satellite MRV verification and carbon credit token allocation.',
        date: '30 Nov 2026',
        completed: false,
      },
    ],
  },
  {
    projectCode: 'PRJ-2026-002',
    title: 'Charotar Regenerative Soil & Drip Optimization Mission',
    slug: 'charotar-regenerative-soil-drip-mission',
    scope:
      'Installation of IoT solar soil probes, bio-dynamic compost drives, and cover cropping across 40 farmer land holdings in the Anand-Kheda agricultural belt.',
    category: 'SOIL_RESTORATION',
    categoryLabel: 'Soil Restoration',
    location: {
      state: 'Gujarat',
      district: 'Anand',
      taluka: 'Petlad',
      gramPanchayat: 'Sunav',
      address: 'Sunav - Petlad Belt, Anand, Gujarat',
      coordinates: { lat: 22.4862, lng: 72.8021 },
    },
    assignedPartner: {
      name: 'AgriTech Field Services',
      organization: 'AgriTech Field Solutions Pvt Ltd',
      contactPhone: '+91 98765 43210',
    },
    progress: 40,
    status: 'IN_PROGRESS',
    startDate: new Date('2026-05-15'),
    targetCompletion: new Date('2027-01-15'),
    carbonCreditEstimatePerAcre: 3.8,
    totalHectaresTarget: 80,
    saplingsTarget: 600,
    saplingsPlanted: 240,
    budget: {
      allocatedAmount: 450000,
      disbursedAmount: 180000,
      currency: 'INR',
    },
    milestones: [
      {
        title: 'Farmer Mobilization & Consent Workshops',
        description: 'Cluster farmer orientation on regenerative organic inputs and sensor telemetry.',
        date: '30 May 2026',
        completed: true,
        completedAt: new Date('2026-05-30'),
        verifiedBy: 'Gram Sevak Anand',
      },
      {
        title: 'Baseline Lab Soil Sampling',
        description: 'Collection of core samples across 38 holdings for chemical and biological indexing.',
        date: '15 Jul 2026',
        completed: true,
        completedAt: new Date('2026-07-15'),
        verifiedBy: 'Certified Soil Testing Lab Anand',
      },
      {
        title: 'Bio-Compost Distribution & Application',
        description: 'Delivery of 5,000L cold-fermented humic compost to participating farms.',
        date: '30 Sep 2026',
        completed: false,
      },
      {
        title: 'Impact Assessment & Soil Carbon Audit',
        description: 'Post-monsoon measurement of soil organic matter (SOM) percentage gains.',
        date: '15 Jan 2027',
        completed: false,
      },
    ],
  },
  {
    projectCode: 'PRJ-2026-003',
    title: 'Mahi River Watershed Bio-Shield & Bamboo Plantation',
    slug: 'mahi-river-watershed-bio-shield',
    scope:
      'Riparian buffer zone plantation of Beema Bamboo & vetiver grass to prevent soil erosion along Mahi riverbed and capture high-velocity carbon biomass.',
    category: 'BIODIVERSITY_CORRIDOR',
    categoryLabel: 'Biodiversity Corridor',
    location: {
      state: 'Gujarat',
      district: 'Anand',
      taluka: 'Umreth',
      gramPanchayat: 'Khadana',
      address: 'Mahi River Basin, Umreth, Anand, Gujarat',
      coordinates: { lat: 22.6978, lng: 73.1189 },
    },
    assignedPartner: {
      name: 'Gujarat Agro Forest Dept',
      organization: 'State Forestry Development Wing',
      contactPhone: '+91 94280 11223',
    },
    progress: 20,
    status: 'ENROLLING',
    startDate: new Date('2026-08-01'),
    targetCompletion: new Date('2027-04-30'),
    carbonCreditEstimatePerAcre: 6.5,
    totalHectaresTarget: 120,
    saplingsTarget: 3000,
    saplingsPlanted: 600,
    budget: {
      allocatedAmount: 1200000,
      disbursedAmount: 250000,
      currency: 'INR',
    },
    milestones: [
      {
        title: 'Riverbank Cadastral Zone Demarcation',
        description: 'High-precision satellite mapping of vulnerable river embankment parcels.',
        date: '15 Aug 2026',
        completed: true,
        completedAt: new Date('2026-08-15'),
        verifiedBy: 'Water Resources Dept Official',
      },
      {
        title: 'Community Landholder Enrollment Drive',
        description: 'Onboarding 50+ riparian plots into sovereign agroforestry registry.',
        date: '30 Sep 2026',
        completed: false,
      },
      {
        title: 'Bamboo Clump Root Inoculation & Planting',
        description: 'Planting fast-growing tissue cultured Bambusa balcooa clones.',
        date: '15 Nov 2026',
        completed: false,
      },
      {
        title: 'Erosion Barrier & Biomass Audit',
        description: 'LiDAR canopy profiling and initial biomass MRV certificate issuance.',
        date: '30 Apr 2027',
        completed: false,
      },
    ],
  },
];

class ProjectService {
  /**
   * Seed initial projects if DB is empty
   */
  async seedDefaultProjectsIfEmpty() {
    try {
      const count = await Project.countDocuments();
      if (count === 0) {
        await Project.insertMany(INITIAL_PROJECTS);
        console.log(`[ProjectService] Successfully seeded ${INITIAL_PROJECTS.length} default projects.`);
      }
    } catch (e) {
      console.warn('[ProjectService] Seed note:', e.message);
    }
  }

  /**
   * Get all projects with filters
   */
  async getProjects(query = {}) {
    await this.seedDefaultProjectsIfEmpty();

    const { category, status, district, search, farmerId } = query;
    const filter = {};

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (category && category !== 'ALL') {
      filter.category = category;
    }

    if (district && district !== 'ALL') {
      filter['location.district'] = { $regex: district, $options: 'i' };
    }

    if (farmerId) {
      filter['enrolledLands.farmerId'] = farmerId;
    }

    if (search && search.trim()) {
      const term = search.trim();
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { scope: { $regex: term, $options: 'i' } },
        { 'location.address': { $regex: term, $options: 'i' } },
        { 'location.gramPanchayat': { $regex: term, $options: 'i' } },
      ];
    }

    const projects = await Project.find(filter).sort({ createdAt: -1 }).lean();
    return projects;
  }

  /**
   * Get single project by ID, slug, or projectCode
   */
  async getProjectById(id) {
    await this.seedDefaultProjectsIfEmpty();

    let project;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      project = await Project.findById(id).lean();
    }
    if (!project) {
      project = await Project.findOne({ slug: id }).lean();
    }
    if (!project) {
      project = await Project.findOne({ projectCode: id }).lean();
    }

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  }

  /**
   * Create new sustainability project (Admin / Government / Partner)
   */
  async createProject(user, projectData) {
    const title = projectData.title || projectData.name || 'Community Agroforestry & Carbon Project';
    const scope = projectData.scope || projectData.description || 'Community afforestation and soil restoration initiative.';
    const category = (projectData.category || 'CIVIC_AGROFORESTRY').toUpperCase().replace(/[\s-]+/g, '_');
    const categoryLabel =
      projectData.categoryLabel ||
      category
        .split('_')
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(' ');

    const slug =
      projectData.slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + `-${Date.now().toString().slice(-4)}`;

    const projectCode =
      projectData.projectCode || `PRJ-2026-${Math.floor(100 + Math.random() * 900)}`;

    const milestones =
      projectData.milestones && projectData.milestones.length > 0
        ? projectData.milestones
        : [
            {
              title: 'Site GIS Demarcation & Baseline Survey',
              description: 'Initial cadastral mapping and soil carbon profiling.',
              date: new Date().toLocaleDateString('en-GB'),
              completed: true,
              completedAt: new Date(),
              verifiedBy: user?.name || user?.fullName || 'System Official',
            },
            {
              title: 'Farmer Enrollment & Sapling Distribution',
              description: 'Linking registered land parcels and distributing saplings.',
              date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toLocaleDateString('en-GB'),
              completed: false,
            },
            {
              title: 'First-Quarter Survival & Carbon Audit',
              description: 'Drone verification and carbon credit issuance.',
              date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120).toLocaleDateString('en-GB'),
              completed: false,
            },
          ];

    const project = new Project({
      ...projectData,
      title,
      scope,
      category,
      categoryLabel,
      projectCode,
      slug,
      createdBy: user?._id || user?.id,
      milestones,
    });

    await project.save();
    return project;
  }

  /**
   * Update project details
   */
  async updateProject(id, user, updateData) {
    const project = await Project.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  }

  /**
   * Enroll farmer's registered land into project
   */
  async enrollLandInProject(projectId, user, { landId }) {
    if (!landId) {
      throw new Error('Land ID is required for project enrollment');
    }

    let project = null;
    if (typeof projectId === 'string' && projectId.match(/^[0-9a-fA-F]{24}$/)) {
      project = await Project.findById(projectId);
    }
    if (!project) {
      project = await Project.findOne({ slug: projectId });
    }
    if (!project) {
      project = await Project.findOne({ projectCode: projectId });
    }

    if (!project) {
      throw new Error('Project not found');
    }

    let land = null;
    if (typeof landId === 'string' && landId.match(/^[0-9a-fA-F]{24}$/)) {
      land = await Land.findById(landId);
    }
    if (!land) {
      land = await Land.findOne({ landId: landId });
    }

    if (!land) {
      throw new Error('Registered land parcel not found');
    }

    // Verify ownership if applicable
    const landOwnerId = (land.ownerId || land.farmerId || land.userId || '')?.toString();
    const currentUserId = (user._id || user.id || '')?.toString();

    if (landOwnerId && currentUserId && landOwnerId !== currentUserId) {
      if (user.role !== 'SUPER_ADMIN' && user.role !== 'GOVERNMENT') {
        throw new Error('You can only enroll land parcels that you own');
      }
    }

    // Check if already enrolled in this project
    const alreadyEnrolled = (project.enrolledLands || []).some(
      (el) => el.landId && el.landId.toString() === (land._id || landId).toString()
    );

    if (alreadyEnrolled) {
      throw new Error('This land parcel is already enrolled in this sustainability project');
    }

    project.enrolledLands.push({
      landId: land._id,
      farmerId: user._id || user.id || land.ownerId,
      farmerName: user.name || land.ownerName || 'Farmer',
      landName: land.landName || `Survey ${land.surveyNumber}`,
      surveyNumber: land.surveyNumber,
      areaAcres: land.area || land.totalArea || 1.0,
      enrolledAt: new Date(),
      status: 'ACTIVE',
    });

    // Update project progress dynamically if planned/enrolling
    if (project.status === 'ENROLLING' && project.enrolledLands.length >= 5) {
      project.status = 'IN_PROGRESS';
    }

    await project.save();
    return project;
  }

  /**
   * Update or verify milestone
   */
  async updateMilestone(projectId, milestoneIndex, user, updateData) {
    let project = null;
    if (typeof projectId === 'string' && projectId.match(/^[0-9a-fA-F]{24}$/)) {
      project = await Project.findById(projectId);
    }
    if (!project) {
      project = await Project.findOne({ projectCode: projectId });
    }
    if (!project) {
      project = await Project.findOne({ slug: projectId });
    }
    if (!project) {
      throw new Error(`Project not found with ID/Code: ${projectId}`);
    }

    const milestone = project.milestones[milestoneIndex];
    if (!milestone) {
      throw new Error(`Milestone at index ${milestoneIndex} not found on project ${project.projectCode}`);
    }

    if (typeof updateData.completed === 'boolean') {
      milestone.completed = updateData.completed;
      if (updateData.completed) {
        milestone.completedAt = new Date();
        milestone.verifiedBy = user?.name || user?.fullName || 'Authorised Official';
      } else {
        milestone.completedAt = null;
        milestone.verifiedBy = null;
      }
    }

    if (updateData.title) milestone.title = updateData.title;
    if (updateData.description) milestone.description = updateData.description;
    if (updateData.date) milestone.date = updateData.date;

    // Recalculate progress percentage based on completed milestones
    const totalMilestones = project.milestones.length;
    const completedCount = project.milestones.filter((m) => m.completed).length;
    project.progress = Math.round((completedCount / totalMilestones) * 100);

    if (project.progress === 100) {
      project.status = 'COMPLETED';
    }

    await project.save();
    return project;
  }

  /**
   * Get Project Analytics & Stats
   */
  async getProjectStats() {
    await this.seedDefaultProjectsIfEmpty();

    const projects = await Project.find().lean();
    const totalProjects = projects.length;
    const activeProjects = projects.filter(
      (p) => p.status === 'IN_PROGRESS' || p.status === 'ENROLLING'
    ).length;

    let totalEnrolledLands = 0;
    let totalEstimatedCarbon = 0;
    let totalSaplingsPlanted = 0;

    projects.forEach((p) => {
      const landsCount = p.enrolledLands?.length || 0;
      // Add baseline fallback count if seed project has linkedLandCount
      const effectiveCount = landsCount > 0 ? landsCount : p.totalHectaresTarget ? Math.round(p.totalHectaresTarget / 2.5) : 10;
      totalEnrolledLands += effectiveCount;
      totalEstimatedCarbon += (p.carbonCreditEstimatePerAcre || 4.5) * effectiveCount;
      totalSaplingsPlanted += p.saplingsPlanted || 500;
    });

    return {
      totalProjects,
      activeProjects,
      totalEnrolledLands,
      totalSaplingsPlanted,
      estimatedCarbonSequesteredTons: Math.round(totalEstimatedCarbon),
      budgetDisbursed: projects.reduce((acc, p) => acc + (p.budget?.disbursedAmount || 0), 0),
    };
  }
}

export const projectService = new ProjectService();
export default projectService;
