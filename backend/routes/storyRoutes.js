const express = require('express');
const {
  getStories,
  getStory,
  createStory,
  updateStory,
  deleteStory,
  toggleLike,
  getTrendingStories
} = require('../controllers/storyController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Story routes
router.get('/trending', getTrendingStories);
router.get('/', optionalAuth, getStories);
router.get('/:id', optionalAuth, getStory);
router.post('/', protect, createStory);
router.put('/:id', protect, updateStory);
router.delete('/:id', protect, deleteStory);

// Like routes
router.post('/:id/like', protect, toggleLike);

module.exports = router;
