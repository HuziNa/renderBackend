const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['booking_confirmed', 'booking_rejected', 'payment_reminder', 'company_approved', 'system_alert'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  relatedBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
  relatedCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  emailSent: { type: Boolean, default: false },
  emailSentAt: { type: Date, default: null }
}, { timestamps: true });

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
