'use strict';

const { renderPage } = require('./layout');
const { buildHeadMeta, absoluteUrl } = require('../lib/seo');
const { SITE_NAME } = require('../lib/config');

// 404.html's physical file always sits at the dist root, but GitHub Pages
// serves its content for whatever URL failed to match (any depth) without
// actually redirecting the browser there — so relative paths can't be
// computed reliably for this one page. It uses fully-qualified absolute
// SITE_URL links instead (see layout.js's useAbsoluteAssets).
function renderNotFoundPage() {
  const bodyHtml = `
    <section class="section container static-page" style="text-align:center; padding: 90px 20px;">
      <p class="eyebrow">404</p>
      <h1 class="page-title">यह पेज नहीं मिला</h1>
      <p class="page-subtitle" style="margin: 0 auto 26px;">शायद यह कहानी हटा दी गई है, या लिंक गलत है।</p>
      <a href="${absoluteUrl('/')}" class="btn btn--primary">होम पेज पर जाएँ</a>
    </section>
  `;

  const headExtra = buildHeadMeta({
    title: `पेज नहीं मिला | ${SITE_NAME}`,
    description: 'यह पेज उपलब्ध नहीं है।',
    canonicalPath: '/404.html',
  });

  return renderPage({ headExtra, bodyHtml, bodyClass: 'page-not-found', useAbsoluteAssets: true });
}

module.exports = { renderNotFoundPage };
