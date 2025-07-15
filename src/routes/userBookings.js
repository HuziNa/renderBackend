const express = require("express");
const router = express.Router();

const {
  getMyBookings,
  cancelMyBooking,
} = require("../controllers/userBookingController");

const { verifyToken } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.get("/my-bookings", verifyToken, authorizeRoles("client"), getMyBookings);
router.patch("/cancel/:bookingId", verifyToken, authorizeRoles("client"), cancelMyBooking);

module.exports = router;
