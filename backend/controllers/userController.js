const User = require('../models/User');
const Notification = require('../models/Notification');
const Story = require('../models/Story');
const Comment = require('../models/Comment');
const StoryView = require('../models/StoryView');
const Like = require('../models/Like');
const Bookmark = require('../models/Bookmark');
const Feedback = require('../models/Feedback');
const cloudinary = require('../config/cloudinary');

// @desc    Delete the authenticated user's account
// @route   DELETE /api/users/profile
// @access  Private
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const authoredStories = await Story.find({ author: userId }).select('_id');
    const storyIds = authoredStories.map((story) => story._id);
    const authoredStoryIds = new Set(storyIds.map((id) => id.toString()));
    const commentsToDelete = await Comment.find({
      $or: [{ story: { $in: storyIds } }, { author: userId }]
    }).select('_id story');
    const commentIds = new Set(commentsToDelete.map((comment) => comment._id.toString()));
    let parentIds = [...commentIds];

    while (parentIds.length > 0) {
      const replies = await Comment.find({ parentComment: { $in: parentIds } }).select('_id story');
      parentIds = replies
        .map((comment) => comment._id.toString())
        .filter((id) => !commentIds.has(id));
      replies.forEach((comment) => commentIds.add(comment._id.toString()));
      replies.forEach((comment) => commentsToDelete.push(comment));
    }

    const retainedStoryCommentCounts = new Map();
    commentsToDelete.forEach((comment) => {
      const storyId = comment.story.toString();
      if (!authoredStoryIds.has(storyId)) {
        retainedStoryCommentCounts.set(storyId, (retainedStoryCommentCounts.get(storyId) || 0) + 1);
      }
    });

    const commentObjectIds = [...commentIds];

    await Promise.all([
      Story.deleteMany({ author: userId }),
      Comment.deleteMany({ _id: { $in: commentObjectIds } }),
      Story.updateMany(
        { author: { $ne: userId } },
        { $pull: { likes: userId, bookmarks: userId } }
      ),
      Comment.updateMany(
        { _id: { $nin: commentObjectIds } },
        { $pull: { likes: userId } }
      ),
      User.updateMany(
        { _id: { $ne: userId } },
        { $pull: { followers: userId, following: userId } }
      ),
      Notification.deleteMany({ user: userId }),
      StoryView.deleteMany({ story: { $in: storyIds } }),
      Like.deleteMany({
        $or: [{ user: userId }, { story: { $in: storyIds } }, { comment: { $in: commentObjectIds } }]
      }),
      Bookmark.deleteMany({ $or: [{ user: userId }, { story: { $in: storyIds } }] }),
      Feedback.updateMany({ user: userId }, { $unset: { user: '' } })
    ]);

    await Promise.all([...retainedStoryCommentCounts.keys()].map(async (storyId) => {
      const commentsCount = await Comment.countDocuments({ story: storyId });
      await Story.updateOne({ _id: storyId }, { $set: { commentsCount } });
    }));

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Account and associated content deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting account'
    });
  }
};

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username profileImage')
      .populate('following', 'username profileImage');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const stories = await Story.find({
      author: user._id,
      isPublished: true
    })
      .populate('author', 'username firstName lastName profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { user, stories }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio, profileImage } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

// @desc    Upload profile image to Cloudinary
// @route   POST /api/users/profile/image
// @access  Private
exports.uploadProfileImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Choose an image to upload'
    });
  }

  const cloudinaryConfig = cloudinary.config();
  if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
    return res.status(503).json({
      success: false,
      message: 'Image uploads are unavailable because Cloudinary is not configured'
    });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let uploadedImage;
    try {
      uploadedImage = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
          folder: process.env.CLOUDINARY_FOLDER_NAME
            ? `${process.env.CLOUDINARY_FOLDER_NAME}/profiles`
            : 'travel_stories/profiles',
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
          transformation: [{ width: 512, height: 512, crop: 'limit' }]
        }, (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
        });

        uploadStream.end(req.file.buffer);
      });
    } catch (error) {
      console.error('Cloudinary profile image upload error:', error);
      return res.status(502).json({
        success: false,
        message: 'Cloudinary could not upload this image'
      });
    }

    user.profileImage = uploadedImage.secure_url;

    try {
      await user.save();
    } catch (error) {
      try {
        await cloudinary.uploader.destroy(uploadedImage.public_id, { resource_type: 'image' });
      } catch (cleanupError) {
        console.error('Failed to clean up unlinked Cloudinary profile image:', cleanupError);
      }
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        profileImage: user.profileImage,
        user
      }
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error saving profile image'
    });
  }
};

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Can't follow yourself
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    // Check if already following
    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user'
      });
    }

    // Add to following and followers
    currentUser.following.push(req.params.id);
    userToFollow.followers.push(req.user.id);

    await currentUser.save();
    await userToFollow.save();

    await Notification.create({
      user: req.params.id,
      message: `${currentUser.username} started following you`,
      type: 'follow',
      link: `/profile/${currentUser._id}`
    });

    res.status(200).json({
      success: true,
      message: 'User followed successfully'
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error following user'
    });
  }
};

// @desc    Unfollow a user
// @route   POST /api/users/:id/unfollow
// @access  Private
exports.unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if following
    if (!currentUser.following.includes(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Not following this user'
      });
    }

    // Remove from following and followers
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== req.params.id
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== req.user.id.toString()
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error unfollowing user'
    });
  }
};

// @desc    Get user's followers
// @route   GET /api/users/:id/followers
// @access  Public
exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username firstName lastName profileImage');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { followers: user.followers }
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching followers'
    });
  }
};

// @desc    Get user's following
// @route   GET /api/users/:id/following
// @access  Public
exports.getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'username firstName lastName profileImage');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { following: user.following }
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching following'
    });
  }
};
