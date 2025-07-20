const express = require("express");
const router = express.Router();
const {
  getNewestGrounds,
  getVenuesByCity,
  getVenuesBySport,
  getHighestRatedVenues,
} = require("../controllers/LatestgroundController");

// Featured Section
router.get("/featured", getHighestRatedVenues);

// Explore by city
router.get("/by-city", getVenuesByCity);

// Explore by sport
router.get("/by-sport", getVenuesBySport);

// getting the newest grounds
router.get("/newest", getNewestGrounds);

module.exports = router;
