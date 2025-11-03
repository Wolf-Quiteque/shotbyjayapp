# Shot by JAR - Dynamic CMS

A scalable content management system for Shot by JAR website with MongoDB, Cloudflare R2, Alpine.js, and HTMX.

## Features

✅ **Default-First Architecture**: All content from HTML is default - edits stored as overrides in database
✅ **Multi-Site Support**: Use WEB_ID to manage multiple sites from same database
✅ **Real-time Editing**: Edit text, images, and videos with visual overlay icons
✅ **Analytics Dashboard**: Track views, new users, and visitor statistics
✅ **Cloudflare R2 Storage**: Upload images/videos to scalable object storage
✅ **Simple Authentication**: JWT-based login for admin access

## Architecture

```
┌─────────────────┐
│  User Visits    │
│    Website      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  Load Default   │ ───▶ │  MongoDB     │
│  HTML Content   │      │  (Overrides) │
└────────┬────────┘      └──────────────┘
         │
         ▼
┌─────────────────┐
│ Apply Overrides │
│  from Database  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Track Page     │
│     View        │
└─────────────────┘
```

**Edit Mode Flow:**
1. Admin visits `/?edit=true`
2. Authentication verified via JWT
3. Visual edit icons appear on editable elements
4. Changes saved to MongoDB
5. Uploaded media stored in Cloudflare R2

## Installation

### Prerequisites

- Node.js 16+ and npm
- MongoDB Atlas account (or local MongoDB)
- Cloudflare R2 account

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

The `.env` file is already configured with your credentials. Update if needed:

```env
WEB_ID=shotbyjar
BASE_URL=http://localhost:3000
NODE_ENV=development

# Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme123
JWT_SECRET=super-long-random-string-for-testing-123456789012345678901234567890
JWT_EXPIRES=7d

# MongoDB
MONGO_URL=mongodb+srv://...

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=shotbyjar
R2_PUBLIC_BASE_URL=https://pub-...r2.dev/shotbyjar
```

⚠️ **Important**: Change `ADMIN_PASSWORD` and `JWT_SECRET` in production!

### Step 3: Initialize Database

The system will automatically create collections on first use. Optionally, seed the home page:

```bash
node scripts/seed-page.js
```

### Step 4: Start Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The application will be available at:
- **Website**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin

## Usage

### Admin Login

1. Navigate to http://localhost:3000/admin
2. Login with credentials from `.env`:
   - Username: `admin`
   - Password: `changeme123`

### Viewing Analytics

The admin dashboard shows:
- Total views (last 30 days)
- New users
- Unique visitors
- Active users (currently online)
- Views over time chart
- Page list with edit buttons

### Editing Content

1. From admin dashboard, click "Edit Page" button
2. Or visit any page with `?edit=true` query parameter
3. Hover over editable elements - edit icons (✏️) will appear
4. Click edit icon to modify:
   - **Text**: Edit in textarea
   - **Images**: Upload new file or enter URL
   - **Videos**: Upload new file or enter URL

### Adding Editable Elements

To make any HTML element editable, add these attributes:

```html
<!-- Text -->
<h1 data-edit-id="hero-title" data-edit-type="text">Default Title</h1>
<p data-edit-id="hero-desc" data-edit-type="text">Default description</p>

<!-- Images -->
<img src="default.jpg" data-edit-id="hero-img" data-edit-type="image">

<!-- Videos -->
<video src="default.mp4" data-edit-id="hero-vid" data-edit-type="video"></video>
```

**Rules:**
- `data-edit-id`: Unique identifier for this element (within the page)
- `data-edit-type`: One of: `text`, `image`, or `video`
- The HTML content is the default that shows when no override exists

## Multi-Site Support

To add additional sites:

1. Add new site folder to project
2. Set unique `WEB_ID` in environment or code
3. Add page entry to database:

```javascript
// In your site's HTML or initialization
const WEB_ID = 'newsite';
const PAGE_ID = 'home';
```

