const mongoose = require("mongoose");

const groundSchema = new mongoose.Schema(
  {
    company: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
      },
      name: String,
    },
    name: { type: String, required: true },
    sport: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sport",
        required: true,
      },
      name: String,
    },
    description: String,
    location: {
      // type: {
      //   type: String,
      //   enum: ["Point"],
      //   default: "Point",
      // },
      // coordinates: {
      //   type: [Number], // Format: [longitude, latitude]
      // },
      address: String,
      city: String,
      //area: String,
    },
    capacity: Number,
    amenities: [String],
    isActive: { type: Boolean, default: true },

    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

groundSchema.index({ isActive: 1 });
//groundSchema.index({ location: '2dsphere' });


module.exports = mongoose.model("Ground", groundSchema);
