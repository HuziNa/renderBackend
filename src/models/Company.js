const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  user: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String
  },
  companyName: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  location: {
    address: String,
    city: String,
    state: String,
    country: { type: String, default: 'Pakistan' },
    postalCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  contactInfo: {
    phone: String,
    email: String,
    website: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String
    }
  },
  sportsOffered: [{
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport' },
    name: String
  }],
  verification: {
    status: { type: String, default: 'pending' },
    notes: String,
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at: Date
  },
  isActive: { type: Boolean, default: false },
  images: {
    logo: String,
    coverImage: String,
    gallery: [{ url: String, caption: String }]
  },
  meta: mongoose.Schema.Types.Mixed
}, { timestamps: true });

companySchema.index({ 'user._id': 1 });
companySchema.index({ isActive: 1 });

module.exports = mongoose.model('Company', companySchema);
