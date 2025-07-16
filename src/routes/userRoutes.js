const express = require("express");
const { updateProfile, changePassword, getMyBookings, deleteAccount } = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.put("/update-profile", verifyToken, authorizeRoles("client"),updateProfile);
router.put("/change-password", verifyToken, authorizeRoles("client"),changePassword);
router.get("/my-bookings", verifyToken, authorizeRoles("client"),getMyBookings);
router.delete("/delete-account", verifyToken, authorizeRoles("client"),deleteAccount);

module.exports = router;
