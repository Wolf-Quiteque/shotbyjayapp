/**
 * Seed script to initialize the home page in the database
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Page = require('../models/Page');

const WEB_ID = process.env.WEB_ID || 'shotbyjar';

async function seedPage() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Create home page entry
    const homePage = await Page.findOneAndUpdate(
      { webId: WEB_ID, pageId: 'home' },
      {
        webId: WEB_ID,
        pageId: 'home',
        pageName: 'Home Page',
        pageUrl: '/index.html',
        isActive: true
      },
      { upsert: true, new: true }
    );

    console.log('✅ Home page created/updated:', homePage);

    console.log('\n📝 Summary:');
    console.log(`   Web ID: ${WEB_ID}`);
    console.log(`   Page ID: home`);
    console.log(`   Page Name: Home Page`);
    console.log(`   Status: Active`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nNext steps:');
    console.log('1. Start server: npm run dev');
    console.log('2. Visit admin: http://localhost:3000/admin');
    console.log('3. Login with credentials from .env');
    console.log('4. Click "Edit Page" or visit: http://localhost:3000/?edit=true');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed.');
  }
}

seedPage();
