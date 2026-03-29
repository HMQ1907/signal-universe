<template>
  <div class="su-card relative overflow-hidden" :class="isOpen ? 'border-indigo-500/40' : ''">
    <div v-if="isOpen" class="absolute inset-0 opacity-5 pointer-events-none"
      style="background: linear-gradient(135deg, #6366f1, #8b5cf6);" />

    <div class="relative z-10">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center"
            :class="isOpen ? 'bg-indigo-500/20' : 'bg-slate-800'">
            <UIcon name="i-heroicons-signal" :class="isOpen ? 'text-indigo-400' : 'text-slate-500'" class="text-lg" />
          </div>
          <div>
            <p class="text-white font-bold">{{ $t('signals.session_daily') }}</p>
            <p class="text-slate-400 text-sm">{{ $t('signals.window_hours') }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="isOpen" class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-400" />
          </span>
          <UBadge
            :label="sessionStatus"
            :color="isOpen ? 'primary' : isConfirmed ? 'success' : 'neutral'"
            variant="soft"
          />
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
        <p class="text-slate-400 text-sm">Signal amount: ${{ confirmation?.amount?.toFixed(2) }}</p>
        <p v-if="confirmation?.profit_amount" class="text-green-400 font-bold">
          Profit: +${{ confirmation.profit_amount.toFixed(2) }}
        </p>
      </div>

      <UButton
        v-if="isOpen && !isConfirmed && defiTier"
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

    <UModal v-model="showConfirmDialog">
      <UCard>
        <template #header>
          <h3 class="text-white font-bold text-lg">{{ $t('signals.confirm_dialog.title') }}</h3>
        </template>
        <div class="space-y-4">
          <p class="text-slate-400">{{ $t('signals.confirm_dialog.description') }}</p>
          <div class="p-4 rounded-xl bg-slate-800/50 space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-400 text-sm">{{ $t('signals.confirm_dialog.tier_label') }}</span>
              <span class="text-white font-semibold">${{ defiTier }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400 text-sm">{{ $t('signals.confirm_dialog.balance_label') }}</span>
              <span class="text-white font-semibold">${{ userBalance.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400 text-sm">{{ $t('signals.confirm_dialog.amount_label') }}</span>
              <span class="text-indigo-400 font-bold">${{ signalAmount.toFixed(2) }}</span>
            </div>
          </div>
          <UAlert :description="$t('signals.confirm_dialog.warning')" color="warning" variant="soft" />
        </div>
        <template #footer>
          <div class="flex gap-3 justify-end">
            <UButton color="neutral" variant="soft" @click="showConfirmDialog = false">{{ $t('signals.confirm_dialog.cancel') }}</UButton>
            <UButton :loading="loading" color="primary"
              @click="handleConfirm">
              {{ $t('signals.confirm_dialog.confirm') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  sessions: any[]
  confirmations: Record<number, any>
  userBalance: number
  defiTier: number | null
}>()

const emit = defineEmits<{ confirmed: [sessionId: number] }>()

const { t } = useI18n()
const loading = ref(false)
const showConfirmDialog = ref(false)
const timeLeft = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const session = computed(() => props.sessions.find(s => s.time_window === 'daily') || props.sessions[0] || null)
const confirmation = computed(() => session.value ? props.confirmations[session.value.id] : null)
const isConfirmed = computed(() => !!confirmation.value)

const signalAmount = computed(() => parseFloat((props.userBalance * 0.01).toFixed(2)))

const isOpen = computed(() => {
  if (!session.value) return false
  if (session.value.status !== 'open') return false
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  if (session.value.session_date !== today) return false
  const h = now.getHours()
  return h >= 11 && h <= 23
})

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
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
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
