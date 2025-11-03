/**
 * Test script to verify MongoDB and R2 connections
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

console.log('🧪 Testing Connections...\n');

async function testMongoDB() {
  console.log('1️⃣ Testing MongoDB connection...');
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('   ✅ MongoDB connected successfully!');
    await mongoose.connection.close();
    return true;
  } catch (error) {
    console.error('   ❌ MongoDB connection failed:', error.message);
    return false;
  }
}

async function testR2() {
  console.log('\n2️⃣ Testing Cloudflare R2 connection...');
  console.log('   📝 Configuration:');
  console.log(`      Account ID: ${process.env.R2_ACCOUNT_ID}`);
  console.log(`      Access Key ID: ${process.env.R2_ACCESS_KEY_ID?.substring(0, 8)}...`);
  console.log(`      Secret Key: ${process.env.R2_SECRET_ACCESS_KEY?.substring(0, 8)}...`);
  console.log(`      Target Bucket: ${process.env.R2_BUCKET}`);

  // Try both endpoint formats
  const endpoints = [
    `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET}`
  ];

  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    console.log(`\n   🔄 Attempt ${i + 1}: Testing endpoint: ${endpoint}`);

    try {
      const r2Client = new S3Client({
        region: 'auto',
        endpoint: endpoint,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
        }
      });

      console.log('   🔄 Attempting to list buckets...');
      const command = new ListBucketsCommand({});
      const response = await r2Client.send(command);

      console.log('   ✅ R2 connected successfully!');
      console.log(`   📦 Found ${response.Buckets.length} bucket(s):`);

      if (response.Buckets.length > 0) {
        response.Buckets.forEach((bucket, idx) => {
          console.log(`      ${idx + 1}. ${bucket.Name} (Created: ${bucket.CreationDate?.toLocaleDateString()})`);
        });
      }

      const targetBucket = response.Buckets.find(b => b.Name === process.env.R2_BUCKET);
      if (targetBucket) {
        console.log(`   ✅ Target bucket "${process.env.R2_BUCKET}" found!`);
        console.log(`      Created: ${targetBucket.CreationDate}`);
        console.log(`   ✅ Correct endpoint: ${endpoint}`);
      } else {
        console.log(`   ⚠️  Target bucket "${process.env.R2_BUCKET}" not found in account`);
        console.log(`   💡 Available buckets: ${response.Buckets.map(b => b.Name).join(', ')}`);
        console.log(`   💡 Tip: Update R2_BUCKET in .env to match one of the above`);
      }
      return true;

    } catch (error) {
      console.error(`   ❌ Attempt ${i + 1} failed!`);
      console.error('   📛 Error Details:');
      console.error(`      Type: ${error.name}`);
      console.error(`      Message: ${error.message}`);

      if (error.$metadata) {
        console.error(`      HTTP Status: ${error.$metadata.httpStatusCode}`);
        console.error(`      Request ID: ${error.$metadata.requestId}`);
      }

      if (error.Code) {
        console.error(`      AWS Error Code: ${error.Code}`);
      }

      // If this is not the last attempt, continue to next endpoint
      if (i < endpoints.length - 1) {
        console.log('   ⏭️  Trying next endpoint format...');
        continue;
      }
    }
  }

  // All attempts failed
  console.log('\n   ❌ All connection attempts failed!');
  console.log('\n   💡 Troubleshooting Tips:');
  console.log('      1. Verify Access Key ID and Secret Access Key are correct');
  console.log('      2. Check that R2 API token has "Admin Read & Write" permissions');
  console.log('      3. Ensure Account ID matches your Cloudflare account');
  console.log('      4. Create new R2 API token: https://dash.cloudflare.com/ → R2 → Manage R2 API Tokens');
  console.log('      5. Make sure token permissions include "Admin Read & Write" (not just Object Read & Write)');

  return false;
}

async function testEnvironment() {
  console.log('\n3️⃣ Checking environment variables...');
  const required = [
    'MONGO_URL',
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET',
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD',
    'JWT_SECRET'
  ];

  let allPresent = true;
  required.forEach(key => {
    if (process.env[key]) {
      console.log(`   ✅ ${key}`);
    } else {
      console.log(`   ❌ ${key} - MISSING!`);
      allPresent = false;
    }
  });

  return allPresent;
}

async function runTests() {
  const envOk = await testEnvironment();
  const mongoOk = await testMongoDB();
  const r2Ok = await testR2();

  console.log('\n' + '='.repeat(50));
  if (envOk && mongoOk && r2Ok) {
    console.log('🎉 All tests passed! You\'re ready to go!');
    console.log('\nNext steps:');
    console.log('1. npm run dev');
    console.log('2. Visit http://localhost:3000/admin');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
    if (!envOk) console.log('   → Fix missing environment variables in .env');
    if (!mongoOk) console.log('   → Check MongoDB URL and network access');
    if (!r2Ok) console.log('   → Verify R2 credentials and bucket name');
  }
  console.log('='.repeat(50) + '\n');

  process.exit(envOk && mongoOk && r2Ok ? 0 : 1);
}

runTests();
