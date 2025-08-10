//getitng the company related info
const Booking = require("../models/Booking");

// Get all bookings for a company with optional status filter
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("slot")
      .populate("ground")
      .populate("sport._id")
      .populate("user._id");

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const mongoose = require("mongoose");
const Ground = require("../models/Ground");
const Sport = require("../models/Sport");
const Company = require("../models/Company");
const User = require("../models/User");
const Slot = require("../models/Slot");
const { sendTemplatedEmail } = require("../services/notificationService");

const confirmBookingByCompany = async (req, res) => {
  try {
    const bookingIdParam = req.params.bookingId;
    const bookingId = Number(bookingIdParam);

    if (isNaN(bookingId)) {
      return res
        .status(400)
        .json({ message: "Invalid booking ID. Must be a number." });
    }

    // 1. Find and update the booking
    const updatedBooking = await Booking.findOneAndUpdate(
      { bookingId, status: "pending-confirmation" },
      { $set: { status: "confirmed", "payment.status": "paid" } },
      { new: true }
    );

    if (!updatedBooking) {
      return res
        .status(404)
        .json({ message: "Booking not found or already confirmed" });
    }

    // 2. Get related data
    const ground = await Ground.findById(updatedBooking.ground);
    const sport = await Sport.findById(updatedBooking.sport._id);
    const company = await Company.findById(ground.company._id);
    const slot = await Slot.findById(updatedBooking.slot);

    // 3. Get user or guest info
    let userName = "Guest";
    let userEmail = null;
    let userId = null;

    if (updatedBooking.isGuest) {
      userName = updatedBooking.guestInfo?.name || "Guest";
      userEmail = updatedBooking.guestInfo?.email || null;
    } else if (updatedBooking.user?._id) {
      const user = await User.findById(updatedBooking.user._id);
      userName = user?.name || "User";
      userEmail = user?.email || null;
      userId = user?._id;
    }

    // 4. Format slot info using UTC so it matches DB
    const slotDate = new Date(slot.date).toLocaleDateString("en-GB", {
      timeZone: "UTC",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const slotDetails = `${ground.name} | ${slot.startTime} - ${slot.endTime}`;
    const slotPrice = slot.price;

    // 5. Send confirmation email
    if (userEmail) {
      await sendTemplatedEmail({
        templateName: "bookingConfirmed.html",
        to: userEmail,
        subject: "Your Booking is Confirmed!",
        data: {
          userName,
          sportName: sport?.name || "Sport",
          companyName: company?.companyName || "Facility",
          slotDate,
          slotDetails,
          slotPrice,
        },
        type: "booking_confirmed",
        title: "Booking Confirmed",
        message: `Your booking for ${sport?.name} at ${company?.companyName} is now confirmed.`,
        userId,
        relatedBooking: updatedBooking._id,
        relatedCompany: company._id,
      });

      console.log(" Confirmation email sent to:", userEmail);
    } else {
      console.log(" No email found to send confirmation.");
    }

    return res.status(200).json({
      message: "Booking confirmed and user notified.",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error(" Error confirming booking:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const rejectBookingByCompany = async (req, res) => {
  try {
    console.log("=== REJECT BOOKING STARTED ===");
    const bookingIdParam = req.params.bookingId;
    const { rejectionReason } = req.body;
    const bookingId = Number(bookingIdParam);

    console.log("BookingId:", bookingId);
    console.log("Rejection reason:", rejectionReason || "None provided");

    if (isNaN(bookingId)) {
      return res
        .status(400)
        .json({ message: "Invalid booking ID. Must be a number." });
    }

    // 1. Find the booking before deletion to access its data
    const booking = await Booking.findOne({ bookingId });

    if (!booking) {
      console.log("Booking not found for ID:", bookingId);
      return res.status(404).json({ message: "Booking not found" });
    }

    console.log("Found booking:", booking.bookingId);

    // 2. Get related data before deleting the booking
    const ground = await Ground.findById(booking.ground);
    const sport = await Sport.findById(booking.sport._id);
    const company = await Company.findById(ground.company._id);
    const slot = await Slot.findById(booking.slot);

    // 3. Get user or guest info
    let userName = "Guest";
    let userEmail = null;
    let userId = null;

    if (booking.isGuest) {
      userName = booking.guestInfo?.name || "Guest";
      userEmail = booking.guestInfo?.email || null;
    } else if (booking.user?._id) {
      const user = await User.findById(booking.user._id);
      userName = user?.name || "User";
      userEmail = user?.email || null;
      userId = user?._id;
    }

    console.log("User info:", { userName, userEmail });

    // 4. Format slot info using UTC so it matches DB
    const slotDate = new Date(slot.date).toLocaleDateString("en-GB", {
      timeZone: "UTC",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const slotDetails = `${ground.name} | ${slot.startTime} - ${slot.endTime}`;
    const bookingTime = `${slotDate}, ${slot.startTime} - ${slot.endTime}`;

    // 5. Reactivate the slot
    await Slot.findByIdAndUpdate(booking.slot, { isActive: true });
    console.log("Slot reactivated:", booking.slot);

    // 6. Delete the booking
    await Booking.findOneAndDelete({ bookingId });
    console.log("Booking deleted");

    // 7. Send rejection email
    if (userEmail) {
      await sendTemplatedEmail({
        templateName: "bookingRejection.html",
        to: userEmail,
        subject: "Your Booking has been Rejected",
        data: {
          userName,
          sportName: sport?.name || "Sport",
          companyName: company?.companyName || "Facility",
          bookingTime,
          rejectionReason: rejectionReason || "No reason provided",
        },
        type: "booking_rejected",
        title: "Booking Rejected",
        message: `Your booking for ${sport?.name} at ${company?.companyName} has been rejected.`,
        userId,
        relatedCompany: company._id,
      });

      console.log("Rejection email sent to:", userEmail);
    } else {
      console.log("No email found to send rejection notification.");
    }

    console.log("=== REJECT BOOKING COMPLETED ===");

    return res.status(200).json({
      message: "Booking rejected and user notified.",
    });
  } catch (error) {
    console.error("=== REJECT BOOKING ERROR ===");
    console.error("Error rejecting booking:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllBookings,
  confirmBookingByCompany,
  rejectBookingByCompany,
};
