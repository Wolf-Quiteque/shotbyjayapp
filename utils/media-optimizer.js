const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Optimize image and convert to WebP format
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {String} originalFilename - Original filename
 * @returns {Promise<{buffer: Buffer, filename: String, mimetype: String}>}
 */
async function optimizeImage(imageBuffer, originalFilename) {
  try {
    console.log(`📸 Optimizing image: ${originalFilename}`);

    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    console.log(`   Original format: ${metadata.format}, size: ${imageBuffer.length} bytes`);

    // Determine target width based on original size
    let targetWidth = metadata.width;
    if (metadata.width > 2000) {
      targetWidth = 2000; // Max width for large images
    } else if (metadata.width > 1200) {
      targetWidth = 1200; // Medium width
    }

    // Convert to WebP with optimization
    const optimizedBuffer = await sharp(imageBuffer)
      .resize(targetWidth, null, {
        withoutEnlargement: true, // Don't upscale
        fit: 'inside'
      })
      .webp({
        quality: 85, // High quality WebP
        effort: 6    // Higher effort = better compression (0-6)
      })
      .toBuffer();

    const originalName = path.parse(originalFilename).name;
    const newFilename = `${originalName}.webp`;

    console.log(`   ✅ Optimized: ${optimizedBuffer.length} bytes (${Math.round((1 - optimizedBuffer.length / imageBuffer.length) * 100)}% smaller)`);

    return {
      buffer: optimizedBuffer,
      filename: newFilename,
      mimetype: 'image/webp'
    };
  } catch (error) {
    console.error('❌ Image optimization failed:', error);
    // Return original if optimization fails
    return {
      buffer: imageBuffer,
      filename: originalFilename,
      mimetype: 'image/jpeg' // fallback
    };
  }
}

/**
 * Optimize video and convert to WebM format
 * @param {Buffer} videoBuffer - Original video buffer
 * @param {String} originalFilename - Original filename
 * @returns {Promise<{buffer: Buffer, filename: String, mimetype: String}>}
 */
async function optimizeVideo(videoBuffer, originalFilename) {
  const tempInputPath = path.join(os.tmpdir(), `input-${Date.now()}-${originalFilename}`);
  const originalName = path.parse(originalFilename).name;
  const tempOutputPath = path.join(os.tmpdir(), `output-${Date.now()}-${originalName}.webm`);

  try {
    console.log(`🎥 Optimizing video: ${originalFilename}`);
    console.log(`   Original size: ${videoBuffer.length} bytes`);

    // Write buffer to temporary file
    await fs.writeFile(tempInputPath, videoBuffer);

    // Convert to WebM with VP9 codec
    await new Promise((resolve, reject) => {
      ffmpeg(tempInputPath)
        .outputOptions([
          '-c:v vp9',           // VP9 video codec
          '-crf 32',            // Quality (0-63, lower = better quality, 32 is good balance)
          '-b:v 0',             // Variable bitrate
          '-c:a libopus',       // Opus audio codec
          '-b:a 128k',          // Audio bitrate
          '-vf scale=1280:-2'   // Scale to max 1280px width, maintain aspect ratio
        ])
        .output(tempOutputPath)
        .on('start', (command) => {
          console.log('   FFmpeg command:', command);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`   Processing: ${Math.round(progress.percent)}%`);
          }
        })
        .on('end', () => {
          console.log('   ✅ Video conversion complete');
          resolve();
        })
        .on('error', (err) => {
          console.error('   ❌ FFmpeg error:', err);
          reject(err);
        })
        .run();
    });

    // Read optimized video
    const optimizedBuffer = await fs.readFile(tempOutputPath);
    console.log(`   ✅ Optimized: ${optimizedBuffer.length} bytes (${Math.round((1 - optimizedBuffer.length / videoBuffer.length) * 100)}% smaller)`);

    // Cleanup temp files
    await fs.unlink(tempInputPath).catch(() => {});
    await fs.unlink(tempOutputPath).catch(() => {});

    return {
      buffer: optimizedBuffer,
      filename: `${originalName}.webm`,
      mimetype: 'video/webm'
    };
  } catch (error) {
    console.error('❌ Video optimization failed:', error);

    // Cleanup temp files
    await fs.unlink(tempInputPath).catch(() => {});
    await fs.unlink(tempOutputPath).catch(() => {});

    // Return original if optimization fails
    return {
      buffer: videoBuffer,
      filename: originalFilename,
      mimetype: 'video/mp4' // fallback
    };
  }
}

/**
 * Optimize media file (auto-detect type)
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} filename - Original filename
 * @param {String} mimetype - Original mimetype
 * @returns {Promise<{buffer: Buffer, filename: String, mimetype: String}>}
 */
async function optimizeMedia(fileBuffer, filename, mimetype) {
  if (mimetype.startsWith('image/')) {
    return optimizeImage(fileBuffer, filename);
  } else if (mimetype.startsWith('video/')) {
    return optimizeVideo(fileBuffer, filename);
  } else {
    // Unknown type, return as-is
    return {
      buffer: fileBuffer,
      filename: filename,
      mimetype: mimetype
    };
  }
}

module.exports = {
  optimizeImage,
  optimizeVideo,
  optimizeMedia
};
