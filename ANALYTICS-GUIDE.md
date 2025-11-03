# Analytics Guide - Shot by JAR CMS

## Overview

Your CMS now includes comprehensive analytics tracking that gives you deep insights into your visitors and their behavior.

## What Data is Tracked?

### 1. **Basic Metrics**
- Total page views
- Unique visitors
- New vs. returning visitors
- Active users (real-time)

### 2. **Traffic Sources**
Track where your visitors are coming from:
- **Direct**: Users who typed your URL directly or used bookmarks
- **Facebook**: `facebook.com`, `fb.com`, `m.facebook.com`
- **Instagram**: `instagram.com`
- **Twitter**: `twitter.com`, `t.co`
- **TikTok**: `tiktok.com`
- **YouTube**: `youtube.com`, `youtu.be`
- **LinkedIn**: `linkedin.com`, `lnkd.in`
- **Pinterest**: `pinterest.com`
- **Reddit**: `reddit.com`
- **Google**: All Google search engines
- **Other Search Engines**: Bing, Yahoo, DuckDuckGo, Baidu
- **Other**: Any other referrer source

### 3. **Device Information**
- **Device Type**: Mobile, Tablet, or Desktop
- **Browser**: Chrome, Safari, Firefox, Edge, etc.
- **Operating System**: Windows, MacOS, iOS, Android, Linux

### 4. **Geographic Data**
- **Country**: Where your visitors are located
- **City**: Specific city (when available)
- **Region**: State/province information

### 5. **Engagement Metrics**
- **Time on Page**: How long users spend on your site (in seconds)
- **Scroll Depth**: How far down the page users scroll (percentage)
- **Sessions**: Group multiple page views from the same user

### 6. **Campaign Tracking (UTM Parameters)**
Track marketing campaigns using UTM parameters in your URLs:
- `utm_source`: Campaign source (e.g., "instagram", "email")
- `utm_medium`: Marketing medium (e.g., "social", "cpc")
- `utm_campaign`: Campaign name (e.g., "summer_sale")
- `utm_content`: Content variation
- `utm_term`: Search keywords

**Example URL**:
```
https://yoursite.com/?utm_source=instagram&utm_medium=social&utm_campaign=new_reel
```

## API Endpoints

### 1. Get General Statistics
```
GET /api/analytics/stats/:webId
```

**Query Parameters**:
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `period`: Time grouping - `hourly`, `daily`, `weekly`, or `monthly`

**Response Includes**:
- Total views
- New users
- Unique visitors
- Returning visitors
- Views by page
- Views by traffic source
- Views by device type
- Views by country
- Views by browser
- Views over time (with breakdown by period)
- Average engagement metrics
- Top referrers
- UTM campaign performance

**Example**:
```javascript
// Get last 7 days of analytics
fetch('/api/analytics/stats/shotbyjar?startDate=2025-04-26&endDate=2025-05-03&period=daily')
```

### 2. Real-Time Analytics
```
GET /api/analytics/realtime/:webId
```

Shows activity from the last 24 hours:
- Active users (last 5 minutes)
- Recent 100 page views
- Users by minute (last hour)

### 3. Detailed Traffic Sources
```
GET /api/analytics/sources/:webId
```

**Query Parameters**: `startDate`, `endDate`

Detailed breakdown by traffic source including:
- Total views per source
- Unique users per source
- New users per source
- Average time on page per source
- Average scroll depth per source

### 4. Geographic Distribution
```
GET /api/analytics/geography/:webId
```

**Query Parameters**: `startDate`, `endDate`

Shows visitor distribution by:
- Country (with view counts and unique users)
- City (top 20 cities)

## Viewing Analytics in Admin Dashboard

Access your admin dashboard at: `http://localhost:3000/admin`

The dashboard displays:

### Main Stats Cards
- **Total Page Views**: All-time or filtered by date
- **New Users**: First-time visitors
- **Unique Visitors**: Distinct users
- **Active Users**: Currently online (last 5 minutes)

### Charts
- **Views Over Time**: Line chart showing traffic trends
  - Toggle between daily, weekly, monthly views
- **Traffic Sources**: See which platforms drive the most traffic
- **Device Breakdown**: Mobile vs Desktop vs Tablet
- **Geographic Distribution**: Where your visitors are from

## Time Periods Available

### Daily Analytics
- Track day-by-day performance
- Best for monitoring recent trends
- Default view in dashboard

### Weekly Analytics
- See week-over-week growth
- Great for identifying patterns
- Good for monthly reports

### Monthly Analytics
- Long-term trend analysis
- Year-over-year comparisons
- Strategic planning

## Marketing Campaign Tracking

### Setting Up UTM Campaigns

When sharing your links on social media or ads, add UTM parameters:

