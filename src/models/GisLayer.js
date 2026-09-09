import mongoose from 'mongoose';

const gisLayerSchema = new mongoose.Schema(
  {
    layerId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Layer title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'CADASTRAL_GRID',
        'FOREST_ASSET',
        'WATER_CANAL',
        'NDVI_VEGETATION',
        'SOIL_FERTILITY_ZONE',
        'DROUGHT_RISK_MAP',
        'COMMUNITY_LAND',
      ],
      default: 'CADASTRAL_GRID',
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      default: 'Gujarat',
    },
    district: {
      type: String,
      required: true,
      index: true,
    },
    taluka: {
      type: String,
      default: '',
    },
    village: {
      type: String,
      default: '',
    },
    geoJson: {
      type: {
        type: String,
        enum: ['FeatureCollection', 'Feature', 'Polygon', 'MultiPolygon'],
        default: 'FeatureCollection',
      },
      features: [
        {
          type: {
            type: String,
            default: 'Feature',
          },
          properties: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            default: {},
          },
          geometry: {
            type: {
              type: String,
              enum: ['Polygon', 'MultiPolygon', 'Point', 'LineString'],
              default: 'Polygon',
            },
            coordinates: mongoose.Schema.Types.Mixed,
          },
        },
      ],
    },
    center: {
      type: [Number], // [lng, lat]
      default: [72.9281, 22.5645],
    },
    bounds: {
      type: [[Number]], // [[minLng, minLat], [maxLng, maxLat]]
      default: [
        [72.85, 22.5],
        [73.05, 22.65],
      ],
    },
    defaultZoom: {
      type: Number,
      default: 13,
    },
    ndviMetrics: {
      avgNdvi: { type: Number, default: 0.68 },
      canopyCoveragePct: { type: Number, default: 42.5 },
      moistureIndex: { type: Number, default: 0.58 },
      lastSatellitePass: { type: Date, default: Date.now },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

gisLayerSchema.pre('validate', function (next) {
  if (!this.layerId) {
    this.layerId = `GIS-${this.district?.toUpperCase().slice(0, 4) || 'CAD'}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;
  }
  next();
});

export const GisLayer = mongoose.model('GisLayer', gisLayerSchema);
export default GisLayer;
