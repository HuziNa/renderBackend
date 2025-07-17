const express = require("express");
const router = express.Router();
const { getGroundsWithSlots } = require("../controllers/getGroundsWithSlots");
const { verifyToken } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");



router.get("/available", verifyToken,authorizeRoles("client"),getGroundsWithSlots);

module.exports = router;
