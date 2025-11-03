const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToR2, deleteFromR2 } = require('../config/r2');
const authMiddleware = require('../middleware/auth');
const Media = require('../models/Media');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

/**
 * POST /api/upload
 * Upload media to Cloudflare R2 and save to database
 * Requires authentication
 */
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to R2
    const fileUrl = await uploadToR2(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Determine media type
    const mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';

    // Extract filename from URL
    const filename = fileUrl.split('/').pop();

    // Save to database
    const media = new Media({
      filename: filename,
      originalName: req.file.originalname,
      url: fileUrl,
      mimetype: req.file.mimetype,
      size: req.file.size,
      mediaType: mediaType,
      webId: req.body.webId || 'shotbyjar',
      uploadedBy: req.admin?._id
    });

    await media.save();

    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      mediaId: media._id,
      mediaType: mediaType
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

/**
 * DELETE /api/upload
 * Delete media from Cloudflare R2 and database
 * Requires authentication
 */
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'File URL is required' });
    }

    // Delete from R2
    await deleteFromR2(url);

    // Delete from database
    await Media.findOneAndDelete({ url });

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

/**
 * GET /api/upload/media
 * Get all uploaded media from database
 * Requires authentication
 */
router.get('/media', authMiddleware, async (req, res) => {
  try {
    const { webId = 'shotbyjar', mediaType, page = 1, limit = 50 } = req.query;

    const query = { webId };
    if (mediaType && ['image', 'video'].includes(mediaType)) {
      query.mediaType = mediaType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [media, total] = await Promise.all([
      Media.find(query)
        .sort({ uploadedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Media.countDocuments(query)
    ]);

    res.json({
      success: true,
      media,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

/**
 * GET /api/upload/media/:id
 * Get single media item by ID
 */
router.get('/media/:id', async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    res.json({ success: true, media });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

/**
 * PUT /api/upload/media/:id
 * Update media metadata
 * Requires authentication
 */
router.put('/media/:id', authMiddleware, async (req, res) => {
  try {
    const { isUsed, usedIn } = req.body;

    const updateData = {};
    if (typeof isUsed === 'boolean') {
      updateData.isUsed = isUsed;
    }
    if (usedIn) {
      updateData.usedIn = usedIn;
    }

    const media = await Media.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    res.json({ success: true, media });
  } catch (error) {
    console.error('Error updating media:', error);
    res.status(500).json({ error: 'Failed to update media' });
  }
});

module.exports = router;
