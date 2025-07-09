const mongoose = require('mongoose');

const sportSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, trim: true },
  icon: String,
  category: String, // Remove enum for flexibility
  isActive: { type: Boolean, default: true },
  booking: {
    defaultSlotDuration: { type: Number, default: 60 },
    maxAdvanceBookingDays: { type: Number, default: 30 }
  },
  players: {
    min: { type: Number, default: 2 },
    max: { type: Number, default: 4 }
  },
  equipment: [{
    name: String,
    required: Boolean,
    providedByFacility: Boolean
  }],
  rules: [String],
  seasonalAvailability: {
    available: { type: Boolean, default: true },
    seasons: [String]
  },
  popularity: {
    totalBookings: { type: Number, default: 0 },
    totalFacilities: { type: Number, default: 0 }
  },
  averageRating: { type: Number, default: 0 },
  displayOrder: { type: Number, default: 0 },
  seo: {
    slug: { type: String, unique: true, lowercase: true },
    metaDescription: String
  },
  isFeatured: { type: Boolean, default: false },
  meta: mongoose.Schema.Types.Mixed
}, { timestamps: true });

sportSchema.index({ name: 1 });
sportSchema.index({ isActive: 1 });
sportSchema.index({ category: 1 });
sportSchema.index({ displayOrder: 1 });
sportSchema.index({ 'seo.slug': 1 });
sportSchema.index({ isFeatured: 1 });

sportSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.seo = this.seo || {};
    this.seo.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

module.exports = mongoose.model('Sport', sportSchema);
