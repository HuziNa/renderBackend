const express = require("express");
const router = express.Router();
const { getNewestGrounds } = require("../controllers/LatestgroundController");

// getting the newest grounds
router.get("/newest", getNewestGrounds);

module.exports = router;
