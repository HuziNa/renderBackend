const Slot = require("../models/Slot");
const Booking = require("../models/Booking");
const Ground = require("../models/Ground");
const Sport = require("../models/Sport");
const Company = require("../models/Company");
const User = require("../models/User");
const Counter = require("../models/Counter");
const { sendTemplatedEmail } = require("../services/notificationService");

const createBooking = async (req, res) => {
  try {
    const { slotId, guestInfo, specialRequests } = req.body;
    const user = req.user;

    console.log(" Starting booking creation...");

    // 1. Validate slot
    const slot = await Slot.findById(slotId);
    console.log(" Slot:", slot);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found or inactive" });
    }

    // 2. Prevent double booking
    const existingBooking = await Booking.findOne({
      slot: slotId,
      status: { $in: ["pending", "confirmed"] },
    });
    console.log("Existing booking:", existingBooking);
    if (existingBooking) {
      return res.status(409).json({ message: "Slot already booked" });
    }

    // 3. Get ground, sport and company
    const ground = await Ground.findById(slot.ground._id);
    console.log(" Ground:", ground);

    if (!ground) {
      return res.status(404).json({ message: "Ground not found" });
    }

    const sport = await Sport.findById(ground.sport._id);
    console.log(" Sport:", sport);

    if (!sport) {
      return res.status(404).json({ message: "Sport not found" });
    }

    const company = await Company.findById(ground.company._id);
    console.log(" Company:", company);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const companyOwner = await User.findById(company.user._id);
    console.log(" Company Owner:", companyOwner);
    console.log(" User", user);

    if (!companyOwner) {
      return res.status(404).json({ message: "Company owner not found" });
    }

    // 4. Auto-increment bookingId
    const counter = await Counter.findOneAndUpdate(
      { name: "bookingId" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    console.log(" Booking counter:", counter);

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
        amount: slot.price
      },
    };

    let userName, userEmail;
    if (user && !user.isGuest) {
      bookingData.user = {
        _id: user.id,
        name: user.name,
      };
      console.log(user.name);
      bookingData.isGuest = false;
      userName = user.name;
      userEmail = user.email
    } else if (guestInfo) {
      bookingData.guestInfo = guestInfo;
      bookingData.isGuest = true;
      userName = guestInfo.name;
      userEmail = guestInfo.email;
    } else {
      return res.status(400).json({ message: "User or guest info required" });
    }

    console.log(" User info:", { userName, userEmail });

    // 6. Create booking
    const booking = await Booking.create(bookingData);
    console.log(" Booking created:", booking);

    // 7. Mark slot as inactive
    slot.isActive = false;
    await slot.save();
    console.log(" Slot marked inactive");

    const slotDetails = `${ground.name} | ${slot.startTime} - ${slot.endTime}`;
    // 8. Compose slot details
    console.log(" Slot details string:", slotDetails)
    // 8. Compose slot details
    const slotDate = new Date(slot.date).toLocaleDateString("en-GB", {
      timeZone: "UTC",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    console.log(slotDate);
    const slotPrice = slot.price;

    // 9. Send email to user: booking is pending
    if (userEmail) {
      console.log("📧 Sending email to user:", userEmail);
      await sendTemplatedEmail({
        templateName: "bookingPending.html",
        to: userEmail,
        subject: "Your Booking is Pending - Please Complete Payment",
        data: {
          userName,
          sportName: sport.name,
          companyName: company.companyName,
          slotDate,
          slotDetails,
          slotPrice,
        },
        type: "booking_pending",
        title: "Booking Pending",
        message: `Your booking for ${sport.name} at ${company.companyName} is pending. Please pay to confirm.`,
        userId: booking.user?._id,
        relatedBooking: booking._id,
        relatedCompany: company._id,
      });
      console.log(" Email sent to user");
    }

    // 10. Send email to company owner
    if (companyOwner.email) {
      console.log(" Sending email to company owner:", companyOwner.email);
      await sendTemplatedEmail({
        templateName: "notifyCompany.html",
        to: companyOwner.email,
        subject: "New Booking Requires Confirmation",
        data: {
          companyName: company.companyName,
          userName,
          sportName: sport.name,
          slotDate,
          slotDetails,
          slotPrice,
        },
        type: "booking_notify_company",
        title: "New Booking Created",
        message: `A new booking for ${sport.name} requires your confirmation.`,
        relatedBooking: booking._id,
        relatedCompany: company._id,
      });
      console.log(" Email sent to company owner");
    }

    res.status(201).json({ message: "Booking created", booking });
  } catch (err) {
    console.error(" Error creating booking:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createBooking };