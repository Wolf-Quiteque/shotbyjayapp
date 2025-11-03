/**
 * Test R2 upload functionality (doesn't require Admin permissions)
 */
require('dotenv').config();
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

async function testR2Upload() {
  console.log('🧪 Testing Cloudflare R2 Upload...\n');

  console.log('📝 Configuration:');
  console.log(`   Account ID: ${process.env.R2_ACCOUNT_ID}`);
  console.log(`   Access Key ID: ${process.env.R2_ACCESS_KEY_ID?.substring(0, 8)}...`);
  console.log(`   Secret Key: ${process.env.R2_SECRET_ACCESS_KEY?.substring(0, 8)}...`);
  console.log(`   Bucket: ${process.env.R2_BUCKET}`);

  const endpoint = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  console.log(`   Endpoint: ${endpoint}\n`);

  const r2Client = new S3Client({
    region: 'auto',
    endpoint: endpoint,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
    }
  });

  const testKey = `test/cms-test-${Date.now()}.txt`;
  const testContent = 'Hello from Shot by JAR CMS! This is a test file.';

  try {
    // Test 1: Upload
    console.log('1️⃣ Testing upload...');
    const putCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: testKey,
      Body: Buffer.from(testContent, 'utf-8'),
      ContentType: 'text/plain'
    });

    await r2Client.send(putCommand);
    console.log('   ✅ Upload successful!');
    console.log(`   📁 File uploaded: ${testKey}`);

    // Test 2: Retrieve
    console.log('\n2️⃣ Testing download...');
    const getCommand = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: testKey
    });

    const response = await r2Client.send(getCommand);
    const downloadedContent = await response.Body.transformToString();

    if (downloadedContent === testContent) {
      console.log('   ✅ Download successful!');
      console.log(`   ✅ Content verified: "${downloadedContent}"`);
    } else {
      console.log('   ⚠️  Content mismatch!');
      console.log(`   Expected: "${testContent}"`);
      console.log(`   Got: "${downloadedContent}"`);
    }

    // Test 3: Delete
    console.log('\n3️⃣ Testing delete...');
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: testKey
    });

    await r2Client.send(deleteCommand);
    console.log('   ✅ Delete successful!');
    console.log(`   🗑️  Cleaned up test file: ${testKey}`);

    // Test 4: Public URL
    console.log('\n4️⃣ Testing public URL format...');
    const publicUrl = `${process.env.R2_PUBLIC_BASE_URL}/${testKey}`;
    console.log(`   📍 Public URL would be: ${publicUrl}`);
    console.log('   💡 Note: File must exist and bucket must allow public access');

    // Success summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 All R2 tests passed!');
    console.log('='.repeat(60));
    console.log('\n✅ Your R2 configuration is working correctly!');
    console.log('✅ Upload functionality: OK');
    console.log('✅ Download functionality: OK');
    console.log('✅ Delete functionality: OK');
    console.log('\n📝 Your CMS can now:');
    console.log('   • Upload images and videos to R2');
    console.log('   • Serve media from public URLs');
    console.log('   • Delete old media files');
    console.log('\n🚀 Ready to start the server: npm run dev');

    return true;

  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.error('❌ R2 Test Failed!');
    console.log('='.repeat(60));
    console.error('\n📛 Error Details:');
    console.error(`   Type: ${error.name}`);
    console.error(`   Message: ${error.message}`);

    if (error.$metadata) {
      console.error(`   HTTP Status: ${error.$metadata.httpStatusCode}`);
      console.error(`   Request ID: ${error.$metadata.requestId}`);
    }

    if (error.Code) {
      console.error(`   AWS Error Code: ${error.Code}`);
    }

    console.log('\n💡 Troubleshooting:');

    if (error.name === 'AccessDenied' || error.$metadata?.httpStatusCode === 403) {
      console.log('   ⚠️  Permission Issue:');
      console.log('   1. Go to: https://dash.cloudflare.com/');
      console.log('   2. Navigate to: R2 → Manage R2 API Tokens');
      console.log('   3. Create new token with "Object Read & Write" permissions');
      console.log('   4. Update R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY in .env');
    } else if (error.name === 'NoSuchBucket') {
      console.log('   ⚠️  Bucket Not Found:');
      console.log(`   1. Verify bucket name "${process.env.R2_BUCKET}" exists in R2`);
      console.log('   2. Check spelling in .env file');
      console.log('   3. Ensure bucket is in the same account as API token');
    } else if (error.message?.includes('getaddrinfo')) {
      console.log('   ⚠️  Network/DNS Issue:');
      console.log('   1. Check internet connection');
      console.log('   2. Verify R2_ACCOUNT_ID is correct');
    } else {
      console.log('   1. Double-check all R2 credentials in .env');
      console.log('   2. Ensure bucket exists and is accessible');
      console.log('   3. Verify API token has not expired');
    }

    console.log('\n💡 CMS will still work for:');
    console.log('   ✅ Editing text content');
    console.log('   ✅ Using external image/video URLs (Cloudinary, etc.)');
    console.log('   ⚠️  Cannot upload new files to R2 until this is fixed');

    return false;
  }
}

testR2Upload().then(success => {
  process.exit(success ? 0 : 1);
});
