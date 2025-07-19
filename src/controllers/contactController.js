const { sendTemplatedEmail } = require("../services/notificationService");

// POST /api/contact
const sendContactMessage = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    // Send Email to Admin
    await sendTemplatedEmail({
      to: process.env.EMAIL_USER, // admin email
      subject: `New Contact Message from ${firstName} ${lastName}`,
      templateName: "contactMessage.html",
      data: { firstName, lastName, email, phone, message },
      message: `You have received a new message from ${firstName} ${lastName}.`
    });

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending contact message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { sendContactMessage };
