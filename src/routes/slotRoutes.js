const express = require("express");
const router = express.Router();
const { updateSlotStatus } = require("../controllers/updateSlotStatus");

router.put("/update-status/:slotId", updateSlotStatus);

module.exports = router;
