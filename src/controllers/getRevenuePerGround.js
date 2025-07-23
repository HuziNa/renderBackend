const { Ground, Company, Booking } = require("../models");

const getRevenuePerGround = async (req, res) => {
  try {
    const userId = req.user.id;

    // Step 1: Find the company of the current user
    const company = await Company.findOne({ "user._id": userId });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Step 2: Get all ground IDs of this company
    const grounds = await Ground.find({ "company._id": company._id });
    const groundIds = grounds.map(g => g._id);

    if (groundIds.length === 0) {
      return res.status(200).json({ message: "No grounds found", revenue: [] });
    }

    // Step 3: Aggregate bookings to calculate revenue per ground
    const revenue = await Booking.aggregate([
      {
        $match: {
          ground: { $in: groundIds }
        }
      },
      {
        $group: {
          _id: "$ground",
          totalRevenue: { $sum: "$price" },
          bookingCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "grounds", // Collection name (usually plural lowercase)
          localField: "_id",
          foreignField: "_id",
          as: "groundDetails"
        }
      },
      { $unwind: "$groundDetails" },
      {
        $project: {
          groundId: "$_id",
          groundName: "$groundDetails.name",
          totalRevenue: 1,
          bookingCount: 1
        }
      }
    ]);

    res.status(200).json({ revenue });
  } catch (err) {
    console.error("Error getting revenue:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getRevenuePerGround };
