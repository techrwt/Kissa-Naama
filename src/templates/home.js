'use strict';

const { renderPage } = require('./layout');
const { renderStoryCard } = require('./story-card');
const { buildHeadMeta, websiteSchema, organizationSchema } = require('../lib/seo');
const { escapeHtml, toPlainText, formatHindiDate } = require('../lib/format');
const { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } = require('../lib/config');
const { relLink } = require('../lib/paths');

const DEPTH = 0; // homepage lives at dist/index.html

function renderHero(hero) {
  const excerpt = toPlainText(hero.excerpt);
  return `
    <section class="hero">
      <div class="container hero__inner">
        <div class="hero__image-wrap">
          <img src="${relLink(DEPTH, hero.image)}" alt="${escapeHtml(hero.imageAlt || hero.title)}" class="hero__image" fetchpriority="high" />
        </div>
        <div class="hero__content">
          <p class="eyebrow">आज की चुनी हुई कहानी</p>
          <h1 class="hero__title">${escapeHtml(hero.title)}</h1>
          <p class="hero__excerpt">${escapeHtml(excerpt)}</p>
          <div class="hero__meta">
            <span>${formatHindiDate(hero.publishedAt)}</span>
            <span aria-hidden="true">•</span>
            <span>${escapeHtml(hero.readingTime || '')} मिनट पढ़ें</span>
          </div>
          <a href="${relLink(DEPTH, `/stories/${hero.slug}/`)}" class="btn btn--primary">कहानी पढ़ें</a>
        </div>
      </div>
    </section>`;
}

function renderHomePage({ heroStory, latestStories, moreStories }) {
  const latestCardsHtml = latestStories.map((s) => renderStoryCard(s, 'grid', DEPTH)).join('\n        ');
  const moreCardsHtml = moreStories.map((s) => renderStoryCard(s, 'grid', DEPTH)).join('\n        ');

  const bodyHtml = `
    ${renderHero(heroStory)}

    <section class="section container">
      <div class="section__header">
        <h2 class="section__title">नई कहानियाँ</h2>
        <a href="${relLink(DEPTH, '/stories/')}" class="section__link">सभी कहानियाँ देखें →</a>
      </div>
      <div class="story-grid">
        ${latestCardsHtml}
      </div>
    </section>

    ${
      moreStories.length > 0
        ? `<section class="section section--muted container">
      <div class="section__header">
        <h2 class="section__title">और कहानियाँ</h2>
      </div>
      <div class="story-grid">
        ${moreCardsHtml}
      </div>
    </section>`
        : ''
    }

    <section class="section container">
      <div class="cta-card">
        <h2 class="cta-card__title">नई कहानी सबसे पहले पढ़ना चाहते हैं?</h2>
        <p class="cta-card__text">KissaNama पर हर हफ़्ते नई कहानियाँ जुड़ती हैं। खोज पेज से अपनी पसंदीदा कहानी अभी खोजें।</p>
        <a href="${relLink(DEPTH, '/search/')}" class="btn btn--outline">कहानी खोजें</a>
      </div>
    </section>
  `;

  const headExtra = buildHeadMeta({
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    canonicalPath: '/',
    ogType: 'website',
    jsonLd: [websiteSchema(), organizationSchema()],
  });

  return renderPage({ headExtra, bodyHtml, activePath: '/', bodyClass: 'page-home', depth: DEPTH });
}

module.exports = { renderHomePage };
