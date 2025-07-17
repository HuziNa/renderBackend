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

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "Date must be in YYYY-MM-DD format" });
    }

    // Convert date for query
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    // Step 1: Find all grounds in city with given sport
    const grounds = await Ground.find({
      "location.city": city,
      "sport.name": sportName,
      isActive: true
    }).select("_id name company location capacity amenities");

    if (!grounds.length) {
      return res.status(200).json({ message: "No grounds found", grounds: [] });
    }

    // Step 2: For each ground, fetch slots for that date
    const results = [];
    for (const ground of grounds) {
      const slots = await Slot.find({
        "ground._id": ground._id,
        date: { $gte: startDate, $lt: endDate },
        isActive: true
      }).sort({ startTime: 1 });

      results.push({
        ...ground.toObject(),
        slots
      });
    }

    res.status(200).json({ grounds: results });
  } catch (error) {
    console.error("Error fetching grounds with slots:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getGroundsWithSlots };
