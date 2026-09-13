'use strict';

/**
 * KissaNama content validator.
 * Validates a single story object against the required schema.
 * NOTE: There is intentionally NO "category" field anywhere in this schema.
 */

const REQUIRED_STRING_FIELDS = [
  'id',
  'title',
  'slug',
  'excerpt',
  'image',
  'imageAlt',
  'publishedAt',
  'author',
];

const VALID_BLOCK_TYPES = ['paragraph', 'heading', 'quote', 'image', 'separator'];

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function fail(errors, msg) {
  errors.push(msg);
}

function validateBlock(block, index, storyLabel, errors) {
  if (typeof block !== 'object' || block === null || Array.isArray(block)) {
    fail(errors, `${storyLabel}: story[${index}] must be an object`);
    return;
  }
  if (!VALID_BLOCK_TYPES.includes(block.type)) {
    fail(
      errors,
      `${storyLabel}: story[${index}].type "${block.type}" is invalid. Must be one of: ${VALID_BLOCK_TYPES.join(', ')}`
    );
    return;
  }
  switch (block.type) {
    case 'paragraph':
      if (typeof block.text !== 'string' || !block.text.trim()) {
        fail(errors, `${storyLabel}: story[${index}] (paragraph) requires non-empty "text"`);
      }
      break;
    case 'heading':
      if (typeof block.text !== 'string' || !block.text.trim()) {
        fail(errors, `${storyLabel}: story[${index}] (heading) requires non-empty "text"`);
      }
      if (block.level !== undefined && ![2, 3].includes(Number(block.level))) {
        fail(errors, `${storyLabel}: story[${index}] (heading) "level" must be 2 or 3`);
      }
      break;
    case 'quote':
      if (typeof block.text !== 'string' || !block.text.trim()) {
        fail(errors, `${storyLabel}: story[${index}] (quote) requires non-empty "text"`);
      }
      break;
    case 'image':
      if (typeof block.src !== 'string' || !block.src.trim()) {
        fail(errors, `${storyLabel}: story[${index}] (image) requires non-empty "src"`);
      }
      break;
    case 'separator':
      break;
    default:
      break;
  }
}

function validateStory(story, sourceFile) {
  const errors = [];

  if (typeof story !== 'object' || story === null || Array.isArray(story)) {
    return [`${sourceFile}: each story must be a JSON object`];
  }

  const storyLabel = `${sourceFile} → "${story.id || story.slug || '(unknown id)'}"`;

  if ('category' in story) {
    fail(errors, `${storyLabel}: "category" field is not allowed. KissaNama has no category system.`);
  }

  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof story[field] !== 'string' || !story[field].trim()) {
      fail(errors, `${storyLabel}: missing or empty required field "${field}"`);
    }
  }

  if (typeof story.slug === 'string' && story.slug.trim() && !SLUG_REGEX.test(story.slug)) {
    fail(
      errors,
      `${storyLabel}: "slug" must be lowercase, using only letters, numbers and hyphens (e.g. "meri-kahani")`
    );
  }

  if (typeof story.publishedAt === 'string' && !DATE_REGEX.test(story.publishedAt)) {
    fail(errors, `${storyLabel}: "publishedAt" must be in YYYY-MM-DD format`);
  }

  if (story.updatedAt !== undefined) {
    if (typeof story.updatedAt !== 'string' || !DATE_REGEX.test(story.updatedAt)) {
      fail(errors, `${storyLabel}: "updatedAt" must be in YYYY-MM-DD format if provided`);
    }
  }

  if (!Array.isArray(story.story) || story.story.length === 0) {
    fail(errors, `${storyLabel}: "story" must be a non-empty array of content blocks`);
  } else {
    story.story.forEach((block, i) => validateBlock(block, i, storyLabel, errors));
  }

  if (story.readingTime !== undefined) {
    const rt = Number(story.readingTime);
    if (!Number.isFinite(rt) || rt <= 0) {
      fail(errors, `${storyLabel}: "readingTime" must be a positive number (minutes)`);
    }
  }

  if (story.featured !== undefined && typeof story.featured !== 'boolean') {
    fail(errors, `${storyLabel}: "featured" must be true or false`);
  }

  if (story.seo !== undefined) {
    if (typeof story.seo !== 'object' || story.seo === null || Array.isArray(story.seo)) {
      fail(errors, `${storyLabel}: "seo" must be an object`);
    } else {
      if (story.seo.title !== undefined && typeof story.seo.title !== 'string') {
        fail(errors, `${storyLabel}: "seo.title" must be a string`);
      }
      if (story.seo.description !== undefined && typeof story.seo.description !== 'string') {
        fail(errors, `${storyLabel}: "seo.description" must be a string`);
      }
      if (story.seo.keywords !== undefined) {
        if (!Array.isArray(story.seo.keywords) || story.seo.keywords.some((k) => typeof k !== 'string')) {
          fail(errors, `${storyLabel}: "seo.keywords" must be an array of strings`);
        }
      }
    }
  }

  return errors;
}

/**
 * Validates a full batch (array of stories) parsed from one JSON file.
 * Returns { errors: string[] }
 */
function validateBatch(batchData, sourceFile) {
  const errors = [];
  if (!Array.isArray(batchData)) {
    return { errors: [`${sourceFile}: file must contain a JSON array of stories`] };
  }
  if (batchData.length === 0) {
    errors.push(`${sourceFile}: batch file is empty (no stories)`);
  }
  for (const story of batchData) {
    errors.push(...validateStory(story, sourceFile));
  }
  return { errors };
}

module.exports = { validateStory, validateBatch, SLUG_REGEX, DATE_REGEX };
