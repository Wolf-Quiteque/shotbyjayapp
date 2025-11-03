/**
 * Test script to verify media database integration
 * Run this after uploading an image to test database persistence
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Media = require('../models/Media');

async function testMediaDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Get all media
    console.log('Fetching all media from database...');
    const allMedia = await Media.find().sort({ uploadedAt: -1 });
    console.log(`✓ Found ${allMedia.length} media files in database\n`);

    if (allMedia.length === 0) {
      console.log('ℹ No media files found. Upload an image first via /api/upload');
      console.log('\nExample curl command:');
      console.log('curl -X POST http://localhost:3000/api/upload \\');
      console.log('  -H "Cookie: token=YOUR_AUTH_TOKEN" \\');
      console.log('  -F "file=@/path/to/image.jpg"');
    } else {
      console.log('Media Files:');
      console.log('='.repeat(80));

      allMedia.forEach((media, index) => {
        console.log(`\n${index + 1}. ${media.originalName}`);
        console.log(`   ID: ${media._id}`);
        console.log(`   Type: ${media.mediaType}`);
        console.log(`   URL: ${media.url}`);
        console.log(`   Size: ${(media.size / 1024).toFixed(2)} KB`);
        console.log(`   Uploaded: ${media.uploadedAt.toISOString()}`);
        console.log(`   Used: ${media.isUsed ? 'Yes' : 'No'}`);

        if (media.usedIn && media.usedIn.length > 0) {
          console.log(`   Used in:`);
          media.usedIn.forEach(usage => {
            console.log(`     - Page: ${usage.pageId}, Element: ${usage.elementId}`);
          });
        }
      });

      console.log('\n' + '='.repeat(80));

      // Statistics
      const images = allMedia.filter(m => m.mediaType === 'image').length;
      const videos = allMedia.filter(m => m.mediaType === 'video').length;
      const used = allMedia.filter(m => m.isUsed).length;
      const unused = allMedia.filter(m => !m.isUsed).length;

      console.log('\nStatistics:');
      console.log(`  Total: ${allMedia.length}`);
      console.log(`  Images: ${images}`);
      console.log(`  Videos: ${videos}`);
      console.log(`  Used: ${used}`);
      console.log(`  Unused: ${unused}`);
    }

    console.log('\n✓ Database test completed successfully!');

  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
    process.exit(0);
  }
}

// Run the test
testMediaDB();
