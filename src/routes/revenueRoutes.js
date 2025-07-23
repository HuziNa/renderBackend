const express = require("express");
const router = express.Router();
const { getRevenuePerGround } = require("../controllers/getRevenuePerGround");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/revenue-per-ground", verifyToken, getRevenuePerGround);

module.exports = router;
