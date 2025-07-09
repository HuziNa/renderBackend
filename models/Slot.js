const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  ground: { // Embed minimal ground info for quick access
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ground', required: true },
    name: String
  },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { type: String, default: 'available' }, // Remove enum for flexibility
  lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lockedUntil: Date,
  price: Number,
  isRecurring: Boolean,
  recurring: {
    pattern: String, // e.g., 'daily', 'weekly', etc.
    endDate: Date
  },
  meta: mongoose.Schema.Types.Mixed // For any extra info
}, { timestamps: true });

slotSchema.index({ 'ground._id': 1, date: 1 });
slotSchema.index({ status: 1 });

module.exports = mongoose.model('Slot', slotSchema);
