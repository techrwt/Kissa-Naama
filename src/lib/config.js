'use strict';

/**
 * Site-wide configuration.
 *
 * IMPORTANT: Update SITE_URL below (or set the SITE_URL environment variable
 * before running `npm run build`) to your real GitHub Pages URL, e.g.
 *   https://your-username.github.io/KissaNama/
 * This value is used for canonical URLs, sitemap.xml, Open Graph tags and JSON-LD,
 * so getting it right matters a lot for SEO.
 */
const SITE_URL = (process.env.SITE_URL || 'https://your-username.github.io/KissaNama').replace(/\/+$/, '');

module.exports = {
  SITE_NAME: 'KissaNama',
  SITE_TAGLINE: 'हर कहानी के पीछे एक किस्सा',
  SITE_DESCRIPTION:
    'KissaNama एक प्रीमियम हिंदी कहानी पत्रिका है — रहस्य, रोमांच, भावना और जीवन की सच्ची-सी लगने वाली कहानियाँ, सीधे आपके लिए।',
  SITE_URL,
  DEFAULT_AUTHOR: 'KissaNama',
  DEFAULT_OG_IMAGE: '/assets/logo/logo-social.png',
  LOGO_PATH: '/assets/logo/logo.png',
  NAV: [
    { label: 'होम', href: '/' },
    { label: 'कहानियाँ', href: '/stories/' },
    { label: 'खोज', href: '/search/' },
  ],
  FOOTER_LINKS: [
    { label: 'हमारे बारे में', href: '/about/' },
    { label: 'गोपनीयता नीति', href: '/privacy/' },
    { label: 'संपर्क करें', href: '/contact/' },
  ],
  BUILD_YEAR: new Date().getFullYear(),
};
