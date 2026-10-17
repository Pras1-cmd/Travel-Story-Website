const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getNotifications, markNotificationRead } = require('../controllers/socialController');

const router = express.Router();

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markNotificationRead);

module.exports = router;
