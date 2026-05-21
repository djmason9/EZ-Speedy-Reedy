<template>
  <Teleport to="body">
    <div class="backdrop" @click.self="$emit('close')">
      <div class="panel" role="dialog" aria-modal="true" aria-label="Text preview">

        <!-- Header -->
        <div class="panel-header">
          <div class="header-left">
            <i class="bi bi-text-left"></i>
            <span>Text Preview</span>
            <span class="word-count">{{ words.length.toLocaleString() }} words</span>
          </div>
          <button class="btn-close" @click="$emit('close')" title="Close (Esc)">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Search bar -->
        <div class="search-bar">
          <div class="search-input-wrap">
            <i class="bi bi-search search-icon"></i>
            <input
              ref="searchEl"
              v-model="inputValue"
              type="text"
              class="search-input"
              placeholder="Search for a word or phrase…"
              @keydown.enter="commitSearch"
              @keydown.stop
            />
            <button v-if="inputValue" class="btn-clear-search" @click="clearSearch" title="Clear search">
              <i class="bi bi-x"></i>
            </button>
          </div>

          <button class="btn-search" @click="commitSearch" title="Search">
            <i class="bi bi-search"></i> Search
          </button>

          <!-- Match navigation (shown once a search has been committed) -->
          <div class="match-nav" v-if="query">
            <span class="match-count" :class="{ 'no-results': matchResults.length === 0 }">
              {{ matchResults.length === 0 ? 'No matches' : `${matchCursor + 1} / ${matchResults.length}` }}
            </span>
            <button class="nav-btn" @click="prevMatch" :disabled="matchResults.length < 2" title="Previous match">
              <i class="bi bi-chevron-up"></i>
            </button>
            <button class="nav-btn" @click="nextMatch" :disabled="matchResults.length < 2" title="Next match">
              <i class="bi bi-chevron-down"></i>
            </button>
          </div>
        </div>

        <!-- Tip -->
        <div class="panel-tip">
          <i class="bi bi-cursor-text"></i>
          Click any word to jump to that position and start reading from there.
        </div>

        <!-- Scrollable word body -->
        <div class="panel-body" ref="bodyEl">
          <span
            v-for="(word, i) in words"
            :key="i"
            :ref="el => captureRef(el, i)"
            class="word"
            :class="{
              current:       i === currentIndex,
              past:          i < currentIndex,
              match:         matchSet.has(i),
              'match-focus': focusedMatchSet.has(i),
            }"
            @click="select(i)"
          >{{ word }}&thinsp;</span>
        </div>

        <!-- Footer -->
        <div class="panel-footer">
          <span class="position-label">
            Currently at word <strong>{{ currentIndex + 1 }}</strong> of {{ words.length.toLocaleString() }}
          </span>
          <button class="btn-start" @click="$emit('close')">
            <i class="bi bi-play-fill"></i> Close &amp; Start Reading
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  words:        { type: Array,  required: true },
  currentIndex: { type: Number, required: true }
})

const emit = defineEmits(['close', 'jump-to'])

// ── Refs ────────────────────────────────────────────────────────────────────
const bodyEl   = ref(null)
const searchEl = ref(null)
let   currentEl = null   // DOM node for the current reading position

// ── Search state ─────────────────────────────────────────────────────────────
const inputValue  = ref('')   // raw text in the input box
const query       = ref('')   // committed search term (set only on Search button / Enter)
const matchCursor = ref(0)    // which match is currently focused

/**
 * Find all phrase matches in the word array.
 *
 * The query is split into tokens. For a single token, any word containing
 * that token (substring, case-insensitive) counts as a match. For multiple
 * tokens, we look for a run of consecutive words where each word contains
 * the corresponding query token — so "quick brown" finds ["quick","brown"]
 * appearing back-to-back anywhere in the text.
 *
 * Returns an array of { start, end } objects (both indices inclusive).
 */
