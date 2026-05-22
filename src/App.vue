<template>
  <div class="app">
    <!-- Header -->
    <header class="app-header">
      <h1 class="logo"><i class="bi bi-lightning-charge-fill"></i> EZ Speedy Reedy</h1>
      <span v-if="fileName" class="file-name">
        <i class="bi bi-file-earmark-text"></i>{{ fileName }}
      </span>
    </header>

    <!-- Main content -->
    <main class="app-main">
      <!-- File upload — always accessible; shrinks once content is loaded -->
      <section class="upload-section" :class="{ compact: hasWords }">
        <FileUploader :has-content="hasWords" @text-loaded="onTextLoaded" />
      </section>

      <!-- Word display -->
      <section class="display-section">
        <WordDisplay :chunk="currentChunk" />
      </section>
    </main>

    <!-- Controls — pinned to bottom -->
    <footer class="app-footer">
      <SpeedControl
        :wpm="wpm"
        :chunk-size="chunkSize"
        :is-playing="isPlaying"
        :has-words="hasWords"
        :current="progress.current"
        :total="progress.total"
        @wpm-change="setWpm"
        @chunk-change="setChunkSize"
        @play-pause="togglePlay"
        @restart="restart"
        @show-preview="showPreview = true"
      />

      <TextPreview
        v-if="showPreview"
        :words="words"
        :current-index="currentIndex"
        @close="showPreview = false"
        @jump-to="jumpTo"
      />
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import FileUploader from '@/components/FileUploader.vue'
import WordDisplay  from '@/components/WordDisplay.vue'
import SpeedControl from '@/components/SpeedControl.vue'
import TextPreview  from '@/components/TextPreview.vue'
import { useReader } from '@/composables/useReader'

const {
  words,
  currentChunk,
  currentIndex,
  isPlaying,
  wpm,
  chunkSize,
  progress,
  hasWords,
  loadText,
  togglePlay,
  restart,
  jumpTo,
  setWpm,
  setChunkSize,
} = useReader()

const showPreview = ref(false)
const fileName    = ref('')

function onTextLoaded(text, name) {
  loadText(text)
  fileName.value = name
}

// ── Spacebar handler ────────────────────────────────────────────────────────
// Must preventDefault so the browser doesn't scroll the page when Space is pressed
function handleKeydown(e) {
  // Don't hijack keys while focus is inside a form element
  if (e.target.matches('input, textarea, button')) return

  if (e.code === 'Space') {
    e.preventDefault()
    togglePlay()
  } else if (e.code === 'ArrowRight') {
    e.preventDefault()
    setWpm(Math.min(1000, wpm.value + 25))
  } else if (e.code === 'ArrowLeft') {
    e.preventDefault()
    setWpm(Math.max(60, wpm.value - 25))
  } else if (e.code === 'ArrowUp') {
    e.preventDefault()
    setChunkSize(chunkSize.value + 1)
  } else if (e.code === 'ArrowDown') {
    e.preventDefault()
    setChunkSize(chunkSize.value - 1)
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── Header ──────────────────────────────────────────────────────────────── */
.app-header {
  padding: 0.75rem 2rem;
  background: var(--header-bg);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.file-name {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.3rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 50ch;
}

.logo {
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
}

.logo .bi-lightning-charge-fill {
  color: var(--logo-icon);
}

/* ── Main ─────────────────────────────────────────────────────────────────── */
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 2rem;
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
  gap: 1rem;
}

/* Upload section */
.upload-section {
  transition: all 0.4s ease;
}

.upload-section.compact {
  opacity: 0.6;
  transform: scale(0.98);
}

.upload-section.compact:hover {
  opacity: 1;
  transform: scale(1);
}

/* ── Display ──────────────────────────────────────────────────────────────── */
.display-section {
  flex: 1;
  background: var(--surface);
  border-radius: 14px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  border: 1px solid var(--border);
}

/* ── Footer ──────────────────────────────────────────────────────────────── */
.app-footer {
  background: var(--footer-bg);
  border-top: 1px solid var(--border);
  backdrop-filter: blur(8px);
}
</style>
