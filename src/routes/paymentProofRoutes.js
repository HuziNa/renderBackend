const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadPaymentProof } = require('../controllers/paymentProofController');

// ✅ Use memoryStorage so we can access file.buffer in the controller
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const ext = file.originalname.toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, or PDF files allowed."), false);
  }
};

const upload = multer({ storage, fileFilter });

router.post('/upload-payment-proof/:bookingId', upload.single('proof'), uploadPaymentProof);

module.exports = router;
