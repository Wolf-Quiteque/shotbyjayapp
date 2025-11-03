# Media Upload & Retrieval - Implementation Summary

## Changes Made

### 1. Created Media Model (`models/Media.js`)
A new Mongoose model to track all uploaded media files with the following fields:
- `filename`: Unique filename in R2
- `originalName`: Original uploaded filename
- `url`: Full public URL of the file
- `mimetype`: File MIME type
- `size`: File size in bytes
- `mediaType`: Either 'image' or 'video'
- `webId`: Website identifier (default: 'shotbyjar')
- `uploadedBy`: Reference to Admin who uploaded
- `isUsed`: Boolean indicating if the file is used in content
- `usedIn`: Array of locations where the media is used (pageId, elementId)
- `uploadedAt`: Upload timestamp

### 2. Updated Upload Route (`routes/upload.js`)

#### POST /api/upload
- **Before**: Only uploaded to R2 and returned URL
- **Now**: Uploads to R2 AND saves metadata to database
- Returns: URL, filename, mimetype, size, mediaId, and mediaType

#### DELETE /api/upload
- **Before**: Only deleted from R2
- **Now**: Deletes from both R2 and database

#### NEW: GET /api/upload/media
Get all uploaded media with pagination and filtering
- Query params: `webId`, `mediaType` (image/video), `page`, `limit`
- Returns: Array of media with pagination info

#### NEW: GET /api/upload/media/:id
Get single media item by ID

#### NEW: PUT /api/upload/media/:id
Update media metadata (isUsed, usedIn)

### 3. Updated Content Route (`routes/content.js`)

#### PUT /api/content/:webId/:pageId/:elementId
- **Enhanced**: Now tracks media usage when images/videos are assigned to content blocks
- Automatically marks media as `isUsed: true`
- Adds usage location to `usedIn` array

#### DELETE /api/content/:webId/:pageId/:elementId
- **Enhanced**: Removes media usage tracking when content is deleted
- Marks media as `isUsed: false` if no longer used anywhere

## How It Works

### Upload Flow
1. User uploads image via `/api/upload`
2. File is uploaded to Cloudflare R2
3. Media metadata is saved to MongoDB
4. Returns URL and media info

### Usage Tracking Flow
1. User assigns image to content block via CMS
2. Content is saved via `/api/content/:webId/:pageId/:elementId`
3. System finds media by URL in database
4. Marks media as used and records the location

### Retrieval Flow
1. Request `/api/upload/media` to get all uploaded media
2. Filter by `mediaType=image` or `mediaType=video`
3. Paginate results with `page` and `limit`
4. Each media item includes:
   - URL for display
   - Usage information
   - Upload metadata
   - Original filename

## API Examples

### Upload an Image
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Cookie: token=YOUR_AUTH_TOKEN" \
  -F "file=@image.jpg"
```

Response:
```json
{
  "success": true,
  "url": "https://your-r2-url.com/uploads/uuid.jpg",
  "filename": "image.jpg",
  "mimetype": "image/jpeg",
  "size": 123456,
  "mediaId": "507f1f77bcf86cd799439011",
  "mediaType": "image"
}
```

### Get All Images
```bash
curl http://localhost:3000/api/upload/media?mediaType=image \
  -H "Cookie: token=YOUR_AUTH_TOKEN"
```

Response:
```json
{
  "success": true,
  "media": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "filename": "uuid.jpg",
      "originalName": "image.jpg",
      "url": "https://your-r2-url.com/uploads/uuid.jpg",
      "mimetype": "image/jpeg",
      "size": 123456,
      "mediaType": "image",
      "webId": "shotbyjar",
      "isUsed": true,
      "usedIn": [
        {"pageId": "home", "elementId": "hero-image"}
      ],
      "uploadedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "pages": 1
  }
}
```

### Get Single Media Item
```bash
curl http://localhost:3000/api/upload/media/507f1f77bcf86cd799439011
```

## Testing

To test the implementation:

1. **Upload a test image:**
   ```bash
   npm run test-upload
   ```

2. **Check database:**
   - Connect to MongoDB
   - Query the `medias` collection
   - Verify the uploaded file is saved

3. **Test retrieval:**
   - Call GET /api/upload/media
   - Verify the response includes your uploaded image

4. **Test usage tracking:**
   - Upload an image
   - Assign it to a content block via CMS
   - Check that `isUsed` is true and `usedIn` is populated

## Benefits

1. **Full Tracking**: Every uploaded file is tracked in the database
2. **Usage Analytics**: Know which files are being used and where
3. **Media Library**: Can build a media gallery/picker UI
4. **Cleanup**: Can identify and remove unused files
5. **Audit Trail**: Track who uploaded what and when
6. **Metadata**: Store and query file information without accessing R2
