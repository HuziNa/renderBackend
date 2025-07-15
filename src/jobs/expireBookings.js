const Booking = require("../models/Booking");
const Slot = require("../models/Slot");

const expireBookings = async () => {
  try {
    const now = new Date();
    console.log(`[Expire Job] Running at ${now.toISOString()}`);

    const expiredBookings = await Booking.find({
      $and: [
        { status: "pending" },
        { "payment.status": "pending" },
        { "payment.expiresAt": { $lt: now } },
      ]
    });

    console.log(`[Expire Job] Found ${expiredBookings.length} expired bookings.`);

    for (const booking of expiredBookings) {
      console.log(`[Expire Job] Expiring booking ${booking._id} that expired at ${booking.payment.expiresAt}`);

      // Cancel booking
      booking.status = "cancelled";
      booking.payment.status = "failed";
      await booking.save();

      // Reactivate slot
      await Slot.findByIdAndUpdate(booking.slot, { isActive: true });

      console.log(`[Expire Job] Booking ${booking._id} cancelled. Slot ${booking.slot} reactivated.`);
    }
  } catch (err) {
    console.error("[Expire Job] Error:", err);
  }
};

module.exports = expireBookings;
