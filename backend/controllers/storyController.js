const Story = require('../models/Story');
const Comment = require('../models/Comment');

// @desc    Get all stories
// @route   GET /api/stories
// @access  Public
exports.getStories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { category, tags, author, search } = req.query;

    // Build query
    let query = { isPublished: true };

    if (category) {
      query.category = category;
    }

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    if (author) {
      query.author = author;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const stories = await Story.find(query)
      .populate('author', 'username firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Story.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        stories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching stories'
    });
  }
};

// @desc    Get single story
// @route   GET /api/stories/:id
// @access  Public
exports.getStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('author', 'username firstName lastName profileImage bio');

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Increment views
    story.views += 1;
    await story.save();

    res.status(200).json({
      success: true,
      data: { story }
    });
  } catch (error) {
    console.error('Get story error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching story'
    });
  }
};

// @desc    Create story
// @route   POST /api/stories
// @access  Private
exports.createStory = async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, images, location, tags, category } = req.body;

    const story = await Story.create({
      title,
      content,
      excerpt,
      coverImage,
      images,
      location,
      tags,
      category,
      author: req.user.id
    });

    const populatedStory = await Story.findById(story._id)
      .populate('author', 'username firstName lastName profileImage');

    res.status(201).json({
      success: true,
      message: 'Story created successfully',
      data: { story: populatedStory }
    });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating story'
    });
  }
};

// @desc    Update story
// @route   PUT /api/stories/:id
// @access  Private
exports.updateStory = async (req, res) => {
  try {
    let story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Check ownership
    if (story.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this story'
      });
    }

    const { title, content, excerpt, coverImage, images, location, tags, category, isPublished } = req.body;

    story = await Story.findByIdAndUpdate(
      req.params.id,
      { title, content, excerpt, coverImage, images, location, tags, category, isPublished },
      { new: true, runValidators: true }
    ).populate('author', 'username firstName lastName profileImage');

    res.status(200).json({
      success: true,
      message: 'Story updated successfully',
      data: { story }
    });
  } catch (error) {
    console.error('Update story error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating story'
    });
  }
};

// @desc    Delete story
// @route   DELETE /api/stories/:id
// @access  Private
exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Check ownership
    if (story.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this story'
      });
    }

    // Delete associated comments
    await Comment.deleteMany({ story: req.params.id });

    await story.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting story'
    });
  }
};

// @desc    Like/unlike story
// @route   POST /api/stories/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    const userIndex = story.likes.indexOf(req.user.id);

    if (userIndex > -1) {
      // Unlike
      story.likes.splice(userIndex, 1);
      story.likesCount -= 1;
    } else {
      // Like
      story.likes.push(req.user.id);
      story.likesCount += 1;
    }

    await story.save();

    res.status(200).json({
      success: true,
      message: userIndex > -1 ? 'Story unliked' : 'Story liked',
      data: { likesCount: story.likesCount, isLiked: userIndex === -1 }
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling like'
    });
  }
};

// @desc    Get trending stories
// @route   GET /api/stories/trending
// @access  Public
exports.getTrendingStories = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const stories = await Story.find({ isPublished: true })
      .populate('author', 'username firstName lastName profileImage')
      .sort({ likesCount: -1, views: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      data: { stories }
    });
  } catch (error) {
    console.error('Get trending stories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching trending stories'
    });
  }
};
