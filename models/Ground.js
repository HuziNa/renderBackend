const mongoose = require('mongoose');

const groundSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true },
  sportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true },
  description: { type: String, default: '' },
  capacity: { type: Number, required: true },
  amenities: [String],
  pricePerHour: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  images: [{ url: String, caption: String }],
  specifications: {
    length: Number,
    width: Number,
    surface: String,
    lighting: Boolean,
    covered: Boolean
  }
}, { timestamps: true });

groundSchema.index({ companyId: 1 });
groundSchema.index({ sportId: 1 });

module.exports = mongoose.model('Ground', groundSchema);
