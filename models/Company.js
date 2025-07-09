const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  // Location information
  location: {
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      default: null,
      trim: true
    },
    country: {
      type: String,
      default: 'Pakistan',
      trim: true
    },
    postalCode: {
      type: String,
      default: null,
      trim: true
    },
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    }
  },
  // Contact information
  contactInfo: {
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    website: {
      type: String,
      default: null,
      trim: true
    },
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String
    }
  },
  // Sports offered by this company
  sportsOffered: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sport'
  }],
  // Company verification status
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  verificationNotes: {
    type: String,
    default: null
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Bank account details for payments
  bankDetails: {
    accountName: {
      type: String,
      required: true,
      trim: true
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true
    },
    bankName: {
      type: String,
      required: true,
      trim: true
    },
    branchCode: {
      type: String,
      default: null,
      trim: true
    },
    iban: {
      type: String,
      default: null,
      trim: true
    }
  },
  // Business registration info
  businessInfo: {
    registrationNumber: {
      type: String,
      default: null,
      trim: true
    },
    taxNumber: {
      type: String,
      default: null,
      trim: true
    },
    businessType: {
      type: String,
      enum: ['individual', 'partnership', 'company', 'ngo'],
      default: 'individual'
    }
  },
  // Document uploads
  documents: {
    businessLicense: {
      type: String, // File URL
      default: null
    },
    identityCard: {
      type: String, // File URL
      default: null
    },
    bankStatement: {
      type: String, // File URL
      default: null
    }
  },
  // Company images
  images: {
    logo: {
      type: String,
      default: null
    },
    coverImage: {
      type: String,
      default: null
    },
    gallery: [{
      url: String,
      caption: String
    }]
  },
  // Operating hours
  operatingHours: {
    monday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    tuesday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    wednesday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    thursday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    friday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    saturday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    sunday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    }
  },
  // Company statistics
  totalBookings: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  // Featured company flag
  isFeatured: {
    type: Boolean,
    default: false
  },
  // Company amenities
  amenities: [{
    name: String,
    available: { type: Boolean, default: true }
  }],
  // Policies
  policies: {
    cancellationPolicy: {
      type: String,
      default: ''
    },
    refundPolicy: {
      type: String,
      default: ''
    },
    termsAndConditions: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true
});

// Indexes for performance optimization
companySchema.index({ userId: 1 });
companySchema.index({ verificationStatus: 1 });
companySchema.index({ 'location.city': 1 });
companySchema.index({ 'location.coordinates': '2dsphere' });
companySchema.index({ sportsOffered: 1 });
companySchema.index({ isActive: 1 });
companySchema.index({ rating: -1 });
companySchema.index({ totalBookings: -1 });
companySchema.index({ isFeatured: 1 });

// Virtual for full address
companySchema.virtual('fullAddress').get(function() {
  const { address, city, state, country, postalCode } = this.location;
  return [address, city, state, country, postalCode]
    .filter(Boolean)
    .join(', ');
});

// Virtual for approval status
companySchema.virtual('isApproved').get(function() {
  return this.verificationStatus === 'approved';
});

// Virtual for active grounds count
companySchema.virtual('activeGroundsCount', {
  ref: 'Ground',
  localField: '_id',
  foreignField: 'companyId',
  count: true,
  match: { isActive: true }
});

// Pre-save middleware to update sports offered when grounds change
companySchema.pre('save', async function(next) {
  if (this.isModified('sportsOffered')) {
    // Update facility count for sports
    const Sport = require('./Sport');
    for (const sportId of this.sportsOffered) {
      const sport = await Sport.findById(sportId);
      if (sport) {
        await sport.updateFacilityCount();
      }
    }
  }
  next();
});

// Instance method to update rating
companySchema.methods.updateRating = async function() {
  const Review = require('./Review');
  
  const stats = await Review.aggregate([
    { $match: { companyId: this._id, isVisible: true } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    this.rating = Math.round(stats[0].avgRating * 10) / 10; // Round to 1 decimal
    this.totalReviews = stats[0].totalReviews;
  } else {
    this.rating = 0;
    this.totalReviews = 0;
  }
  
  return this.save();
};

// Instance method to update booking stats
companySchema.methods.updateBookingStats = async function() {
  const Booking = require('./Booking');
  
  const stats = await Booking.aggregate([
    { 
      $match: { 
        companyId: this._id, 
        status: 'confirmed' 
      } 
    },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' }
      }
    }
  ]);
  
  if (stats.length > 0) {
    this.totalBookings = stats[0].totalBookings;
    this.totalRevenue = stats[0].totalRevenue;
  } else {
    this.totalBookings = 0;
    this.totalRevenue = 0;
  }
  
  return this.save();
};

// Instance method to approve company
companySchema.methods.approve = function(adminId, notes = null) {
  this.verificationStatus = 'approved';
  this.verifiedBy = adminId;
  this.verifiedAt = new Date();
  this.verificationNotes = notes;
  return this.save();
};

// Instance method to reject company
companySchema.methods.reject = function(adminId, notes) {
  this.verificationStatus = 'rejected';
  this.verifiedBy = adminId;
  this.verifiedAt = new Date();
  this.verificationNotes = notes;
  return this.save();
};

// Instance method to suspend company
companySchema.methods.suspend = function(adminId, notes) {
  this.verificationStatus = 'suspended';
  this.verifiedBy = adminId;
  this.verifiedAt = new Date();
  this.verificationNotes = notes;
  this.isActive = false;
  return this.save();
};

// Instance method to check if company is open
companySchema.methods.isOpenNow = function() {
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = dayNames[now.getDay()];
  
  const todayHours = this.operatingHours[today];
  if (!todayHours || todayHours.closed) return false;
  
  const currentTime = now.toTimeString().substring(0, 5); // HH:MM format
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

// Static method to find by location
companySchema.statics.findByLocation = function(city, radius = 50) {
  return this.find({
    'location.city': new RegExp(city, 'i'),
    verificationStatus: 'approved',
    isActive: true
  });
};

// Static method to find by sport
companySchema.statics.findBySport = function(sportId) {
  return this.find({
    sportsOffered: sportId,
    verificationStatus: 'approved',
    isActive: true
  });
};

// Static method to find featured companies
companySchema.statics.findFeatured = function() {
  return this.find({
    isFeatured: true,
    verificationStatus: 'approved',
    isActive: true
  }).sort({ rating: -1, totalBookings: -1 });
};

// Static method to search companies
companySchema.statics.search = function(query) {
  const regex = new RegExp(query, 'i');
  return this.find({
    verificationStatus: 'approved',
    isActive: true,
    $or: [
      { companyName: regex },
      { description: regex },
      { 'location.city': regex },
      { 'location.address': regex },
      { 'contactInfo.email': regex },
      { 'contactInfo.phone': regex },
      { 'contactInfo.website': regex }
    ]
  });
};

companySchema.statics.searchWithFilters = function(query, filters = {}, limit = 20, skip = 0) {
  const regex = new RegExp(query, 'i');

  const baseQuery = {
    verificationStatus: 'approved',
    isActive: true,
    $or: [
      { companyName: regex },
      { description: regex },
      { 'location.city': regex }
    ]
  };

  if (filters.sportId) {
    baseQuery.sportsOffered = filters.sportId;
  }

  if (filters.city) {
    baseQuery['location.city'] = new RegExp(filters.city, 'i');
  }

  return this.find(baseQuery)
             .limit(limit)
             .skip(skip)
             .sort({ rating: -1 });
};