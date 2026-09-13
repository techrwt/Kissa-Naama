'use strict';

/**
 * KissaNama uses fully RELATIVE links/asset paths in every generated page
 * (instead of root-absolute "/assets/..." paths). This makes the built
 * dist/ folder work correctly in two situations that matter a lot in practice:
 *
 *   1. Someone double-clicks dist/index.html and opens it directly via
 *      file:// — root-absolute paths would incorrectly resolve against the
 *      local filesystem root (e.g. C:/assets/...), breaking every asset.
 *   2. The site is deployed to a GitHub Pages *project* page, which lives
 *      under a subpath (https://user.github.io/RepoName/) rather than the
 *      domain root — root-absolute paths would resolve to the domain root
 *      and miss the "/RepoName" prefix entirely.
 *
 * Relative paths, computed from each page's folder depth, work correctly
 * in both cases with zero configuration.
 *
 * NOTE: this is only for in-page navigation/asset links. Canonical URLs,
 * Open Graph tags, JSON-LD and sitemap.xml still use fully-qualified
 * absolute URLs built from SITE_URL (see src/lib/seo.js) — those always
 * need to be real, absolute URLs regardless of how the page is loaded.
 */

function relPrefix(depth) {
  return depth > 0 ? '../'.repeat(depth) : '';
}

/**
 * Converts a root-style path (e.g. "/", "/stories/", "/stories/foo/",
 * "assets/css/main.css") into a relative path/filename appropriate for a
 * page sitting `depth` folders below the site root.
 */
function relLink(depth, targetPath) {
  const clean = String(targetPath).replace(/^\/+/, '');
  const prefix = relPrefix(depth);
  if (clean === '') return `${prefix}index.html`;
  if (clean.endsWith('/')) return `${prefix}${clean}index.html`;
  return `${prefix}${clean}`;
}

module.exports = { relPrefix, relLink };
