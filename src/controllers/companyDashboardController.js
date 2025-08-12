const Booking = require("../models/Booking");
const Ground = require("../models/Ground");
const Company = require("../models/Company");
const mongoose = require("mongoose");

// 🔥 Universal helper to get companyId
const getCompanyId = async (userId) => {
  const company = await Company.findOne({ "user._id": userId });
  console.log(company._id);
  return company ? company._id : null;
};

// get total bookings
exports.getTotalBookings = async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user.id);
    if (!companyId) return res.status(404).json({ message: "Company not found for this user." });

    const groundIds = await getCompanyGroundIds(companyId);
    console.log(" Ground IDs:", groundIds);

    const count = await Booking.countDocuments({
      $or: [
        { ground: { $in: groundIds } },
        { "ground._id": { $in: groundIds } }
      ]
    });
    console.log(" Booking count:", count);

    res.json({ totalBookings: count });
  } catch (err) {
    console.error(" Error getting total bookings:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


// 2️⃣ Upcoming confirmed bookings gives the complete bookings
// exports.getUpcomingBookings = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req.user.id);
//     if (!companyId) return res.status(404).json({ message: "Company not found for this user." });

//     const today = new Date();
//     const bookings = await Booking.find({
//       ground: { $in: await getCompanyGroundIds(companyId) },
//       status: "confirmed"
//     })
//     .populate("slot")
//     .populate("ground")
//     .populate("user");

//     // Filter by slot date still upcoming
//     const upcoming = bookings.filter(b => new Date(b.slot.date) >= today);

//     console.log(`✅ Upcoming bookings for company ${companyId}:`, upcoming.length);
//     res.json({ upcomingBookings: upcoming });
//   } catch (err) {
//     console.error("❌ Error getting upcoming bookings:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.getUpcomingBookingsCount = async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user.id);
    if (!companyId) {
      return res.status(404).json({ message: "Company not found for this user." });
    }

    const groundIds = await getCompanyGroundIds(companyId);

    // Get all confirmed bookings for this company
    const confirmedBookings = await Booking.find({
      $or: [
        { ground: { $in: groundIds } },
        { "ground._id": { $in: groundIds } }
      ],
      status: "confirmed"
    }).populate("slot");

    const totalConfirmed = confirmedBookings.length;

    // Count upcoming bookings (future slot dates)
    const today = new Date();
    const totalUpcoming = confirmedBookings.filter(b =>
      b.slot && new Date(b.slot.date) >= today
    ).length;

    return res.json({
      totalConfirmed,
      totalUpcoming
    });
  } catch (err) {
    console.error(" Error getting booking counts:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// 3️⃣ Total revenue
exports.getTotalRevenue = async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user.id);
    if (!companyId) return res.status(404).json({ message: "Company not found for this user." });

    const result = await Booking.aggregate([
      { $match: {
          ground: { $in: await getCompanyGroundIds(companyId) },
          status: "confirmed"
      }},
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const totalRevenue = result[0]?.total || 0;
    console.log(` Total revenue for company ${companyId}:`, totalRevenue);
    res.json({ totalRevenue });
  } catch (err) {
    console.error(" Error getting total revenue:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 4️⃣ Total number of grounds
exports.getTotalGrounds = async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user.id);
    if (!companyId) return res.status(404).json({ message: "Company not found for this user." });

    const count = await Ground.countDocuments({ "company._id": companyId });
    console.log(` Total grounds for company ${companyId}:`, count);

    res.json({ totalGrounds: count });
  } catch (err) {
    console.error(" Error getting total grounds:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Utility: Get all ground IDs for this company (avoid repeating code)
const getCompanyGroundIds = async (companyId) => {
  const grounds = await Ground.find({ "company._id": companyId }, "_id");
  return grounds.map(g => g._id);
};


// getting the grounds info for the dashboard
exports.getCompanyGroundsSummary = async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user.id);
    if (!companyId) return res.status(404).json({ message: "Company not found for this user." });

    const grounds = await Ground.find({ "company._id": companyId });

    const summary = await Promise.all(grounds.map(async (ground) => {
      // count confirmed bookings for this ground
      const bookings = await Booking.find({ ground: ground._id, status: "confirmed" })
        .populate("slot");
      
      const totalBookings = bookings.length;
      const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      return {
        groundName: ground.name,
        city: ground.location.city,
        address: ground.location.address,
        sport: ground.sport.name,
        totalBookings,
        totalRevenue
      };
    }));

    res.json(summary);

  } catch (err) {
    console.error(" Error fetching company grounds summary:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// getting the bookings summary for the table 
exports.getAllCompanyBookings = async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user.id);
    if (!companyId) return res.status(404).json({ message: "Company not found for this user." });

    const groundIds = await getCompanyGroundIds(companyId);

    const bookings = await Booking.find({ ground: { $in: groundIds } })
      .populate("slot")
      .populate("ground")
      .populate("user");

    const formatted = bookings.map(b => ({
      userName: b.isGuest ? b.guestInfo?.name : b.user?.name,
      groundName: b.ground?.name,
      slotDate: b.slot?.date,
      startTime: b.slot?.startTime,
      endTime: b.slot?.endTime,
      status: b.status,
      bookingId: b.bookingId,
      paymentProofUrl: b.payment?.proofUrl || null
    }));

    res.json(formatted);

  } catch (err) {
    console.error(" Error fetching company bookings:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


