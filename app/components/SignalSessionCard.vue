<template>
  <div class="su-card relative overflow-hidden" :class="isOpen ? 'border-indigo-500/40' : ''">
    <div v-if="isOpen" class="absolute inset-0 opacity-5 pointer-events-none"
      style="background: linear-gradient(135deg, #6366f1, #8b5cf6);" />

    <div class="relative z-10">
      <div class="mb-6 rounded-[1.25rem] border border-white/5 bg-white/3 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-5">
        <div class="flex items-start justify-between gap-4">
          <div class="flex min-w-0 items-start gap-3 sm:gap-4">
            <div
              class="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ring-white/10 shadow-lg"
              :class="isOpen ? 'bg-indigo-500/15 shadow-indigo-500/20' : 'bg-slate-800/80 shadow-black/20'"
            >
              <div
                v-if="isOpen"
                class="absolute inset-0 rounded-2xl bg-linear-to-br from-indigo-400/20 via-violet-500/20 to-fuchsia-500/10 blur-sm"
              />
              <UIcon
                name="i-heroicons-signal"
                :class="isOpen ? 'text-indigo-300' : 'text-slate-500'"
                class="relative z-10 text-xl"
              />
            </div>

            <div class="min-w-0">
              <div class="mb-1 flex items-center gap-2">
                <span class="inline-flex items-center rounded-full border border-indigo-400/30 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-300">
                  AI Signal
                </span>
                <span v-if="isOpen" class="relative flex h-2 w-2 shrink-0">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-400" />
                </span>
              </div>
              <p class="text-lg font-black tracking-tight text-white sm:text-xl">
                {{ $t('signals.session_daily') }}
              </p>
              <p class="mt-1 text-sm text-slate-400">
                {{ windowHoursLabel }}
              </p>
            </div>
          </div>

          <div class="flex shrink-0 flex-col items-end gap-2">
            <UBadge
              :label="sessionStatus"
              :color="isOpen ? 'primary' : isConfirmed ? 'success' : 'neutral'"
              variant="soft"
              class="rounded-full px-3 py-1 text-xs font-semibold"
            />
            <div class="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-right text-[11px] font-medium text-slate-400">
              {{ windowHoursLabel }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="isOpen && !isConfirmed" class="text-center mb-6">
        <p class="text-slate-400 text-sm mb-2">{{ $t('signals.window_closes_in') }}</p>
        <div class="text-2xl font-black signal-timer" :class="timeLeft <= 600 ? 'text-amber-400' : 'text-white'">
          {{ formatTime(timeLeft) }}
        </div>
      </div>

      <div v-if="isConfirmed" class="text-center mb-6 py-4">
        <UIcon name="i-heroicons-check-circle" class="text-green-400 text-4xl mb-2" />
        <p class="text-green-400 font-semibold">{{ $t('signals.confirmed') }}</p>
        <p class="text-slate-400 text-sm">{{ $t('signals.session_profit_preview') }}: ${{ confirmation?.amount?.toFixed(2) }}</p>
        <p v-if="confirmation?.profit_amount" class="text-green-400 font-bold">
          Profit: +${{ confirmation.profit_amount.toFixed(2) }}
        </p>
      </div>

      <UButton
        v-if="showConfirmButton"
        block
        :loading="loading"
        color="primary"
        class="py-3 font-bold shadow-lg shadow-primary-500/25"
        @click="showConfirmDialog = true"
      >
        <UIcon name="i-heroicons-check" class="mr-2" />
        {{ $t('signals.confirm_btn') }}
      </UButton>

      <div v-if="!isOpen && !isConfirmed" class="text-center py-4">
        <p class="text-slate-500 text-sm">{{ $t('signals.waiting') }}</p>
        <p class="text-slate-400 text-xs mt-1">{{ $t('signals.window_opens_hint') }}</p>
      </div>
    </div>

    <UModal v-model:open="showConfirmDialog" :title="$t('signals.confirm_dialog.title')">
      <template #body>
        <div class="space-y-4">
          <!-- <p class="text-slate-400">{{ $t('signals.confirm_dialog.description') }}</p> -->
          <div class="p-4 rounded-xl bg-slate-800/50 space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-400 text-sm">{{ $t('signals.confirm_dialog.tier_label') }}</span>
              <span class="text-white font-semibold">${{ effectiveTier }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400 text-sm">{{ $t('signals.confirm_dialog.total_balance_label') }}</span>
              <span class="text-white font-semibold">${{ userTotalBalance.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400 text-sm">{{ $t('signals.confirm_dialog.profit_preview_label') }}</span>
              <span class="text-indigo-400 font-bold">${{ signalAmount.toFixed(2) }}</span>
            </div>
          </div>
          <UAlert :description="$t('signals.confirm_dialog.warning')" color="warning" variant="soft" />
        </div>
      </template>
      <template #footer>
        <div class="flex gap-3 justify-end w-full">
          <UButton color="neutral" variant="ghost" @click="showConfirmDialog = false">{{ $t('signals.confirm_dialog.cancel') }}</UButton>
          <UButton :loading="loading" color="primary" @click="handleConfirm">{{ $t('signals.confirm_dialog.confirm') }}</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { roundMoney2 } from '~/utils/money'
import { getAiConfirmWindowEndDate, isAiConfirmWindowOpenAt } from '~/utils/aiConfirmWindow'
import { packageTierFromTotalBalance } from '~/utils/investment'

const props = defineProps<{
  sessions: any[]
  confirmations: Record<number, any>
  /** balance + locked_capital — 2% of this is session profit preview */
  userTotalBalance: number
  defiTier: number | null
}>()

const emit = defineEmits<{ confirmed: [sessionId: number] }>()

const { t } = useI18n()
const config = useRuntimeConfig()
const testAi = computed(() => !!config.public.testAi)
const windowHoursLabel = computed(() =>
  testAi.value ? t('signals.window_hours_test') : t('signals.window_hours')
)
const loading = ref(false)
const showConfirmDialog = ref(false)
const timeLeft = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const session = computed(() => props.sessions.find(s => s.time_window === 'daily') || props.sessions[0] || null)
const confirmation = computed(() => session.value ? props.confirmations[session.value.id] : null)
const isConfirmed = computed(() => !!confirmation.value)

const signalAmount = computed(() => roundMoney2(props.userTotalBalance * 0.02))

const isOpen = computed(() => {
  if (!session.value) return false
  if (session.value.status !== 'open') return false
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  if (session.value.session_date !== today) return false
  return isAiConfirmWindowOpenAt(now, testAi.value)
})

/** Tier for UI + confirm: saved package, or TEST_AI + inferred from total balance (≥$300). */
const effectiveTier = computed(() => {
  if (props.defiTier != null) return props.defiTier
  if (testAi.value) return packageTierFromTotalBalance(props.userTotalBalance)
  return null
})

const showConfirmButton = computed(
  () => isOpen.value && !isConfirmed.value && effectiveTier.value != null
)

const sessionStatus = computed(() => {
  if (isConfirmed.value) return t('signals.confirmed')
  if (isOpen.value) return t('signals.session_open')
  return t('signals.waiting')
})

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const updateTimer = () => {
  const now = new Date()
  const end = getAiConfirmWindowEndDate(now, testAi.value)
  timeLeft.value = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000))
}

onMounted(() => {
  updateTimer()
  timer = setInterval(updateTimer, 1000)
})

onUnmounted(() => { if (timer) clearInterval(timer) })

const handleConfirm = async () => {
  if (!session.value) return
  loading.value = true
  try {
    emit('confirmed', session.value.id)
    showConfirmDialog.value = false
  } finally {
    loading.value = false
  }
}
</script>
