const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");
const User = require("../models/User");

const supabase = createClient(
  "https://qhsfxcesuhbpvhquuzod.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoc2Z4Y2VzdWhicHZocXV1em9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzcxNjQsImV4cCI6MjA2NzY1MzE2NH0.fS-T2lJGSpc8OWrOADjrpg8E-ZwX0AcBVxBxnrJ0KbY"
);

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
    secure: false, // set to true in production (with HTTPS)
    sameSite: "lax",
    maxAge: 3600000,
  });

  res.send(`
    <html>
      <body style="font-family: sans-serif; text-align: center; margin-top: 50px;">
        <h1>Login Successful 🎉</h1>
        <p>Your session has been created.</p>
      </body>
    </html>
  `);
};

module.exports = { supabaseCallback };
