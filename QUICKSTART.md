# Quick Start Guide

Get your Shot by JAR CMS running in 3 minutes!

## 1. Install Dependencies

```bash
npm install
```

This will install:
- Express (web server)
- MongoDB driver
- Cloudflare R2 SDK
- Authentication libraries
- And more...

## 2. Verify Environment Variables

Check that your `.env` file has all required values:

```bash
# Should see all these filled in:
# - MONGO_URL
# - R2_ACCOUNT_ID
# - R2_ACCESS_KEY_ID
# - R2_SECRET_ACCESS_KEY
# - R2_BUCKET
# - ADMIN_USERNAME
# - ADMIN_PASSWORD
```

## 3. Initialize Database (Optional)

```bash
node scripts/seed-page.js
```

This creates the home page entry in MongoDB.

## 4. Start the Server

```bash
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:3000
📊 Admin dashboard: http://localhost:3000/admin
```

## 5. Login to Admin Dashboard

1. Open: http://localhost:3000/admin
2. Login:
   - Username: `admin`
   - Password: `changeme123` (or what you set in .env)

## 6. Start Editing!

### Option A: From Dashboard
1. Click "Edit Page" button on home page
2. Hover over any text, image, or video
3. Click the edit icon (✏️) that appears
4. Make your changes and click "Save"

### Option B: Direct URL
1. Go to: http://localhost:3000/?edit=true
2. You'll be redirected to login if not authenticated
3. Once logged in, edit mode activates automatically

## What Can You Edit?

Look for elements with the edit icon (✏️):

### Text Elements
- Hero title: "Shot by JAR"
- About section paragraphs
- CTA titles and descriptions

### Images
- Hero image
- Logo
- Testimonial images

### Videos
- Three showcase reels

## How It Works

1. **Default Content**: Everything in your HTML is the default
2. **Edits = Overrides**: When you edit, it saves to MongoDB as an override
3. **Load Process**:
   - Page loads with defaults
   - CMS script fetches overrides from database
   - Overrides replace defaults on the page
4. **Revert**: Delete the override to go back to default HTML content

## Adding More Editable Elements

To make any HTML element editable, add these two attributes:

```html
<!-- Text -->
<p data-edit-id="unique-id" data-edit-type="text">
  Your default content here
</p>

<!-- Image -->
<img src="default.jpg"
     data-edit-id="unique-id"
     data-edit-type="image">

<!-- Video -->
<video src="default.mp4"
       data-edit-id="unique-id"
       data-edit-type="video"></video>
```

**Important**: Each `data-edit-id` must be unique within the page!

## Testing Analytics

Open two browser windows:
1. Window 1: Visit http://localhost:3000 (tracks a view)
2. Window 2: Open admin dashboard
3. You'll see the view count increment!

## Common Issues

### Can't Connect to MongoDB
- Check your `MONGO_URL` in `.env`
- Verify network access in MongoDB Atlas (whitelist your IP)

### Can't Login
- Check `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`
- Clear browser cookies and try again

### Edit Icons Don't Appear
- Make sure URL has `?edit=true`
- Check that you're logged in (visit /admin first)
- Look for errors in browser console (F12)

### Changes Don't Save
- Check browser console for errors
- Verify MongoDB connection is active
- Check server logs for API errors

## Next Steps

- Read full [README.md](README.md) for details
- Add more editable elements to your pages
- Configure Cloudflare R2 for media uploads
- Change default admin password
- Deploy to production

## Need Help?

Check the browser console (F12) and server logs for error messages. Most issues are related to:
1. MongoDB connection
2. Environment variables
3. Authentication/cookies

Happy editing! 🎉
