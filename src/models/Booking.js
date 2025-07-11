

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  slot: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true },
  ground: { type: mongoose.Schema.Types.ObjectId, ref: "Ground", required: true },
  sport: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "Sport", required: true },
    name: String
  },
  user: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String
  },
  isGuest: { type: Boolean, default: false },
  guestInfo: {
    name: String,
    email: String,
    phone: String
  },
  totalAmount: Number,
  status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
  payment: {
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    expiresAt: Date
  },
  specialRequests: String
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
