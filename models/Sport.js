const mongoose = require('mongoose');

const sportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String, // URL or icon identifier
    default: null
  },
  category: {
    type: String,
    enum: ['indoor', 'outdoor', 'water', 'court', 'field'],
    default: 'court'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Booking settings for this sport
  defaultSlotDuration: {
    type: Number, // minutes
    default: 60,
    min: 30,
    max: 240
  },
  maxAdvanceBookingDays: {
    type: Number,
    default: 30,
    min: 1,
    max: 90
  },
  // Minimum players required
  minPlayers: {
    type: Number,
    default: 2,
    min: 1
  },
  // Maximum players allowed
  maxPlayers: {
    type: Number,
    default: 4,
    min: 1
  },
  // Equipment requirements
  equipment: [{
    name: {
      type: String,
      required: true
    },
    required: {
      type: Boolean,
      default: false
    },
    providedByFacility: {
      type: Boolean,
      default: false
    }
  }],
  // Rules and regulations
  rules: [{
    type: String,
    trim: true
  }],
  // Seasonal availability
  seasonalAvailability: {
    available: {
      type: Boolean,
      default: true
    },
    seasons: [{
      type: String,
      enum: ['spring', 'summer', 'autumn', 'winter']
    }]
  },
  // Popularity metrics
  totalBookings: {
    type: Number,
    default: 0
  },
  totalFacilities: {
    type: Number,
    default: 0
  },
  // Average rating across all facilities
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  // Display order for frontend
  displayOrder: {
    type: Number,
    default: 0
  },
  // SEO fields
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  metaDescription: {
    type: String,
    maxlength: 160
  },
  // Featured sport flag
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for performance optimization
sportSchema.index({ name: 1 });
sportSchema.index({ isActive: 1 });
sportSchema.index({ category: 1 });
sportSchema.index({ displayOrder: 1 });
sportSchema.index({ slug: 1 });
sportSchema.index({ isFeatured: 1 });

// Pre-save middleware to generate slug
sportSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Virtual for popularity score
sportSchema.virtual('popularityScore').get(function() {
  return (this.totalBookings * 0.7) + (this.totalFacilities * 0.3);
});

// Instance method to increment booking count
sportSchema.methods.incrementBookings = function() {
  this.totalBookings += 1;
  return this.save();
};

// Instance method to update facility count
sportSchema.methods.updateFacilityCount = async function() {
  const Ground = require('./Ground');
  const count = await Ground.countDocuments({ 
    sportId: this._id, 
    isActive: true 
  });
  this.totalFacilities = count;
  return this.save();
};

// Instance method to update average rating
sportSchema.methods.updateAverageRating = async function() {
  const Ground = require('./Ground');
  const Company = require('./Company');
  
  // Get all grounds for this sport
  const grounds = await Ground.find({ sportId: this._id, isActive: true });
  const companyIds = grounds.map(ground => ground.companyId);
  
  // Get companies and their ratings
  const companies = await Company.find({ 
    _id: { $in: companyIds }, 
    isActive: true 
  });
  
  if (companies.length > 0) {
    const totalRating = companies.reduce((sum, company) => sum + company.rating, 0);
    this.averageRating = totalRating / companies.length;
  } else {
    this.averageRating = 0;
  }
  
  return this.save();
};

// Static method to find active sports
sportSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
};

// Static method to find featured sports
sportSchema.statics.findFeatured = function() {
  return this.find({ 
    isActive: true, 
    isFeatured: true 
  }).sort({ displayOrder: 1, name: 1 });
};

// Static method to find by category
sportSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category, 
    isActive: true 
  }).sort({ displayOrder: 1, name: 1 });
};

// Static method to search sports
sportSchema.statics.search = function(query) {
  const regex = new RegExp(query, 'i');
  return this.find({
    isActive: true,
    $or: [
      { name: regex },
      { description: regex },
      { category: regex }
    ]
  }).sort({ displayOrder: 1, name: 1 });
};

// Static method to get popular sports
sportSchema.statics.getPopular = function(limit = 10) {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $addFields: {
        popularityScore: {
          $add: [
            { $multiply: ['$totalBookings', 0.7] },
            { $multiply: ['$totalFacilities', 0.3] }
          ]
        }
      }
    },
    { $sort: { popularityScore: -1, name: 1 } },
    { $limit: limit }
  ]);
};

module.exports = mongoose.model('Sport', sportSchema);