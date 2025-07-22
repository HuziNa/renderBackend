const Booking = require('../models/Booking');
const Ground = require('../models/Ground');
const Company = require('../models/Company');
const User = require('../models/User');
const { sendTemplatedEmail } = require('../services/notificationService');
const supabase = require('../utils/supabase');

exports.uploadPaymentProof = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No file uploaded." });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    const ground = await Ground.findById(booking.ground);
    const company = await Company.findById(ground.company._id);
    const companyUser = await User.findById(company.user._id);

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${bookingId}_${timestamp}_${file.originalname}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('paymentproofs')
      .upload(`proofs/${filename}`, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ message: "Error uploading to cloud storage." });
    }

    // Get public URL
    const { data: publicURLData } = supabase.storage
      .from('paymentproofs')
      .getPublicUrl(`proofs/${filename}`);

    const fileURL = publicURLData.publicUrl;

    // Save to booking
    booking.payment.status = "proof_uploaded";
    await booking.save();

    // Send email
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
          path: fileURL // ← Public Supabase URL
        }
      ]
    });

    res.json({ message: "Payment proof uploaded and emailed to company." });

  } catch (err) {
    console.error("Error uploading payment proof:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
