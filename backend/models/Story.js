const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverImage: {
    type: String,
    default: ''
  },
  images: [{
    url: String,
    caption: String,
    publicId: String
  }],
  location: {
    country: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  reachableBy: [{
    type: String,
    enum: ['train', 'bus', 'vehicle', 'flight'],
    default: []
  }],
  familyFriendly: {
    type: Boolean,
    default: false
  },
  familyFriendlyNote: {
    type: String,
    maxlength: [500, 'Family friendly note cannot exceed 500 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['adventure', 'culture', 'food', 'nature', 'city', 'budget', 'luxury', 'solo', 'family', 'other'],
    default: 'other'
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bookmarksCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search and performance
storySchema.index({ title: 'text', content: 'text', tags: 'text' });
storySchema.index({ author: 1, createdAt: -1 });
storySchema.index({ isPublished: 1, createdAt: -1 });
storySchema.index({ likesCount: -1 });
storySchema.index({ views: -1 });
storySchema.index({ 'location.country': 1, 'location.city': 1 });
storySchema.index({ category: 1 });
storySchema.index({ familyFriendly: 1 });
storySchema.index({ 'reachableBy': 1 });

// Update likes count
storySchema.methods.updateLikesCount = async function() {
  this.likesCount = this.likes.length;
  await this.save();
};

// Update bookmarks count
storySchema.methods.updateBookmarksCount = async function() {
  this.bookmarksCount = this.bookmarks.length;
  await this.save();
};

// Check if story is bookmarked by user
storySchema.methods.isBookmarkedBy = function(userId) {
  return this.bookmarks.includes(userId);
};

// Toggle bookmark status
storySchema.methods.toggleBookmark = async function(userId) {
  const index = this.bookmarks.indexOf(userId);
  if (index > -1) {
    this.bookmarks.splice(index, 1);
  } else {
    this.bookmarks.push(userId);
  }
  await this.updateBookmarksCount();
  return index === -1; // Return true if now bookmarked, false if removed
};

module.exports = mongoose.model('Story', storySchema);