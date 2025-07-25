const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");
const User = require("../models/User");

const supabase = createClient(
  "https://qhsfxcesuhbpvhquuzod.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoc2Z4Y2VzdWhicHZocXV1em9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzcxNjQsImV4cCI6MjA2NzY1MzE2NH0.fS-T2lJGSpc8OWrOADjrpg8E-ZwX0AcBVxBxnrJ0KbY"
);

// const supabaseCallback = async (req, res) => {
//   const { access_token } = req.query;

//   if (!access_token) {
//     return res.status(400).json({ message: "Access token missing" });
//   }

//   const { data: userData, error } = await supabase.auth.getUser(access_token);

//   if (error || !userData?.user) {
//     return res.status(401).json({ message: "Failed to get Supabase user" });
//   }

//   const { email, user_metadata } = userData.user;
//   const googleId = userData.user.id;

//   let user = await User.findOne({ "google.id": googleId });

//   if (!user) {
//     user = await User.create({
//       name: user_metadata.full_name || "Google User",
//       email,
//       google: {
//         id: googleId,
//         avatar: user_metadata.avatar_url,
//       },
//       role: "client",
//     });
//   }

//   const payload = {
//     id: user._id,
//     role: user.role,
//     email: user.email,
//   };

//   const token = jwt.sign(payload, process.env.JWT_SECRET, {
//     expiresIn: "1h",
//   });

//   res.cookie("token", token, {
//     httpOnly: true,
//     secure: true, // set to true in production (with HTTPS)
//     sameSite: "None",
//     maxAge: 3600000,
//   });

//   res.redirect("https://sports-booking-frontend-sage.vercel.app");
// };

// module.exports = { supabaseCallback };


const supabaseCallback = async (req, res) => {
  const { access_token } = req.query;

  if (!access_token) {
    return res.status(400).json({ message: "Access token missing" });
  }

  const { data: userData, error } = await supabase.auth.getUser(access_token);

  if (error || !userData?.user) {
    return res.status(401).json({ message: "Failed to get Supabase user" });
  }

  const { email, user_metadata } = userData.user;
  const googleId = userData.user.id;

  let user = await User.findOne({ "google.id": googleId });

  if (!user) {
    user = await User.create({
      name: user_metadata.full_name || "Google User",
      email,
      google: {
        id: googleId,
        avatar: user_metadata.avatar_url,
      },
      role: "client",
    });
  }

  const payload = {
    id: user._id,
    role: user.role,
    email: user.email,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: true, // ✅ because it's on HTTPS (render)
    sameSite: "None",
    maxAge: 3600000,
  });

  // ✅ Redirect to your deployed frontend
  res.redirect("https://sports-booking-frontend-sage.vercel.app");
};

module.exports = { supabaseCallback };
