# ⚡ EZ Speedy Reedy

A browser-based speed reading app that displays words one at a time (or in chunks) using the **Optimal Recognition Point (ORP)** technique — the center letter of each word is pinned at a fixed focal point and highlighted in coral red, training your eye to stop wandering and dramatically increase reading speed.

---

## Features

- **ORP word display** — center letter highlighted, word always aligned to the same focal point on screen
- **Word chunking** — flash 1, 2, 3, or 4 words at a time; WPM stays constant regardless of chunk size
- **File upload** — drag-and-drop or browse; supports PDF, DOCX, TXT, and Markdown (`.md`)
- **URL import** — paste any article or blog URL and the page is fetched and parsed automatically (uses Mozilla Readability, same engine as Firefox Reader View)
- **Adjustable speed** — default 350 WPM, range 60–1000 WPM via slider, buttons, or arrow keys
- **Text preview** — browse the full document before reading, search for a word or phrase, and click any word to jump directly to that starting point
- **Phrase search** — multi-word queries find consecutive word sequences across the entire text
- **PDF footer stripping** — page numbers and running footers are automatically excluded
- **Smart PDF parsing** — uses position data to reconstruct words correctly even when PDFs store text character-by-character
- **Progress tracking** — current word position and percentage shown in real time
- **PWA — works offline** — install to your iPhone or iPad home screen; reads files and previously fetched articles with no internet connection
- **Mobile-friendly** — touch-optimized controls, safe-area insets for iPhone notch, responsive layout down to small phone screens

---

## Tech Stack

