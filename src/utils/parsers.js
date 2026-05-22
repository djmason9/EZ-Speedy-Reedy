import * as pdfjs from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url'

// Wire the PDF.js worker — Vite's ?url suffix copies the file to dist
// and returns its public URL as a string (no CDN dependency)
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

/**
 * Parse a PDF file and return its full text content.
 * Returns an error string if the PDF is a scanned image with no text layer.
 */
export async function parsePdf(file) {
  const arrayBuffer = await file.arrayBuffer()
  const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise
  const pages = []

  for (let i = 1; i <= doc.numPages; i++) {
    const page    = await doc.getPage(i)
    const viewport = page.getViewport({ scale: 1 })
    const content = await page.getTextContent()

    // Footer threshold: skip anything in the bottom 7% of the page.
    // PDF Y-axis is bottom-up, so low transform[5] = near the bottom.
    const footerY = viewport.height * 0.07

    pages.push(buildPageText(content.items, footerY))
  }

  const fullText = pages.join('\n').trim()

  // Detect scanned images (no OCR text layer)
  if (fullText.length < 20) {
    throw new Error(
      'This PDF appears to be a scanned image. No extractable text was found. ' +
      'Please use a PDF with a real text layer, or convert it with OCR first.'
    )
  }

  return fullText
}

/**
 * Reconstruct readable text from PDF.js text items using position data.
 *
 * Key fix over the naive `.join(' ')` approach: many PDFs split words into
 * multiple items (sometimes character-by-character). We use each item's
 * x/y position + width to decide whether consecutive items are part of the
 * same word or separated by a space/line-break.
 *
 * footerY — items whose Y position (transform[5]) is below this value are
 * treated as footer content and skipped entirely.
 *
 * Each item's transform: [scaleX, skewX, skewY, scaleY, x, y]
 */
function buildPageText(items, footerY = 0) {
  // Pre-filter: keep only real text items above the footer zone.
  // This is done up-front so that `lastItem` below is always a valid
  // text item with transform/width/hasEOL — avoiding the crash that
  // happened when items[i-1] was a non-text marker object.
  const textItems = items.filter(item =>
    typeof item.str === 'string' &&
    item.str.length > 0 &&
    Array.isArray(item.transform) &&
    item.transform[5] > footerY      // above the footer zone
  )

  let text     = ''
  let lastItem = null   // tracks the previous *text* item (not raw array index)

  for (const cur of textItems) {
    if (!lastItem) {
      text     += cur.str
      lastItem  = cur
      continue
    }

    // 1. Previous item signalled end-of-line → word boundary
    if (lastItem.hasEOL) {
      text += ' ' + cur.str

    // 2. Significant vertical shift → different line → word boundary
    } else if (Math.abs(cur.transform[5] - lastItem.transform[5]) > 1) {
      text += ' ' + cur.str

    } else {
      // 3. Horizontal gap: if the space between where lastItem ended and
      //    where cur starts exceeds ~10% of the font size, insert a space.
      const prevEndX  = lastItem.transform[4] + (lastItem.width ?? 0)
      const curStartX = cur.transform[4]
      const fontSize  = Math.abs(cur.transform[0]) || Math.abs(cur.transform[3]) || 10
      const gap       = curStartX - prevEndX

      text += gap > fontSize * 0.1 ? ' ' + cur.str : cur.str
    }

    lastItem = cur
  }

  return text
}

/**
 * Parse a DOCX file using mammoth (lazy-loaded to keep initial bundle small).
 */
export async function parseDocx(file) {
  const { default: mammoth } = await import('mammoth')
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

/**
 * Parse a plain text file using the FileReader API.
 */
export async function parseTxt(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = () => reject(new Error('Failed to read text file'))
    reader.readAsText(file, 'UTF-8')
  })
}

/**
 * Parse a Markdown file — reads as text then strips all Markdown syntax,
 * leaving only the prose words suitable for speed reading.
 */
export async function parseMd(file) {
  const raw = await parseTxt(file)
  return stripMarkdown(raw)
}

/**
 * Strip Markdown syntax, returning clean prose text.
 * Order matters: code blocks first (before inline rules touch backticks).
 */
