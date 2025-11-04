# Media Optimization Guide

## Overview

Your CMS now automatically optimizes all uploaded images and videos to save storage space and bandwidth while maintaining excellent quality.

## What Happens When You Upload

### Images
- **Automatic WebP Conversion**: All images (JPEG, PNG, etc.) are automatically converted to WebP format
- **Smart Resizing**: Large images are intelligently resized:
  - Images > 2000px wide → resized to 2000px
  - Images > 1200px wide → resized to 1200px
  - Smaller images are left at original size
- **Quality Settings**: 85% quality (high quality, excellent compression)
- **Expected Savings**: Typically 40-80% smaller file size

### Videos
- **Automatic WebM Conversion**: All videos (MP4, MOV, etc.) are converted to WebM format
- **VP9 Codec**: Uses modern VP9 video codec for better compression
- **Opus Audio**: Uses Opus audio codec for smaller audio size
- **Smart Scaling**: Videos are scaled to max 1280px width (maintains aspect ratio)
- **Quality Settings**: CRF 32 (good balance of quality and file size)
- **Expected Savings**: Typically 30-60% smaller file size

## Benefits

### For You
- **Save Storage Costs**: Smaller files mean less R2 storage usage
- **Save Bandwidth**: Faster uploads and downloads
- **Better Performance**: Smaller files load faster for your visitors

### For Your Visitors
- **Faster Loading**: Pages load much faster with optimized media
- **Less Data Usage**: Especially important for mobile users
- **Better Experience**: No quality loss, just faster performance

## Browser Support

### WebP Images
- ✅ Chrome/Edge (all versions)
- ✅ Firefox (65+)
- ✅ Safari (14+)
- ✅ Mobile browsers (all modern)
- **Coverage**: 97%+ of users

### WebM Videos
- ✅ Chrome/Edge (all versions)
- ✅ Firefox (all versions)
- ✅ Safari (14.1+)
- ✅ Mobile browsers (most modern)
- **Coverage**: 95%+ of users

## Example Savings

### Images
**Before:**
- family-photo.jpg: 4.2 MB
- portrait.png: 2.8 MB
- landscape.jpg: 3.5 MB
- **Total: 10.5 MB**

**After (WebP):**
- family-photo.webp: 950 KB (77% smaller)
- portrait.webp: 680 KB (76% smaller)
- landscape.webp: 820 KB (77% smaller)
- **Total: 2.45 MB (77% reduction!)**

### Videos
**Before:**
- promo-video.mp4: 45 MB
- behind-scenes.mov: 38 MB
- **Total: 83 MB**

**After (WebM):**
- promo-video.webm: 22 MB (51% smaller)
- behind-scenes.webm: 19 MB (50% smaller)
- **Total: 41 MB (51% reduction!)**

## What You'll See

When you upload a file, you'll see notifications like:
- "Image uploaded! (72% smaller as WebP)"
- "File uploaded! (48% smaller as WebM)"

This shows you exactly how much space was saved!

## Server Logs

The server also logs detailed information:
```
📤 Uploading: photo.jpg (3420KB)
📸 Optimizing image: photo.jpg
   Original format: jpeg, size: 3502080 bytes
   ✅ Optimized: 987520 bytes (72% smaller)
💾 Optimized: photo.webp (964KB)
✅ Upload complete: https://...photo.webp (72% smaller)
```

## Technical Details

### Image Optimization (Sharp)
- Library: `sharp` (high-performance image processing)
- Output format: WebP
- Quality: 85
- Effort: 6 (maximum compression effort)
- Resizing: Smart resize based on dimensions
- Preserves: Aspect ratio, orientation

### Video Optimization (FFmpeg)
- Tool: `fluent-ffmpeg` with FFmpeg
- Output format: WebM
- Video codec: VP9
- Audio codec: Opus
- CRF: 32 (constant quality)
- Bitrate: Variable (better quality)
- Audio bitrate: 128k
- Scaling: Max 1280px width

## Fallback Behavior

If optimization fails for any reason:
- The original file is uploaded instead
- No error is shown to the user
- The system logs the error for debugging
- Your upload still succeeds

## Performance Impact

### Upload Time
- **Images**: +1-3 seconds (WebP conversion is fast)
- **Videos**: +30 seconds to 2 minutes (depends on video length)
- Worth it for the storage savings!

### Server Resources
- Images: Minimal CPU usage
- Videos: Moderate CPU usage during conversion
- All processing happens in memory
- Temporary files are automatically cleaned up

## Disabling Optimization (If Needed)

If you ever need to disable automatic optimization:

1. Open `routes/upload.js`
2. Comment out the optimization call:
```javascript
// const optimized = await optimizeMedia(
//   req.file.buffer,
//   req.file.originalname,
//   req.file.mimetype
// );

// Use original file instead:
const optimized = {
  buffer: req.file.buffer,
  filename: req.file.originalname,
  mimetype: req.file.mimetype
};
```

## Best Practices

1. **Upload High Quality Originals**: Let the system handle optimization
2. **Don't Pre-Optimize**: Upload original files for best results
3. **Check File Sizes**: Monitor the compression ratios in notifications
4. **Test Browser Support**: WebP/WebM work in 95%+ of browsers

## Monitoring

Check your R2 storage regularly:
- View file sizes in Cloudflare dashboard
- Monitor bandwidth usage
- Compare before/after optimization
- Track total storage costs

Your media is now automatically optimized for the web! 🚀
