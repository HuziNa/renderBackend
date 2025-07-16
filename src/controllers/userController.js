// for updating the user info etc
const User = require("../models/User");
const Booking = require("../models/Booking");
const bcrypt = require("bcryptjs");

//  Update profile (name, email, phone)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    res.json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//  Change password (only for non-Google users)
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.google?.id) {
      return res.status(400).json({ message: "Google users cannot change password" });
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// View previous bookings
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ "user._id": userId })
      .populate("ground")
      .populate("slot")
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//  Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete user
    await User.findByIdAndDelete(userId);

    // Optional: delete all related bookings
    await Booking.deleteMany({ "user._id": userId });

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
