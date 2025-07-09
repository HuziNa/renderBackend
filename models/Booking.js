const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  groundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ground',
    required: true
  },
  // Booking details
  bookingDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  // Payment information
  paymentProof: {
    type: String, // File URL
    default: null
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'proof_uploaded', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  // Booking status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'expired'],
    default: 'pending'
  },
  // Timer tracking
  paymentExpiresAt: {
    type: Date,
    required: true
  },
  // Admin approval
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  adminNotes: {
    type: String,
    default: null
  },
  // Cooldown tracking
  cooldownApplied: {
    type: Boolean,
    default: false
  },
  cooldownDuration: {
    type: Number, // minutes
    default: 30
  },
  // Booking metadata
  guestInfo: {
    name: String,
    email: String,
    phone: String
  },
  specialRequests: {
    type: String,
    default: null
  },
  // Notification tracking
  emailSent: {
    type: Boolean,
    default: false
  },
  reminderSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for performance optimization
bookingSchema.index({ userId: 1 });
bookingSchema.index({ companyId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ paymentExpiresAt: 1 });
bookingSchema.index({ bookingDate: 1 });

// Pre-save middleware to generate booking ID
bookingSchema.pre('save', async function(next) {
  if (this.isNew && !this.bookingId) {
    const count = await this.constructor.countDocuments();
    this.bookingId = `BK${Date.now()}${count + 1}`;
  }
  next();
});

// Virtual for booking duration in minutes
bookingSchema.virtual('durationMinutes').get(function() {
  if (this.startTime && this.endTime) {
    const [startHour, startMin] = this.startTime.split(':').map(Number);
    const [endHour, endMin] = this.endTime.split(':').map(Number);
    return (endHour * 60 + endMin) - (startHour * 60 + startMin);
  }
  return 0;
});

// Instance method to check if booking is expired
bookingSchema.methods.isExpired = function() {
  return new Date() > this.paymentExpiresAt;
};

// Instance method to check if booking is in cooldown period
bookingSchema.methods.isInCooldown = function() {
  if (!this.cooldownApplied) return false;
  const cooldownEnd = new Date(this.updatedAt.getTime() + (this.cooldownDuration * 60000));
  return new Date() < cooldownEnd;
};

// Static method to find bookings by date range
bookingSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    bookingDate: {
      $gte: startDate,
      $lte: endDate
    }
  });
};

module.exports = mongoose.model('Booking', bookingSchema);