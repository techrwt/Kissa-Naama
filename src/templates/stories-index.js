'use strict';

const { renderPage } = require('./layout');
const { renderStoryCard } = require('./story-card');
const { buildHeadMeta, breadcrumbSchema } = require('../lib/seo');
const { SITE_NAME } = require('../lib/config');

const DEPTH = 1; // dist/stories/index.html

function renderStoriesIndexPage(allStories) {
  const cardsHtml = allStories.map((s) => renderStoryCard(s, 'grid', DEPTH)).join('\n        ');

  const bodyHtml = `
    <section class="section container page-header">
      <p class="eyebrow">कुल ${allStories.length} कहानियाँ</p>
      <h1 class="page-title">सभी कहानियाँ</h1>
      <p class="page-subtitle">KissaNama के पूरे संग्रह से — नई से पुरानी कहानी तक, एक ही जगह।</p>
    </section>
    <section class="section container">
      <div class="story-grid">
        ${cardsHtml}
      </div>
    </section>
  `;

  const headExtra = buildHeadMeta({
    title: `सभी कहानियाँ | ${SITE_NAME}`,
    description: `${SITE_NAME} की सभी हिंदी कहानियों का पूरा संग्रह — एक ही जगह, बिना किसी श्रेणी के।`,
    canonicalPath: '/stories/',
    jsonLd: breadcrumbSchema([
      { name: 'होम', path: '/' },
      { name: 'कहानियाँ', path: '/stories/' },
    ]),
  });

  return renderPage({ headExtra, bodyHtml, activePath: '/stories/', bodyClass: 'page-stories-index', depth: DEPTH });
}

module.exports = { renderStoriesIndexPage };
