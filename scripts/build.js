#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const DIST_DIR = path.join(ROOT, 'dist');

const { loadAllStories, getRelatedStories, pickHeroStory } = require('../src/lib/content');
const { buildSearchIndex } = require('../src/lib/search-index');
const { buildSitemap, buildRobotsTxt } = require('../src/lib/sitemap');
const { SITE_URL } = require('../src/lib/config');
const { renderHomePage } = require('../src/templates/home');
const { renderStoriesIndexPage } = require('../src/templates/stories-index');
const { renderStoryPage } = require('../src/templates/story');
const { renderSearchPage } = require('../src/templates/search');
const { renderStaticPage } = require('../src/templates/static-page');
const { renderNotFoundPage } = require('../src/templates/not-found');
const { STATIC_PAGES } = require('../src/content/static-pages');

function log(msg) {
  console.log(`[build] ${msg}`);
}

function rmrf(target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(relPath, content) {
  const fullPath = path.join(DIST_DIR, relPath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content, 'utf8');
}

function copyDir(src, destRelative) {
  if (!fs.existsSync(src)) return;
  const dest = path.join(DIST_DIR, destRelative);
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, path.join(destRelative, entry.name));
    } else {
      ensureDir(path.dirname(destPath));
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function copyFileInto(src, destRelative) {
  if (!fs.existsSync(src)) return;
  const dest = path.join(DIST_DIR, destRelative);
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function main() {
  const startedAt = Date.now();
  log(`KissaNama build शुरू हो रहा है... (SITE_URL = ${SITE_URL})`);

  rmrf(DIST_DIR);
  ensureDir(DIST_DIR);

  // 1) Load + validate all content/batch-*.json files. Throws (and exits below) on any error.
  const allStories = loadAllStories(CONTENT_DIR);
  log(`${allStories.length} कहानियाँ लोड और validate हो गईं।`);

  // 2) Pick hero + latest + more.
  const heroStory = pickHeroStory(allStories);
  const rest = allStories.filter((s) => s.id !== heroStory.id);
  const latestStories = rest.slice(0, 6);
  const moreStories = rest.slice(6);

  // 3) Homepage.
  writeFile('index.html', renderHomePage({ heroStory, latestStories, moreStories }));
  log('होमपेज तैयार।');

  // 4) Stories index page.
  writeFile('stories/index.html', renderStoriesIndexPage(allStories));

  // 5) Individual story pages.
  for (const story of allStories) {
    const related = getRelatedStories(story, allStories, 4);
    writeFile(`stories/${story.slug}/index.html`, renderStoryPage(story, related, SITE_URL));
  }
  log(`${allStories.length} स्टोरी पेज जनरेट हुए।`);

  // 6) Search page (index embedded inline — works via file://, server, or live site)
  //    + a standalone assets/search-index.json kept around for reference/reuse.
  const searchIndexData = buildSearchIndex(allStories);
  writeFile('search/index.html', renderSearchPage(searchIndexData));
  writeFile('assets/search-index.json', JSON.stringify(searchIndexData));
  log('खोज पेज (embedded data) और सर्च इंडेक्स तैयार।');

  // 7) Static pages (about/privacy/contact).
  for (const page of STATIC_PAGES) {
    const relPath = page.path.replace(/^\/+/, '') + 'index.html';
    writeFile(relPath, renderStaticPage(page));
  }
  log('स्थिर पेज (about/privacy/contact) तैयार।');

  // 8) 404 page
  writeFile('404.html', renderNotFoundPage());

  // 8) sitemap.xml + robots.txt
  writeFile('sitemap.xml', buildSitemap(allStories));
  writeFile('robots.txt', buildRobotsTxt());
  log('sitemap.xml और robots.txt जनरेट हुए।');

  // 9) Copy static assets: CSS, JS, images, logo, and anything in /public.
  copyFileInto(path.join(ROOT, 'src/styles/main.css'), 'assets/css/main.css');
  copyFileInto(path.join(ROOT, 'src/scripts/main.js'), 'assets/js/main.js');
  copyFileInto(path.join(ROOT, 'src/scripts/search.js'), 'assets/js/search.js');
  copyDir(path.join(ROOT, 'assets/images'), 'assets/images');
  copyDir(path.join(ROOT, 'assets/logo'), 'assets/logo');
  copyDir(path.join(ROOT, 'public'), '.');
  log('assets कॉपी हो गए (css, js, images, logo, public files)।');

  // 10) .nojekyll so GitHub Pages doesn't run Jekyll processing on our static output.
  writeFile('.nojekyll', '');

  const seconds = ((Date.now() - startedAt) / 1000).toFixed(2);
  log(`✅ Build पूरा हुआ (${seconds}s). Output: ${path.relative(ROOT, DIST_DIR)}/`);
}

try {
  main();
} catch (err) {
  console.error('\n[build] ❌ Build विफल हुआ:\n');
  console.error(err.message);
  process.exit(1);
}
