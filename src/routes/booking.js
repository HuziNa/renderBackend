
// routes/booking.js
const express = require("express");
const router = express.Router();
const { createBooking , createGuestBooking} = require("../controllers/bookingController");
const { verifyToken } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const optionalAuth = require("../middleware/auth.optional");

router.post("/user", verifyToken,
  authorizeRoles("client"), createBooking); // allows guest too

  router.post("/guest", verifyToken,
  authorizeRoles("guest"), createBooking); // allows guest too
 
router.post('/booking/guest',  createGuestBooking);


// end

module.exports = router;


