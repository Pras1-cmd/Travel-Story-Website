const User = require('../models/User');
const Story = require('../models/Story');
const Comment = require('../models/Comment');

exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalStories, totalComments, unverifiedUsers, recentUsers, recentStories] = await Promise.all([
      User.countDocuments(),
      Story.countDocuments(),
      Comment.countDocuments(),
      User.countDocuments({ isVerified: false }),
      User.find().sort({ createdAt: -1 }).limit(5).select('username email role isVerified createdAt'),
      Story.find().populate('author', 'username profileImage').sort({ createdAt: -1 }).limit(5)
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalStories,
          totalComments,
          unverifiedUsers
        },
        recentUsers,
        recentStories
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard data'
    });
  }
};
