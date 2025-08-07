

// const mongoose = require("mongoose");
// const AutoIncrement = require("mongoose-sequence")(mongoose);

// const bookingSchema = new mongoose.Schema({
//     bookingId: {
//     type: String,
//     unique: true,
    
//   },
//   slot: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true },
//   ground: { type: mongoose.Schema.Types.ObjectId, ref: "Ground", required: true },
//   sport: {
//     _id: { type: mongoose.Schema.Types.ObjectId, ref: "Sport", required: true },
//     name: String
//   },
//   user: {
//     _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     name: String
//   },
//   isGuest: { type: Boolean, default: false },
//   guestInfo: {
//     name: String,
//     email: String,
//     phone: String
//   },
//   totalAmount: Number,
//   status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
//   payment: {
//     status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
//     expiresAt: Date
//   },
//   specialRequests: String
// }, { timestamps: true });

// // Plugin: auto-increment bookingId starting from 1000
// bookingSchema.plugin(AutoIncrement, {
//   inc_field: "bookingId",
//   id: "booking_seq",
//   start_seq: 1000,
// });

// module.exports = mongoose.model("Booking", bookingSchema);

const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: Number,
    unique: true,
    sparse : true
  },
  slot: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true },
  ground: { type: mongoose.Schema.Types.ObjectId, ref: "Ground", required: true },
  sport: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "Sport", required: true },
    name: String,
  },
  user: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
  },
  isGuest: { type: Boolean, default: false },
  guestInfo: {
    name: String,
    email: String,
    phone: String,
  },
  totalAmount: Number,
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "pending-confirmation"],
    default: "pending",
  },
  payment: {
    status: {
      type: String,
      enum: ["pending", "paid", "proof_uploaded","failed"],
      default: "pending",
    },
    expiresAt: Date,
  },
  specialRequests: String,
}, { timestamps: true });

// Plugin: auto-increment bookingId starting from 1000
bookingSchema.plugin(AutoIncrement, {
  inc_field: "bookingId",
  id: "booking_seq",
  start_seq: 1000,
});

module.exports = mongoose.model("Booking", bookingSchema);
