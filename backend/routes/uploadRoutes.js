const express = require('express');
const { uploadImages, deleteImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Upload routes
router.post('/', protect, upload.array('images', 5), uploadImages);
router.delete('/:publicId', protect, deleteImage);

module.exports = router;
