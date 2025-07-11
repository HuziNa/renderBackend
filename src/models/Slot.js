const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    template: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "SlotTemplate",
  required: true
},

    ground: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "Ground", required: true },
      name: String, // denormalized
    },
    company: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
      name: String, // denormalized
    },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    price: { type: Number, required: true },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Slot", slotSchema);
