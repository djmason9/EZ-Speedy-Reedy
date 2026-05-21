<template>
  <div class="loader-card">

    <!-- ── Tab switcher ────────────────────────────────────────────────────── -->
    <div class="tabs">
      <button
        class="tab-btn"
        :class="{ active: mode === 'file' }"
        @click="mode = 'file'"
      >
        <i class="bi bi-file-earmark-arrow-up"></i> Upload File
      </button>
      <button
        class="tab-btn"
        :class="{ active: mode === 'paste' }"
        @click="mode = 'paste'; error = null"
      >
        <i class="bi bi-clipboard"></i> Paste Text
      </button>
    </div>

    <!-- ── Upload mode ─────────────────────────────────────────────────────── -->
    <div
      v-if="mode === 'file'"
      class="uploader"
      :class="{ dragging: isDragging, loading: isLoading }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerInput"
    >
      <!-- Hidden file input -->
      <input
        ref="fileInput"
        type="file"
        accept=".pdf,.txt,.docx,.md"
        class="hidden-input"
        @change="handleFileInput"
      />

      <template v-if="!isLoading">
        <div class="upload-icon">
          <i :class="hasContent ? 'bi bi-arrow-repeat' : 'bi bi-file-earmark-arrow-up'"></i>
        </div>
        <p class="upload-title">{{ hasContent ? 'Load a different file' : 'Drop a file here, or click to browse' }}</p>
        <p class="upload-sub">PDF, TXT, DOCX, or Markdown</p>
      </template>

      <template v-else>
        <div class="spinner" />
        <p class="upload-title">Parsing {{ currentFileName }}…</p>
      </template>
    </div>

    <!-- ── Paste mode ──────────────────────────────────────────────────────── -->
    <div v-else class="paste-area">
      <textarea
        v-model="pasteText"
        class="paste-input"
        placeholder="Paste your text here…"
        rows="6"
        spellcheck="false"
      ></textarea>
      <button
        class="btn-read"
        :disabled="!pasteText.trim()"
        @click="submitPaste"
      >
        <i class="bi bi-play-fill"></i> Start Reading
      </button>
    </div>

    <!-- ── Error banner ────────────────────────────────────────────────────── -->
    <transition name="slide">
      <div v-if="error" class="error-banner">
        <span><i class="bi bi-exclamation-triangle-fill"></i> {{ error }}</span>
        <button class="dismiss" @click="error = null"><i class="bi bi-x-lg"></i></button>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { parseFile } from '@/utils/parsers'

defineProps({
  /** True once text has been loaded — changes upload label */
  hasContent: { type: Boolean, default: false }
})

const emit = defineEmits(['text-loaded'])

// ── State ───────────────────────────────────────────────────────────────────
const mode           = ref('file')   // 'file' | 'paste'
const pasteText      = ref('')
const fileInput      = ref(null)
const isDragging     = ref(false)
const isLoading      = ref(false)
const error          = ref(null)
const currentFileName = ref('')

// ── File upload ─────────────────────────────────────────────────────────────
function triggerInput() {
  if (!isLoading.value) fileInput.value?.click()
}

function handleDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

function handleFileInput(event) {
  const file = event.target?.files?.[0]
  if (file) processFile(file)
  event.target.value = ''
}

async function processFile(file) {
  error.value           = null
  isLoading.value       = true
  currentFileName.value = file.name

  try {
    const rawText = await parseFile(file)
    if (!rawText || rawText.trim().length === 0) {
      throw new Error('The file appears to be empty or contains no readable text.')
    }
    emit('text-loaded', rawText, file.name)
  } catch (err) {
    error.value = err.message || 'An unknown error occurred while parsing the file.'
  } finally {
    isLoading.value = false
  }
}

// ── Paste ───────────────────────────────────────────────────────────────────
function submitPaste() {
  const text = pasteText.value.trim()
  if (!text) {
    error.value = 'Please paste some text before clicking Start Reading.'
    return
  }
  error.value    = null
  pasteText.value = ''
  emit('text-loaded', text, 'Pasted text')
}
</script>

<style scoped>
/* ── Outer card ────────────────────────────────────────────────────────────── */
.loader-card {
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--surface);
  overflow: hidden;
}

/* ── Tabs ──────────────────────────────────────────────────────────────────── */
.tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
}

.tab-btn {
  flex: 1;
  padding: 0.6rem 1rem;
  background: var(--surface-2);
  color: var(--text-muted);
  font-size: 0.88rem;
  font-weight: 500;
  border-radius: 0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: background 0.15s, color 0.15s;
}

.tab-btn:first-child { border-radius: 12px 0 0 0; }
.tab-btn:last-child  { border-radius: 0 12px 0 0; border-left: 1px solid var(--border); }

.tab-btn:hover:not(.active) {
  background: var(--surface-3);
  color: var(--text);
}

.tab-btn.active {
  background: var(--surface);
  color: var(--accent);
  font-weight: 600;
}

/* ── Upload drop zone ──────────────────────────────────────────────────────── */
.uploader {
  padding: 1.5rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  user-select: none;
  background: var(--surface);
}

.uploader:hover {
  background: var(--surface-2);
  box-shadow: inset 0 0 0 2px var(--accent);
}

.uploader.dragging {
  background: var(--surface-2);
  box-shadow: inset 0 0 0 2px var(--accent-light), 0 0 0 4px var(--accent-glow);
  scale: 1.005;
}

.uploader.loading {
  cursor: default;
  opacity: 0.8;
}

.hidden-input { display: none; }

.upload-icon {
  font-size: 2rem;
  color: var(--text-muted);
  margin-bottom: 0.4rem;
}

.upload-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.2rem;
}

.upload-sub {
  font-size: 0.82rem;
  color: var(--text-muted);
}

/* Spinner */
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--surface-3);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin: 0 auto 0.6rem;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Paste area ────────────────────────────────────────────────────────────── */
.paste-area {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.25rem 1.25rem;
  background: var(--surface);
}

.paste-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--surface-2);
  color: var(--text);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 0.95rem;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.paste-input::placeholder { color: var(--text-dim); }

.paste-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.btn-read {
  align-self: flex-end;
  background: var(--accent);
  color: #fff;
  font-weight: 600;
  padding: 0.5rem 1.4rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 0 12px var(--accent-glow);
}
.btn-read:hover:not(:disabled) {
  background: var(--accent-hover);
  box-shadow: 0 0 18px var(--accent-glow);
}
.btn-read:disabled { opacity: 0.35; cursor: not-allowed; }

/* ── Error banner ──────────────────────────────────────────────────────────── */
.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin: 0 1rem 0.75rem;
  padding: 0.6rem 1rem;
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--error-text);
}

.dismiss {
  background: none;
  border: none;
  color: var(--error-text);
  font-size: 1rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
}

.slide-enter-active,
.slide-leave-active { transition: opacity 0.25s, transform 0.25s; }
.slide-enter-from,
.slide-leave-to     { opacity: 0; transform: translateY(-6px); }
</style>
