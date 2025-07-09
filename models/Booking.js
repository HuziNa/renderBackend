const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true, required: true },
  user: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String
  },
  slot: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true }
  },
  company: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: String
  },
  ground: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ground', required: true },
    name: String
  },
  bookingDate: { type: Date, required: true },
  startTime: String,
  endTime: String,
  totalAmount: Number,
  payment: {
    proof: String,
    status: { type: String, default: 'pending' },
    expiresAt: Date
  },
  status: { type: String, default: 'pending' },
  reviewed: {
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at: Date,
    notes: String
  },
  cooldown: {
    applied: { type: Boolean, default: false },
    duration: { type: Number, default: 30 }
  },
  guestInfo: {
    name: String,
    email: String,
    phone: String
  },
  specialRequests: String,
  notification: {
    emailSent: { type: Boolean, default: false },
    reminderSent: { type: Boolean, default: false }
  },
  meta: mongoose.Schema.Types.Mixed
}, { timestamps: true });

bookingSchema.index({ 'user._id': 1 });
bookingSchema.index({ 'company._id': 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'payment.status': 1 });
bookingSchema.index({ 'payment.expiresAt': 1 });
bookingSchema.index({ bookingDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
