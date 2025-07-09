const mongoose = require('mongoose');

const groundSchema = new mongoose.Schema({
  company: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: String
  },
  name: { type: String, required: true },
  sport: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true },
    name: String
  },
  description: String,
  capacity: Number,
  amenities: [String],
  pricePerHour: Number,
  isActive: { type: Boolean, default: true },
  images: [{ url: String, caption: String }],
  specifications: {
    length: Number,
    width: Number,
    surface: String,
    lighting: Boolean,
    covered: Boolean
  },
  meta: mongoose.Schema.Types.Mixed
}, { timestamps: true });

groundSchema.index({ 'company._id': 1 });
groundSchema.index({ 'sport._id': 1 });

groundSchema.index({ isActive: 1 });

module.exports = mongoose.model('Ground', groundSchema);
