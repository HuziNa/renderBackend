// this controller is for getting the slots for the ground and a specific ground 

const express = require("express");
const router = express.Router();
const { getSlots } = require("../controllers/slotController");

// GET /api/slots?groundId=xxx&date=yyyy-mm-dd
router.get("/", getSlots);

module.exports = router;
