<template>
  <div class="tokens-page min-h-screen pb-24">
    <!-- Ambient background -->
    <div class="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        class="su-ambient-orb absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full opacity-35 blur-[100px]"
        style="background: radial-gradient(circle, rgba(99, 102, 241, 0.45), transparent 70%)"
      />
      <div
        class="su-ambient-orb su-ambient-orb--delay absolute bottom-0 right-0 h-80 w-80 rounded-full opacity-25 blur-[80px]"
        style="background: radial-gradient(circle, rgba(139, 92, 246, 0.35), transparent 70%)"
      />
    </div>

    <div class="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <header class="su-fade-up mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
            {{ $t('tokens.badge') }}
          </p>
          <h1 class="text-3xl font-bold text-white md:text-4xl">
            {{ $t('tokens.title') }}
          </h1>
          <p class="mt-2 max-w-xl text-slate-400">
            {{ $t('tokens.subtitle') }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <UButton
            v-for="n in networks"
            :key="n.id"
            size="sm"
            :color="network === n.id ? 'primary' : 'neutral'"
            :variant="network === n.id ? 'solid' : 'outline'"
            class="transition-all duration-300"
            @click="network = n.id"
          >
            <span class="mr-1.5 text-base">{{ n.flag }}</span>
            {{ n.label }}
          </UButton>
        </div>
      </header>

      <!-- Toolbar -->
      <div
        class="su-fade-up su-stagger-1 mb-6 flex flex-col gap-4 rounded-2xl border border-white/5 bg-slate-900/60 p-4 shadow-lg shadow-black/20 ring-1 ring-white/5 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between"
      >
        <div class="flex flex-wrap gap-2">
          <UButton
            size="sm"
            :color="viewMode === 'trending' ? 'primary' : 'neutral'"
            :variant="viewMode === 'trending' ? 'solid' : 'ghost'"
            class="rounded-xl transition-transform duration-200 active:scale-[0.98]"
            @click="viewMode = 'trending'"
          >
            {{ $t('tokens.trending') }}
          </UButton>
          <UButton
            size="sm"
            :color="viewMode === 'watchlist' ? 'primary' : 'neutral'"
            :variant="viewMode === 'watchlist' ? 'solid' : 'ghost'"
            class="rounded-xl transition-transform duration-200 active:scale-[0.98]"
            @click="viewMode = 'watchlist'"
          >
            {{ $t('tokens.watchlist') }}
          </UButton>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs text-slate-500">{{ $t('tokens.timeframe') }}</span>
          <UButton
            v-for="tf in timeframes"
            :key="tf"
            size="xs"
            :color="timeframe === tf ? 'primary' : 'neutral'"
            :variant="timeframe === tf ? 'solid' : 'outline'"
            class="min-w-[3rem] justify-center rounded-lg transition-all duration-200"
            @click="timeframe = tf"
          >
            {{ tf }}
          </UButton>
        </div>
      </div>

      <UCard
        class="su-fade-up su-stagger-2 overflow-hidden border-white/5 bg-slate-900/50 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl"
      >
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-4">
            <h2 class="text-lg font-semibold text-white">
              {{ $t('tokens.table_title', { chain: currentNetwork.label }) }}
            </h2>
            <UBadge color="neutral" variant="soft" class="tabular-nums">
              {{ $t('tokens.demo_notice') }}
            </UBadge>
          </div>
        </template>

        <div v-if="!filteredRows.length" class="px-6 py-16 text-center">
          <UIcon name="i-heroicons-star" class="mx-auto mb-4 text-5xl text-slate-600" />
          <p class="text-slate-400">{{ $t('tokens.watchlist_empty') }}</p>
          <UButton class="mt-6" color="primary" variant="soft" @click="viewMode = 'trending'">
            {{ $t('tokens.back_trending') }}
          </UButton>
        </div>

        <div v-else class="tokens-table-wrap -mx-1 overflow-x-auto px-1 pb-1">
          <UTable
            :data="filteredRows"
            :columns="columns"
            :meta="tableMeta"
            class="min-w-[960px]"
            :ui="{
              tr: 'tokens-tr border-b border-white/5 transition-all duration-300 hover:bg-white/[0.04]',
              th: 'whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500',
              td: 'whitespace-nowrap py-3 text-sm'
            }"
          >
            <template #pair-cell="{ row }">
              <div class="flex items-center gap-3">
                <UButton
                  color="neutral"
                  variant="ghost"
                  square
                  size="xs"
                  class="rounded-lg opacity-70 hover:opacity-100"
                  :icon="favorites.has(row.original.id) ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
                  :class="favorites.has(row.original.id) ? 'text-warning' : ''"
                  @click.stop="toggleFavorite(row.original.id)"
                />
                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ring-1 ring-white/10"
                  :class="row.original.avatarClass"
                >
                  {{ row.original.symbol }}
                </div>
                <div>
                  <p class="font-medium text-white">{{ row.original.pair }}</p>
                  <p class="max-w-[200px] truncate font-mono text-[11px] text-slate-500">
                    {{ row.original.address }}
                  </p>
                </div>
              </div>
            </template>

            <template #timeframeLabel-cell="{ row }">
              <span class="text-xs font-medium text-success">{{ row.original.timeframeLabel }}</span>
            </template>

            <template #txMain-cell="{ row }">
              <div>
                <p class="font-medium text-white">{{ row.original.txMain }}</p>
                <p class="text-xs">
                  <span class="text-success">{{ row.original.txBuy }}</span>
                  <span class="text-slate-600"> / </span>
                  <span class="text-error">{{ row.original.txSell }}</span>
                </p>
              </div>
            </template>

            <template #chg5m-cell="{ row }">
              <span :class="pctClass(row.original.chg5m)">{{ formatPct(row.original.chg5m) }}</span>
            </template>
            <template #chg1h-cell="{ row }">
              <span :class="pctClass(row.original.chg1h)">{{ formatPct(row.original.chg1h) }}</span>
            </template>
            <template #chg6h-cell="{ row }">
              <span :class="pctClass(row.original.chg6h)">{{ formatPct(row.original.chg6h) }}</span>
            </template>
            <template #chg24h-cell="{ row }">
              <span :class="pctClass(row.original.chg24h)">{{ formatPct(row.original.chg24h) }}</span>
            </template>
          </UTable>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({ layout: 'default' })
useHead({ title: 'Tokens - Signal Universe' })

type TokenRow = {
  id: string
  pair: string
  address: string
  symbol: string
  avatarClass: string
  timeframeLabel: string
  liquidity: string
  mc: string
  diluteMc: string
  vol5m: string
  txMain: string
  txBuy: number
  txSell: number
  price: string
  chg5m: number
  chg1h: number
  chg6h: number
  chg24h: number
  chain: string
}

const networks = [
  { id: 'sol', label: 'Solana', flag: '◎' },
  { id: 'eth', label: 'Ethereum', flag: 'Ξ' },
  { id: 'bsc', label: 'BSC', flag: '⬡' }
] as const

const timeframes = ['5m', '1h', '6h', '24h'] as const

const network = ref<(typeof networks)[number]['id']>('sol')
const timeframe = ref<(typeof timeframes)[number]>('5m')
const viewMode = ref<'trending' | 'watchlist'>('trending')
const favorites = ref<Set<string>>(new Set())

const currentNetwork = computed(() => networks.find(n => n.id === network.value)!)

const mockTokens: TokenRow[] = [
  {
    id: '1',
    pair: 'ai16z / SOL',
    address: '4k3Dyjzvzp8e...v7nq',
    symbol: 'AI',
    avatarClass: 'from-violet-500 to-fuchsia-600',
    timeframeLabel: '5m',
    liquidity: '$63.72K',
    mc: '$973.68K',
    diluteMc: '$1.12M',
    vol5m: '$12.4K',
    txMain: '50',
    txBuy: 33,
    txSell: 17,
    price: '$0.00094',
    chg5m: 12.4,
    chg1h: -2.1,
    chg6h: 8.7,
    chg24h: 45.2,
    chain: 'sol'
  },
  {
    id: '2',
    pair: 'BONK / SOL',
    address: 'DezXAZ8z7PnrnR...Je6s',
    symbol: 'BK',
    avatarClass: 'from-orange-500 to-rose-600',
    timeframeLabel: '5m',
    liquidity: '$892.1K',
    mc: '$1.85B',
    diluteMc: '$2.01B',
    vol5m: '$210K',
    txMain: '1.2K',
    txBuy: 780,
    txSell: 420,
    price: '$0.0000182',
    chg5m: -1.2,
    chg1h: 0.8,
    chg6h: -4.3,
    chg24h: 2.1,
    chain: 'sol'
  },
  {
    id: '3',
    pair: 'JUP / SOL',
    address: 'JUPyiwrYJFskUPi...Ha7t',
    symbol: 'JP',
    avatarClass: 'from-emerald-500 to-teal-600',
    timeframeLabel: '5m',
    liquidity: '$4.2M',
    mc: '$890M',
    diluteMc: '$1.1B',
    vol5m: '$890K',
    txMain: '420',
    txBuy: 260,
    txSell: 160,
    price: '$0.652',
    chg5m: 0.4,
    chg1h: 1.9,
    chg6h: 3.2,
    chg24h: -0.8,
    chain: 'sol'
  },
  {
    id: '4',
    pair: 'WIF / SOL',
    address: 'EKpQGSJtjMFqKZ9...KrRJ',
    symbol: 'WF',
    avatarClass: 'from-pink-500 to-purple-600',
    timeframeLabel: '5m',
    liquidity: '$12.1M',
    mc: '$2.1B',
    diluteMc: '$2.4B',
    vol5m: '$3.1M',
    txMain: '2.8K',
    txBuy: 1600,
    txSell: 1200,
    price: '$1.42',
    chg5m: -3.8,
    chg1h: -1.1,
    chg6h: 5.5,
    chg24h: 12.0,
    chain: 'sol'
  },
  {
    id: '5',
    pair: 'PEPE / ETH',
    address: '0x6982508145...565b',
    symbol: 'PP',
    avatarClass: 'from-green-600 to-lime-500',
    timeframeLabel: '5m',
    liquidity: '$18.2M',
    mc: '$4.5B',
    diluteMc: '$4.5B',
    vol5m: '$1.2M',
    txMain: '890',
    txBuy: 510,
    txSell: 380,
    price: '$0.0000107',
    chg5m: 2.2,
    chg1h: 4.4,
    chg6h: -6.1,
    chg24h: 1.1,
    chain: 'eth'
  },
  {
    id: '6',
    pair: 'UNI / ETH',
    address: '0x1f9840a85d5aF...41e0',
    symbol: 'UN',
    avatarClass: 'from-pink-600 to-rose-500',
    timeframeLabel: '5m',
    liquidity: '$22M',
    mc: '$5.9B',
    diluteMc: '$6.2B',
    vol5m: '$640K',
    txMain: '312',
    txBuy: 190,
    txSell: 122,
    price: '$9.84',
    chg5m: 0.1,
    chg1h: -0.5,
    chg6h: 1.2,
    chg24h: 3.3,
    chain: 'eth'
  },
  {
    id: '7',
    pair: 'CAKE / BNB',
    address: '0x0E09FaBB...73d5',
    symbol: 'CK',
    avatarClass: 'from-amber-500 to-orange-600',
    timeframeLabel: '5m',
    liquidity: '$8.4M',
    mc: '$890M',
    diluteMc: '$1.0B',
    vol5m: '$420K',
    txMain: '180',
    txBuy: 102,
    txSell: 78,
    price: '$2.64',
    chg5m: 0.6,
    chg1h: -0.2,
    chg6h: 1.8,
    chg24h: 4.1,
    chain: 'bsc'
  }
]

