const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {getAdminDashboardStats,getAllUserSummaries} = require("../controllers/adminDashboardController");
const authorizeRoles = require("../middleware/roleMiddleware");

// Assuming you only want admins to see this
// you can extend your verifyToken to check user.role === 'admin'
router.get("/stats", verifyToken, authorizeRoles("admin"),getAdminDashboardStats);
router.get('/users-summary', getAllUserSummaries); 
module.exports = router;
