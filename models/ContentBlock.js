const mongoose = require('mongoose');

const contentBlockSchema = new mongoose.Schema({
  webId: {
    type: String,
    required: true,
    index: true
  },
  pageId: {
    type: String,
    required: true,
    index: true
  },
  elementId: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    enum: ['text', 'image', 'video'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for fast lookups
contentBlockSchema.index({ webId: 1, pageId: 1, elementId: 1 }, { unique: true });

module.exports = mongoose.model('ContentBlock', contentBlockSchema);
