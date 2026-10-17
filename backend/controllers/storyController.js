const Story = require('../models/Story');
const StoryView = require('../models/StoryView');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

// @desc    Get all stories
// @route   GET /api/stories
// @access  Public
exports.getStories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { category, tags, author, search, q, destination, reachableBy, familyFriendly } = req.query;

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

    const searchQuery = search || q;
    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { content: { $regex: searchQuery, $options: 'i' } },
        { excerpt: { $regex: searchQuery, $options: 'i' } },
        { 'location.country': { $regex: searchQuery, $options: 'i' } },
        { 'location.city': { $regex: searchQuery, $options: 'i' } }
      ];
    }

    if (destination) {
      const destinationQuery = {
        $or: [
          { 'location.country': { $regex: destination, $options: 'i' } },
          { 'location.city': { $regex: destination, $options: 'i' } }
        ]
      };

      if (query.$or) {
        // Combine both $or conditions with $and
        query.$and = [
          { $or: query.$or },
          destinationQuery
        ];
        delete query.$or;
      } else {
        query.$or = destinationQuery.$or;
      }
    }

    if (reachableBy) {
      const modes = reachableBy.split(',');
      query.reachableBy = { $in: modes };
    }

    if (familyFriendly === 'true' || familyFriendly === true) {
      query.familyFriendly = true;
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

// @desc    Count a story view
// @route   POST /api/stories/:id/view
// @access  Public
exports.countStoryView = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).select('views');

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    const { visitorId } = req.body;
    if (typeof visitorId !== 'string' || !/^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/i.test(visitorId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid visitor ID is required'
      });
    }

    const now = new Date();
    const cooldownCutoff = new Date(now.getTime() - 10_000);
    let canCountView = await StoryView.findOneAndUpdate(
      {
        story: story._id,
        visitorId,
        lastViewedAt: { $lte: cooldownCutoff }
      },
      { $set: { lastViewedAt: now } },
      { new: true }
    );

    if (!canCountView) {
      try {
        await StoryView.create({
          story: story._id,
          visitorId,
          lastViewedAt: now
        });
        canCountView = true;
      } catch (error) {
        if (error.code !== 11000) throw error;
      }
    }

    if (!canCountView) {
      const currentStory = await Story.findById(story._id).select('views');
      return res.status(200).json({
        success: true,
        data: { views: currentStory.views, counted: false }
      });
    }

    const updatedStory = await Story.findByIdAndUpdate(
      story._id,
      { $inc: { views: 1 } },
      { new: true, select: 'views' }
    );

    if (!updatedStory) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { views: updatedStory.views, counted: true }
    });
  } catch (error) {
    console.error('Count story view error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error counting story view'
    });
  }
};

// @desc    Create story
// @route   POST /api/stories
// @access  Private
exports.createStory = async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, images, location, reachableBy, familyFriendly, familyFriendlyNote, tags, category } = req.body;

    const story = await Story.create({
      title,
      content,
      excerpt,
      coverImage,
      images,
      location,
      reachableBy,
      familyFriendly,
      familyFriendlyNote,
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

    const { title, content, excerpt, coverImage, images, location, reachableBy, familyFriendly, familyFriendlyNote, tags, category, isPublished } = req.body;

    story = await Story.findByIdAndUpdate(
      req.params.id,
      { title, content, excerpt, coverImage, images, location, reachableBy, familyFriendly, familyFriendlyNote, tags, category, isPublished },
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

      if (story.author && story.author.toString() !== req.user.id.toString()) {
        await Notification.create({
          user: story.author,
          message: `${req.user.username || 'Someone'} liked your story`,
          type: 'like',
          link: `/story/${story._id}`
        });
      }
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

// @desc    Bookmark/unbookmark story
// @route   POST /api/stories/:id/bookmark
// @access  Private
exports.toggleBookmark = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    const isBookmarked = await story.toggleBookmark(req.user.id);

    res.status(200).json({
      success: true,
      message: isBookmarked ? 'Story bookmarked' : 'Story removed from bookmarks',
      data: { isBookmarked }
    });
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling bookmark'
    });
  }
};

// @desc    Get user's bookmarked stories
// @route   GET /api/stories/bookmarked
// @access  Private
exports.getUserBookmarkedStories = async (req, res) => {
  try {
    const stories = await Story.find({
      $and: [
        { isPublished: true },
        { bookmarks: req.user.id }
      ]
    })
      .populate('author', 'username firstName lastName profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { stories }
    });
  } catch (error) {
    console.error('Get bookmarked stories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching bookmarked stories'
    });
  }
};
