// // routes/slotTemplate.js
// const express = require("express");
// const router = express.Router();
// const { createSlotTemplate } = require("../controllers/slotTemplateController");
// const { verifyToken } = require("../middleware/authMiddleware");
// const authorizeRoles = require("../middleware/roleMiddleware");

// router.post(
//   "/create",
//   verifyToken,
//   authorizeRoles("company"),
//   createSlotTemplate
// );

// module.exports = router;

// for creating a slot template and also making the slots and editing a slot 
const express = require("express");
const { createSlotTemplate, updateSlotTemplate } = require("../controllers/slotTemplateController");
const { verifyToken } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const router = express.Router();
const SlotTemplate = require("../models/SlotTemplate");
const { Ground, Company } = require("../models");

// Create a new slot template
router.post("/", verifyToken, authorizeRoles("company"),createSlotTemplate);

// Update an existing template
router.put("/:templateId", verifyToken, authorizeRoles("company"),updateSlotTemplate);

// GET slot template by ground ID
router.get("/Template", verifyToken, authorizeRoles("company"), async (req, res) => {
  try {
    const { groundId } = req.query;
    if (!groundId) return res.status(400).json({ message: "Ground ID required" });

    const template = await SlotTemplate.findOne({ ground: groundId });
    if (!template) return res.status(404).json({ message: "No slot template found" });

    res.status(200).json(template);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
