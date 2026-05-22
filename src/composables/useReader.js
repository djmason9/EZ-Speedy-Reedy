import { ref, computed, onUnmounted } from 'vue'
import { tokenize } from '@/utils/tokenizer'

/**
 * Core speed reading state and timing logic.
 *
 * Uses recursive setTimeout instead of setInterval so:
 *  - The interval is re-read each tick (WPM changes take effect immediately)
 *  - Slow renders can never cause tick accumulation / "burst" playback
 */
export function useReader() {
  const words        = ref([])   // string[]
  const currentIndex = ref(0)
  const isPlaying    = ref(false)
  const wpm          = ref(300)
  const chunkSize    = ref(1)    // words shown per flash (1–4)

  let timerId = null

  // ─── Derived state ────────────────────────────────────────────────────────

  // Slice of words currently on screen
  const currentChunk = computed(() => {
    if (!words.value.length) return []
    const start = currentIndex.value
    const end   = Math.min(start + chunkSize.value, words.value.length)
    return words.value.slice(start, end)
  })

  // Time per flash: scales with chunk size so WPM stays constant
  // e.g. 350 WPM, chunk 3 → each flash shows 3 words → 3 × (60/350 × 1000) ms
  const msPerFlash  = computed(() =>
    Math.round((60 / wpm.value) * 1000 * chunkSize.value)
  )

  const progress    = computed(() => ({
    current: currentIndex.value + (words.value.length ? 1 : 0),
    total:   words.value.length
  }))
  const hasWords = computed(() => words.value.length > 0)

  // ─── Actions ──────────────────────────────────────────────────────────────

  function loadText(rawText) {
    clearTimer()
    words.value        = tokenize(rawText)
    currentIndex.value = 0
    isPlaying.value    = false
  }

  function play() {
    if (!hasWords.value) return
    if (currentIndex.value >= words.value.length - 1) {
      // At or past the end — restart automatically
      currentIndex.value = 0
    }
    isPlaying.value = true
    scheduleNext()
  }

  function pause() {
    isPlaying.value = false
    clearTimer()
  }

  function togglePlay() {
    isPlaying.value ? pause() : play()
  }

  function restart() {
    clearTimer()
    currentIndex.value = 0
    isPlaying.value    = false
  }

  function jumpTo(index) {
    clearTimer()
    currentIndex.value = Math.max(0, Math.min(index, words.value.length - 1))
    isPlaying.value    = false
  }

  function setWpm(newWpm) {
    wpm.value = Number(newWpm)
    if (isPlaying.value) { clearTimer(); scheduleNext() }
  }

  function setChunkSize(n) {
    chunkSize.value = Math.max(1, Math.min(4, Number(n)))
    if (isPlaying.value) { clearTimer(); scheduleNext() }
  }

  // ─── Internal timer ───────────────────────────────────────────────────────

  function scheduleNext() {
    timerId = setTimeout(() => {
      const next = currentIndex.value + chunkSize.value
      if (next < words.value.length) {
        currentIndex.value = next
        scheduleNext()
      } else {
        isPlaying.value = false
        timerId         = null
      }
    }, msPerFlash.value)
  }

  function clearTimer() {
    if (timerId !== null) {
      clearTimeout(timerId)
      timerId = null
    }
  }

  // Clean up timer if the component using this composable is destroyed
  onUnmounted(clearTimer)

  // ─── Public API ───────────────────────────────────────────────────────────

  return {
    // State
    words,
    currentIndex,
    currentChunk,
    isPlaying,
    wpm,
    chunkSize,
    progress,
    hasWords,
    // Actions
    loadText,
    play,
    pause,
    togglePlay,
    restart,
    jumpTo,
    setWpm,
    setChunkSize,
  }
}
