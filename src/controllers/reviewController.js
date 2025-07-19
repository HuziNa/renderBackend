const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Company = require("../models/Company");
const User = require("../models/User");
const Ground = require("../models/Ground");
// POST /api/reviews
const addReview = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ message: "Booking ID and rating are required." });
    }

    // 1. Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    // 2. Verify that the booking belongs to the user
    if (booking.user._id.toString() !== userId) {
      return res.status(403).json({ message: "You cannot review this booking." });
    }

    // 3. Find user
    const user = await User.findById(userId);

    // 4. Get company from ground
    const ground = await Ground.findById(booking.ground._id);
    if (!ground || !ground.company || !ground.company._id) {
      return res.status(400).json({ message: "Company not found for this booking's ground." });
    }
    const company = await Company.findById(ground.company._id);

    // 5. Create review
    const review = await Review.create({
      user: { _id: user._id, name: user.name },
      company: { _id: company._id, name: company.companyName },
      booking: { _id: booking._id },
      rating,
      comment
    });

    res.status(201).json({ message: "Review added successfully", review });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// GET /api/reviews/company/:companyId
const getCompanyReviews = async (req, res) => {
  try {
    const { companyId } = req.params;
    const reviews = await Review.find({ "company._id": companyId }).sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { addReview, getCompanyReviews };
