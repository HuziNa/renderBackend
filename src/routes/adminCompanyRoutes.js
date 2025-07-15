const express = require("express");
const router = express.Router();

const {
  getAllCompanies,
  approveCompany
} = require("../controllers/adminCompanyController");

const { verifyToken } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Admin routes
router.get("/", verifyToken, authorizeRoles("admin"),getAllCompanies);
router.patch("/approve/:companyId", verifyToken, authorizeRoles("admin"), approveCompany);

module.exports = router;
