const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  webId: {
    type: String,
    default: 'shotbyjar',
    index: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedIn: [{
    pageId: String,
    elementId: String
  }],
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for fast lookups
mediaSchema.index({ webId: 1, mediaType: 1, uploadedAt: -1 });
mediaSchema.index({ url: 1 });

module.exports = mongoose.model('Media', mediaSchema);
