const mongoose = require("mongoose");
const Ground = require("../models/Ground");
const Slot = require("../models/Slot");

const getGroundsWithSlots = async (req, res) => {
  try {
    const { city, sportName, date } = req.query;

    // Validate inputs
    if (!city || !sportName || !date) {
      return res.status(400).json({ message: "City, sportName, and date are required" });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "Date must be in YYYY-MM-DD format" });
    }

    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    // Step 1: Find relevant grounds
    const grounds = await Ground.find({
      "location.city": city,
      "sport.name": sportName,
      isActive: true
    }).select("_id name location sport company capacity amenities");

    if (!grounds.length) {
      return res.status(200).json([]);
    }

    const groundIds = grounds.map(g => g._id);

    // Step 2: Find all active slots for these grounds on that date
    const slots = await Slot.find({
      "ground._id": { $in: groundIds },
      date: { $gte: startDate, $lt: endDate },
      isActive: true
    }).select("_id ground startTime endTime price");

    // Step 3: Group slots by ground._id
    const slotMap = {};
    for (const slot of slots) {
      const groundId = slot.ground._id.toString();
      if (!slotMap[groundId]) {
        slotMap[groundId] = [];
      }
      slotMap[groundId].push({
        _id: slot._id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        price: slot.price
      });
    }

    // Step 4: Attach slots to each ground
    const result = grounds.map(ground => ({
      ...ground.toObject(),
      slots: slotMap[ground._id.toString()] || []
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching grounds with slots:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getGroundsWithSlots };
