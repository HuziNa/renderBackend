const express = require("express");
const router = express.Router();
const {
  guestLogin,
  loginClient,
  loginCompany,
  loginAdmin,
  registerClient,
  registerCompany,
  supabaseCallback,
} = require("../controllers/authController");

// Guest Login
router.post("/login/guest", guestLogin);

// Client Auth
router.post("/login/client", loginClient);
router.post("/register/client", registerClient);

// Company Auth
router.post("/login/company", loginCompany);
router.post("/register/company", registerCompany);

// Admin Auth (no register)
router.post("/login/admin", loginAdmin);

router.get("/supabase-callback", supabaseCallback);

module.exports = router;
