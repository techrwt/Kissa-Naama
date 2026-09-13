#!/usr/bin/env node
'use strict';

const path = require('path');
const { loadAllStories } = require('../src/lib/content');

const CONTENT_DIR = path.join(__dirname, '..', 'content');

try {
  const stories = loadAllStories(CONTENT_DIR);
  console.log(`✅ सभी content/batch-*.json फ़ाइलें valid हैं। कुल कहानियाँ: ${stories.length}`);
  process.exit(0);
} catch (err) {
  console.error('❌ Content validation विफल हुआ:\n');
  console.error(err.message);
  process.exit(1);
}