function stripMarkdown(text) {
  return text
    // Fenced code blocks (``` or ~~~) — drop the whole block
    .replace(/^`{3}[\s\S]*?`{3}/gm, '')
    .replace(/^~{3}[\s\S]*?~{3}/gm, '')
    // Inline code — keep the code text, strip backticks
    .replace(/`([^`]+)`/g, '$1')
    // HTML tags
    .replace(/<[^>]+>/g, '')
    // Setext-style headings (underline with === or ---)
    .replace(/^[=-]{3,}\s*$/gm, '')
    // ATX headings (# ## ### …)
    .replace(/^#{1,6}\s+/gm, '')
    // Images — drop entirely (alt text rarely useful for reading)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    // Links — keep the link text, drop the URL
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // Reference-style links [text][ref] — keep text
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
    // Bold + italic ***text*** or ___text___
    .replace(/(\*{3}|_{3})(.+?)\1/g, '$2')
    // Bold **text** or __text__
    .replace(/(\*{2}|_{2})(.+?)\1/g, '$2')
    // Italic *text* or _text_
    .replace(/([*_])(.+?)\1/g, '$2')
    // Strikethrough ~~text~~
    .replace(/~~(.+?)~~/g, '$1')
    // Blockquotes (> )
    .replace(/^>\s?/gm, '')
    // Horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Unordered list markers (- * +)
    .replace(/^[\s]*[-*+]\s+/gm, '')
    // Ordered list markers (1. 2. …)
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Footnotes [^1] or [^note]
    .replace(/\[\^[^\]]*\]/g, '')
    // Table separator rows (| --- | --- |)
    .replace(/^\|?[\s:|-]+\|[\s:|-]*\|?\s*$/gm, '')
    // Table pipe characters
    .replace(/\|/g, ' ')
    // Collapse multiple blank lines to one
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Fetch a URL via a CORS proxy and extract the article text using
 * @mozilla/readability — the same engine Firefox Reader View uses.
 *
 * Returns { title, text } so callers can display a meaningful filename.
 */
export async function parseUrl(url) {
  // Validate URL format before hitting the network
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    throw new Error('Please enter a valid URL (e.g. https://example.com/article).')
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only http:// and https:// URLs are supported.')
  }

  // corsproxy.io proxies the request server-side, bypassing browser CORS restrictions.
  const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(url)}`
  let response
  try {
    response = await fetch(proxyUrl)
  } catch {
    throw new Error('Network error — check your internet connection and try again.')
  }
  if (!response.ok) {
    throw new Error(`Could not fetch page (HTTP ${response.status}). The site may block proxies.`)
  }

  const html = await response.text()

  // Parse the HTML string into a real DOM so Readability can traverse it.
  const doc = new DOMParser().parseFromString(html, 'text/html')

  // Set the base URI so Readability can resolve relative links/images correctly.
  const base = doc.createElement('base')
  base.href = url
  doc.head.prepend(base)

  const { Readability } = await import('@mozilla/readability')
  const article = new Readability(doc).parse()

  if (!article?.textContent?.trim()) {
    throw new Error(
      'Could not extract readable text from this page. ' +
      'It may require JavaScript to render, or may be behind a login.'
    )
  }

  return {
    title: article.title?.trim() || parsed.hostname,
    text:  article.textContent.trim(),
  }
}

/**
 * Route a File to the correct parser based on MIME type and extension.
 */
export async function parseFile(file) {
  const name = file.name.toLowerCase()
  const type = file.type

  const isPdf  = type === 'application/pdf' || name.endsWith('.pdf')
  const isDocx = type.includes('wordprocessingml') || name.endsWith('.docx')
  const isMd   = type === 'text/markdown' || name.endsWith('.md')
  const isTxt  = type === 'text/plain' || name.endsWith('.txt')

  if (isPdf)  return parsePdf(file)
  if (isDocx) return parseDocx(file)
  if (isMd)   return parseMd(file)
  if (isTxt)  return parseTxt(file)

  throw new Error(`Unsupported file type: "${file.name}". Please upload a PDF, TXT, DOCX, or MD file.`)
}
