import { computed } from 'vue'
import { useNow } from '@vueuse/core'

/** Matches server `isDailyAiConfirmWindowOpen`: local hours 11–23 (inclusive). */
export function useSignalSessionWindow() {
  const now = useNow({ interval: 60_000 })
  const isWindowOpen = computed(() => {
    const h = now.value.getHours()
    return h >= 11 && h <= 23
  })
  return { isWindowOpen, now }
}
