const express = require("express");
const router = express.Router();
const { addReview, getCompanyReviews, getAllReviews } = require("../controllers/reviewController");
const { verifyToken } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Add a review 
router.post("/", verifyToken, authorizeRoles("client"),addReview);

// Get reviews for a company with the ._id of the company 
router.get("/company/:companyId", verifyToken,authorizeRoles("company"),getCompanyReviews);

// getting all the reviews 
router.get("/all", getAllReviews);

module.exports = router;
