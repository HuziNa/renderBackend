const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  groundId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ground', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: {
    type: String,
    enum: ['available', 'booked', 'pending', 'locked', 'blocked'],
    default: 'available'
  },
  lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  lockedUntil: { type: Date, default: null },
  price: { type: Number, required: true },
  isRecurring: { type: Boolean, default: false },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: null
  },
  recurringEndDate: { type: Date, default: null }
}, { timestamps: true });

slotSchema.index({ groundId: 1, date: 1 });
slotSchema.index({ status: 1 });
slotSchema.index({ lockedUntil: 1 });

module.exports = mongoose.model('Slot', slotSchema);
