const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const { sendTemplatedEmail } = require("../services/notificationService");

const router = express.Router();

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "No account found with this email" });
  }

  // Generate temp password
  const tempPassword = crypto.randomBytes(5).toString("hex"); // 10-char
  const hashedPassword = await bcrypt.hash(tempPassword, 12);

  user.password = hashedPassword;
  user.mustChangePassword = true; // optional flag
  await user.save();

  try {
    await sendTemplatedEmail({
      templateName: "forgotPassword.html",
      to: email,
      subject: "Your Temporary Password",
      data: {
        userName: user.name || "User",
        tempPassword
      },
      type: "password_reset",
      title: "Temporary Password Issued",
      message: `A temporary password was issued for ${email}`,
      userId: user._id
    });

    return res.json({ message: "Temporary password sent to your email." });
  } catch (error) {
    console.error("❌ Email failed:", error);
    return res.status(500).json({ message: "Failed to send email." });
  }
});

module.exports = router;
