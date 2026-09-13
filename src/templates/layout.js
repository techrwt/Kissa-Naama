'use strict';

const { SITE_NAME, SITE_TAGLINE, NAV, FOOTER_LINKS, BUILD_YEAR, LOGO_PATH } = require('../lib/config');
const { escapeHtml } = require('../lib/format');
const { relLink } = require('../lib/paths');

/**
 * Renders the header. `activePath` marks the current nav item.
 * `depth` = how many folders deep the current page is below the site root
 * (0 for /index.html, 1 for /stories/index.html, 2 for /stories/slug/index.html, etc).
 * `useAbsolute` (404 page only) resolves links via SITE_URL instead of
 * relative depth-math — see the note on renderPage below for why.
 */
function renderHeader(activePath, depth, useAbsolute) {
  const resolve = useAbsolute ? require('../lib/seo').absoluteUrl : (path) => relLink(depth, path);

  const navItems = NAV.map((item) => {
    const isActive = item.href === activePath;
    return `<li><a href="${resolve(item.href)}" class="nav-link${isActive ? ' is-active' : ''}"${
      isActive ? ' aria-current="page"' : ''
    }>${escapeHtml(item.label)}</a></li>`;
  }).join('\n            ');

  return `
  <header class="site-header">
    <div class="container site-header__inner">
      <a href="${resolve('/')}" class="site-logo" aria-label="${escapeHtml(SITE_NAME)} — होम पेज पर जाएँ">
        <img src="${resolve(LOGO_PATH)}" alt="${escapeHtml(SITE_NAME)} लोगो" class="site-logo__img" width="600" height="200" />
      </a>
      <button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="siteNav" aria-label="मेन्यू खोलें">
        <span></span><span></span><span></span>
      </button>
      <nav class="site-nav" id="siteNav">
        <ul>
            ${navItems}
        </ul>
      </nav>
    </div>
  </header>`;
}

function renderFooter(depth, useAbsolute) {
  const resolve = useAbsolute ? require('../lib/seo').absoluteUrl : (path) => relLink(depth, path);

  const links = FOOTER_LINKS.map(
    (item) => `<li><a href="${resolve(item.href)}">${escapeHtml(item.label)}</a></li>`
  ).join('\n          ');

  return `
  <footer class="site-footer">
    <div class="container site-footer__inner">
      <div class="site-footer__brand">
        <span class="site-footer__logo-wrap">
          <img src="${resolve(LOGO_PATH)}" alt="${escapeHtml(SITE_NAME)} लोगो" class="site-footer__logo" width="600" height="200" />
        </span>
        <p class="site-footer__tagline">${escapeHtml(SITE_TAGLINE)}</p>
      </div>
      <ul class="site-footer__links">
          ${links}
      </ul>
      <p class="site-footer__copy">© ${BUILD_YEAR} ${escapeHtml(SITE_NAME)}। सर्वाधिकार सुरक्षित।</p>
    </div>
  </footer>`;
}

/**
 * Wraps `bodyHtml` in the full HTML document shell.
 * `depth` = folder depth of this page below site root (see renderHeader above).
 * Pass `useAbsoluteAssets: true` (only used by the 404 page) to force
 * SITE_URL-qualified absolute asset paths instead of relative ones — needed
 * because GitHub Pages serves 404.html's content at whatever URL failed,
 * so relative paths can't reliably be computed for it.
 */
function renderPage({ headExtra, bodyHtml, activePath = '', bodyClass = '', depth = 0, useAbsoluteAssets = false }) {
  let cssHref;
  let jsHref;
  let faviconHref;

  if (useAbsoluteAssets) {
    const { absoluteUrl } = require('../lib/seo');
    cssHref = absoluteUrl('/assets/css/main.css');
    jsHref = absoluteUrl('/assets/js/main.js');
    faviconHref = absoluteUrl('/assets/logo/favicon.svg');
  } else {
    cssHref = relLink(depth, 'assets/css/main.css');
    jsHref = relLink(depth, 'assets/js/main.js');
    faviconHref = relLink(depth, 'assets/logo/favicon.svg');
  }

  return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#f6efe2" />
  <link rel="icon" href="${faviconHref}" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800&family=Noto+Serif+Devanagari:wght@500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${cssHref}" />
    ${headExtra}
</head>
<body class="${bodyClass}">
  <a href="#main-content" class="skip-link">मुख्य सामग्री पर जाएँ</a>
  ${renderHeader(activePath, depth, useAbsoluteAssets)}
  <main id="main-content">
  ${bodyHtml}
  </main>
  ${renderFooter(depth, useAbsoluteAssets)}
  <script>window.__KISSANAMA_DEPTH__ = ${useAbsoluteAssets ? 0 : depth};</script>
  <script src="${jsHref}" defer></script>
</body>
</html>`;
}

module.exports = { renderPage, renderHeader, renderFooter };
