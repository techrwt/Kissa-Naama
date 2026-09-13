'use strict';

const { renderPage } = require('./layout');
const { buildHeadMeta, breadcrumbSchema } = require('../lib/seo');
const { SITE_NAME } = require('../lib/config');

/**
 * `contentHtml` should be pre-built HTML (already escaped/trusted, since it comes from us, not user JSON).
 */
function renderStaticPage({ path: pagePath, title, description, contentHtml, navLabel }) {
  const bodyHtml = `
    <section class="section container static-page">
      <h1 class="page-title">${title}</h1>
      <div class="static-page__content">
        ${contentHtml}
      </div>
    </section>
  `;

  const headExtra = buildHeadMeta({
    title: `${title} | ${SITE_NAME}`,
    description,
    canonicalPath: pagePath,
    jsonLd: breadcrumbSchema([
      { name: 'होम', path: '/' },
      { name: navLabel || title, path: pagePath },
    ]),
  });

  return renderPage({ headExtra, bodyHtml, activePath: pagePath, bodyClass: 'page-static', depth: 1 });
}

module.exports = { renderStaticPage };
