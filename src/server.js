// File: src/server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard"); // Protected example
const bookingRoutes = require("./routes/booking");
const cors = require("cors");
const { verifyToken } = require("./middleware/authMiddleware"); // for protected routes
const app = express();
app.use(express.urlencoded({ extended: true }));
// new shit for the cookie system
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "https://sports-booking-frontend-sage.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// deleting the old slots and making new ones
const cron = require("node-cron");
const { updateSlotsDaily } = require("./controllers/slotTemplateController");

cron.schedule("0 0 * * *", async () => {
  console.log(" Running daily slot update job...");
  await updateSlotsDaily();
});

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
},  60 * 1000); // runs every 15 minutes

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

// changing the user info and stuff
app.use("/api/user/update", require("./routes/userRoutes"));

// payment proof
app.use("/api/payment-proof", require("./routes/paymentProofRoutes"));

// this is the api for getting the grounds from sport, location and the date
app.use("/api/grounds", require("./routes/groundsWithSlots"));

// the api for the contact us page
app.use("/api/contact", require("./routes/contactRoutes"));

// this is for getting the reviews of a company and also posting a review
app.use("/api/reviews", require("./routes/reviewRoutes"));

// getting the latest grounds for the whats new page and also the newest and seacrh by grounds
app.use("/api/grounds", require("./routes/LatestgroundRoutes"));

app.use("/api", require("./routes/supabaseRoutes"));

app.use("/api", require("./routes/sendTempPasswordEmail"));

const path = require("path");
app.use(express.static(path.join(__dirname, "../public")));

const revenueRoutes = require("./routes/revenueRoutes");
app.use("/api/company", revenueRoutes);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    console.log("✉️ Email Config:");
    console.log({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
    });
    const PORT = process.env.PORT || 5000; // ✅ Dynamic for Render
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });
