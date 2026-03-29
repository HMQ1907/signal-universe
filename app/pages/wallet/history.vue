<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
    <div class="mb-8 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-white">{{ $t('wallet.history.title') }}</h1>
      <div class="flex gap-2">
        <NuxtLink to="/wallet/deposit">
          <UButton size="sm" color="primary" icon="i-heroicons-arrow-down-tray">Deposit</UButton>
        </NuxtLink>
        <NuxtLink to="/wallet/withdraw">
          <UButton size="sm" color="neutral" icon="i-heroicons-arrow-up-tray">Withdraw</UButton>
        </NuxtLink>
      </div>
    </div>

    <!-- Filter tabs -->
    <div class="flex flex-wrap gap-2 mb-6">
      <UButton
        v-for="tab in filterTabs"
        :key="tab.value"
        size="sm"
        :color="activeFilter === tab.value ? 'indigo' : 'gray'"
        :variant="activeFilter === tab.value ? 'solid' : 'ghost'"
        @click="activeFilter = tab.value"
      >
        {{ tab.label }}
      </UButton>
    </div>

    <!-- Transactions -->
    <div class="su-card">
      <div v-if="txData?.data?.length" class="space-y-0">
        <div v-for="tx in txData.data" :key="tx.id"
          class="flex items-center justify-between py-4 border-b border-slate-800 last:border-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              :class="txIconBg(tx.type)">
              <UIcon :name="txIcon(tx.type)" :class="txIconColor(tx.type)" />
            </div>
            <div>
              <p class="text-white text-sm font-medium">{{ $t(`wallet.history.type.${tx.type}`) }}</p>
              <p class="text-slate-500 text-xs">{{ new Date(tx.created_at).toLocaleString() }}</p>
              <p v-if="tx.admin_note" class="text-slate-400 text-xs mt-0.5">{{ tx.admin_note }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-bold" :class="isIncome(tx.type) ? 'text-green-400' : 'text-red-400'">
              {{ isIncome(tx.type) ? '+' : '-' }}${{ tx.amount.toFixed(2) }}
            </p>
            <UBadge
              :label="$t(`common.${tx.status}`)"
              size="xs"
              :color="tx.status === 'completed' ? 'green' : tx.status === 'pending' ? 'yellow' : 'red'"
              variant="soft"
            />
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16 text-slate-500">
        <UIcon name="i-heroicons-banknotes" class="text-5xl mb-4 text-slate-700" />
        <p>No transactions found</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Transaction History - Signal Universe' })

const { t } = useI18n()
const activeFilter = ref('all')

const filterTabs = [
  { label: t('wallet.history.all'), value: 'all' },
  { label: t('wallet.history.deposits'), value: 'deposit' },
  { label: t('wallet.history.withdrawals'), value: 'withdraw_profit' },
  { label: t('wallet.history.profits'), value: 'signal_profit' },
  { label: t('wallet.history.referrals'), value: 'deposit_referral' }
]

const { data: txData } = await useFetch('/api/wallet/history', {
  query: computed(() => ({ type: activeFilter.value === 'all' ? undefined : activeFilter.value, limit: 50 })),
  watch: [activeFilter]
})

const txIcon = (type: string) => {
  const icons: Record<string, string> = {
    deposit: 'i-heroicons-arrow-down-tray', withdraw_profit: 'i-heroicons-arrow-up-tray',
    withdraw_capital: 'i-heroicons-arrow-up-tray', signal_profit: 'i-heroicons-signal',
    signal_referral: 'i-heroicons-arrow-path', deposit_referral: 'i-heroicons-users',
    leader_bonus: 'i-heroicons-trophy', admin_adjust: 'i-heroicons-adjustments-horizontal'
  }
  return icons[type] || 'i-heroicons-banknotes'
}

const txIconBg = (type: string) => isIncome(type) ? 'bg-green-500/10' : 'bg-red-500/10'
const txIconColor = (type: string) => isIncome(type) ? 'text-green-400' : 'text-red-400'
const isIncome = (type: string) => !['withdraw_profit', 'withdraw_capital'].includes(type)
</script>
