const Comment = require('../models/Comment');
const Story = require('../models/Story');

// @desc    Get comments for a story
// @route   GET /api/comments/story/:storyId
// @access  Public
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      story: req.params.storyId,
      parentComment: null
    })
      .populate('author', 'username firstName lastName profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { comments }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching comments'
    });
  }
};

// @desc    Create comment
// @route   POST /api/comments
// @access  Private
exports.createComment = async (req, res) => {
  try {
    const { content, storyId, parentCommentId } = req.body;

    // Check if story exists
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // If reply, check if parent comment exists
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
    }

    const comment = await Comment.create({
      content,
      story: storyId,
      author: req.user.id,
      parentComment: parentCommentId || null
    });

    // Update story comments count
    story.commentsCount += 1;
    await story.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username firstName lastName profileImage');

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: { comment: populatedComment }
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating comment'
    });
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check ownership
    if (comment.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }

    comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content },
      { new: true, runValidators: true }
    ).populate('author', 'username firstName lastName profileImage');

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: { comment }
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating comment'
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check ownership
    if (comment.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    // Delete replies
    await Comment.deleteMany({ parentComment: req.params.id });

    // Update story comments count
    const story = await Story.findById(comment.story);
    if (story) {
      const repliesCount = await Comment.countDocuments({ parentComment: req.params.id });
      story.commentsCount -= (1 + repliesCount);
      await story.save();
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting comment'
    });
  }
};

// @desc    Like/unlike comment
// @route   POST /api/comments/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const userIndex = comment.likes.indexOf(req.user.id);

    if (userIndex > -1) {
      // Unlike
      comment.likes.splice(userIndex, 1);
      comment.likesCount -= 1;
    } else {
      // Like
      comment.likes.push(req.user.id);
      comment.likesCount += 1;
    }

    await comment.save();

    res.status(200).json({
      success: true,
      message: userIndex > -1 ? 'Comment unliked' : 'Comment liked',
      data: { likesCount: comment.likesCount, isLiked: userIndex === -1 }
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling like'
    });
  }
};

// @desc    Get replies for a comment
// @route   GET /api/comments/:id/replies
// @access  Public
exports.getReplies = async (req, res) => {
  try {
    const replies = await Comment.find({ parentComment: req.params.id })
      .populate('author', 'username firstName lastName profileImage')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: { replies }
    });
  } catch (error) {
    console.error('Get replies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching replies'
    });
  }
};