4. Update `cms.js` constants for each site
5. All sites can share the same MongoDB database

## API Reference

### Authentication

**POST** `/api/auth/login`
```json
{
  "username": "admin",
  "password": "changeme123"
}
```

**POST** `/api/auth/logout`

**GET** `/api/auth/verify`

### Content Management

**GET** `/api/content/:webId/:pageId`
Get all content overrides for a page

**PUT** `/api/content/:webId/:pageId/:elementId`
Create/update content override
```json
{
  "content": "New content or URL",
  "contentType": "text|image|video"
}
```

**DELETE** `/api/content/:webId/:pageId/:elementId`
Delete override (revert to default)

### Analytics

**POST** `/api/analytics/track`
Track a page view
```json
{
  "webId": "shotbyjar",
  "pageId": "home",
  "userId": "uuid",
  "isNewUser": true
}
```

**GET** `/api/analytics/stats/:webId?startDate=&endDate=`
Get analytics statistics (requires auth)

**GET** `/api/analytics/realtime/:webId`
Get real-time visitor data (requires auth)

### Media Upload

**POST** `/api/upload`
Upload file to Cloudflare R2 (requires auth)
- Form data with `file` field
- Returns: `{ url: "https://..." }`

**DELETE** `/api/upload`
Delete file from R2 (requires auth)
```json
{
  "url": "https://..."
}
```

## File Structure

```
website/
├── admin/                      # Admin dashboard
│   └── index.html             # Dashboard UI (Alpine.js)
├── shotsbyjay html/           # Public website
│   ├── index.html             # Homepage (with data-edit-id attributes)
│   ├── js/
│   │   └── cms.js            # CMS client script
│   ├── css/
│   └── images/
├── models/                    # MongoDB schemas
│   ├── ContentBlock.js       # Content overrides
│   ├── Page.js               # Page registry
│   └── PageView.js           # Analytics
├── routes/                    # API endpoints
│   ├── auth.js               # Authentication
│   ├── content.js            # Content CRUD
│   ├── analytics.js          # Analytics tracking
│   └── upload.js             # Media uploads
├── middleware/
│   └── auth.js               # JWT verification
├── config/
│   └── r2.js                 # Cloudflare R2 client
├── server.js                 # Express server
├── package.json
├── .env                      # Environment variables
└── README.md
```

## Security Considerations

🔒 **For Production:**

1. **Change default credentials** in `.env`
2. **Use strong JWT_SECRET** (64+ random characters)
3. **Enable HTTPS** (configure in server.js helmet settings)
4. **Set secure cookie flags** (update auth.js)
5. **Add rate limiting** for API endpoints
6. **Implement CORS whitelist** (update server.js)
7. **Use environment-specific configs**
8. **Regularly update dependencies**

## Deployment

### Using Vercel/Netlify/Railway

1. Push code to GitHub
2. Connect repository to platform
3. Set environment variables from `.env`
4. Deploy

### Using Traditional Hosting

1. Upload files to server
2. Install Node.js and npm
3. Run `npm install`
4. Use PM2 or similar for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name shotbyjar
   pm2 save
   pm2 startup
   ```

## Troubleshooting

**Issue**: Can't connect to MongoDB
**Solution**: Check `MONGO_URL` in `.env` and network access in MongoDB Atlas

**Issue**: Upload fails
**Solution**: Verify R2 credentials and bucket permissions

**Issue**: Can't log in
**Solution**: Check `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`

**Issue**: Edit icons don't appear
**Solution**: Make sure you're accessing with `?edit=true` and authenticated

**Issue**: Content changes don't persist
**Solution**: Check MongoDB connection and console for errors

## Support

For issues or questions, check:
- MongoDB Atlas connection status
- Cloudflare R2 bucket configuration
- Browser console for JavaScript errors
- Server logs for API errors

## License

All rights reserved - Shot by JAR / Edison's Growth Partners LLC
