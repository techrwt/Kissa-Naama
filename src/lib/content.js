'use strict';

const fs = require('fs');
const path = require('path');
const { validateBatch } = require('./validate');
const { toPlainText } = require('./format');

const BATCH_FILE_REGEX = /^batch-.+\.json$/i;

/**
 * Finds all content/batch-*.json files, sorted by filename for stable/deterministic ordering.
 */
function findBatchFiles(contentDir) {
  if (!fs.existsSync(contentDir)) {
    throw new Error(`Content directory not found: ${contentDir}`);
  }
  return fs
    .readdirSync(contentDir)
    .filter((f) => BATCH_FILE_REGEX.test(f))
    .sort();
}

/**
 * Reads + JSON-parses + validates every batch file.
 * Throws a single combined Error listing every problem if anything is invalid,
 * so the build fails loudly and clearly rather than silently skipping bad data.
 */
function loadAllStories(contentDir) {
  const batchFiles = findBatchFiles(contentDir);

  if (batchFiles.length === 0) {
    throw new Error(
      `No content/batch-*.json files found in ${contentDir}. Add at least one batch file (e.g. batch-1.json) before building.`
    );
  }

  const allErrors = [];
  const allStories = [];
  const seenIds = new Map();
  const seenSlugs = new Map();

  for (const file of batchFiles) {
    const fullPath = path.join(contentDir, file);
    let parsed;
    try {
      const raw = fs.readFileSync(fullPath, 'utf8');
      parsed = JSON.parse(raw);
    } catch (err) {
      allErrors.push(`${file}: invalid JSON — ${err.message}`);
      continue;
    }

    const { errors } = validateBatch(parsed, file);
    if (errors.length > 0) {
      allErrors.push(...errors);
      continue;
    }

    for (const story of parsed) {
      if (seenIds.has(story.id)) {
        allErrors.push(`${file}: duplicate story "id" "${story.id}" (already used in ${seenIds.get(story.id)})`);
      } else {
        seenIds.set(story.id, file);
      }
      if (seenSlugs.has(story.slug)) {
        allErrors.push(`${file}: duplicate story "slug" "${story.slug}" (already used in ${seenSlugs.get(story.slug)})`);
      } else {
        seenSlugs.set(story.slug, file);
      }
      allStories.push({ ...story, _sourceFile: file });
    }
  }

  if (allErrors.length > 0) {
    const message = [
      `Content validation failed with ${allErrors.length} error(s):`,
      ...allErrors.map((e) => `  ✗ ${e}`),
    ].join('\n');
    throw new Error(message);
  }

  // Sort newest first by publishedAt, tie-broken by id for stability.
  allStories.sort((a, b) => {
    if (a.publishedAt !== b.publishedAt) {
      return a.publishedAt < b.publishedAt ? 1 : -1;
    }
    return a.id < b.id ? 1 : -1;
  });

  // Assign previous/next based on the sorted (newest-first) order.
  allStories.forEach((story, index) => {
    story._prev = index < allStories.length - 1 ? allStories[index + 1] : null; // older story
    story._next = index > 0 ? allStories[index - 1] : null; // newer story
  });

  return allStories;
}

/**
 * Builds a lowercase keyword set for a story used for related-story scoring.
 * Draws from seo.keywords, title words, and excerpt words (no category system involved).
 */
function keywordSetFor(story) {
  const words = new Set();
  (story.seo && story.seo.keywords ? story.seo.keywords : []).forEach((k) =>
    words.add(String(k).trim().toLowerCase())
  );
  const tokenize = (text) =>
    toPlainText(text)
      .split(/[\s,।.!?"'()]+/)
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length > 1);
  tokenize(story.title).forEach((w) => words.add(w));
  tokenize(story.excerpt).forEach((w) => words.add(w));
  return words;
}

/**
 * Finds up to `limit` related stories for `story` from `allStories`,
 * scored by keyword/title/excerpt overlap. Returns [] if nothing scores > 0,
 * so the caller can gracefully hide the "related stories" section.
 */
function getRelatedStories(story, allStories, limit = 4) {
  const baseSet = keywordSetFor(story);
  if (baseSet.size === 0) return [];

  const scored = allStories
    .filter((s) => s.id !== story.id)
    .map((candidate) => {
      const candidateSet = keywordSetFor(candidate);
      let score = 0;
      for (const word of candidateSet) {
        if (baseSet.has(word)) score += 1;
      }
      return { candidate, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // tie-break: newer story first
      return a.candidate.publishedAt < b.candidate.publishedAt ? 1 : -1;
    });

  return scored.slice(0, limit).map((entry) => entry.candidate);
}

/**
 * Picks the homepage hero story: the newest story explicitly marked `featured: true`,
 * falling back to the newest story overall if none are marked featured.
 */
function pickHeroStory(allStories) {
  const featured = allStories.find((s) => s.featured === true);
  return featured || allStories[0];
}

module.exports = { findBatchFiles, loadAllStories, getRelatedStories, pickHeroStory, keywordSetFor };
