const express = require('express');
const {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  toggleLike,
  getReplies
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Comment routes
router.get('/story/:storyId', getComments);
router.post('/', protect, createComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);

// Like routes
router.post('/:id/like', protect, toggleLike);

// Replies
router.get('/:id/replies', getReplies);

module.exports = router;
