const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  isVisible: { type: Boolean, default: true },
  companyResponse: {
    message: String,
    respondedAt: Date
  }
}, { timestamps: true });

reviewSchema.index({ companyId: 1 });
reviewSchema.index({ userId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
