/**
 * Splits raw text into an array of word tokens.
 * Keeps punctuation attached (preserves reading rhythm).
 * Handles non-breaking spaces (U+00A0) from PDF/DOCX exports.
 */
export function tokenize(text) {
  if (!text || typeof text !== 'string') return []
  return text
    .replace(/ /g, ' ')   // normalize non-breaking spaces
    .replace(/\r\n/g, '\n')    // normalize Windows line endings
    .split(/\s+/)
    .filter(w => w.length > 0)
}
