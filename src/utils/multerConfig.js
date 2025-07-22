const multer = require("multer");

const storage = multer.memoryStorage(); // Save files in memory, not disk

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const ext = file.originalname.toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and PDF files are allowed"), false);
  }
};

module.exports = multer({ storage, fileFilter });
