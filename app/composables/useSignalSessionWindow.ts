import { computed } from 'vue'
import { useNow } from '@vueuse/core'
import { isAiConfirmWindowOpenAt } from '~/utils/aiConfirmWindow'

/** Matches server `isDailyAiConfirmWindowOpen` (local time). */
export function useSignalSessionWindow() {
  const config = useRuntimeConfig()
  const testAi = computed(() => !!config.public.testAi)
  const now = useNow({ interval: 1000 })
  const isWindowOpen = computed(() => isAiConfirmWindowOpenAt(now.value, testAi.value))
  return { isWindowOpen, now, testAi }
}