| Layer | Tool |
|---|---|
| Build | [Vite](https://vitejs.dev/) |
| Framework | [Vue 3](https://vuejs.org/) (Composition API) |
| PDF parsing | [pdfjs-dist](https://mozilla.github.io/pdf.js/) v4 |
| DOCX parsing | [mammoth](https://github.com/mwilliamson/mammoth.js) (lazy-loaded) |
| Web page parsing | [@mozilla/readability](https://github.com/mozilla/readability) + [corsproxy.io](https://corsproxy.io) |
| Offline / PWA | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) + Workbox |
| Icons | [Bootstrap Icons](https://icons.getbootstrap.com/) |

---

## Getting Started

**Requirements:** Node.js 18+

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

```bash
# Production build
npm run build

# Preview the production build locally
npm run preview
```

---

## Deploying to Netlify (free, no account required)

This is a fully static app — no server needed. The build output is just files.

### Option 1 — Netlify Drop (fastest, ~1 minute)

1. Run `npm run build` — this creates a `dist/` folder
2. Go to **[app.netlify.com/drop](https://app.netlify.com/drop)**
3. Drag the `dist/` folder onto the page
4. Netlify gives you a live `https://xxxx.netlify.app` URL instantly

No account needed for a temporary URL. Create a free account to keep the URL permanent and re-deploy by dragging again.

### Option 2 — Netlify CLI (re-deploy in one command)

```bash
npm install -g netlify-cli
netlify deploy --dir=dist --prod
```

After the first deploy you can redeploy any time with that single command.

### Option 3 — GitHub + Auto-deploy

Connect your GitHub repo to Netlify and it will rebuild and redeploy automatically every time you push. Set the build command to `npm run build` and the publish directory to `dist`.

---

## Using on iPhone / iPad (PWA — offline capable)

Once deployed to Netlify (or any HTTPS host):

1. Open the URL in **Safari** on your iPhone or iPad
2. Tap the **Share** button → **Add to Home Screen**
3. Open the app from your home screen **while still online** — wait a few seconds for the service worker to finish caching everything
4. That's it. The app now works **fully offline** — no Wi-Fi, no data, nothing

### What works offline
- Reading files you upload (PDF, DOCX, TXT, Markdown)
- Pasting text
- Articles you've fetched via URL in the past week (cached automatically)
- All controls, preview, search

### What requires internet
- Fetching new URLs (needs to reach the CORS proxy and the target site)

### If something stops working offline

The service worker (the piece that makes offline work) can sometimes get into a bad state, especially after an app update. To fix it:

1. On iPhone: **Settings → Safari → Advanced → Website Data** → find the site → delete it
2. Open the site in Safari again while online and wait a few seconds
3. Re-add to home screen

Or in Safari on the device: hold the reload button → **Reload Without Content Blockers**, then hard-reload (pull down to refresh).

---

## How to Use

### 1. Load content
Choose a tab in the loader card:

**Upload File** — drag and drop or click to browse. Supported formats:

| Format | Extension | Notes |
|---|---|---|
| PDF | `.pdf` | Text-layer PDFs only; scanned images are not supported |
| Word | `.docx` | Full document text extracted |
| Plain text | `.txt` | UTF-8 encoded |
| Markdown | `.md` | Markdown syntax is stripped; only prose is read |

**URL** — paste any article or blog URL and click **Fetch & Read** (or press Enter). The page is fetched via a CORS proxy and parsed with Mozilla Readability, extracting only the article body. Works well on news sites, Wikipedia, Medium, Substack, and most static article pages. Does not work on paywalled pages, login-required pages, or SPAs that render content via JavaScript after load.

**Paste Text** — paste raw text directly into the box and click **Start Reading**.

You can load new content at any time — it replaces the current text and resets to the beginning.

### 2. Start reading
Press **Play** or hit **Space** — words flash at the center of the screen at 350 WPM by default.

### 3. Adjust speed
Use the speed slider or the **−** / **+** buttons to change WPM. Left/right arrow keys also work while reading.

### 4. Change words per flash (chunking)
Use the **Words per flash** control or the up/down arrow keys to show 1–4 words per flash. Speed in WPM stays constant — the flash duration scales proportionally.

### 5. Choose a starting point
Click **Preview** to open the full-text browser:
- Scroll through the entire document
- Type a word or phrase and click **Search** (or press Enter) to find and highlight all matches
- Navigate between matches with the **↑ ↓** arrow buttons
- Click any word to jump to that position, then close and start reading from there

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `→` | Speed up +25 WPM |
| `←` | Slow down −25 WPM |
| `↑` | +1 word per flash (max 4) |
| `↓` | −1 word per flash (min 1) |
| `Enter` *(in preview search)* | Run search / go to next match |
| `Esc` *(in preview)* | Clear search, then close preview |

Keyboard shortcuts are hidden on mobile (no physical keyboard).

---

## Project Structure

```
EZ-Speedy-Reedy/
├── index.html               # App shell; PWA meta tags, apple-touch-icon, viewport-fit
├── package.json
├── vite.config.js           # Vite + PWA plugin config; Workbox precache & runtime cache
├── public/
│   ├── icon.svg             # App icon source (sage green lightning bolt)
│   ├── icon-192.png         # PWA manifest icon (192×192)
│   ├── icon-512.png         # PWA manifest icon (512×512, maskable)
│   └── apple-touch-icon.png # iOS home screen icon (180×180)
└── src/
    ├── App.vue              # Root component; keyboard listeners; safe-area layout
    ├── main.js              # Vue app entry point
    ├── style.css            # Global CSS variables (sepia theme) + mobile base styles
    ├── components/
    │   ├── FileUploader.vue # Upload / URL / Paste tabs; drag-drop; URL fetch + Readability
    │   ├── WordDisplay.vue  # ORP word renderer — single word or multi-word chunk
    │   ├── SpeedControl.vue # WPM slider, chunk size, play/pause, restart, preview
    │   └── TextPreview.vue  # Full-text browser with phrase search and jump-to
    ├── composables/
    │   └── useReader.js     # All reading state and timing logic
    └── utils/
        ├── parsers.js       # PDF, DOCX, TXT, Markdown, and URL parsers
        └── tokenizer.js     # Splits raw text into a word array
```

---

## How ORP Alignment Works

Each word is split into three `<span>` elements:

```
[ before ][ PIVOT ][ after ]
```

Both the `before` and `after` spans have `flex: 1`, which forces them to share the remaining space equally. The `pivot` (center letter, `Math.floor(word.length / 2)`) always ends up at the exact horizontal midpoint of the screen regardless of word length — your eye never has to move.

For multi-word chunks, words are displayed side by side centered as a group. Each word still has its own pivot letter highlighted. Font size scales down automatically as chunk count increases to keep everything on one line.

---

## How the PWA / Offline Works

The build step runs Workbox (via `vite-plugin-pwa`) which generates a service worker (`sw.js`) that precaches every asset in the build output:

| Cached | Why |
|---|---|
| HTML, CSS, JS bundles | Core app shell |
| Bootstrap Icons fonts (`.woff2`, `.woff`) | UI icon glyphs |
| PDF.js worker (`.mjs`, ~2.2 MB) | In-browser PDF parsing |
| App icons (`.png`, `.svg`) | Home screen + favicon |

The service worker uses a **Cache First** strategy for precached assets — requests never hit the network once cached. URL-fetched articles are cached separately for up to 7 days so recently read web pages are available offline too.

> **Important:** Icon files are only added to the precache once (via the manifest icons list). Duplicating them between `includeAssets` and `globPatterns` causes Workbox to silently abort the install, which breaks offline entirely.

---

## Color Palette

Warm Sepia theme — optimized for reading comfort (same principle as Kindle's default palette).

| Token | Value | Use |
|---|---|---|
| `--bg` | `#fdf6e3` | Warm cream page background |
| `--surface` | `#fffdf7` | Cards and panels |
| `--surface-2` | `#f5eedd` | Panel headers/footers |
| `--border` | `#d4c4a0` | Dividers |
| `--accent` | `#5b8a6e` | Buttons, slider, highlights (sage green) |
| `--pivot` | `#b83020` | ORP center letter (deep terracotta) |
| `--text` | `#2c1f0e` | Primary text (rich dark brown) |
| `--text-muted` | `#7a6040` | Secondary text |

---

## Notes

- **Scanned PDFs** (images with no text layer) are not supported. Convert them with OCR first.
- **Large PDFs** may take a few seconds to parse; a loading spinner is shown during extraction.
- mammoth (DOCX parser) is lazy-loaded — it is only downloaded the first time you open a `.docx` file.
- PDF footer detection drops items in the bottom **7%** of each page's height (page numbers, copyright lines, etc.).
- The URL fetch tab requires an internet connection and a CORS proxy (`corsproxy.io`). It will not work on pages that require login or that render content via JavaScript after load.
