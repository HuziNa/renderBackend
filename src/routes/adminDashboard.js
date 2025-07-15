const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const adminDashboardController = require("../controllers/adminDashboardController");
const authorizeRoles = require("../middleware/roleMiddleware");

// Assuming you only want admins to see this
// you can extend your verifyToken to check user.role === 'admin'
router.get("/stats", verifyToken, authorizeRoles("admin"),adminDashboardController.getAdminDashboardStats);

module.exports = router;
