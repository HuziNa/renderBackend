// controllers/slotController.js
const Slot = require("../models/Slot");

exports.updateSlotStatus = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be a boolean value." });
    }

    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found." });
    }

    slot.isActive = isActive;
    await slot.save();

    res.status(200).json({
      message: `Slot status updated successfully.`,
      slotId: slot._id,
      newStatus: slot.isActive,
    });
  } catch (error) {
    console.error("Error updating slot status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
