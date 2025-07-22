const User = require("../models/User");
const Company = require("../models/Company");
const Booking = require("../models/Booking");

exports.getAdminDashboardStats = async (req, res) => {
  try {
    // 1️⃣ Total users
    const totalUsers = await User.countDocuments({});

    // 2️⃣ Active companies
    const activeCompanies = await Company.countDocuments({ isActive: true });

    // 3️⃣ Total bookings
    const totalBookings = await Booking.countDocuments({});

    // 4️⃣ Total revenue (sum of all confirmed booking totalAmounts)
    const confirmedBookings = await Booking.find({ status: "confirmed" });
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    // 5️⃣ Success rate
    const successfulBookings = confirmedBookings.length;
    const successRate = totalBookings > 0 ? ((successfulBookings / totalBookings) * 100).toFixed(2) + "%" : "0%";

    // 6️⃣ Average booking amount
    const averageBookingAmount = successfulBookings > 0 ? Math.round(totalRevenue / successfulBookings) : 0;

    res.json({
      totalUsers,
      activeCompanies,
      totalRevenue,
      totalBookings,
      successRate,
      averageBookingAmount
    });

  } catch (err) {
    console.error("Error fetching admin dashboard stats:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// users info 
exports.getAllUserSummaries = async (req, res) => {
  try {
    const users = await User.find({}, 'name email role isActive'); // Only select needed fields
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching user summaries:", err);
    res.status(500).json({ message: "Failed to fetch user data" });
  }
};
