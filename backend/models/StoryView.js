const mongoose = require('mongoose');

const storyViewSchema = new mongoose.Schema({
  story: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    required: true
  },
  visitorId: {
    type: String,
    required: true
  },
  lastViewedAt: {
    type: Date,
    required: true
  }
});

storyViewSchema.index({ story: 1, visitorId: 1 }, { unique: true });

module.exports = mongoose.model('StoryView', storyViewSchema);
