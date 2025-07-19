// for the whats new page 
const Ground = require("../models/Ground");

// Get newest 5 grounds
const getNewestGrounds = async (req, res) => {
  try {
    const grounds = await Ground.find({ isActive: true })
      .sort({ createdAt: -1 }) // Newest first
      .limit(3)
      .select("_id name company location sport createdAt"); // Return only necessary fields

    res.status(200).json({ newestGrounds: grounds });
  } catch (error) {
    console.error("Error fetching newest grounds:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getNewestGrounds };
