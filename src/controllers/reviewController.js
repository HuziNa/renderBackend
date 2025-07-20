const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Company = require("../models/Company");
const User = require("../models/User");
const Ground = require("../models/Ground");

// addreview
const addReview = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from JWT
    const { bookingId, rating, comment } = req.body;

    // Validate input
    if (!bookingId || !rating) {
      return res.status(400).json({ message: "Booking ID and rating are required." });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    // 1. Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    // 2. Verify that the booking belongs to the logged-in user
    if (booking.user._id.toString() !== userId) {
      return res.status(403).json({ message: "You can only review your own bookings." });
    }

    // 3. Check if the user has already reviewed this booking
    const existingReview = await Review.findOne({ "booking._id": bookingId });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this booking." });
    }

    // 4. Get user info
    const user = await User.findById(userId).select("name");
    if (!user) return res.status(404).json({ message: "User not found." });

    // 5. Get company info via ground
    const ground = await Ground.findById(booking.ground._id);
    if (!ground || !ground.company || !ground.company._id) {
      return res.status(400).json({ message: "Company not found for this booking's ground." });
    }
    const company = await Company.findById(ground.company._id);

    // 6. Create review
    const review = await Review.create({
      user: { _id: user._id, name: user.name },
      company: { _id: company._id, name: company.companyName },
      booking: { _id: booking._id },
      rating,
      comment: comment || ""
    });

    res.status(201).json({
      message: "Review added successfully",
      review
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getCompanyReviews = async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required." });
    }

    const reviews = await Review.find({ "company._id": companyId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      companyId,
      totalReviews: reviews.length,
      reviews
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { addReview, getCompanyReviews };
