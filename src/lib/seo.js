'use strict';

const { SITE_NAME, SITE_URL, SITE_DESCRIPTION, DEFAULT_OG_IMAGE, DEFAULT_AUTHOR } = require('./config');
const { escapeHtml, toPlainText } = require('./format');

function absoluteUrl(pathname) {
  const clean = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${SITE_URL}${clean}`;
}

/**
 * Builds the full <head> meta block (title, description, canonical, Open Graph, Twitter card).
 * `opts.jsonLd` may be a single object or an array of JSON-LD objects to embed.
 */
function buildHeadMeta(opts) {
  const {
    title,
    description,
    canonicalPath,
    ogType = 'website',
    ogImage = DEFAULT_OG_IMAGE,
    publishedAt,
    updatedAt,
    author,
    jsonLd,
  } = opts;

  const canonical = absoluteUrl(canonicalPath);
  const image = ogImage.startsWith('http') ? ogImage : absoluteUrl(ogImage);
  const desc = escapeHtml(toPlainText(description) || SITE_DESCRIPTION);
  const safeTitle = escapeHtml(title);

  const lines = [
    `<title>${safeTitle}</title>`,
    `<meta name="description" content="${desc}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:title" content="${safeTitle}" />`,
    `<meta property="og:description" content="${desc}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:locale" content="hi_IN" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${safeTitle}" />`,
    `<meta name="twitter:description" content="${desc}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ];

  if (ogType === 'article') {
    if (publishedAt) lines.push(`<meta property="article:published_time" content="${publishedAt}" />`);
    if (updatedAt) lines.push(`<meta property="article:modified_time" content="${updatedAt}" />`);
    lines.push(`<meta property="article:author" content="${escapeHtml(author || DEFAULT_AUTHOR)}" />`);
  }

  const jsonLdBlocks = [].concat(jsonLd || []).filter(Boolean);
  for (const block of jsonLdBlocks) {
    lines.push(`<script type="application/ld+json">${JSON.stringify(block)}</script>`);
  }

  return lines.join('\n    ');
}

function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL + '/',
    logo: absoluteUrl('/assets/logo/logo.png'),
  };
}

function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL + '/',
    description: SITE_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

function breadcrumbSchema(items) {
  // items: [{ name, path }]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

function articleSchema(story) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: story.title,
    description: toPlainText(story.excerpt),
    image: [absoluteUrl(`/${story.image.replace(/^\/+/, '')}`)],
    author: {
      '@type': 'Person',
      name: story.author || DEFAULT_AUTHOR,
    },
    publisher: organizationSchema(),
    datePublished: story.publishedAt,
    dateModified: story.updatedAt || story.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(`/stories/${story.slug}/`),
    },
    inLanguage: 'hi-IN',
  };
}

module.exports = {
  absoluteUrl,
  buildHeadMeta,
  organizationSchema,
  websiteSchema,
  breadcrumbSchema,
  articleSchema,
};
