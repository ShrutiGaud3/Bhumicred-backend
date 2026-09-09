import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Land } from '../models/Land.js';

const INITIAL_CATALOG = [
  {
    name: 'Tissue-Cultured Red Sandalwood Clonal Saplings (Pack of 25)',
    slug: 'red-sandalwood-saplings-pack-25',
    sku: 'AGR-SAP-001',
    category: 'SAPLINGS',
    categoryLabel: 'Agroforestry Saplings',
    seller: {
      name: 'Gujarat State Agro Forestry Nursery',
      organization: 'Gujarat Agro Forest Dept',
      rating: 4.9,
      isVerified: true,
    },
    pricing: {
      mrp: 4500,
      price: 3750,
      discountPercent: 16,
      taxPercent: 5,
    },
    inventory: {
      stock: 450,
      unit: 'PACK_25',
      lowStockThreshold: 20,
      inStock: true,
    },
    ratings: {
      average: 4.8,
      count: 142,
    },
    specs: {
      height: '1.5 - 2.0 Feet',
      age: '9 Months Hardened Clones',
      survivalRate: '95%+ with drip irrigation',
      certification: 'ICFRE Sovereign Certified Grade A',
      spacing: '10ft x 10ft Grid recommended',
    },
    description:
      'Certified high-resin heartwood clonal saplings ideal for bund planting or dedicated agroforestry plots with rapid growth and drought resistance.',
    benefits: [
      'High market heartwood valuation at 12-15 year maturity',
      'Pre-inoculated with beneficial mycorrhiza for root vigor',
      'Includes GIS tree registration code for tree insurance linkage',
    ],
    usageGuide: 'Plant in well-drained loamy soil with 50g organic compost per pit during onset of monsoon.',
    featured: true,
    deliveryEstimate: '3-5 Business Days',
    status: 'ACTIVE',
  },
  {
    name: 'Bio-Dynamic Liquid Organic Compost & Humic Booster (5 Liters)',
    slug: 'bio-dynamic-liquid-compost-5l',
    sku: 'AGR-ORG-002',
    category: 'BIO_FERTILIZERS',
    categoryLabel: 'Bio-Fertilizers & Nutrients',
    seller: {
      name: 'Kisan Shakti Bio Nutrients',
      organization: 'Kisan Organic Cooperative',
      rating: 4.9,
      isVerified: true,
    },
    pricing: {
      mrp: 1100,
      price: 850,
      discountPercent: 22,
      taxPercent: 5,
    },
    inventory: {
      stock: 820,
      unit: 'LITER',
      lowStockThreshold: 50,
      inStock: true,
    },
    ratings: {
      average: 4.9,
      count: 88,
    },
    specs: {
      composition: 'Microbial Flora + Seaweed Extract + Humic Acid 18%',
      dosage: '5ml per liter of water (Foliar/Drip)',
      suitability: 'All field crops, orchards, vegetables & pulse tracts',
      shelfLife: '24 Months from manufacturing',
    },
    description:
      'Cold-fermented bio-stimulant rich in humic & fulvic fractions to revive depleted soil microbiome and rapidly build organic carbon.',
    benefits: [
      'Increases cation exchange capacity (CEC) in root zones',
      'Accelerates plant nutrient bioavailability by 35%',
      '100% Residue-free and NPOP Organic Certified',
    ],
    usageGuide: 'Dilute 1:200 with water for drip application every 21 days during active vegetative flush.',
    featured: true,
    deliveryEstimate: '2-4 Business Days',
    status: 'ACTIVE',
  },
  {
    name: 'Automated Solar Smart Drip Controller with LoRa Soil Sensor',
    slug: 'solar-smart-drip-controller-lora',
    sku: 'AGR-SOL-003',
    category: 'SOLAR_IRRIGATION',
    categoryLabel: 'Smart Drip & Solar Pumps',
    seller: {
      name: 'EcoSolar Precision Tech',
      organization: 'EcoSolar India Pvt Ltd',
      rating: 4.7,
      isVerified: true,
    },
    pricing: {
      mrp: 7999,
      price: 6499,
      discountPercent: 18,
      taxPercent: 12,
    },
    inventory: {
      stock: 95,
      unit: 'UNIT',
      lowStockThreshold: 10,
      inStock: true,
    },
    ratings: {
      average: 4.7,
      count: 63,
    },
    specs: {
      power: '5W Monocrystalline Solar Panel + 4000mAh Battery',
      valves: 'Dual 1-inch Solenoid support',
      sensors: 'Soil Moisture (VWC) + Ground Temp Probe',
      connectivity: 'Bluetooth 5.0 + LoRa / SMS alerts',
    },
    description:
      'Solar-powered precision drip irrigation controller that automatically pulses irrigation valves only when soil moisture dips below your target set-point.',
    benefits: [
      'Saves up to 45% farm water and prevents root-rot',
      'Zero grid electricity required; weather-proof IP67 enclosure',
      'Syncs with Bhumicred GIS parcel telemetry',
    ],
    usageGuide: 'Install sensor probe at 15cm-30cm root depth; plug solar mount towards south facing sunlight.',
    featured: true,
    deliveryEstimate: '4-6 Business Days',
    status: 'ACTIVE',
  },
  {
    name: 'Cold-Pressed Certified Azadirachtin Neem Bio-Pesticide (10,000 PPM - 1L)',
    slug: 'azadirachtin-neem-bio-pesticide-1l',
    sku: 'AGR-ORG-004',
    category: 'ORGANIC_PESTICIDES',
    categoryLabel: 'Organic Pest Control',
    seller: {
      name: 'Vedic Green Crop Care',
      organization: 'Vedic Bio Formulations',
      rating: 4.8,
      isVerified: true,
    },
    pricing: {
      mrp: 1450,
      price: 1190,
      discountPercent: 17,
      taxPercent: 5,
    },
    inventory: {
      stock: 310,
      unit: 'LITER',
      lowStockThreshold: 30,
      inStock: true,
    },
    ratings: {
      average: 4.8,
      count: 51,
    },
    specs: {
      activeIngredient: 'Azadirachtin 1.0% EC (10000 PPM)',
      targetPests: 'Bollworms, Aphids, Whiteflies, Thrips & Leaf Miners',
      preHarvestInterval: '0 Days (Safe for food crops)',
    },
    description:
      'High-potency botanical anti-feedant and repellent that interrupts pest reproductive cycles while keeping honeybees and pollinator insects completely safe.',
    benefits: [
      'Broad-spectrum pest repellency without chemical residues',
      'Prevents pest resistance build-up',
      'Ideal for zero-budget natural farming (ZBNF)',
    ],
    usageGuide: 'Spray 2ml-3ml per liter of water at early dusk during pest onset; repeat every 10-14 days.',
    featured: false,
    deliveryEstimate: '2-4 Business Days',
    status: 'ACTIVE',
  },
  {
    name: 'High-Yield Certified Hybrid Mustard Seeds (Pusa Bold Var - 5 Kg)',
    slug: 'pusa-bold-mustard-seeds-5kg',
    sku: 'AGR-SED-005',
    category: 'SEEDS',
    categoryLabel: 'Certified Seeds',
    seller: {
      name: 'IARI Certified Seed Agency',
      organization: 'Indian Agricultural Seed Corporation',
      rating: 4.9,
      isVerified: true,
    },
    pricing: {
      mrp: 1250,
      price: 990,
      discountPercent: 20,
      taxPercent: 5,
    },
    inventory: {
      stock: 600,
      unit: 'BAG',
      lowStockThreshold: 40,
      inStock: true,
    },
    ratings: {
      average: 4.9,
      count: 114,
    },
    specs: {
      germinationRate: '92% Guaranteed',
      maturityDuration: '110-120 Days',
      oilContent: '42.5% High Resin Profile',
      seedTreatment: 'Pre-treated with Trichoderma viride',
    },
    description:
      'Breeder-certified bold grain mustard seeds with exceptional aphid tolerance and high oil output, suitable for irrigated and rainfed conditions.',
    benefits: [
      'Bold seed size (5.5g / 1000 seeds weight)',
      'High yield potential of 20-25 quintals per hectare',
      'Resistant to white rust and alternaria blight',
    ],
    usageGuide: 'Sow at 4-5 kg/ha with row spacing of 30cm and plant-to-plant distance of 10-15cm.',
    featured: false,
    deliveryEstimate: '3-5 Business Days',
    status: 'ACTIVE',
  },
  {
    name: 'Mineralized Soil Micronutrient Revitalizer Granules (25 Kg Bag)',
    slug: 'mineralized-soil-micronutrient-granules-25kg',
    sku: 'AGR-AMD-006',
    category: 'SOIL_AMENDMENTS',
    categoryLabel: 'Soil Amendments',
    seller: {
      name: 'Bhumika Soil Solutions',
      organization: 'Bhumika Bio Mines Ltd',
      rating: 4.6,
      isVerified: true,
    },
    pricing: {
      mrp: 1800,
      price: 1450,
      discountPercent: 19,
      taxPercent: 5,
    },
    inventory: {
      stock: 240,
      unit: 'BAG',
      lowStockThreshold: 20,
      inStock: true,
    },
    ratings: {
      average: 4.7,
      count: 37,
    },
    specs: {
      formula: 'Zinc 8% + Boron 2% + Iron 5% + Sulphur 10% + Calcium Bentonite Base',
      releaseRate: 'Slow-release 90 Days sustained buffering',
      meshSize: '2-4mm dust-free granules',
    },
    description:
      'Balanced multi-micronutrient matrix designed to correct hidden hunger in soil, balance soil pH, and amplify root assimilation efficiency.',
    benefits: [
      'Rectifies chronic Zinc and Boron deficiencies in alluvial & black soils',
      'Enhances chlorophyll synthesis and grain filling',
      'Easy broadcast application with seeds or basal compost',
    ],
    usageGuide: 'Broadcast 10-15 kg per acre during field preparation or first hoeing.',
    featured: false,
    deliveryEstimate: '3-6 Business Days',
    status: 'ACTIVE',
  },
];

