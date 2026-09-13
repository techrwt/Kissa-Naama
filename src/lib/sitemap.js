'use strict';

const { SITE_URL } = require('./config');
const { escapeXml } = require('./format');

const STATIC_PATHS = ['/', '/stories/', '/search/', '/about/', '/privacy/', '/contact/'];

function urlEntry(pathname, lastmod) {
  const loc = `${SITE_URL}${pathname}`;
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
  </url>`;
}

function buildSitemap(allStories) {
  const entries = [
    ...STATIC_PATHS.map((p) => urlEntry(p)),
    ...allStories.map((s) => urlEntry(`/stories/${s.slug}/`, s.updatedAt || s.publishedAt)),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;
}

function buildRobotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

module.exports = { buildSitemap, buildRobotsTxt };
