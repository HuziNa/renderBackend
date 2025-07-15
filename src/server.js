// File: src/server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard"); // Protected example
const bookingRoutes = require("./routes/booking");

const { verifyToken } = require("./middleware/authMiddleware"); // for protected routes
const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/bookings", verifyToken, bookingRoutes);
app.use("/api/dashboard", verifyToken, dashboardRoutes);
app.use("/api/booking", require("./routes/booking"));
// predadding sports 
const sportRoutes = require("./routes/sport");
app.use("/api/sports", sportRoutes);
// adding grounds
const groundRoutes = require("./routes/ground");
app.use("/api/grounds", groundRoutes);
// creating slot template 
const slotTemplateRoutes = require("./routes/slotTemplate");
app.use("/api/slot-template", slotTemplateRoutes);
// for getting the slots for a ground and a specific date
app.use("/api/slots", require("./routes/slots"));
// for booking depending on the specific user
app.use("/api/booking", require("./routes/booking"));

// for the cooldown function of the bookings 
const expireBookings = require("./jobs/expireBookings");
setInterval(() => {
  expireBookings();
}, 60 * 1000); // runs every 60 seconds

// getting the bookings of a compnay
app.use("/api/company/bookings", require("./routes/companyBookings"));

// admin company management 
app.use("/api/admin/companies", require("./routes/adminCompanyRoutes"));
app.use("/api/user", require("./routes/userBookings"));

// getting all the grounds of a sport and city
app.use("/api/grounds", require("./routes/groundRoutes"));

// getting all the info for the compnay dashboard
app.use("/api/company/dashboard", require("./routes/companyDashboardRoutes"));

// getting all the info for the admin dashboard
app.use("/api/admin/dashboard", require("./routes/adminDashboard"));

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    console.log("✉️ Email Config:");
    console.log({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER
    });
    app.listen(5000, () => console.log("🚀 Server running on port 5000"));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });