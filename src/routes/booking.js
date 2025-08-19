// routes/booking.js
const express = require("express");
const router = express.Router();
const { createBooking, createGuestBooking } = require("../controllers/bookingController");
const { verifyToken } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// ✅ Route for authenticated users (clients)
router.post(
  "/user",
  verifyToken,
  authorizeRoles("client"),
  createBooking
);

// ✅ Route for guests (no token required)
router.post(
  "/guest",
  createGuestBooking
);

module.exports = router;