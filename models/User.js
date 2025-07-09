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
    unique: true,
    lowercase: true,
    trim: true
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
  },
  role: { type: String, default: 'client' }, // Remove enum for flexibility
  isActive: { type: Boolean, default: true },
  cooldown: {
    until: { type: Date, default: null },
    reason: String
  },
  isGuest: { type: Boolean, default: false },
  guestSession: String,
  phone: String,
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
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'cooldown.until': 1 });
userSchema.index({ isActive: 1 });

userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.google?.id) {
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

userSchema.methods.comparePassword = async function(candidatePassword) {
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
