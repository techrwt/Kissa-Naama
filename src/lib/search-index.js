'use strict';

const { toPlainText } = require('./format');

function storyBodyText(story) {
  return story.story
    .map((block) => {
      if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote') {
        return toPlainText(block.text);
      }
      if (block.type === 'image') {
        return toPlainText(block.caption || '');
      }
      return '';
    })
    .join(' ');
}

function buildSearchIndex(allStories) {
  return allStories.map((story) => ({
    id: story.id,
    slug: story.slug,
    title: story.title,
    excerpt: toPlainText(story.excerpt),
    image: story.image.replace(/^\/+/, ''),
    imageAlt: story.imageAlt,
    publishedAt: story.publishedAt,
    readingTime: story.readingTime,
    author: story.author,
    body: storyBodyText(story),
    keywords: (story.seo && story.seo.keywords) || [],
  }));
}

module.exports = { buildSearchIndex };
