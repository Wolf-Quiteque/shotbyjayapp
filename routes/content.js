const express = require('express');
const router = express.Router();
const ContentBlock = require('../models/ContentBlock');
const Page = require('../models/Page');
const authMiddleware = require('../middleware/auth');

/**
 * GET /api/content/:webId/:pageId
 * Get all content overrides for a specific page
 */
router.get('/:webId/:pageId', async (req, res) => {
  try {
    const { webId, pageId } = req.params;
    const contentBlocks = await ContentBlock.find({ webId, pageId });

    // Return as object keyed by elementId for easy lookup
    const contentMap = {};
    contentBlocks.forEach(block => {
      contentMap[block.elementId] = {
        content: block.content,
        contentType: block.contentType,
        updatedAt: block.updatedAt
      };
    });

    res.json(contentMap);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

/**
 * PUT /api/content/:webId/:pageId/:elementId
 * Update or create content override
 * Requires authentication
 */
router.put('/:webId/:pageId/:elementId', authMiddleware, async (req, res) => {
  try {
    const { webId, pageId, elementId } = req.params;
    const { content, contentType } = req.body;

    if (!content || !contentType) {
      return res.status(400).json({ error: 'Content and contentType are required' });
    }

    const contentBlock = await ContentBlock.findOneAndUpdate(
      { webId, pageId, elementId },
      { content, contentType, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ success: true, contentBlock });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ error: 'Failed to update content' });
  }
});

/**
 * DELETE /api/content/:webId/:pageId/:elementId
 * Delete content override (revert to default)
 * Requires authentication
 */
router.delete('/:webId/:pageId/:elementId', authMiddleware, async (req, res) => {
  try {
    const { webId, pageId, elementId } = req.params;

    await ContentBlock.findOneAndDelete({ webId, pageId, elementId });

    res.json({ success: true, message: 'Content reverted to default' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

/**
 * GET /api/content/pages/:webId
 * Get all pages for a website
 */
router.get('/pages/:webId', authMiddleware, async (req, res) => {
  try {
    const { webId } = req.params;
    const pages = await Page.find({ webId, isActive: true });
    res.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

/**
 * POST /api/content/pages/:webId
 * Create or update a page
 * Requires authentication
 */
router.post('/pages/:webId', authMiddleware, async (req, res) => {
  try {
    const { webId } = req.params;
    const { pageId, pageName, pageUrl } = req.body;

    if (!pageId || !pageName || !pageUrl) {
      return res.status(400).json({ error: 'pageId, pageName, and pageUrl are required' });
    }

    const page = await Page.findOneAndUpdate(
      { webId, pageId },
      { pageName, pageUrl, isActive: true },
      { upsert: true, new: true }
    );

    res.json({ success: true, page });
  } catch (error) {
    console.error('Error creating/updating page:', error);
    res.status(500).json({ error: 'Failed to create/update page' });
  }
});

module.exports = router;
