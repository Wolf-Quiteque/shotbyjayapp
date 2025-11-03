const express = require('express');
const router = express.Router();
const PageView = require('../models/PageView');
const authMiddleware = require('../middleware/auth');

/**
 * POST /api/analytics/track
 * Track a page view
 */
router.post('/track', async (req, res) => {
  try {
    const { webId, pageId, userId, isNewUser } = req.body;

    if (!webId || !pageId || !userId) {
      return res.status(400).json({ error: 'webId, pageId, and userId are required' });
    }

    const pageView = new PageView({
      webId,
      pageId,
      userId,
      isNewUser: isNewUser || false,
      userAgent: req.headers['user-agent'],
      referrer: req.headers.referer || req.headers.referrer
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
 * Get analytics statistics for a website
 * Requires authentication
 */
router.get('/stats/:webId', authMiddleware, async (req, res) => {
  try {
    const { webId } = req.params;
    const { startDate, endDate } = req.query;

    // Default to last 30 days if no date range provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Total views
    const totalViews = await PageView.countDocuments({
      webId,
      timestamp: { $gte: start, $lte: end }
    });

    // Total new users
    const newUsers = await PageView.countDocuments({
      webId,
      isNewUser: true,
      timestamp: { $gte: start, $lte: end }
    });

    // Unique visitors
    const uniqueVisitors = await PageView.distinct('userId', {
      webId,
      timestamp: { $gte: start, $lte: end }
    });

    // Views by page
    const viewsByPage = await PageView.aggregate([
      {
        $match: {
          webId,
          timestamp: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$pageId',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Views by day
    const viewsByDay = await PageView.aggregate([
      {
        $match: {
          webId,
          timestamp: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          views: { $sum: 1 },
          newUsers: {
            $sum: { $cond: ['$isNewUser', 1, 0] }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      totalViews,
      newUsers,
      uniqueVisitors: uniqueVisitors.length,
      viewsByPage,
      viewsByDay,
      dateRange: { start, end }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * GET /api/analytics/realtime/:webId
 * Get real-time analytics (last 24 hours)
 * Requires authentication
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
      .select('pageId timestamp userId isNewUser');

    const activeUsers = await PageView.distinct('userId', {
      webId,
      timestamp: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
    });

    res.json({
      recentViews,
      activeUsersCount: activeUsers.length
    });
  } catch (error) {
    console.error('Error fetching real-time analytics:', error);
    res.status(500).json({ error: 'Failed to fetch real-time analytics' });
  }
});

module.exports = router;