**Instagram Post**:
```
https://shotbyjar.com/?utm_source=instagram&utm_medium=social&utm_campaign=march_promo&utm_content=reel_1
```

**Facebook Ad**:
```
https://shotbyjar.com/?utm_source=facebook&utm_medium=cpc&utm_campaign=spring_sale
```

**Email Newsletter**:
```
https://shotbyjar.com/?utm_source=newsletter&utm_medium=email&utm_campaign=monthly_update
```

### Tracking Campaign Performance

The analytics will show you:
- Which campaigns generated the most traffic
- Which sources (Instagram, Facebook, etc.) performed best
- How many unique users each campaign brought
- How engaged those users were (time on site, scroll depth)

## Understanding Key Metrics

### Bounce Rate
Users who leave after viewing only one page. (Currently calculated from time on page < 10 seconds)

### Session Duration
Average time users spend on your site during a single visit.

### Scroll Depth
Percentage of page users view. Higher scroll depth = more engaged users.

### Returning Visitors
Users who come back to your site. High return rate = loyal audience.

### Traffic Source Breakdown
- **Direct**: Users who typed your URL or used bookmarks (strong brand awareness)
- **Social Media**: Instagram, Facebook, TikTok (content performance)
- **Search Engines**: Google, Bing (SEO effectiveness)
- **Referrals**: Other websites linking to you

## Privacy & Data Collection

### What We Store
- Anonymous user IDs (generated randomly)
- Session IDs (per browsing session)
- IP addresses (for geographic data only)
- User agent strings (for device/browser info)
- Referrer URLs
- Page visit timestamps
- Engagement metrics

### What We Don't Store
- Personal identifiable information (PII)
- Passwords or credentials
- Payment information
- Cookies with personal data

### GDPR/Privacy Compliance
- All tracking is anonymous
- No third-party tracking cookies
- Data stays in your MongoDB database
- You control all data

## Advanced Use Cases

### 1. Optimize Social Media Strategy
Check which platforms drive the most traffic:
```
GET /api/analytics/sources/shotbyjar
```
Focus your content creation on platforms that perform best.

### 2. Identify Best Times to Post
Use hourly analytics to see when users are most active:
```
GET /api/analytics/stats/shotbyjar?period=hourly
```

### 3. Geographic Targeting
See where your audience is located:
```
GET /api/analytics/geography/shotbyjar
```
Tailor content to your main regions.

### 4. Mobile vs Desktop Performance
Check device breakdown to optimize your site:
```javascript
// In the stats response, look at viewsByDevice
{
  "viewsByDevice": [
    { "_id": "mobile", "count": 450 },
    { "_id": "desktop", "count": 320 },
    { "_id": "tablet", "count": 80 }
  ]
}
```

### 5. Content Performance
Track which pages get the most engagement:
```javascript
// Check viewsByPage and engagement metrics per page
{
  "viewsByPage": [
    { "_id": "home", "count": 850 },
    { "_id": "portfolio", "count": 420 }
  ]
}
```

## Tips for Better Analytics

### 1. Use UTM Parameters Consistently
Create a naming convention for your campaigns:
- Use lowercase
- Use underscores instead of spaces
- Be descriptive but concise

### 2. Monitor Trends, Not Just Numbers
Look at week-over-week and month-over-month changes, not just absolute numbers.

### 3. Segment Your Data
Compare different traffic sources:
- Instagram vs Facebook performance
- Mobile vs Desktop engagement
- New vs Returning visitors

### 4. Set Goals
Track metrics that matter to your business:
- Want more bookings? Track button clicks to Calendly
- Want engagement? Monitor scroll depth and time on page
- Want reach? Track unique visitors and new users

### 5. Test and Iterate
- Post at different times and check analytics
- Try different content types and see what engages users
- Use A/B testing for campaigns

## Troubleshooting

### Analytics not showing up?
1. Check that your site is running: `npm run dev`
2. Visit your site to generate some data
3. Wait a few minutes for data to process
4. Refresh the admin dashboard

### Geographic data missing?
- IP-based geolocation requires additional setup
- For now, referrer source tracking works automatically

### Real-time users showing 0?
- Visit your site in another tab/window
- Realtime tracking updates every 5 minutes
- Make sure cookies are enabled

## Next Steps

1. **Start Tracking**: Just use your site normally - analytics are automatic!
2. **Add UTM Parameters**: When sharing links on social media
3. **Check Dashboard Daily**: Monitor your traffic trends
4. **Optimize Based on Data**: Focus on what works

## Support

If analytics aren't working correctly:
1. Check browser console for errors (F12)
2. Verify MongoDB connection in server logs
3. Test the tracking endpoint: `POST /api/analytics/track`

Your analytics system is now ready! Visit your site and check `/admin` to see the data rolling in! 📊
