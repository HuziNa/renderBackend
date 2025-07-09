const mongoose = require("mongoose");

const systemSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: mongoose.Schema.Types.Mixed,
    description: String,
    category: String, // Remove enum for flexibility
    isActive: { type: Boolean, default: true },
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

systemSettingsSchema.index({ key: 1 });

module.exports = mongoose.model("SystemSettings", systemSettingsSchema);
