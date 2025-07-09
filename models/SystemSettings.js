const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['booking', 'payment', 'notification', 'security', 'general'],
    required: true
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

systemSettingsSchema.index({ key: 1 });

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