class MarketplaceService {
  /**
   * Seed initial catalog if DB is empty
   */
  async seedDefaultProductsIfEmpty() {
    try {
      const count = await Product.countDocuments();
      if (count === 0) {
        await Product.insertMany(INITIAL_CATALOG);
        console.log(`[MarketplaceService] Successfully seeded ${INITIAL_CATALOG.length} default products.`);
      }
    } catch (e) {
      console.warn('[MarketplaceService] Catalog seed note:', e.message);
    }
  }

  /**
   * Get all products with filtering, search, sorting
   */
  async getProducts(query = {}) {
    await this.seedDefaultProductsIfEmpty();

    const { category, search, minPrice, maxPrice, status = 'ACTIVE', sort = 'featured', limit = 50, page = 1 } = query;

    const filter = {};
    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (category && category !== 'ALL') {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter['pricing.price'] = {};
      if (minPrice) filter['pricing.price'].$gte = Number(minPrice);
      if (maxPrice) filter['pricing.price'].$lte = Number(maxPrice);
    }

    if (search && search.trim()) {
      const term = search.trim();
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { 'seller.name': { $regex: term, $options: 'i' } },
      ];
    }

    let sortObj = { featured: -1, createdAt: -1 };
    if (sort === 'price_asc') sortObj = { 'pricing.price': 1 };
    else if (sort === 'price_desc') sortObj = { 'pricing.price': -1 };
    else if (sort === 'rating') sortObj = { 'ratings.average': -1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter).sort(sortObj).skip(skip).limit(Number(limit)).lean();

