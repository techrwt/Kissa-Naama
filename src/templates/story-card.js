'use strict';

const { escapeHtml, toPlainText, formatHindiDate } = require('../lib/format');
const { relLink } = require('../lib/paths');

/**
 * Renders one story card. `variant` can be "grid" (default) or "compact" (for related stories).
 * `depth` = folder depth of the PAGE this card is being rendered onto (not the story itself),
 * used to compute correct relative links/asset paths.
 */
function renderStoryCard(story, variant = 'grid', depth = 0) {
  const excerpt = toPlainText(story.excerpt);
  return `<article class="story-card story-card--${variant}">
        <a href="${relLink(depth, `/stories/${story.slug}/`)}" class="story-card__link">
          <div class="story-card__image-wrap">
            <img src="${relLink(depth, story.image)}" alt="${escapeHtml(story.imageAlt || story.title)}" loading="lazy" class="story-card__image" onerror="this.closest('.story-card__image-wrap').classList.add('image-fallback')" />
          </div>
          <div class="story-card__body">
            <h3 class="story-card__title">${escapeHtml(story.title)}</h3>
            <p class="story-card__excerpt">${escapeHtml(excerpt)}</p>
            <div class="story-card__meta">
              <span>${formatHindiDate(story.publishedAt)}</span>
              <span aria-hidden="true">•</span>
              <span>${escapeHtml(story.readingTime || '')} मिनट पढ़ें</span>
            </div>
          </div>
        </a>
      </article>`;
}

module.exports = { renderStoryCard };
