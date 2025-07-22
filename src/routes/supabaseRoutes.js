const express = require('express');
const { supabaseCallback } = require('../controllers/supabaseController');
const router = express.Router();

router.get('/auth/supabase/callback', supabaseCallback);

module.exports = router;