const matchResults = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []

  const tokens = q.split(/\s+/).filter(Boolean)
  const n      = tokens.length
  const words  = props.words
  const results = []

  for (let i = 0; i <= words.length - n; i++) {
    let hit = true
    for (let j = 0; j < n; j++) {
      if (!words[i + j].toLowerCase().includes(tokens[j])) { hit = false; break }
    }
    if (hit) results.push({ start: i, end: i + n - 1 })
  }
  return results
})

// All word indices belonging to ANY match — shown with yellow background
const matchSet = computed(() => {
  const s = new Set()
  for (const { start, end } of matchResults.value)
    for (let i = start; i <= end; i++) s.add(i)
  return s
})

// Word indices belonging to the FOCUSED match — shown in gold
const focusedMatchSet = computed(() => {
  const s = new Set()
  if (matchResults.value.length) {
    const { start, end } = matchResults.value[matchCursor.value]
    for (let i = start; i <= end; i++) s.add(i)
  }
  return s
})

// Commit the typed input as the active search query
function commitSearch() {
  query.value = inputValue.value.trim()
  matchCursor.value = 0
  if (matchResults.value.length) scrollToWordIndex(matchResults.value[0].start)
}

function nextMatch() {
  if (!matchResults.value.length) return
  matchCursor.value = (matchCursor.value + 1) % matchResults.value.length
  scrollToWordIndex(matchResults.value[matchCursor.value].start)
}

function prevMatch() {
  if (!matchResults.value.length) return
  matchCursor.value = (matchCursor.value - 1 + matchResults.value.length) % matchResults.value.length
  scrollToWordIndex(matchResults.value[matchCursor.value].start)
}

function clearSearch() {
  inputValue.value = ''
  query.value = ''
  searchEl.value?.focus()
}

async function scrollToWordIndex(index) {
  await nextTick()
  const el = bodyEl.value?.querySelectorAll('.word')[index]
  el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
}

// ── Ref capture ──────────────────────────────────────────────────────────────
function captureRef(el, i) {
  if (i === props.currentIndex) currentEl = el
}

// ── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  await nextTick()
  // Scroll to current reading position on open
  currentEl?.scrollIntoView({ block: 'center', behavior: 'instant' })
  // Auto-focus the search input
  searchEl.value?.focus()
})

function handleKey(e) {
  if (e.key === 'Escape') {
    if (inputValue.value || query.value) {
      // First Esc clears search; second Esc closes the panel
      clearSearch()
    } else {
      emit('close')
    }
  }
}
onMounted(() => window.addEventListener('keydown', handleKey))
onUnmounted(() => window.removeEventListener('keydown', handleKey))

// ── Select word ───────────────────────────────────────────────────────────────
function select(index) {
  emit('jump-to', index)
  emit('close')
}
</script>

<style scoped>
/* ── Backdrop ──────────────────────────────────────────────────────────────── */
.backdrop {
  position: fixed;
  inset: 0;
  background: var(--backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1.5rem;
  backdrop-filter: blur(6px);
  animation: fadeIn 0.15s ease;
}
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

/* ── Panel ─────────────────────────────────────────────────────────────────── */
.panel {
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  width: min(880px, 100%);
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.18s ease;
  overflow: hidden;
}
@keyframes slideUp {
  from { transform: translateY(16px); opacity: 0 }
  to   { transform: translateY(0);    opacity: 1 }
}

/* ── Header ────────────────────────────────────────────────────────────────── */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  background: var(--surface-2);
}
.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  color: var(--text);
}
.header-left .bi { color: var(--accent-light); font-size: 1.1rem; }
.word-count { font-weight: 400; font-size: 0.8rem; color: var(--text-muted); }
.btn-close {
  background: var(--surface-3);
  color: var(--text-muted);
  border: 1px solid var(--border-light);
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  padding: 0; flex-shrink: 0;
}
.btn-close:hover { background: var(--border-light); color: var(--text); }

