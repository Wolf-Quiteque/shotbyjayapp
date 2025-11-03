const express = require('express');
const router = express.Router();
const PageView = require('../models/PageView');
const authMiddleware = require('../middleware/auth');
const { parseAnalyticsData } = require('../utils/analytics-parser');

/**
 * POST /api/analytics/track
 * Track a page view with enhanced analytics
 */
router.post('/track', async (req, res) => {
  try {
    const { webId, pageId, userId, isNewUser, sessionId, pageUrl, pageTitle, timeOnPage, scrollDepth } = req.body;

    if (!webId || !pageId || !userId) {
      return res.status(400).json({ error: 'webId, pageId, and userId are required' });
    }

    // Parse analytics data from request
    const analyticsData = parseAnalyticsData(req, pageUrl);

    const pageView = new PageView({
      webId,
      pageId,
      userId,
      sessionId: sessionId || userId,
      isNewUser: isNewUser || false,
      pageUrl,
      pageTitle,
      timeOnPage,
      scrollDepth,
      ...analyticsData
    });

    await pageView.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking page view:', error);
    res.status(500).json({ error: 'Failed to track page view' });
  }
});

/**
 * GET /api/analytics/stats/:webId
 * Get comprehensive analytics statistics
 */
router.get('/stats/:webId', authMiddleware, async (req, res) => {
  try {
    const { webId } = req.params;
    const { startDate, endDate, period = 'daily' } = req.query;

    // Default to last 30 days if no date range provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const matchQuery = {
      webId,
      timestamp: { $gte: start, $lte: end }
    };

    // Total views
    const totalViews = await PageView.countDocuments(matchQuery);

    // Total new users
    const newUsers = await PageView.countDocuments({
      ...matchQuery,
      isNewUser: true
    });

    // Unique visitors
    const uniqueVisitors = await PageView.distinct('userId', matchQuery);

    // Views by page
    const viewsByPage = await PageView.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$pageId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Views by referrer source
    const viewsBySource = await PageView.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$referrerSource',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Views by device type
    const viewsByDevice = await PageView.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$deviceType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Views by country
    const viewsByCountry = await PageView.aggregate([
      { $match: { ...matchQuery, country: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Views by browser
    const viewsByBrowser = await PageView.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$browser',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Determine date format based on period
    let dateFormat;
    switch (period) {
      case 'hourly':
        dateFormat = '%Y-%m-%d %H:00';
        break;
      case 'weekly':
        dateFormat = '%Y-W%U';
        break;
      case 'monthly':
        dateFormat = '%Y-%m';
        break;
      default: // daily
        dateFormat = '%Y-%m-%d';
    }

    // Views over time
    const viewsOverTime = await PageView.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$timestamp' }
          },
          views: { $sum: 1 },
          newUsers: {
            $sum: { $cond: ['$isNewUser', 1, 0] }
          },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          _id: 1,
          views: 1,
          newUsers: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Average engagement metrics
    const engagementStats = await PageView.aggregate([
      { $match: { ...matchQuery, timeOnPage: { $exists: true, $gt: 0 } } },
      {
        $group: {
          _id: null,
          avgTimeOnPage: { $avg: '$timeOnPage' },
          avgScrollDepth: { $avg: '$scrollDepth' },
          totalEngagedSessions: { $sum: 1 }
        }
      }
    ]);

    // Top referrers (full URLs)
    const topReferrers = await PageView.aggregate([
      { $match: { ...matchQuery, referrer: { $exists: true, $ne: '', $ne: null } } },
      {
        $group: {
          _id: '$referrer',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // UTM Campaign performance
    const utmCampaigns = await PageView.aggregate([
      { $match: { ...matchQuery, utmCampaign: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: {
            campaign: '$utmCampaign',
            source: '$utmSource',
            medium: '$utmMedium'
          },
          views: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          _id: 1,
          views: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalViews,
      newUsers,
      uniqueVisitors: uniqueVisitors.length,
      returningVisitors: uniqueVisitors.length - newUsers,
      viewsByPage,
      viewsBySource,
      viewsByDevice,
      viewsByCountry,
      viewsByBrowser,
      viewsOverTime,
      engagementStats: engagementStats[0] || { avgTimeOnPage: 0, avgScrollDepth: 0, totalEngagedSessions: 0 },
      topReferrers,
      utmCampaigns,
      dateRange: { start, end },
      period
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * GET /api/analytics/realtime/:webId
 * Get real-time analytics (last 24 hours)
 */
router.get('/realtime/:webId', authMiddleware, async (req, res) => {
  try {
    const { webId } = req.params;
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentViews = await PageView.find({
      webId,
      timestamp: { $gte: last24Hours }
    })
      .sort({ timestamp: -1 })
      .limit(100)
      .select('pageId timestamp userId isNewUser referrerSource deviceType country');

    const activeUsers = await PageView.distinct('userId', {
      webId,
      timestamp: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
    });

    // Active users by minute (last hour)
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const activeByMinute = await PageView.aggregate([
      {
        $match: {
          webId,
          timestamp: { $gte: lastHour }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d %H:%M', date: '$timestamp' }
          },
          users: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          _id: 1,
          count: { $size: '$users' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      recentViews,
      activeUsersCount: activeUsers.length,
      activeByMinute
    });
  } catch (error) {
    console.error('Error fetching real-time analytics:', error);
    res.status(500).json({ error: 'Failed to fetch real-time analytics' });
  }
});

/**
 * GET /api/analytics/sources/:webId
 * Get detailed traffic source breakdown
 */
router.get('/sources/:webId', authMiddleware, async (req, res) => {
  try {
    const { webId } = req.params;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const matchQuery = {
      webId,
      timestamp: { $gte: start, $lte: end }
    };

    // Group by referrer source with detailed metrics
    const sourceStats = await PageView.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$referrerSource',
          views: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          newUsers: {
            $sum: { $cond: ['$isNewUser', 1, 0] }
          },
          avgTimeOnPage: { $avg: '$timeOnPage' },
          avgScrollDepth: { $avg: '$scrollDepth' }
        }
      },
      {
        $project: {
          _id: 1,
          views: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          newUsers: 1,
          avgTimeOnPage: 1,
          avgScrollDepth: 1
        }
      },
      { $sort: { views: -1 } }
    ]);

    res.json({
      sourceStats,
      dateRange: { start, end }
    });
  } catch (error) {
    console.error('Error fetching source analytics:', error);
    res.status(500).json({ error: 'Failed to fetch source analytics' });
  }
});

/**
 * GET /api/analytics/geography/:webId
 * Get geographic distribution of visitors
 */
router.get('/geography/:webId', authMiddleware, async (req, res) => {
  try {
    const { webId } = req.params;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const matchQuery = {
      webId,
      timestamp: { $gte: start, $lte: end },
      country: { $exists: true, $ne: null }
    };

    // By country
    const byCountry = await PageView.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$country',
          views: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          _id: 1,
          views: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { views: -1 } }
    ]);

    // By city
    const byCity = await PageView.aggregate([
      { $match: { ...matchQuery, city: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: { city: '$city', country: '$country' },
          views: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          _id: 1,
          views: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      byCountry,
      byCity,
      dateRange: { start, end }
    });
  } catch (error) {
    console.error('Error fetching geography analytics:', error);
    res.status(500).json({ error: 'Failed to fetch geography analytics' });
  }
});

module.exports = router;
