const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  webId: {
    type: String,
    required: true,
    index: true
  },
  pageId: {
    type: String,
    required: true
  },
  pageName: {
    type: String,
    required: true
  },
  pageUrl: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for fast lookups
pageSchema.index({ webId: 1, pageId: 1 }, { unique: true });

module.exports = mongoose.model('Page', pageSchema);
