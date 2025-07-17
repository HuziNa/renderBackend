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

// Create a new slot template
router.post("/", verifyToken, authorizeRoles("company"),createSlotTemplate);

// Update an existing template
router.put("/:templateId", verifyToken, authorizeRoles("company"),updateSlotTemplate);

module.exports = router;
