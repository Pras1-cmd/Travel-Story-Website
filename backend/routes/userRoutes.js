const express = require('express');
const {
  getUserProfile,
  deleteAccount,
  updateProfile,
  uploadProfileImage,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const uploadProfileImageFile = require('../middleware/profileImageUpload');

const router = express.Router();

// Profile routes
router.delete('/profile', protect, deleteAccount);
router.put('/profile', protect, updateProfile);
router.post('/profile/image', protect, uploadProfileImageFile, uploadProfileImage);
router.get('/profile/:id', getUserProfile);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);
router.get('/:id', getUserProfile);

// Follow routes
router.post('/:id/follow', protect, followUser);
router.post('/:id/unfollow', protect, unfollowUser);

module.exports = router;
