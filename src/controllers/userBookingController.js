const Booking = require("../models/Booking");
const Slot = require("../models/Slot");

// GET /api/bookings/my-bookings
const getMyBookings = async (req, res) => {
  try {
    const userId = req.user?.id;

    const bookings = await Booking.find({ "user._id": userId })
      .sort({ createdAt: -1 })
      .populate("slot")
      .populate("ground")
      .populate("sport._id");

    res.status(200).json({ bookings });
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /api/bookings/cancel/:bookingId
const cancelMyBooking = async (req, res) => {
  try {
    const userId = req.user?.id;
    const bookingIdParam = req.params.bookingId;

    // Convert to number
    const bookingId = Number(bookingIdParam);

    if (isNaN(bookingId)) {
      return res
        .status(400)
        .json({ message: "Invalid booking ID. Must be a number." });
    }

    // Find booking by bookingId and user
    const booking = await Booking.findOne({
      bookingId,
      "user._id": userId,
      status: "pending",
    });

    if (!booking) {
      return res
        .status(404)
        .json({ message: "Booking not found or cannot be cancelled" });
    }

    // Cancel booking and re-activate slot
    booking.status = "cancelled";
    await booking.save();

    await Slot.findByIdAndUpdate(booking.slot, { isActive: true });

    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error("Error cancelling booking:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getMyBookings,
  cancelMyBooking,
};
