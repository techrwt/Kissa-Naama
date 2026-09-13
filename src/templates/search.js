'use strict';

const { renderPage } = require('./layout');
const { buildHeadMeta, breadcrumbSchema } = require('../lib/seo');
const { SITE_NAME } = require('../lib/config');
const { relLink } = require('../lib/paths');

const DEPTH = 1; // dist/search/index.html

/**
 * The search index is embedded directly in the page (inline <script type="application/json">)
 * rather than fetched via fetch()/XHR. This is deliberate: fetch() of local JSON files is
 * blocked by browsers when a page is opened via file:// (double-clicking the HTML file),
 * which is a very common way people preview a static site. Embedding the data inline means
 * search works identically whether the page is opened via file://, a local dev server, or
 * the live GitHub Pages site — no network request needed at all.
 */
function renderSearchPage(searchIndexData) {
  // Escape "</" so the embedded JSON can never accidentally close the <script> tag early.
  const safeJson = JSON.stringify(searchIndexData).replace(/<\//g, '<\\/');

  const bodyHtml = `
    <section class="section container page-header">
      <p class="eyebrow">खोज</p>
      <h1 class="page-title">अपनी पसंदीदा कहानी खोजें</h1>
      <p class="page-subtitle">शीर्षक, विवरण या कहानी के अंदर के शब्दों से खोजें — कोई श्रेणी नहीं, सिर्फ़ सीधी खोज।</p>
      <form class="search-form" role="search" id="searchForm" action="${relLink(DEPTH, '/search/')}" method="get">
        <label for="searchInput" class="visually-hidden">कहानी खोजें</label>
        <input
          type="search"
          id="searchInput"
          name="q"
          class="search-input"
          placeholder="जैसे: रहस्य, प्रेम, गांव..."
          autocomplete="off"
          autofocus
        />
      </form>
    </section>
    <section class="section container">
      <p id="searchStatus" class="search-status" role="status" aria-live="polite"></p>
      <div id="searchResults" class="story-grid"></div>
    </section>
    <script type="application/json" id="kissanama-search-data">${safeJson}</script>
    <script src="${relLink(DEPTH, 'assets/js/search.js')}" defer></script>
  `;

  const headExtra = buildHeadMeta({
    title: `कहानी खोजें | ${SITE_NAME}`,
    description: `${SITE_NAME} की सभी कहानियों में खोजें — शीर्षक, विवरण और कहानी के अंदर के शब्दों से।`,
    canonicalPath: '/search/',
    jsonLd: breadcrumbSchema([
      { name: 'होम', path: '/' },
      { name: 'खोज', path: '/search/' },
    ]),
  });

  return renderPage({ headExtra, bodyHtml, activePath: '/search/', bodyClass: 'page-search', depth: DEPTH });
}

module.exports = { renderSearchPage };
