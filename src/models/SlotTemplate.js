// models/SlotTemplate.js
const mongoose = require("mongoose");

const slotTemplateSchema = new mongoose.Schema({
  ground: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "Ground", required: true },
    name: String,
  },
  company: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    name: String,
  },
  weekdays: {
    type: [String], // ["Monday", "Tuesday", ...]
    required: true,
  },
  startTime: {
    type: String, // "16:00"
    required: true,
  },
  endTime: {
    type: String, // "22:00"
    required: true,
  },
  slotDurationMinutes: {
    type: Number, // e.g. 60
    required: true,
  },
  pricePerSlot: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("SlotTemplate", slotTemplateSchema);
