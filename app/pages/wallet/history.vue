<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
    <div class="mb-6 flex items-center justify-between gap-4 flex-wrap">
      <h1 class="text-2xl font-bold text-white">{{ $t('wallet.history.title') }}</h1>
      <div class="flex gap-2">
        <NuxtLink to="/wallet/deposit">
          <UButton size="sm" color="primary" icon="i-heroicons-arrow-down-tray">Nạp tiền</UButton>
        </NuxtLink>
        <NuxtLink to="/wallet/withdraw">
          <UButton size="sm" color="neutral" variant="outline" icon="i-heroicons-arrow-up-tray">Rút tiền</UButton>
        </NuxtLink>
      </div>
    </div>

    <!-- Main tabs: two categories -->
    <div class="flex gap-2 mb-5">
      <button
        v-for="(mt, i) in mainTabs" :key="i"
        @click="mainTab = i"
        class="flex-1 py-3 rounded-xl text-sm font-semibold border transition-all"
        :class="mainTab === i
          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
          : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'"
      >
        <UIcon :name="mt.icon" class="mr-1.5" />
        {{ mt.label }}
      </button>
    </div>

    <!-- Tab A: Nạp / Rút / Hoa hồng -->
    <div v-if="mainTab === 0">
      <div v-if="txPending" class="flex justify-center py-16 text-slate-500">
        <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin" />
      </div>
      <template v-else>
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="tab in tabsA" :key="tab.value"
          @click="filterA = tab.value"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
          :class="filterA === tab.value
            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
            : 'border-white/10 text-slate-500 hover:text-slate-300'"
        >
          {{ tab.label }}
        </button>
      </div>
      <TxList :items="txGroupA" />
      </template>
    </div>

    <!-- Tab B: AI Signals + Lãi kép -->
    <div v-if="mainTab === 1">
      <div v-if="txPending" class="flex justify-center py-16 text-slate-500">
        <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin" />
      </div>
      <template v-else>
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="tab in tabsB" :key="tab.value"
          @click="filterB = tab.value"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
          :class="filterB === tab.value
            ? 'border-violet-500 bg-violet-500/10 text-violet-300'
            : 'border-white/10 text-slate-500 hover:text-slate-300'"
        >
          {{ tab.label }}
        </button>
      </div>
      <TxList :items="txGroupB" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', pageTransition: false })
useHead({ title: 'Lịch sử giao dịch - Signal Universe' })

const mainTab = ref(0)
const filterA = ref('all')
const filterB = ref('all')

const mainTabs = [
  { label: 'Nạp · Rút · Hoa hồng', icon: 'i-heroicons-banknotes' },
  { label: 'AI Signal · Lãi kép', icon: 'i-heroicons-signal' }
]

const tabsA = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Nạp tiền', value: 'deposit' },
  { label: 'Rút lợi nhuận', value: 'withdraw_profit' },
  { label: 'Rút vốn', value: 'withdraw_capital' },
  { label: 'Hoa hồng nạp', value: 'deposit_referral' },
]

const tabsB = [
  { label: 'Tất cả', value: 'all' },
  { label: 'AI Signal', value: 'signal_profit' },
  { label: 'Hoa hồng tín hiệu', value: 'signal_referral' },
  { label: 'Admin điều chỉnh', value: 'admin_adjust' },
]

const { data: allTx, pending: txPending } = useFetch('/api/wallet/history', { query: { limit: 200 }, lazy: true })

const groupATypes = ['deposit', 'withdraw_profit', 'withdraw_capital', 'deposit_referral']
const groupBTypes = ['signal_profit', 'signal_referral', 'admin_adjust']

const txGroupA = computed(() => {
  const items = (allTx.value?.data || []).filter((t: any) => groupATypes.includes(t.type))
  if (filterA.value === 'all') return items
  return items.filter((t: any) => t.type === filterA.value)
})

const txGroupB = computed(() => {
  const items = (allTx.value?.data || []).filter((t: any) => groupBTypes.includes(t.type))
  if (filterB.value === 'all') return items
  return items.filter((t: any) => t.type === filterB.value)
})
</script>
