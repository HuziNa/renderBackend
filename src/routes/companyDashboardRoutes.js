const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/companyDashboardController");
const checkCompanyApproval = require("../middleware/checkCompanyApproval");
const authorizeRoles = require("../middleware/roleMiddleware");

router.get(
  "/total-bookings",
  verifyToken,
  authorizeRoles("company"),
  checkCompanyApproval,
  dashboardController.getTotalBookings
);
router.get(
  "/upcoming-bookings",
  verifyToken,
  authorizeRoles("company"),
  checkCompanyApproval,
  dashboardController.getUpcomingBookingsCount
);
router.get(
  "/total-revenue",
  verifyToken,
  authorizeRoles("company"),
  checkCompanyApproval,
  dashboardController.getTotalRevenue
);
router.get(
  "/total-grounds",
  verifyToken,
  authorizeRoles("company"),
  checkCompanyApproval,
  dashboardController.getTotalGrounds
);
router.get(
  "/grounds",
  verifyToken,
  authorizeRoles("company"),
  checkCompanyApproval,
  dashboardController.getCompanyGroundsSummary
);
router.get(
  "/bookings",
  verifyToken,
  authorizeRoles("company"),
  checkCompanyApproval,
  dashboardController.getAllCompanyBookings
);

module.exports = router;
