const express = require("express");
const router = express.Router();
const { getGroundsByCityAndSport } = require("../controllers/gettingGround");
const checkCompanyApproval = require("../middleware/checkCompanyApproval");
const { verifyToken } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.get(
  "/search",
  verifyToken,
  authorizeRoles("client"),
  getGroundsByCityAndSport
);

module.exports = router;

// this returns all the grounds of a particular sport and date
