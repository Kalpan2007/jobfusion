const express = require('express');
const router = express.Router();
const { analyzeResume, upload } = require('../controllers/analyzeController');
const rateLimit = require('express-rate-limit');

const analyzeLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // limit each IP to 10 requests per windowMs
});

router.post('/analyze', analyzeLimit, upload, analyzeResume);

module.exports = router;
