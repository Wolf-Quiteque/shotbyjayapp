# Deploying Shot by JAR CMS to Vercel

## Prerequisites

Before deploying to Vercel, make sure you have:
- ✅ MongoDB Atlas account (already configured)
- ✅ Cloudflare R2 bucket (already configured)
- ✅ Vercel account (free tier works fine)

## Step-by-Step Deployment

### 1. Install Vercel CLI (Optional but Recommended)

```bash
npm install -g vercel
```

### 2. Prepare Your Repository

Make sure all your code is committed to a Git repository (GitHub, GitLab, or Bitbucket).

```bash
git init
git add .
git commit -m "Initial commit - Shot by JAR CMS"
```

Push to GitHub:
```bash
git remote add origin https://github.com/yourusername/shotbyjar.git
git branch -M main
git push -u origin main
```

### 3. Deploy via Vercel Dashboard

#### Option A: Deploy from Git (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect the settings
5. **Configure Environment Variables** (see below)
6. Click "Deploy"

#### Option B: Deploy from CLI

```bash
vercel
```

Follow the prompts and configure environment variables when asked.

### 4. Configure Environment Variables in Vercel

In your Vercel project settings, add these environment variables:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `WEB_ID` | `shotbyjar` | Your site identifier |
| `NODE_ENV` | `production` | Production mode |
| `BASE_URL` | `https://your-domain.vercel.app` | Your Vercel URL |
| `PUBLIC_DIR` | `./public` | Public directory |
| `JWT_SECRET` | Your secure random string | Use at least 64 characters |
| `JWT_EXPIRES` | `7d` | Token expiry |
| `MONGO_URL` | Your MongoDB connection string | From MongoDB Atlas |
| `R2_ACCOUNT_ID` | `67c418d7629bbb7bab6799cd6ee7f48a` | From Cloudflare |
| `R2_ACCESS_KEY_ID` | Your R2 access key | From Cloudflare |
| `R2_SECRET_ACCESS_KEY` | Your R2 secret key | From Cloudflare |
| `R2_BUCKET` | `shotbyjar` | Your R2 bucket name |
| `R2_PUBLIC_BASE_URL` | Your R2 public URL | From Cloudflare |
| `ADMIN_USERNAME` | Your admin username | **Change from default!** |
| `ADMIN_PASSWORD` | Your admin password | **Change from default!** |

**Security Note:** Generate a strong JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Update MongoDB Atlas Network Access

1. Go to MongoDB Atlas Dashboard
2. Navigate to Network Access
3. Add Vercel's IP ranges or use `0.0.0.0/0` (allow from anywhere)
   - Note: `0.0.0.0/0` is less secure but easier for serverless
4. Save changes

### 6. Update Cloudflare R2 CORS Settings

1. Go to Cloudflare Dashboard → R2 → Your Bucket
2. Settings → CORS Policy
3. Add this configuration:

```json
[
  {
    "AllowedOrigins": [
      "https://your-domain.vercel.app",
      "https://*.vercel.app"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 7. Update CMS Script for Production

The `cms.js` script will automatically use the correct API endpoints since it uses relative URLs.

### 8. Test Your Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Check that the homepage loads with default content
3. Visit admin dashboard: `https://your-project.vercel.app/admin`
4. Login with your credentials
5. Test editing content in edit mode: `https://your-project.vercel.app?edit=true`

## Important Notes

### Vercel Serverless Functions

Vercel runs Node.js as serverless functions, which means:
- ✅ Each request is handled independently
- ✅ Scales automatically
- ⚠️ 10-second timeout for Hobby plan (60s for Pro)
- ⚠️ Cold starts may cause slight delays

### File Uploads

- ✅ File uploads to R2 work perfectly
- ✅ Files are stored in Cloudflare R2 (not on Vercel)
- ✅ No local file storage needed

### MongoDB Connection

- ✅ Uses MongoDB Atlas (cloud database)
- ✅ Connection pooling handled by Mongoose
- ⚠️ Ensure MongoDB Atlas allows connections from `0.0.0.0/0` or Vercel IPs

## Custom Domain (Optional)

1. Go to your Vercel project → Settings → Domains
2. Add your custom domain (e.g., `shotbyjar.com`)
3. Update DNS records as instructed by Vercel
4. Update `BASE_URL` environment variable to your custom domain
5. Update R2 CORS to include your custom domain

## Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution:** Check MongoDB Atlas Network Access whitelist

### Issue: "R2 upload fails with CORS error"
**Solution:** Update R2 CORS policy to include your Vercel domain

### Issue: "Authentication not working"
**Solution:** Ensure `JWT_SECRET` is set in Vercel environment variables

### Issue: "Edit mode doesn't load"
**Solution:** Hard refresh browser (Ctrl + Shift + R) or clear cache

### Issue: "API timeout errors"
**Solution:** Optimize API calls or upgrade to Vercel Pro for longer timeout

## Monitoring

Monitor your deployment:
- **Vercel Dashboard**: View deployment logs and analytics
- **MongoDB Atlas**: Monitor database usage and performance
- **Cloudflare R2**: Track storage and bandwidth usage

## Continuous Deployment

Once connected to Git, Vercel automatically deploys:
- ✅ Every push to `main` branch → Production
- ✅ Every push to other branches → Preview deployment
- ✅ Pull requests get automatic preview URLs

## Cost Estimate

**Free Tier:**
- Vercel: Free (Hobby plan)
- MongoDB Atlas: Free (M0 cluster, 512MB storage)
- Cloudflare R2: Free tier (10GB storage, 1M Class A operations)

**Upgrade when needed:**
- Vercel Pro: $20/month (longer timeouts, more bandwidth)
- MongoDB: Starting at $9/month (dedicated cluster)
- R2: Pay-as-you-go after free tier

## Security Checklist

Before going live:
- [ ] Change `ADMIN_PASSWORD` from default
- [ ] Generate strong `JWT_SECRET` (64+ characters)
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Review MongoDB network access rules
- [ ] Test R2 bucket permissions (public read, authenticated write)
- [ ] Set up MongoDB backup strategy
- [ ] Configure rate limiting (optional)

## Next Steps

1. Deploy to Vercel
2. Test all functionality
3. Add custom domain (optional)
4. Share with client
5. Monitor usage and performance

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas logs
3. Check browser console for errors
4. Review Cloudflare R2 access logs

---

## Quick Deploy Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls
```

Your CMS is now live! 🚀
