<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-white">{{ $t('signals.title') }}</h1>
      <p class="text-slate-400 text-sm mt-1">{{ $t('signals.subtitle') }}</p>
    </div>

    <UAlert v-if="showPackageWarning" :description="$t('signals.no_package')"
      color="warning" variant="soft" icon="i-heroicons-exclamation-triangle" class="mb-8">
      <template #description>
        {{ $t('signals.no_package') }}
        <NuxtLink to="/wallet/deposit" class="text-amber-400 hover:underline ml-1">Deposit now →</NuxtLink>
      </template>
    </UAlert>

    <div class="max-w-xl mx-auto mb-8">
      <div v-if="sessionsPending" class="flex justify-center py-8 text-slate-500">
        <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin" />
      </div>
      <SignalSessionCard
        v-else
        :sessions="signalData?.sessions || []"
        :confirmations="signalData?.user_confirmations || {}"
        :user-total-balance="userTotalForSignals"
        :defi-tier="signalData?.defi_tier ?? null"
        @confirmed="handleConfirm"
      />
    </div>

    <div class="su-card">
      <h2 class="text-white font-bold text-lg mb-6">{{ $t('signals.history.title') }}</h2>

      <div v-if="historyPending" class="flex justify-center py-8 text-slate-500">
        <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin" />
      </div>
      <div v-else-if="historyData?.data?.length" class="space-y-0">
        <div v-for="item in historyData.data" :key="item.id"
          class="flex items-center justify-between py-4 border-b border-slate-800 last:border-0">
          <div>
            <p class="text-white text-sm font-medium">
              {{ item.session?.session_date }} — {{ item.session?.time_window === 'daily' ? $t('signals.session_daily') : item.session?.time_window }}
            </p>
            <p class="text-slate-400 text-xs">Signal amount: ${{ item.amount.toFixed(2) }}</p>
          </div>
          <div class="text-right">
            <p class="text-green-400 font-semibold">
              {{ item.profit_amount ? `+$${item.profit_amount.toFixed(2)}` : '-' }}
            </p>
            <UBadge :label="$t(`common.${item.status}`)" size="xs"
              :color="item.status === 'approved' ? 'green' : item.status === 'pending' ? 'yellow' : 'red'"
              variant="soft" />
          </div>
        </div>
      </div>

      <div v-else-if="!historyPending" class="text-center py-12 text-slate-500">
        <UIcon name="i-heroicons-signal" class="text-4xl mb-3 text-slate-600" />
        <p>No signal history yet</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Trading Signals - Signal Universe' })

const { user, refreshUser } = useAuth()
const toast = useToastCustom()
const runtimeConfig = useRuntimeConfig()

const { data: signalData, refresh: refreshSessions, pending: sessionsPending } = useFetch('/api/signals/sessions', { key: 'signal-sessions', lazy: true })

const userTotalForSignals = computed(() => {
  if (signalData.value?.user_total_balance != null) return signalData.value.user_total_balance as number
  const b = user.value?.balance ?? 0
  const l = user.value?.locked_capital ?? 0
  return Math.round((b + l) * 100) / 100
})

/** Hide “need package” when TEST_AI and total ≥ $300 (tier inferred for confirm). */
const showPackageWarning = computed(() => {
  if (!signalData.value) return false
  if (signalData.value.defi_tier) return false
  if (runtimeConfig.public.testAi && userTotalForSignals.value >= 300) return false
  return true
})
const { data: historyData, refresh: refreshHistory, pending: historyPending } = useFetch('/api/signals/history', { key: 'signal-history', lazy: true })

const handleConfirm = async (sessionId: number) => {
  try {
    const result = await $fetch<{ amount: number }>('/api/signals/confirm', {
      method: 'POST',
      body: { session_id: sessionId }
    })
    toast.success(`Signal confirmed! Amount: $${result.amount.toFixed(2)}`)
    await refreshSessions()
    await refreshHistory()
    await refreshUser()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Failed to confirm signal')
  }
}
</script>
