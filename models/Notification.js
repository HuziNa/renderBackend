const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { // Embed minimal user info for quick access
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String
  },
  type: String, // Remove enum for flexibility
  title: String,
  message: String,
  isRead: { type: Boolean, default: false },
  related: { // Flexible related object
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
  },
  email: {
    sent: { type: Boolean, default: false },
    sentAt: Date
  },
  meta: mongoose.Schema.Types.Mixed // For any extra info
}, { timestamps: true });

notificationSchema.index({ 'user._id': 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
