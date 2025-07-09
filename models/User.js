const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not using Google auth
    }
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['client', 'company', 'admin'],
    default: 'client'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Cooldown tracking for failed bookings
  cooldownUntil: {
    type: Date,
    default: null
  },
  // Guest user tracking
  isGuest: {
    type: Boolean,
    default: false
  },
  guestSession: {
    type: String,
    default: null
  },
  // Contact information
  phone: {
    type: String,
    default: null
  },
  // Notification preferences
  emailNotifications: {
    type: Boolean,
    default: true
  },
  // Account verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  // Password reset
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  // Last login tracking
  lastLogin: {
    type: Date,
    default: null
  },
  // Failed login attempts
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance optimization
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ cooldownUntil: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ isActive: 1 });

// Virtual for account locked status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified and not a Google user
  if (!this.isModified('password') || this.googleId) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if user is in cooldown
userSchema.methods.isInCooldown = function() {
  return this.cooldownUntil && new Date() < this.cooldownUntil;
};

// Instance method to apply cooldown
userSchema.methods.applyCooldown = function(minutes = 30) {
  this.cooldownUntil = new Date(Date.now() + (minutes * 60000));
  return this.save();
};

// Instance method to remove cooldown
userSchema.methods.removeCooldown = function() {
  this.cooldownUntil = null;
  return this.save();
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + (2 * 60 * 60 * 1000) }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.loginAttempts;
  delete user.lockUntil;
  return user;
};

module.exports = mongoose.model('User', userSchema);