/* ── Search bar ────────────────────────────────────────────────────────────── */
.search-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface-2);
  flex-shrink: 0;
}
.search-input-wrap { position: relative; flex: 1; display: flex; align-items: center; }
.search-icon { position: absolute; left: 0.75rem; color: var(--text-dim); font-size: 0.9rem; pointer-events: none; }
.search-input {
  width: 100%;
  padding: 0.5rem 2.25rem;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  background: var(--surface);
  color: var(--text);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.search-input::placeholder { color: var(--text-dim); }
.search-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
.btn-clear-search {
  position: absolute; right: 0.5rem;
  background: none; color: var(--text-dim);
  padding: 2px 4px; font-size: 1rem; border-radius: 4px; line-height: 1;
}
.btn-clear-search:hover { color: var(--text-muted); background: var(--surface-3); }

/* Match navigation */
.match-nav { display: flex; align-items: center; gap: 0.3rem; flex-shrink: 0; }
.match-count { font-size: 0.8rem; color: var(--text-muted); white-space: nowrap; min-width: 58px; text-align: right; }
.match-count.no-results { color: var(--pivot); }
.btn-search {
  background: var(--accent);
  color: #fff; font-weight: 600;
  padding: 0.45rem 1rem; border-radius: 8px;
  display: flex; align-items: center; gap: 0.35rem;
  white-space: nowrap; flex-shrink: 0; font-size: 0.9rem;
  box-shadow: 0 0 10px var(--accent-glow);
}
.btn-search:hover { background: var(--accent-hover); }
.nav-btn {
  background: var(--surface-3); color: var(--text-muted);
  border: 1px solid var(--border-light);
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 6px; padding: 0; font-size: 0.8rem;
}
.nav-btn:hover:not(:disabled) { background: var(--border-light); color: var(--text); }
.nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* ── Tip ───────────────────────────────────────────────────────────────────── */
.panel-tip {
  padding: 0.45rem 1.25rem; font-size: 0.78rem;
  color: var(--text-dim); background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: 0.4rem; flex-shrink: 0;
}

/* ── Body ──────────────────────────────────────────────────────────────────── */
.panel-body {
  flex: 1; overflow-y: auto;
  padding: 1.5rem 1.75rem;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.1rem; line-height: 2.1;
  color: var(--text); word-spacing: 0.05em;
}
.panel-body::-webkit-scrollbar { width: 6px; }
.panel-body::-webkit-scrollbar-track { background: var(--surface); }
.panel-body::-webkit-scrollbar-thumb { background: var(--surface-3); border-radius: 3px; }
.panel-body::-webkit-scrollbar-thumb:hover { background: var(--border-light); }

.word { display: inline; border-radius: 3px; cursor: pointer; padding: 1px 2px; transition: background 0.1s; }
.word:hover        { background: var(--surface-3); color: var(--accent-light); }
.word.past         { color: var(--text-dim); }
.word.current      { background: var(--accent); color: #fff; }
.word.match        { background: var(--match-bg); color: var(--text); }
.word.match-focus  { background: var(--match-focus-bg); color: var(--match-focus-text); font-weight: 600; }
.word.current.match, .word.current.match-focus { background: var(--accent); color: #fff; }

/* ── Footer ────────────────────────────────────────────────────────────────── */
.panel-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.9rem 1.25rem;
  border-top: 1px solid var(--border);
  background: var(--surface-2);
  flex-shrink: 0; gap: 1rem;
}
.position-label { font-size: 0.85rem; color: var(--text-muted); }
.position-label strong { color: var(--accent-light); }
.btn-start {
  background: var(--accent); color: #fff; font-weight: 600;
  padding: 0.5rem 1.25rem;
  display: flex; align-items: center; gap: 0.4rem;
  box-shadow: 0 0 12px var(--accent-glow);
}
.btn-start:hover { background: var(--accent-hover); }
</style>
