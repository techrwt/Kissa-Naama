'use strict';

const { renderPage } = require('./layout');
const { renderStoryCard } = require('./story-card');
const { buildHeadMeta, articleSchema, breadcrumbSchema } = require('../lib/seo');
const { escapeHtml, formatInline, toPlainText, formatHindiDate } = require('../lib/format');
const { SITE_NAME } = require('../lib/config');
const { relLink } = require('../lib/paths');

const DEPTH = 2; // dist/stories/<slug>/index.html

function renderBlock(block) {
  switch (block.type) {
    case 'heading': {
      const level = block.level === 3 ? 3 : 2;
      return `<h${level} class="story-heading">${formatInline(block.text)}</h${level}>`;
    }
    case 'quote':
      return `<blockquote class="story-quote">
          <p>${formatInline(block.text)}</p>
          ${block.cite ? `<cite>— ${escapeHtml(block.cite)}</cite>` : ''}
        </blockquote>`;
    case 'image':
      return `<figure class="story-figure">
          <img src="${relLink(DEPTH, block.src)}" alt="${escapeHtml(block.alt || '')}" loading="lazy" class="story-figure__image" onerror="this.parentElement.classList.add('image-fallback')" />
          ${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''}
        </figure>`;
    case 'separator':
      return `<hr class="story-separator" aria-hidden="true" />`;
    case 'paragraph':
    default: {
      const cls = block.highlight ? ' class="is-highlighted"' : '';
      return `<p${cls}>${formatInline(block.text)}</p>`;
    }
  }
}

function renderShareButtons(story, siteUrl) {
  const url = `${siteUrl}/stories/${story.slug}/`;
  const text = encodeURIComponent(story.title);
  const encodedUrl = encodeURIComponent(url);
  return `
        <div class="share-buttons" role="group" aria-label="कहानी शेयर करें">
          <a class="share-btn share-btn--whatsapp" href="https://wa.me/?text=${text}%20${encodedUrl}" target="_blank" rel="noopener noreferrer" aria-label="व्हाट्सएप पर शेयर करें">WhatsApp</a>
          <a class="share-btn share-btn--x" href="https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}" target="_blank" rel="noopener noreferrer" aria-label="X पर शेयर करें">X</a>
          <a class="share-btn share-btn--facebook" href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" rel="noopener noreferrer" aria-label="फेसबुक पर शेयर करें">Facebook</a>
          <button type="button" class="share-btn share-btn--copy" data-copy-url="${url}" aria-label="लिंक कॉपी करें">लिंक कॉपी करें</button>
        </div>`;
}

function renderStoryPage(story, allStoriesRelated, siteUrl) {
  const bodyBlocksHtml = story.story.map(renderBlock).join('\n        ');

  const relatedHtml =
    allStoriesRelated.length > 0
      ? `<section class="section section--muted container related-stories">
      <h2 class="section__title">जुड़ी हुई कहानियाँ</h2>
      <div class="story-grid story-grid--related">
        ${allStoriesRelated.map((s) => renderStoryCard(s, 'compact', DEPTH)).join('\n        ')}
      </div>
    </section>`
      : '';

  const prevNextHtml = `
    <nav class="story-pagination container" aria-label="पिछली और अगली कहानी">
      ${
        story._prev
          ? `<a href="${relLink(DEPTH, `/stories/${story._prev.slug}/`)}" class="story-pagination__link story-pagination__link--prev">
              <span class="story-pagination__label">← पिछली कहानी</span>
              <span class="story-pagination__title">${escapeHtml(story._prev.title)}</span>
            </a>`
          : '<span></span>'
      }
      ${
        story._next
          ? `<a href="${relLink(DEPTH, `/stories/${story._next.slug}/`)}" class="story-pagination__link story-pagination__link--next">
              <span class="story-pagination__label">अगली कहानी →</span>
              <span class="story-pagination__title">${escapeHtml(story._next.title)}</span>
            </a>`
          : '<span></span>'
      }
    </nav>`;

  const bodyHtml = `
    <article class="story-page">
      <div class="container story-breadcrumb">
        <a href="${relLink(DEPTH, '/')}">होम</a>
        <span aria-hidden="true">/</span>
        <a href="${relLink(DEPTH, '/stories/')}">कहानियाँ</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">${escapeHtml(story.title)}</span>
      </div>

      <header class="container story-header">
        <h1 class="story-title">${escapeHtml(story.title)}</h1>
        <p class="story-excerpt">${escapeHtml(toPlainText(story.excerpt))}</p>
        <div class="story-meta">
          <span>${escapeHtml(story.author)}</span>
          <span aria-hidden="true">•</span>
          <span>${formatHindiDate(story.publishedAt)}</span>
          ${story.updatedAt && story.updatedAt !== story.publishedAt ? `<span aria-hidden="true">•</span><span>अपडेट: ${formatHindiDate(story.updatedAt)}</span>` : ''}
          <span aria-hidden="true">•</span>
          <span>${escapeHtml(story.readingTime || '')} मिनट पढ़ें</span>
        </div>
      </header>

      <div class="container story-hero-image-wrap">
        <img src="${relLink(DEPTH, story.image)}" alt="${escapeHtml(story.imageAlt || story.title)}" class="story-hero-image" fetchpriority="high" onerror="this.closest('.story-hero-image-wrap').classList.add('image-fallback')" />
      </div>

      <div class="container story-body">
        ${bodyBlocksHtml}
      </div>

      <div class="container story-footer-actions">
        ${renderShareButtons(story, siteUrl)}
        <a href="${relLink(DEPTH, '/stories/')}" class="btn btn--outline btn--small">← सभी कहानियों पर वापस जाएँ</a>
      </div>
    </article>

    ${relatedHtml}
    ${prevNextHtml}
  `;

  const headExtra = buildHeadMeta({
    title: (story.seo && story.seo.title) || `${story.title} | ${SITE_NAME}`,
    description: (story.seo && story.seo.description) || story.excerpt,
    canonicalPath: `/stories/${story.slug}/`,
    ogType: 'article',
    ogImage: `/${story.image.replace(/^\/+/, '')}`,
    publishedAt: story.publishedAt,
    updatedAt: story.updatedAt,
    author: story.author,
    jsonLd: [
      articleSchema(story),
      breadcrumbSchema([
        { name: 'होम', path: '/' },
        { name: 'कहानियाँ', path: '/stories/' },
        { name: story.title, path: `/stories/${story.slug}/` },
      ]),
    ],
  });

  return renderPage({
    headExtra,
    bodyHtml,
    activePath: '/stories/',
    bodyClass: 'page-story',
    depth: DEPTH,
  });
}

module.exports = { renderStoryPage };
