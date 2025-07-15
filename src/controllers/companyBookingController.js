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
      return res.status(400).json({ message: "Invalid booking ID. Must be a number." });
    }

    // 1. Find and update the booking
    const updatedBooking = await Booking.findOneAndUpdate(
      { bookingId, status: "pending" },
      { $set: { status: "confirmed", "payment.status": "paid" } },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found or already confirmed" });
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
      year: "numeric"
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
          slotPrice
        },
        type: "booking_confirmed",
        title: "Booking Confirmed",
        message: `Your booking for ${sport?.name} at ${company?.companyName} is now confirmed.`,
        userId,
        relatedBooking: updatedBooking._id,
        relatedCompany: company._id
      });

      console.log(" Confirmation email sent to:", userEmail);
    } else {
      console.log(" No email found to send confirmation.");
    }

    return res.status(200).json({
      message: "Booking confirmed and user notified.",
      booking: updatedBooking
    });

  } catch (error) {
    console.error(" Error confirming booking:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};






module.exports = {
  getAllBookings,
  confirmBookingByCompany,
};




  