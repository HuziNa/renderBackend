const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  google: {
    id: { type: String, sparse: true, unique: true },
    avatar: String
  },
  email: {
    type: String,
    required: true,
    unique: true,  // This already creates an index
    lowercase: true,
    trim: true
    // Remove index: true if present
  },
  password: {
    type: String,
    required: function() {
      return !this.google?.id;
    }
  },
  name: {
    type: String,
    required: true,
    trim: true
    // Remove index: true if present elsewhere
  },
  role: { type: String, default: 'client' },
  isActive: { type: Boolean, default: true },
  cooldown: {
    until: { type: Date, default: null },
    reason: String
  },
  isGuest: { type: Boolean, default: false },
  guestSession: String,
  phone: String,
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  notifications: {
    email: { type: Boolean, default: true }
  },
  verification: {
    email: { type: Boolean, default: false },
    token: String,
    expires: Date
  },
  passwordReset: {
    token: String,
    expires: Date
  },
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  meta: mongoose.Schema.Types.Mixed
}, { 
  timestamps: true,
  // Optionally add index definitions here instead of separate calls
  // autoIndex: true // default is true
});

// Remove duplicate index declarations
// Keep only the ones that aren't covered by unique/other options
userSchema.index({ role: 1 });
userSchema.index({ 'cooldown.until': 1 });
userSchema.index({ isActive: 1 });

// The rest of your schema remains the same...
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

//User.js
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.google?.id) return next(); // Skip hashing for Google users

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});


userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};


userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.passwordReset;
  delete user.verification;
  return user;
};

module.exports = mongoose.model('User', userSchema);