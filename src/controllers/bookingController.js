const Slot = require("../models/Slot");
const Booking = require("../models/Booking");
const Ground = require("../models/Ground");
const Sport = require("../models/Sport");
const Company = require("../models/Company");
const User = require("../models/User");
const Counter = require("../models/Counter");
const { sendTemplatedEmail } = require("../services/notificationService");

/**
 * Authenticated booking (for logged-in users)
 */
const createBooking = async (req, res) => {
  try {
    const { slotId, guestInfo, specialRequests } = req.body;
    const user = req.user;

    console.log("Starting booking creation...");

    // 1. Validate slot
    const slot = await Slot.findById(slotId).populate("ground");
    if (!slot) {
      return res.status(404).json({ message: "Slot not found or inactive" });
    }

    // 2. Prevent double booking
    const existingBooking = await Booking.findOne({
      slot: slotId,
      status: { $in: ["pending", "confirmed"] },
    });
    if (existingBooking) {
      return res.status(409).json({ message: "Slot already booked" });
    }

    // 3. Get ground, sport, and company
    const ground = await Ground.findById(slot.ground._id);
    if (!ground) return res.status(404).json({ message: "Ground not found" });

    const sport = await Sport.findById(ground.sport._id);
    if (!sport) return res.status(404).json({ message: "Sport not found" });

    const company = await Company.findById(ground.company._id);
    if (!company) return res.status(404).json({ message: "Company not found" });

    const companyOwner = await User.findById(company.user._id);
    if (!companyOwner) {
      return res.status(404).json({ message: "Company owner not found" });
    }

    // 4. Auto-increment bookingId
    const counter = await Counter.findOneAndUpdate(
      { name: "bookingId" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    // 5. Prepare booking data
    const bookingData = {
      bookingId: counter.value,
      slot: slot._id,
      ground: ground._id,
      sport: {
        _id: sport._id,
        name: sport.name,
      },
      totalAmount: slot.price,
      specialRequests,
      status: "pending",
      payment: {
        status: "pending",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        amount: slot.price,
      },
    };

    let userName, userEmail;
    if (user && !user.isGuest) {
      bookingData.user = {
        _id: user.id,
        name: user.name,
      };
      bookingData.isGuest = false;
      userName = user.name;
      userEmail = user.email;
    } else if (guestInfo) {
      bookingData.guestInfo = guestInfo;
      bookingData.isGuest = true;
      userName = guestInfo.name;
      userEmail = guestInfo.email;
    } else {
      return res.status(400).json({ message: "User or guest info required" });
    }

    // 6. Create booking
    const booking = await Booking.create(bookingData);

    // 7. Mark slot as inactive
    slot.isActive = false;
    await slot.save();

    res.status(201).json({ message: "Booking created", booking });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Guest booking (no login required)
 */
const createGuestBooking = async (req, res) => {
  try {
    const { name, email, phone, groundId, slotId, date, specialRequests } = req.body;

    if (!name || !email || !phone || !groundId || !slotId || !date) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check slot
    const slot = await Slot.findById(slotId).populate("ground");
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    if (!slot.isActive) {
      return res.status(400).json({ message: "Slot already booked." });
    }

    // Ground + Sport + Company
    const ground = await Ground.findById(groundId);
    if (!ground) return res.status(404).json({ message: "Ground not found" });

    const sport = await Sport.findById(ground.sport);
    if (!sport) return res.status(404).json({ message: "Sport not found" });

    const company = await Company.findById(ground.company);
    if (!company) return res.status(404).json({ message: "Company not found" });

    // Auto-increment bookingId
    const counter = await Counter.findOneAndUpdate(
      { name: "bookingId" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    // Create booking (same structure as logged-in)
    const booking = await Booking.create({
      bookingId: counter.value,
      slot: slot._id,
      ground: ground._id,
      sport: {
        _id: sport._id,
        name: sport.name,
      },
      guestInfo: { name, email, phone },
      isGuest: true,
      totalAmount: slot.price,
      specialRequests,
      status: "pending",
      payment: {
        status: "pending",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        amount: slot.price,
      },
      date,
    });

    // Mark slot as inactive
    slot.isActive = false;
    await slot.save();

    res.status(201).json({
      message: "Guest booking successful.",
      booking,
    });
  } catch (error) {
    console.error("Error creating guest booking:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { createBooking, createGuestBooking };