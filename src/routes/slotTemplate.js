// routes/slotTemplate.js
const express = require("express");
const router = express.Router();
const { createSlotTemplate } = require("../controllers/slotTemplateController");
const { verifyToken } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.post(
  "/create",
  verifyToken,
  authorizeRoles("company"),
  createSlotTemplate
);

module.exports = router;
