const mongoose = require("mongoose");

const sportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    equipment: [
      {
        name: String,
        required: Boolean,
        providedByFacility: Boolean,
      },
    ],
    seo: {
      slug: { type: String, lowercase: true },
    },
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

sportSchema.index({ isActive: 1 });

sportSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.seo = this.seo || {};
    this.seo.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
  next();
});

module.exports = mongoose.model("Sport", sportSchema);
