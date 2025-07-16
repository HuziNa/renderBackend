const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadPaymentProof } = require('../controllers/paymentProofController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/upload-payment-proof/:bookingId', upload.single('proof'), uploadPaymentProof);

module.exports = router;