const chainFiltered = computed(() =>
  mockTokens.filter(r => r.chain === network.value)
)

const filteredRows = computed(() => {
  let rows = chainFiltered.value.map(r => ({
    ...r,
    timeframeLabel: timeframe.value
  }))
  if (viewMode.value === 'watchlist') {
    rows = rows.filter(r => favorites.value.has(r.id))
    if (!rows.length) {
      // keep UX: show placeholder row message via empty state
      return rows
    }
  }
  return rows
})

const columns = computed(() => [
  { accessorKey: 'pair', header: t('tokens.col.token') },
  { accessorKey: 'timeframeLabel', header: t('tokens.col.time') },
  { accessorKey: 'liquidity', header: t('tokens.col.liquidity') },
  { accessorKey: 'mc', header: t('tokens.col.mc') },
  { accessorKey: 'diluteMc', header: t('tokens.col.dilute_mc') },
  { accessorKey: 'vol5m', header: t('tokens.col.vol_5m') },
  { accessorKey: 'txMain', header: t('tokens.col.tx_5m') },
  { accessorKey: 'price', header: t('tokens.col.price') },
  { accessorKey: 'chg5m', header: t('tokens.col.chg_5m') },
  { accessorKey: 'chg1h', header: t('tokens.col.chg_1h') },
  { accessorKey: 'chg6h', header: t('tokens.col.chg_6h') },
  { accessorKey: 'chg24h', header: t('tokens.col.chg_24h') }
])

const tableMeta = {
  class: {
    tr: (_row: { index: number }) =>
      `tokens-row-enter [--i:${_row.index}]`
  },
  style: {
    tr: (row: { index: number }) => ({
      animationDelay: `${Math.min(row.index, 20) * 55}ms`
    })
  }
}

function formatPct(n: number) {
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

function pctClass(n: number) {
  if (n > 0) return 'font-semibold text-success'
  if (n < 0) return 'font-semibold text-error'
  return 'text-slate-400'
}

function toggleFavorite(id: string) {
  const next = new Set(favorites.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  favorites.value = next
}
</script>

<style scoped>
.tokens-row-enter {
  animation: tokens-row-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes tokens-row-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tokens-tr:hover {
  box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.15);
}
</style>
