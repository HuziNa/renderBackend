const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");
const { User, Company } = require("../models");
const supabase = require("../utils/supabase");
const jwt = require("jsonwebtoken");


const supabaseCallback = async (req, res) => {
  const { access_token } = req.query;

  if (!access_token) {
    return res.status(400).json({ message: "Access token missing" });
  }

  const { data: userData, error } = await supabase.auth.getUser(access_token);

  if (error || !userData?.user) {
    return res.status(401).json({ message: "Failed to get Supabase user", error });
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
    name: user.name,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None", // or "Lax" if testing locally without HTTPS
      maxAge: 60 * 60 * 1000, // 1 hour
    })
    .status(200)
    .json({ message: "Login successful", user: payload });
};


// ---------- GUEST LOGIN ----------
const guestLogin = async (req, res) => {
  const guestPayload = {
    isGuest: true,
    sessionId: `guest_${Date.now()}`,
    role: "guest",
  };

  const token = generateToken(guestPayload, "30m");
  res.status(200).json({ token, role: "guest" });
};

// ---------- CLIENT LOGIN ----------
const loginClient = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, role: "client" });

  if (!user) return res.status(404).json({ message: "Client not found" });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const payload = {
    id: user._id,
    role: user.role,
    email: user.email,
    name: user.name, 
  };

  const token = generateToken(payload);
  res
    .cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({ role: user.role });
};

// ---------- CLIENT REGISTER ----------
const registerClient = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    const newUser = await User.create({
      name,
      email,
      password, // Will be hashed via pre-save
      phone,
      role: "client",
    });

    const payload = {
      id: newUser._id,
      role: newUser.role,
      email: newUser.email,
    };

    const token = generateToken(payload);
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({ role: newUser.role });
  } catch (err) {
    console.error("Client register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

// ---------- COMPANY REGISTER ----------
const registerCompany = async (req, res) => {
  try {
    const { name, email, password, phone, companyName } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    const newUser = await User.create({
      name,
      email,
      password, // Will be hashed
      phone,
      role: "company",
    });

    const newCompany = await Company.create({
      user: {
        _id: newUser._id,
        name: newUser.name,
      },
      companyName,
      isActive: false, // require admin approval 
    });

    const payload = {
      id: newUser._id,
      role: newUser.role,
      email: newUser.email,
      companyId: newCompany._id,
    };

    const token = generateToken(payload);
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({ role: newUser.role });
  } catch (err) {
    console.error("Company register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

// ---------- COMPANY LOGIN ----------
const loginCompany = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, role: "company" });

  if (!user) return res.status(404).json({ message: "Company user not found" });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const company = await Company.findOne({ "user._id": user._id });

  const payload = {
    id: user._id,
    role: user.role,
    email: user.email,
    companyId: company?._id || null,
  };

  const token = generateToken(payload);
  res
    .cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({ role: user.role });
};

// ---------- ADMIN LOGIN ----------
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, role: "admin" });

  if (!user) return res.status(404).json({ message: "Admin not found" });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const payload = {
    id: user._id,
    role: user.role,
    email: user.email,
  };

  const token = generateToken(payload);
  res
    .cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({ role: user.role });
};

module.exports = {
  guestLogin,
  loginClient,
  registerClient,
  loginCompany,
  registerCompany,
  loginAdmin,
  supabaseCallback,
};
