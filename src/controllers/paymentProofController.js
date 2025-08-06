const Booking = require("../models/Booking");
const Ground = require("../models/Ground");
const Company = require("../models/Company");
const User = require("../models/User");
const { sendTemplatedEmail } = require("../services/notificationService");
const supabase = require("../utils/supabase");

exports.uploadPaymentProof = async (req, res) => {
  try {
    console.log("=== UPLOAD PAYMENT PROOF START ===");
    const bookingId = req.params.bookingId;
    const file = req.file;

    console.log("BookingId from params:", bookingId);
    console.log("File:", file ? file.originalname : "No file");

    if (!file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required." });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    console.log("Booking found:", booking.bookingId);

    const ground = await Ground.findById(booking.ground);
    if (!ground) {
      return res.status(404).json({ message: "Ground not found." });
    }

    console.log("Ground found:", {
      id: ground._id,
      name: ground.name,
      company: ground.company,
    });

    if (!ground.company || !ground.company._id) {
      return res.status(404).json({ message: "Company info not found in ground." });
    }

    const company = await Company.findById(ground.company._id);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    const companyUser = await User.findById(company.user._id);
    if (!companyUser) {
      return res.status(404).json({ message: "Company owner not found." });
    }

    console.log("Company found:", company.companyName);
    console.log("Company user found:", companyUser.email);

    // Upload file to Supabase
    const timestamp = Date.now();
    const filename = `${bookingId}_${timestamp}_${file.originalname}`;

    const { data, error } = await supabase.storage
      .from("paymentproofs")
      .upload(`proofs/${filename}`, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return res.status(500).json({
        message: "Error uploading to cloud storage.",
        error: error.message,
      });
    }

    const { data: publicURLData } = supabase.storage
      .from("paymentproofs")
      .getPublicUrl(`proofs/${filename}`);

    const fileURL = publicURLData.publicUrl;
    console.log("Public URL:", fileURL);

    // Update booking
    booking.payment.status = "proof_uploaded";
    booking.payment.proofUrl = fileURL;
    booking.status = "pending-confirmation"; // added this for the payment page
    await booking.save();

    console.log("Booking updated with payment proof");

    // Send email
    try {
      await sendTemplatedEmail({
        templateName: "paymentProofUploaded.html",
        to: companyUser.email,
        subject: `Payment proof uploaded for booking #${booking.bookingId}`,
        data: {
          companyName: company.companyName,
          userName: booking.isGuest
            ? booking.guestInfo?.name
            : booking.user?.name,
          bookingId: booking.bookingId,
          amount: booking.payment.amount || booking.totalAmount || 0,
        },
        type: "payment_proof_uploaded",
        title: "Payment Proof Uploaded",
        message: `Payment proof uploaded for booking #${booking.bookingId}.`,
        userId: booking.user?._id,
        relatedBooking: booking._id,
        relatedCompany: company._id,
        attachments: [
          {
            filename: file.originalname,
            path: fileURL,
          },
        ],
      });

      console.log("Email sent to company owner");
    } catch (emailError) {
      console.error("Error sending email:", emailError);
    }

    console.log("=== UPLOAD PAYMENT PROOF SUCCESS ===");

    res.json({
      message: "Payment proof uploaded successfully.",
      booking: {
        _id: booking._id,
        bookingId: booking.bookingId,
        paymentStatus: booking.payment.status,
      },
    });
  } catch (err) {
    console.error("=== UPLOAD PAYMENT PROOF ERROR ===");
    console.error("Error uploading payment proof:", err);
    console.error("Stack trace:", err.stack);

    res.status(500).json({
      message: "Internal server error.",
      error:
        process.env.NODE_ENV === "development" ? err.message : "Server error",
    });
  }
};
