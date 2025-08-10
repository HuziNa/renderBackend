const express = require("express");
const router = express.Router();

const {
  getAllBookings,
  confirmBookingByCompany,
  rejectBookingByCompany,
} = require("../controllers/companyBookingController");
const { verifyToken } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const checkCompanyApproval = require("../middleware/checkCompanyApproval");

router.get(
  "/",
  verifyToken,
  authorizeRoles("company"),
  checkCompanyApproval,
  getAllBookings
);
router.patch(
  "/confirm/:bookingId",
  verifyToken,
  authorizeRoles("company"),
  checkCompanyApproval,
  confirmBookingByCompany
);
router.delete(
  "/reject/:bookingId",
  verifyToken,
  authorizeRoles("company"),
  checkCompanyApproval,
  rejectBookingByCompany
);

module.exports = router;
