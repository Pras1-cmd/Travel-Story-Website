const express = require('express');
const {
  getStories,
  getStory,
  countStoryView,
  createStory,
  updateStory,
  deleteStory,
  toggleLike,
  getTrendingStories,
  toggleBookmark,
  getUserBookmarkedStories
} = require('../controllers/storyController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Story routes - place specific routes before parameter routes
router.get('/trending', getTrendingStories);
router.get('/bookmarked', protect, getUserBookmarkedStories);
router.get('/', optionalAuth, getStories);
router.post('/:id/view', countStoryView);
router.get('/:id', optionalAuth, getStory);
router.post('/', protect, createStory);
router.put('/:id', protect, updateStory);
router.delete('/:id', protect, deleteStory);

// Like routes
router.post('/:id/like', protect, toggleLike);

// Bookmark routes
router.post('/:id/bookmark', protect, toggleBookmark);

module.exports = router;