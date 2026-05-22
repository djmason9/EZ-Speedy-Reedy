<template>
  <div class="speed-control">
    <!-- Progress indicator -->
    <div class="progress-info">
      <span v-if="total > 0">
        Word <strong>{{ current }}</strong> of <strong>{{ total }}</strong>
        <span class="pct">({{ pct }}%)</span>
      </span>
      <span v-else class="muted">No file loaded</span>
    </div>

    <!-- Speed gauge -->
    <div class="gauge-row">
      <button class="adj-btn" @click="decrement" title="Slower (−25 WPM)"><i class="bi bi-dash-lg"></i></button>

      <div class="slider-wrap">
        <input
          type="range"
          min="60"
          max="1000"
          step="25"
          :value="wpm"
          @input="onSlider"
        />
        <div class="wpm-labels">
          <span>60</span>
          <span class="wpm-value">{{ wpm }} <small>WPM</small></span>
          <span>1000</span>
        </div>
      </div>

      <button class="adj-btn" @click="increment" title="Faster (+25 WPM)"><i class="bi bi-plus-lg"></i></button>
    </div>

    <!-- Action buttons -->
    <div class="btn-row">
      <button
        class="btn-play"
        :class="{ playing: isPlaying }"
        :disabled="!hasWords"
        @click="$emit('play-pause')"
        title="Space to toggle"
      >
        <i :class="isPlaying ? 'bi bi-pause-fill' : 'bi bi-play-fill'"></i>
        {{ isPlaying ? 'Pause' : 'Play' }}
      </button>

      <button
        class="btn-restart"
        :disabled="!hasWords"
        @click="$emit('restart')"
        title="Return to beginning"
      >
        <i class="bi bi-arrow-counterclockwise"></i> Restart
      </button>

      <button
        class="btn-preview"
        :disabled="!hasWords"
        @click="$emit('show-preview')"
        title="Browse text and choose a start point"
      >
        <i class="bi bi-layout-text-sidebar"></i> Preview
      </button>
    </div>

    <!-- Chunk size control -->
    <div class="chunk-row">
      <span class="chunk-label">Words per flash</span>
      <button class="adj-btn" @click="$emit('chunk-change', chunkSize - 1)" :disabled="chunkSize <= 1">
        <i class="bi bi-dash-lg"></i>
      </button>
      <span class="chunk-value">{{ chunkSize }}</span>
      <button class="adj-btn" @click="$emit('chunk-change', chunkSize + 1)" :disabled="chunkSize >= 4">
        <i class="bi bi-plus-lg"></i>
      </button>
      <span class="chunk-pip" v-for="n in 4" :key="n" :class="{ active: n <= chunkSize }"></span>
    </div>

    <!-- Keyboard hint — hidden on touch devices -->
    <p class="hint">
      <kbd>Space</kbd> play / pause &nbsp;·&nbsp;
      <kbd><i class="bi bi-arrow-left"></i></kbd>
      <kbd><i class="bi bi-arrow-right"></i></kbd> speed ±25 WPM &nbsp;·&nbsp;
      <kbd><i class="bi bi-arrow-up"></i></kbd>
      <kbd><i class="bi bi-arrow-down"></i></kbd> words per flash
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  wpm:       { type: Number, required: true },
  chunkSize: { type: Number, required: true },
  isPlaying: { type: Boolean, required: true },
  hasWords:  { type: Boolean, required: true },
  current:   { type: Number, default: 0 },
  total:     { type: Number, default: 0 }
})

const emit = defineEmits(['wpm-change', 'chunk-change', 'play-pause', 'restart', 'show-preview'])

const pct = computed(() =>
  props.total > 0 ? Math.round((props.current / props.total) * 100) : 0
)

function onSlider(e) {
  emit('wpm-change', Number(e.target.value))
}

function decrement() {
  emit('wpm-change', Math.max(60, props.wpm - 25))
}

function increment() {
  emit('wpm-change', Math.min(1000, props.wpm + 25))
}
</script>

<style scoped>
.speed-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  padding: 1.25rem 2rem;
}

/* Progress */
.progress-info {
  font-size: 0.85rem;
  color: var(--text-muted);
  min-height: 1.2em;
}
.progress-info strong { color: var(--accent-light); }
.pct { margin-left: 0.3rem; color: var(--text-dim); font-size: 0.8rem; }
.muted { color: var(--text-dim); }

/* Gauge row */
.gauge-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 540px;
}

.adj-btn {
  background: var(--surface-2);
  color: var(--text-muted);
  font-size: 1rem;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  padding: 0;
  border: 1px solid var(--border-light);
}
.adj-btn:hover:not(:disabled) { background: var(--surface-3); color: var(--text); }

.slider-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.slider-wrap input[type="range"] { width: 100%; }

.wpm-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: var(--text-dim);
  padding: 0 2px;
}

.wpm-value {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--accent-light);
}
.wpm-value small { font-weight: 400; font-size: 0.72rem; color: var(--text-muted); }

/* Buttons */
.btn-row {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-play {
  background: var(--accent);
  color: #fff;
  font-weight: 600;
  min-width: 110px;
  padding: 0.55rem 1.4rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 0 14px var(--accent-glow);
}
.btn-play:hover:not(:disabled) {
  background: var(--accent-hover);
  box-shadow: 0 0 20px var(--accent-glow);
}
.btn-play.playing {
  background: var(--surface-3);
  box-shadow: none;
  border: 1px solid var(--border-light);
  color: var(--text);
}
.btn-play.playing:hover:not(:disabled) { background: var(--surface-2); }

.btn-restart,
.btn-preview {
  background: var(--surface-2);
  color: var(--text-muted);
  border: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.btn-restart:hover:not(:disabled),
.btn-preview:hover:not(:disabled) {
  background: var(--surface-3);
  color: var(--text);
}

button:disabled { opacity: 0.35; cursor: not-allowed; }

/* Chunk size */
.chunk-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chunk-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-right: 0.2rem;
}

.chunk-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--accent-light);
  min-width: 1.2ch;
  text-align: center;
}

.chunk-pip {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--surface-3);
  transition: background 0.15s;
}
.chunk-pip.active { background: var(--accent); }

/* Keyboard hint */
.hint {
  font-size: 0.75rem;
  color: var(--text-dim);
}

kbd {
  display: inline-block;
  padding: 1px 5px;
  border: 1px solid var(--border-light);
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.75rem;
  background: var(--surface-2);
  color: var(--text-muted);
}

/* ── Mobile layout ─────────────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .speed-control {
    padding: 0.75rem 0.875rem;
    gap: 0.6rem;
  }

  /* Hide keyboard shortcut hint — no keyboard on phone */
  .hint { display: none; }

  /* Bigger +/- buttons for fat fingers */
  .adj-btn {
    width: 42px;
    height: 42px;
    font-size: 1.1rem;
  }

  /* Slider takes full available width */
  .gauge-row {
    max-width: 100%;
  }

  /* Action buttons: Play is full-width row 1, Restart + Preview share row 2 */
  .btn-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.5rem;
    width: 100%;
  }

  .btn-play {
    grid-column: 1 / -1;  /* full width */
    justify-content: center;
    min-height: 50px;
    font-size: 1.05rem;
  }

  .btn-restart,
  .btn-preview {
    justify-content: center;
  }

  /* Chunk row: tighter */
  .chunk-row { gap: 0.4rem; }
  .chunk-label { font-size: 0.75rem; }

  /* Progress: smaller text */
  .progress-info { font-size: 0.8rem; }
}
</style>
