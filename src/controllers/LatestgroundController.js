// for the whats new page
const Ground = require("../models/Ground");
const Review = require("../models/Review");

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


const getHighestRatedVenues = async (req, res) => {
  try {
    const topCompanies = await Review.aggregate([
      {
        $group: {
          _id: "$company._id",
          companyName: { $first: "$company.name" },
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
        },
      },
      { $sort: { averageRating: -1, totalReviews: -1 } }, // Sort by rating, then by total reviews
      { $limit: 3 }, // Only top 3 companies
      {
        $lookup: {
          from: "grounds",
          localField: "_id",
          foreignField: "company._id",
          as: "grounds",
        },
      },
      {
        $project: {
          _id: 1,
          companyName: 1,
          totalReviews: 1,
          averageRating: { $round: ["$averageRating", 1] }, // Round to 1 decimal
          grounds: {
            _id: 1,
            name: 1,
            "location.address": 1,
            "location.city": 1,
            sport: 1,
            amenities: 1,
          },
        },
      },
    ]);

    res.status(200).json({ topCompanies });
  } catch (error) {
    console.error("Error fetching highest rated venues:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// 2️⃣ Venues by city (Explore by Category)
const getVenuesByCity = async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ message: "City is required" });

    const grounds = await Ground.find({
      "location.city": city,
      isActive: true,
    }).select("_id name location sport amenities company");

    res.status(200).json({ venues: grounds });
  } catch (error) {
    console.error("Error fetching venues by city:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 3️⃣ Venues by sport (Explore by Location)
const getVenuesBySport = async (req, res) => {
  try {
    const { sportName } = req.query;
    if (!sportName)
      return res.status(400).json({ message: "Sport name is required" });

    const grounds = await Ground.find({
      "sport.name": sportName,
      isActive: true,
    }).select("_id name location sport amenities company");

    res.status(200).json({ venues: grounds });
  } catch (error) {
    console.error("Error fetching venues by sport:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getHighestRatedVenues,
  getVenuesByCity,
  getVenuesBySport,
  getNewestGrounds
};
