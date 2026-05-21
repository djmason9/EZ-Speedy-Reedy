<template>
  <div class="word-display-container">
    <div class="h-line" />

    <!-- Vertical focal-point marker — only meaningful for single-word mode -->
    <div v-if="chunk.length <= 1" class="v-line" />

    <!-- ── Single-word: ORP flex trick, pivot pinned to screen center ── -->
    <div v-if="chunk.length <= 1" class="word-row single" :class="{ dim: !hasContent }">
      <span class="before">{{ single.before }}</span>
      <span class="pivot">{{ single.pivot }}</span>
      <span class="after">{{ single.after }}</span>
    </div>

    <!-- ── Multi-word: plain text only, no pivot highlight ── -->
    <!--
      Each word is a flex-item <span>; gap provides word spacing.
      No ORP highlight in multi-word mode — only single-word mode uses it.
    -->
    <div v-else class="word-row multi" :style="{ fontSize: multiFontSize }">
      <span v-for="(word, i) in chunk" :key="i" class="word-unit plain">{{ word }}</span>
    </div>

    <div class="h-line" />

    <transition name="fade">
      <div v-if="!hasContent" class="placeholder">
        Upload a file to begin reading
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** Array of words to display. Empty array when nothing is loaded. */
  chunk: {
    type: Array,
    default: () => []
  }
})

const hasContent = computed(() => props.chunk.length > 0)

/** Split a word into before / pivot / after for ORP highlighting. */
function getParts(word) {
  if (!word) return { before: '', pivot: '·', after: '' }
  const mid = Math.floor(word.length / 2)
  return { before: word.slice(0, mid), pivot: word[mid], after: word.slice(mid + 1) }
}

/** Parts for the single-word ORP display (or placeholder). */
const single = computed(() =>
  props.chunk.length ? getParts(props.chunk[0]) : { before: '', pivot: '·', after: '' }
)

/**
 * Scale font down as chunk grows so the words fit comfortably on one line.
 * 1 word → handled by CSS clamp; 2–4 words → progressively smaller.
 */
const multiFontSize = computed(() => {
  const sizes = { 2: 'clamp(36px, 5vw, 58px)', 3: 'clamp(28px, 4vw, 46px)', 4: 'clamp(22px, 3.2vw, 38px)' }
  return sizes[props.chunk.length] ?? 'clamp(22px, 3.2vw, 38px)'
})
</script>

<style scoped>
.word-display-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 48px 0;
  width: 100%;
  min-height: 200px;
}

/* ── Horizontal rules ──────────────────────────────────────────────────────── */
.h-line {
  width: 100%;
  height: 1px;
  background: var(--border-light);
  flex-shrink: 0;
}

/* ── Vertical focal-point marker (single-word only) ───────────────────────── */
.v-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--border-light);
  pointer-events: none;
  z-index: 0;
}

/* ── Shared row styles ─────────────────────────────────────────────────────── */
.word-row {
  display: flex;
  align-items: baseline;
  width: 100%;
  padding: 16px 40px;
  font-family: Georgia, 'Times New Roman', serif;
  line-height: 1.1;
  position: relative;
  z-index: 1;
  transition: opacity 0.1s;
}

.word-row.dim { opacity: 0.25; }

/* ── Single-word ORP layout ────────────────────────────────────────────────── */
/*
  The flex trick: .before and .after each take flex:1 (equal remaining space),
  forcing the .pivot character to always sit at the container's horizontal midpoint.
*/
.word-row.single {
  font-size: clamp(48px, 7vw, 80px);
}

.word-row.single .before {
  flex: 1;
  text-align: right;
  color: var(--text);
  letter-spacing: 0.01em;
}

.word-row.single .pivot {
  flex: none;
  color: var(--pivot);
  font-weight: 600;
}

.word-row.single .after {
  flex: 1;
  text-align: left;
  color: var(--text);
  letter-spacing: 0.01em;
}

/* ── Multi-word layout ─────────────────────────────────────────────────────── */
.word-row.multi {
  justify-content: center;
  white-space: nowrap;
  gap: 0.3em; /* word spacing via CSS gap — reliable across all browsers */
}

/* Each word is a flex item; before/pivot/after are inline inside it */
.word-unit {
  display: inline-flex;
  align-items: baseline;
}

.plain {
  color: var(--text);
}

.pivot {
  color: var(--pivot);
  font-weight: 600;
}

/* ── Placeholder ───────────────────────────────────────────────────────────── */
.placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--text-muted);
  font-size: 1.1rem;
  white-space: nowrap;
  pointer-events: none;
  z-index: 2;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from,  .fade-leave-to      { opacity: 0; }
</style>
