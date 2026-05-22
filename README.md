# ⚡ EZ Speedy Reedy

A browser-based speed reading app that displays words one at a time (or in chunks) using the **Optimal Recognition Point (ORP)** technique — the center letter of each word is pinned at a fixed focal point and highlighted in coral red, training your eye to stop wandering and dramatically increase reading speed.

---

## Features

- **ORP word display** — center letter highlighted, word always aligned to the same focal point on screen
- **Word chunking** — flash 1, 2, 3, or 4 words at a time; WPM stays constant regardless of chunk size
- **File upload** — drag-and-drop or browse; supports PDF, DOCX, TXT, and Markdown (`.md`)
- **Adjustable speed** — default 350 WPM, range 60–1000 WPM via slider, buttons, or arrow keys
- **Text preview** — browse the full document before reading, search for a word or phrase, and click any word to jump directly to that starting point
- **Phrase search** — multi-word queries find consecutive word sequences across the entire text
- **PDF footer stripping** — page numbers and running footers are automatically excluded
- **Smart PDF parsing** — uses position data to reconstruct words correctly even when PDFs store text character-by-character
- **Progress tracking** — current word position and percentage shown in real time
- **Dark navy UI** — clean, distraction-free dark theme with blue accents

---

## Tech Stack

| Layer | Tool |
|---|---|
| Build | [Vite](https://vitejs.dev/) |
| Framework | [Vue 3](https://vuejs.org/) (Composition API) |
| PDF parsing | [pdfjs-dist](https://mozilla.github.io/pdf.js/) v4 |
| DOCX parsing | [mammoth](https://github.com/mwilliamson/mammoth.js) (lazy-loaded) |
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

## How to Use

### 1. Load a file
Drag and drop a file onto the upload area, or click it to browse. Supported formats:

| Format | Extension | Notes |
|---|---|---|
| PDF | `.pdf` | Text-layer PDFs only; scanned images are not supported |
| Word | `.docx` | Full document text extracted |
| Plain text | `.txt` | UTF-8 encoded |
| Markdown | `.md` | Markdown syntax is stripped; only prose is read |

You can load a new file at any time — it replaces the current text and resets to the beginning.

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

---

## Project Structure

```
SpeedReader/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.vue                  # Root component; all keyboard listeners
    ├── main.js                  # Vue app entry point
    ├── style.css                # Global CSS variables (dark theme tokens) and resets
    ├── components/
    │   ├── FileUploader.vue     # Drag-drop file input; routes to correct parser
    │   ├── WordDisplay.vue      # ORP word renderer — single word or multi-word chunk
    │   ├── SpeedControl.vue     # WPM slider, chunk size, play/pause, restart, preview
    │   └── TextPreview.vue      # Full-text browser with phrase search and jump-to
    ├── composables/
    │   └── useReader.js         # All reading state and timing logic
    └── utils/
        ├── parsers.js           # PDF (position-aware), DOCX, TXT, and Markdown parsers
        └── tokenizer.js         # Splits raw text into a word array
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
