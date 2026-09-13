'use strict';

/**
 * Escapes raw text for safe HTML output.
 */
function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escapes text for safe use inside an XML document (sitemap.xml).
 */
function escapeXml(str) {
  return escapeHtml(str);
}

/**
 * Converts lightweight inline markup into safe HTML:
 *   **bold text**   -> <strong>bold text</strong>
 *   ==highlighted== -> <mark class="highlight">highlighted</mark>
 * Input is escaped first, so this is safe against HTML injection from JSON content.
 */
function formatInline(rawText) {
  const escaped = escapeHtml(rawText);
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/==(.+?)==/g, '<mark class="highlight">$1</mark>');
}

/**
 * Strips inline markup + tags to produce plain text (used for search index / meta descriptions).
 */
function toPlainText(rawText) {
  if (!rawText) return '';
  return String(rawText)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/==(.+?)==/g, '$1')
    .trim();
}

/**
 * Formats a YYYY-MM-DD date into a friendly Hindi-style date string, e.g. "12 सितंबर 2026".
 */
const HINDI_MONTHS = [
  'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर',
];

function formatHindiDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const day = String(d).padStart(2, '0');
  return `${day} ${HINDI_MONTHS[m - 1]} ${y}`;
}

module.exports = { escapeHtml, escapeXml, formatInline, toPlainText, formatHindiDate };
