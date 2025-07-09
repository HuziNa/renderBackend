const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String
  },
  company: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: String
  },
  booking: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true }
  },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  isVisible: { type: Boolean, default: true },
  companyResponse: {
    message: String,
    respondedAt: Date
  },
  meta: mongoose.Schema.Types.Mixed
}, { timestamps: true });

reviewSchema.index({ 'company._id': 1 });
reviewSchema.index({ 'user._id': 1 });

module.exports = mongoose.model('Review', reviewSchema);
