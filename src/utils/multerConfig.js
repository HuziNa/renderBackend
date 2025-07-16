const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/paymentProofs/"); // make sure this exists or create on startup
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `proof-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept images or pdfs
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and PDF files are allowed"), false);
  }
};

module.exports = multer({
  storage,
  fileFilter
});
