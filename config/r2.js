const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
});

/**
 * Upload file to Cloudflare R2
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} filename - Original filename
 * @param {String} mimetype - File mime type
 * @returns {Promise<String>} - Public URL of uploaded file
 */
async function uploadToR2(fileBuffer, filename, mimetype) {
  const fileExtension = filename.split('.').pop();
  const uniqueFilename = `${uuidv4()}.${fileExtension}`;
  const key = `uploads/${uniqueFilename}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: mimetype
  });

  await r2Client.send(command);

  // Return public URL
  return `${process.env.R2_PUBLIC_BASE_URL}/${key}`;
}

/**
 * Delete file from Cloudflare R2
 * @param {String} fileUrl - Full URL of the file
 */
async function deleteFromR2(fileUrl) {
  // Extract key from URL
  const key = fileUrl.replace(`${process.env.R2_PUBLIC_BASE_URL}/`, '');

  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key
  });

  await r2Client.send(command);
}

module.exports = {
  uploadToR2,
  deleteFromR2
};
