
// src/routes/dashboard.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    message: `Welcome, ${req.user?.email || "Guest"}!`,
    role: req.user?.role || "guest"
  });
});

module.exports = router; // ✅ must export the router itself
