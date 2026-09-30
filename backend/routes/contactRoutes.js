const express = require('express');
const { submitFeedback } = require('../controllers/contactController');
const { optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', optionalAuth, submitFeedback);

module.exports = router;
