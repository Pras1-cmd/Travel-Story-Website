const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const { getDashboard } = require('../controllers/adminController');

const router = express.Router();

router.get('/dashboard', protect, requireAdmin, getDashboard);

module.exports = router;
