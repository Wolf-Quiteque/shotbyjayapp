const mongoose = require('mongoose');

const pageViewSchema = new mongoose.Schema({
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
  userId: {
    type: String, // Can be session ID or fingerprint
    required: true
  },
  isNewUser: {
    type: Boolean,
    default: false
  },
  userAgent: String,
  referrer: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for analytics queries
pageViewSchema.index({ webId: 1, timestamp: -1 });
pageViewSchema.index({ webId: 1, pageId: 1, timestamp: -1 });

module.exports = mongoose.model('PageView', pageViewSchema);
