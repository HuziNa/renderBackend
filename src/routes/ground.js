const express = require("express");
const router = express.Router();
const { addGround } = require("../controllers/groundController");
const { verifyToken } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const checkCompanyApproval = require("../middleware/checkCompanyApproval");

router.post(
  "/add",
  verifyToken,
  authorizeRoles("company"),
  //checkCompanyApproval,
  addGround
);

module.exports = router;
