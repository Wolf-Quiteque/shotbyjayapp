/**
 * Analytics Parser Utilities
 * Parse user agent, referrer, and other analytics data
 */

/**
 * Parse device type from user agent
 */
function parseDeviceType(userAgent) {
  if (!userAgent) return 'unknown';

  const ua = userAgent.toLowerCase();

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    return 'tablet';
  }

  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
    return 'mobile';
  }

  return 'desktop';
}

/**
 * Parse browser from user agent
 */
function parseBrowser(userAgent) {
  if (!userAgent) return 'Unknown';

  if (userAgent.indexOf('Edg') > -1) return 'Edge';
  if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
  if (userAgent.indexOf('Safari') > -1) return 'Safari';
  if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
  if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) return 'Internet Explorer';
  if (userAgent.indexOf('Opera') > -1) return 'Opera';

  return 'Other';
}

/**
 * Parse operating system from user agent
 */
function parseOS(userAgent) {
  if (!userAgent) return 'Unknown';

  if (userAgent.indexOf('Win') > -1) return 'Windows';
  if (userAgent.indexOf('Mac') > -1) return 'MacOS';
  if (userAgent.indexOf('Linux') > -1) return 'Linux';
  if (userAgent.indexOf('Android') > -1) return 'Android';
  if (userAgent.indexOf('iOS') > -1 || userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) return 'iOS';

  return 'Other';
}

/**
 * Parse referrer source (social media, search engine, etc.)
 */
function parseReferrerSource(referrer) {
  if (!referrer) return 'direct';

  const ref = referrer.toLowerCase();

  // Social Media
  if (ref.includes('facebook.com') || ref.includes('fb.com') || ref.includes('m.facebook.com')) {
    return 'facebook';
  }
  if (ref.includes('instagram.com')) {
    return 'instagram';
  }
  if (ref.includes('twitter.com') || ref.includes('t.co')) {
    return 'twitter';
  }
  if (ref.includes('linkedin.com') || ref.includes('lnkd.in')) {
    return 'linkedin';
  }
  if (ref.includes('tiktok.com')) {
    return 'tiktok';
  }
  if (ref.includes('youtube.com') || ref.includes('youtu.be')) {
    return 'youtube';
  }
  if (ref.includes('pinterest.com')) {
    return 'pinterest';
  }
  if (ref.includes('reddit.com')) {
    return 'reddit';
  }
  if (ref.includes('snapchat.com')) {
    return 'snapchat';
  }
  if (ref.includes('whatsapp.com')) {
    return 'whatsapp';
  }
  if (ref.includes('telegram.org') || ref.includes('t.me')) {
    return 'telegram';
  }

  // Search Engines
  if (ref.includes('google.com') || ref.includes('google.')) {
    return 'google';
  }
  if (ref.includes('bing.com')) {
    return 'bing';
  }
  if (ref.includes('yahoo.com')) {
    return 'yahoo';
  }
  if (ref.includes('duckduckgo.com')) {
    return 'duckduckgo';
  }
  if (ref.includes('baidu.com')) {
    return 'baidu';
  }

  // Other common sources
  if (ref.includes('github.com')) {
    return 'github';
  }

  return 'other';
}

/**
 * Parse UTM parameters from URL
 */
function parseUTMParams(url) {
  if (!url) return {};

  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;

    return {
      utmSource: params.get('utm_source') || undefined,
      utmMedium: params.get('utm_medium') || undefined,
      utmCampaign: params.get('utm_campaign') || undefined,
      utmContent: params.get('utm_content') || undefined,
      utmTerm: params.get('utm_term') || undefined
    };
  } catch (error) {
    return {};
  }
}

/**
 * Get client IP address from request
 */
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * Parse all analytics data from request
 */
function parseAnalyticsData(req, pageUrl) {
  const userAgent = req.headers['user-agent'] || '';
  const referrer = req.headers.referer || req.headers.referrer || '';

  return {
    userAgent,
    deviceType: parseDeviceType(userAgent),
    browser: parseBrowser(userAgent),
    os: parseOS(userAgent),
    referrer,
    referrerSource: parseReferrerSource(referrer),
    ...parseUTMParams(pageUrl),
    ipAddress: getClientIP(req)
  };
}

module.exports = {
  parseDeviceType,
  parseBrowser,
  parseOS,
  parseReferrerSource,
  parseUTMParams,
  getClientIP,
  parseAnalyticsData
};
