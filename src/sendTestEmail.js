require('dotenv').config();
const mongoose = require('mongoose');
const { sendTemplatedEmail } = require('./services/notificationService'); // adjust path as needed

async function runTest() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("Connected to DB ✅");

    const result = await sendTemplatedEmail({
      templateName: 'bookingConfirmation.html',
      to: 'huziproyt@gmail.com', // your test email
      subject: 'Test Booking Email',
      data: {
        userName: 'John Doe',
        sportName: 'Football',
        companyName: 'Super Sports Center',
        bookingTime: new Date().toLocaleString(),
        slotDetails: 'Ground A | 10:00 AM - 11:00 AM'
      },
      type: 'test_email',
      title: 'Test Booking',
      message: 'This is a test booking email'
    });

    console.log("Email result:", result);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from DB 🚀");
  }
}

runTest();