    return {
      products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
    };
  }

  /**
   * Get product by ID or Slug
   */
  async getProductById(id) {
    await this.seedDefaultProductsIfEmpty();
    let product;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id).lean();
    }
    if (!product) {
      product = await Product.findOne({ slug: id }).lean();
    }
    if (!product) {
      product = await Product.findOne({ sku: id }).lean();
    }
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  /**
   * Create new product (Admin / Seller)
   */
  async createProduct(user, productData) {
    const slug =
      productData.slug ||
      productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + `-${Date.now().toString().slice(-4)}`;

    const sku =
      productData.sku ||
      `AGR-${(productData.category || 'INP').slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const product = new Product({
      ...productData,
      slug,
      sku,
      seller: {
        id: user._id || user.id,
        name: user.name || productData.sellerName || 'Verified Seller',
        organization: user.organization || productData.sellerOrg || 'Sovereign Agro Vendor',
        rating: 4.8,
        isVerified: true,
      },
    });

    await product.save();
    return product;
  }

  /**
   * Update product
   */
  async updateProduct(id, user, updateData) {
    const product = await Product.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  /**
   * Place Order & Checkout
   */
  async createOrder(user, orderData) {
    const { items, deliveryAddress, paymentMethod = 'WALLET', couponCode } = orderData;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Order items cannot be empty');
    }

    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const prodId = item.productId || item.id || item._id;
      let product = null;
      if (prodId && typeof prodId === 'string' && prodId.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(prodId);
      }
      if (!product && item.name) {
        product = await Product.findOne({ name: item.name });
      }

      const unitPrice = product ? product.pricing.price : item.price || 0;
      const itemSubtotal = unitPrice * (item.quantity || 1);
      subtotal += itemSubtotal;

      processedItems.push({
        product: product ? product._id : null,
        name: product ? product.name : item.name,
        category: product ? product.category : 'AGRI_INPUT',
        unitPrice,
        quantity: item.quantity || 1,
        subtotal: itemSubtotal,
        sellerName: product ? product.seller.name : 'Sovereign Agro Vendor',
      });

      // Deduct inventory if product exists in DB
      if (product && product.inventory) {
        product.inventory.stock = Math.max(0, product.inventory.stock - (item.quantity || 1));
        if (product.inventory.stock === 0) {
          product.inventory.inStock = false;
          product.status = 'OUT_OF_STOCK';
        }
        await product.save();
      }
    }

    // Coupon calculation
    let discountAmount = 0;
    if (couponCode) {
      const code = couponCode.trim().toUpperCase();
      if (code === 'BHUMI10') {
        discountAmount = Math.round(subtotal * 0.1);
      } else if (code === 'KISAN100') {
        discountAmount = Math.min(100, subtotal);
      } else if (code === 'HARVEST15') {
        discountAmount = Math.round(subtotal * 0.15);
      }
    }

    const deliveryFee = subtotal > 1500 ? 0 : 120;
    const taxAmount = Math.round(subtotal * 0.05);
    const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee + taxAmount);

    const orderNumber = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // Resolve Land Plot name if landId provided
    let landName = deliveryAddress?.landName || 'Main Farm Plot';
    if (deliveryAddress?.landId && deliveryAddress.landId.match(/^[0-9a-fA-F]{24}$/)) {
      const landDoc = await Land.findById(deliveryAddress.landId).lean();
      if (landDoc) {
        landName = landDoc.landName || `${landDoc.surveyNumber} - ${landDoc.village}`;
      }
    }

    const initialTimeline = [
      {
        title: 'Order Placed & Payment Verified',
        description: `Order successfully booked with ${paymentMethod} payment.`,
        timestamp: new Date(),
        completed: true,
        current: false,
      },
      {
        title: 'Vendor Sourcing & Quality Inspection',
        description: 'Quality inspection & packaging in progress at regional hub.',
        timestamp: new Date(Date.now() + 1000 * 60 * 30),
        completed: true,
        current: true,
      },
      {
        title: 'Dispatched via Kisan Express Logistics',
        description: 'In transit to district distribution hub.',
        timestamp: new Date(Date.now() + 1000 * 60 * 60 * 24),
        completed: false,
        current: false,
      },
      {
        title: 'Delivered to Farm Gate',
        description: `Direct delivery to ${landName}.`,
        timestamp: new Date(Date.now() + 1000 * 60 * 60 * 72),
        completed: false,
        current: false,
      },
    ];

    const newOrder = new Order({
      orderNumber,
      buyer: {
        userId: user._id || user.id,
        name: user.name || deliveryAddress?.recipientName || 'Kisan Farmer',
        phone: user.phone || deliveryAddress?.phone || '+91 98765 43210',
        email: user.email,
      },
      items: processedItems,
      deliveryAddress: {
        recipientName: deliveryAddress?.recipientName || user.name || 'Farmer',
        phone: deliveryAddress?.phone || user.phone || '+91 98765 43210',
        landId: deliveryAddress?.landId || null,
        landName,
        addressLine: deliveryAddress?.addressLine || 'Farm Gate Address',
        village: deliveryAddress?.village || '',
        district: deliveryAddress?.district || 'Anand',
        state: deliveryAddress?.state || 'Gujarat',
        pincode: deliveryAddress?.pincode || '388001',
      },
      billing: {
        subtotal,
        discountAmount,
        deliveryFee,
        taxAmount,
        totalAmount,
        couponCode: couponCode || null,
      },
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PAID',
        transactionRef: `TXN-${Date.now().toString().slice(-8)}`,
        paidAt: new Date(),
      },
      fulfillment: {
        status: 'CONFIRMED',
        courier: 'Kisan Express Agri-Logistics',
        trackingNumber: `KEL-${Math.floor(100000 + Math.random() * 900000)}`,
        estimatedDelivery: '3-5 Business Days',
      },
      timeline: initialTimeline,
    });

    await newOrder.save();
    return newOrder;
  }

  /**
   * Get User Orders
   */
  async getUserOrders(userId, role, query = {}) {
    const filter = {};
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN_STAFF') {
      filter['buyer.userId'] = userId;
    }

    if (query.status && query.status !== 'ALL') {
      filter['fulfillment.status'] = query.status;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    return orders;
  }

  /**
   * Get single order by ID or orderNumber
   */
  async getOrderById(id, userId, role) {
    let order;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id).lean();
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: id }).lean();
    }

    if (!order) {
      throw new Error('Order not found');
    }

    if (
      role !== 'SUPER_ADMIN' &&
      role !== 'ADMIN_STAFF' &&
      role !== 'PARTNER' &&
      order.buyer.userId.toString() !== userId.toString()
    ) {
      throw new Error('Unauthorized to view this order');
    }

    return order;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(id, user, { status, courier, trackingNumber, deliveredAt }) {
    const order = await Order.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    if (status) {
      order.fulfillment.status = status;
      if (status === 'DELIVERED') {
        order.fulfillment.deliveredAt = deliveredAt || new Date();
        if (order.payment.method === 'CASH_ON_DELIVERY') {
          order.payment.status = 'PAID';
        }
      }
    }
    if (courier) order.fulfillment.courier = courier;
    if (trackingNumber) order.fulfillment.trackingNumber = trackingNumber;

    await order.save();
    return order;
  }

  /**
   * Get Marketplace Statistics for Admin
   */
  async getMarketplaceStats() {
    await this.seedDefaultProductsIfEmpty();

    const [totalProducts, activeProducts, totalOrders, orders] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: 'ACTIVE' }),
      Order.countDocuments(),
      Order.find().select('billing fulfillment createdAt').lean(),
    ]);

    const gmv = orders.reduce((sum, ord) => sum + (ord.billing?.totalAmount || 0), 0);
    const completedOrders = orders.filter((o) => o.fulfillment?.status === 'DELIVERED').length;
    const pendingOrders = orders.filter((o) => o.fulfillment?.status !== 'DELIVERED' && o.fulfillment?.status !== 'CANCELLED').length;

    return {
      totalProducts,
      activeProducts,
      totalOrders,
      completedOrders,
      pendingOrders,
      grossMerchandiseValue: gmv,
      commissionEarned: Math.round(gmv * 0.05), // 5% platform commission
    };
  }
}

export const marketplaceService = new MarketplaceService();
export default marketplaceService;
