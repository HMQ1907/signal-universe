<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
    <!-- Welcome -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-white">
        {{ $t('dashboard.welcome') }}, <span class="gradient-text">{{ user?.full_name || user?.email }}</span>
      </h1>
      <p class="text-slate-400 text-sm mt-1">{{ new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
    </div>

    <!-- Balance Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <!-- Profit Balance -->
      <div class="su-card relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-10"
          style="background: #6366f1; transform: translate(40%, -40%);" />
        <div class="flex items-center justify-between mb-4">
          <p class="text-slate-400 text-sm">{{ $t('dashboard.profit_balance') }}</p>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <UIcon name="i-heroicons-currency-dollar" class="text-indigo-400" />
          </div>
        </div>
        <p class="text-3xl font-black text-white">${{ (user?.balance || 0).toFixed(2) }}</p>
        <p class="text-xs text-slate-500 mt-1">Available to withdraw</p>
      </div>

      <!-- Locked Capital -->
      <div class="su-card relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-10"
          style="background: #f59e0b; transform: translate(40%, -40%);" />
        <div class="flex items-center justify-between mb-4">
          <p class="text-slate-400 text-sm">{{ $t('dashboard.locked_capital') }}</p>
          <div class="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <UIcon name="i-heroicons-lock-closed" class="text-amber-400" />
          </div>
        </div>
        <p class="text-3xl font-black text-white">${{ (user?.locked_capital || 0).toFixed(2) }}</p>
        <p class="text-xs mt-1" :class="capitalStatus.class">{{ capitalStatus.text }}</p>
      </div>

      <!-- Investment Package -->
      <div class="su-card relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-10"
          style="background: #10b981; transform: translate(40%, -40%);" />
        <div class="flex items-center justify-between mb-4">
          <p class="text-slate-400 text-sm">{{ $t('dashboard.investment_package') }}</p>
          <div class="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
            <UIcon name="i-heroicons-arrow-trending-up" class="text-green-400" />
          </div>
        </div>
        <p class="text-3xl font-black text-white">
          {{ displayDeFiTier ? `$${displayDeFiTier}` : '-' }}
        </p>
        <p class="text-xs text-slate-500 mt-1">
          {{ displayDeFiTier ? $t('dashboard.package_auto') : $t('dashboard.package_none') }}
        </p>
      </div>
    </div>

    <!-- Today's Signals -->
    <div class="su-card mb-8">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-white font-bold text-lg">{{ $t('dashboard.signals_today') }}</h2>
        <NuxtLink to="/signals">
          <UButton size="xs" color="primary" variant="soft" trailing-icon="i-heroicons-arrow-right">
            View All
          </UButton>
        </NuxtLink>
      </div>

      <div class="grid md:grid-cols-1 gap-4 max-w-xl">
        <div v-for="session in todaySessions" :key="session.time"
          class="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border"
          :class="session.isOpen ? 'border-indigo-500/30' : 'border-slate-700'">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
              :class="session.isOpen ? 'bg-indigo-500/20' : 'bg-slate-700'">
              <UIcon name="i-heroicons-signal" :class="session.isOpen ? 'text-indigo-400' : 'text-slate-500'" />
            </div>
            <div>
              <p class="text-white font-semibold">{{ session.label }}</p>
              <p class="text-slate-400 text-xs">{{ $t('signals.window_hours') }}</p>
            </div>
          </div>
          <UBadge
            :label="session.confirmed ? $t('signals.confirmed') : (session.isOpen ? $t('signals.session_open') : $t('signals.waiting'))"
            :color="session.confirmed ? 'green' : (session.isOpen ? 'indigo' : 'gray')"
            variant="soft"
          />
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="su-card" v-for="stat in quickStats" :key="stat.label">
        <p class="text-slate-400 text-xs mb-2">{{ stat.label }}</p>
        <p class="text-xl font-bold" :class="stat.color">{{ stat.value }}</p>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="su-card">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-white font-bold text-lg">{{ $t('dashboard.recent_transactions') }}</h2>
        <NuxtLink to="/wallet/history">
          <UButton size="xs" color="neutral" variant="ghost" trailing-icon="i-heroicons-arrow-right">View All</UButton>
        </NuxtLink>
      </div>

      <div v-if="recentTx?.data?.length" class="space-y-3">
        <div v-for="tx in recentTx.data.slice(0, 5)" :key="tx.id"
          class="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="txIconBg(tx.type)">
              <UIcon :name="txIcon(tx.type)" class="text-sm" :class="txIconColor(tx.type)" />
            </div>
            <div>
              <p class="text-sm text-white font-medium">{{ $t(`wallet.history.type.${tx.type}`) }}</p>
              <p class="text-xs text-slate-500">{{ new Date(tx.created_at).toLocaleDateString() }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-semibold" :class="txAmountColor(tx.type)">${{ tx.amount.toFixed(2) }}</p>
            <UBadge :label="$t(`common.${tx.status}`)" size="xs"
              :color="tx.status === 'completed' ? 'green' : tx.status === 'pending' ? 'yellow' : 'red'"
              variant="soft" />
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12 text-slate-500">
        <UIcon name="i-heroicons-banknotes" class="text-4xl mb-3 text-slate-600" />
        <p>No transactions yet</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Dashboard - Signal Universe' })

const { user, refreshUser } = useAuth()
const { t } = useI18n()
await refreshUser()

const { data: recentTx } = await useFetch('/api/wallet/history', { query: { limit: 5 } })
const { data: signalBrief } = await useFetch('/api/signals/sessions', { key: 'dashboard-signals' })

const displayDeFiTier = computed(() => signalBrief.value?.defi_tier ?? null)

const capitalStatus = computed(() => {
  if (!user.value?.first_deposit_at) return { text: 'No investment', class: 'text-slate-500' }
  const first = new Date(user.value.first_deposit_at)
  const unlock = new Date(first.getTime() + 28 * 24 * 60 * 60 * 1000)
  const now = new Date()
  if (now >= unlock) return { text: 'Capital available for withdrawal', class: 'text-green-400' }
  const daysLeft = Math.ceil((unlock.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
  return { text: `Locked - ${daysLeft} days remaining`, class: 'text-amber-400' }
})

const todaySessions = computed(() => {
  const sessions = signalBrief.value?.sessions || []
  const conf = signalBrief.value?.user_confirmations || {}
  const s = sessions.find((x: any) => x.time_window === 'daily') || sessions[0]
  if (!s) {
    return [{ time: 'daily', label: t('dashboard.signal_daily'), isOpen: false, confirmed: false }]
  }
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const h = now.getHours()
  const isOpen = s.session_date === today && s.status === 'open' && h >= 11 && h <= 23
  const confirmed = !!conf[s.id]
  return [{ time: 'daily', label: t('dashboard.signal_daily'), isOpen, confirmed }]
})

const quickStats = computed(() => [
  { label: 'F1 Members', value: user.value?.f1_count || 0, color: 'text-indigo-400' },
  { label: 'Referral Code', value: user.value?.referral_code || '-', color: 'text-purple-400' },
  { label: 'Total Balance', value: `$${((user.value?.balance || 0) + (user.value?.locked_capital || 0)).toFixed(2)}`, color: 'text-white' },
  {
    label: 'Package Status',
    value: displayDeFiTier.value ? `Tier $${displayDeFiTier.value}` : 'None',
    color: displayDeFiTier.value ? 'text-green-400' : 'text-slate-500'
  }
])

const txIcon = (type: string) => {
  const icons: Record<string, string> = {
    deposit: 'i-heroicons-arrow-down-tray',
    withdraw_profit: 'i-heroicons-arrow-up-tray',
    withdraw_capital: 'i-heroicons-arrow-up-tray',
    signal_profit: 'i-heroicons-signal',
    signal_referral: 'i-heroicons-arrow-path',
    deposit_referral: 'i-heroicons-users',
    admin_adjust: 'i-heroicons-adjustments-horizontal'
  }
  return icons[type] || 'i-heroicons-banknotes'
}

const txIconBg = (type: string) => {
  if (['deposit', 'signal_profit', 'signal_referral', 'deposit_referral'].includes(type)) return 'bg-green-500/10'
  if (['withdraw_profit', 'withdraw_capital'].includes(type)) return 'bg-red-500/10'
  return 'bg-slate-700'
}

const txIconColor = (type: string) => {
  if (['deposit', 'signal_profit', 'signal_referral', 'deposit_referral'].includes(type)) return 'text-green-400'
  if (['withdraw_profit', 'withdraw_capital'].includes(type)) return 'text-red-400'
  return 'text-slate-400'
}

const txAmountColor = (type: string) => {
  if (['withdraw_profit', 'withdraw_capital'].includes(type)) return 'text-red-400'
  return 'text-green-400'
}
</script>
