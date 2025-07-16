const Booking = require('../models/Booking');
const Ground = require('../models/Ground');
const Company = require('../models/Company');
const User = require('../models/User');
const { sendTemplatedEmail } = require('../services/notificationService');

exports.uploadPaymentProof = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const file = req.file; // from multer
    if (!file) return res.status(400).json({ message: "No file uploaded." });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    const ground = await Ground.findById(booking.ground);
    const company = await Company.findById(ground.company._id);
    const companyUser = await User.findById(company.user._id);

    // Update booking status or store proof path if needed
    booking.payment.proof = file.path;
    booking.payment.status = "proof_uploaded";
    await booking.save();

    // Send email to company with attachment
    await sendTemplatedEmail({
      templateName: "paymentProofUploaded.html",
      to: companyUser.email,
      subject: `Payment proof uploaded for booking #${booking.bookingId}`,
      data: {
        companyName: company.companyName,
        userName: booking.isGuest ? booking.guestInfo?.name : booking.user?.name,
        bookingId: booking.bookingId,
      },
      type: "payment_proof_uploaded",
      title: "Payment Proof Uploaded",
      message: `Payment proof uploaded by ${booking.isGuest ? booking.guestInfo?.name : booking.user?.name} for booking #${booking.bookingId}.`,
      userId: booking.user?._id,
      relatedBooking: booking._id,
      relatedCompany: company._id,
      attachments: [
        {
          filename: file.originalname,
          path: file.path
        }
      ]
    });

    res.json({ message: "Payment proof uploaded and emailed to company." });

  } catch (err) {
    console.error("Error uploading payment proof:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
