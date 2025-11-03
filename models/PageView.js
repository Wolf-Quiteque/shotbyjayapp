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
    required: true,
    index: true
  },
  sessionId: {
    type: String, // Session identifier for tracking user sessions
    index: true
  },
  isNewUser: {
    type: Boolean,
    default: false
  },

  // User Agent & Device Info
  userAgent: String,
  deviceType: {
    type: String,
    enum: ['mobile', 'tablet', 'desktop', 'unknown'],
    default: 'unknown'
  },
  browser: String,
  os: String,

  // Referrer & Source Tracking
  referrer: String,
  referrerSource: {
    type: String, // e.g., 'facebook', 'instagram', 'google', 'direct', 'other'
    index: true
  },
  utmSource: String,      // UTM parameters for campaign tracking
  utmMedium: String,
  utmCampaign: String,
  utmContent: String,
  utmTerm: String,

  // Location Data (IP-based geolocation)
  country: String,
  city: String,
  region: String,
  ipAddress: String,

  // Engagement Metrics
  timeOnPage: Number,     // Time spent on page in seconds
  scrollDepth: Number,    // Max scroll depth percentage

  // Page Data
  pageUrl: String,
  pageTitle: String,

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
pageViewSchema.index({ webId: 1, referrerSource: 1, timestamp: -1 });
pageViewSchema.index({ webId: 1, deviceType: 1, timestamp: -1 });
pageViewSchema.index({ webId: 1, country: 1, timestamp: -1 });

module.exports = mongoose.model('PageView', pageViewSchema);
