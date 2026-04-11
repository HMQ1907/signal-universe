<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-white">{{ $t('referral.title') }}</h1>
    </div>

    <!-- Referral Code -->
    <div class="su-card mb-6">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p class="text-slate-400 text-sm mb-1">{{ $t('referral.my_code') }}</p>
          <div class="flex items-center gap-3">
            <span class="text-3xl font-black text-indigo-400 tracking-wider">{{ user?.referral_code }}</span>
            <UButton size="sm" icon="i-heroicons-clipboard-document" color="neutral" variant="ghost" @click="copyCode" />
          </div>
        </div>
        <div>
          <p class="text-slate-400 text-sm mb-2">{{ $t('referral.invite_link') }}</p>
          <div class="flex items-center gap-2">
            <code class="text-indigo-400 text-xs bg-slate-800 px-3 py-2 rounded-lg">
              {{ inviteLink }}
            </code>
            <UButton size="sm" icon="i-heroicons-clipboard-document" color="neutral" variant="ghost" @click="copyLink" />
          </div>
        </div>
      </div>
    </div>

    <!-- Stats: F1…Fn (dynamic) + tổng thành viên + tổng nạp mạng -->
    <div v-if="referralLoading" class="flex justify-center py-16 text-slate-500">
      <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin" />
    </div>
    <template v-else>
    <div class="space-y-4 mb-6">
      <div
        v-if="(teamData?.stats?.by_level || []).length"
        class="overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:thin]"
      >
        <div class="flex gap-3 min-w-0">
          <div
            v-for="row in teamData?.stats?.by_level || []"
            :key="row.level"
            class="su-card shrink-0 w-[132px] sm:w-[148px] text-center snap-start"
          >
            <p class="text-3xl font-black" :class="levelCountClass(row.level)">{{ row.count }}</p>
            <p class="text-slate-400 text-sm mt-1 leading-tight">
              {{ $t('referral.team.fn_members', { n: row.level }) }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="su-card text-center">
          <p class="text-3xl font-black text-white">{{ teamData?.stats?.total ?? 0 }}</p>
          <p class="text-slate-400 text-sm mt-1">{{ $t('referral.team.total_members') }}</p>
        </div>
        <div class="su-card text-center border border-emerald-500/25 bg-emerald-500/6">
          <p class="text-3xl font-black text-emerald-400">
            ${{ networkDepositDisplay }}
          </p>
          <p class="text-slate-400 text-sm mt-1">{{ $t('referral.team.network_total_deposit') }}</p>
        </div>
      </div>
    </div>

    <!-- Downline team: all F1…Fn under current user (not uplines) -->
    <div class="su-card mb-6 border border-white/[0.07]">
      <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 class="text-white font-bold text-lg">{{ $t('referral.team.title') }}</h2>
          <p class="text-slate-500 text-sm mt-1 max-w-xl">{{ $t('referral.team.section_hint') }}</p>
        </div>
        <p v-if="allMembers.length" class="text-slate-400 text-sm whitespace-nowrap">
          {{ $t('referral.team.showing_count', { n: filteredMembers.length, total: allMembers.length }) }}
        </p>
      </div>

      <div v-if="allMembers.length" class="space-y-4 mb-5">
        <UInput
          v-model="teamSearch"
          icon="i-heroicons-magnifying-glass"
          size="md"
          color="neutral"
          variant="outline"
          class="w-full max-w-md"
          :placeholder="$t('referral.team.search_placeholder')"
        />
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-slate-500 text-xs uppercase tracking-wide mr-1">{{ $t('referral.team.filter_level') }}</span>
          <UButton
            size="xs"
            :variant="levelFilter === 'all' ? 'solid' : 'outline'"
            color="neutral"
            @click="levelFilter = 'all'"
          >
            {{ $t('referral.team.filter_all') }}
          </UButton>
          <UButton
            v-for="lv in uniqueLevels"
            :key="lv"
            size="xs"
            :variant="levelFilter === lv ? 'solid' : 'outline'"
            color="neutral"
            class="capitalize"
            @click="levelFilter = lv"
          >
            F{{ lv }}
          </UButton>
        </div>
      </div>

      <template v-if="allMembers.length">
        <div v-if="filteredMembers.length" class="overflow-x-auto rounded-xl border border-white/[0.06] bg-slate-950/40">
          <UTable :data="filteredMembers" :columns="teamColumns" class="min-w-[640px]">
            <template #level-cell="{ row }">
              <UBadge
                :label="`F${row.original.level}`"
                :color="levelBadgeColor(row.original.level)"
                variant="soft"
              />
            </template>
            <template #full_name-cell="{ row }">
              <span class="text-white font-medium">{{ displayName(row.original) }}</span>
            </template>
            <template #total_deposited-cell="{ row }">
              <div class="text-right">
                <span class="text-emerald-400 font-semibold tabular-nums">${{ row.original.total_deposited?.toFixed(2) || '0.00' }}</span>
              </div>
            </template>
          </UTable>
        </div>
        <div v-else class="text-center py-10 text-slate-500 rounded-xl border border-dashed border-white/10">
          <p>{{ $t('referral.team.filter_no_match') }}</p>
        </div>
      </template>
      <div v-else class="text-center py-12 text-slate-500">
        <UIcon name="i-heroicons-users" class="text-4xl mb-3 text-slate-600 mx-auto" />
        <p>{{ $t('referral.empty_team') }}</p>
      </div>
    </div>

    <!-- Commission Structure -->
    <div class="grid md:grid-cols-2 gap-6 mb-6">
      <div class="su-card">
        <h3 class="text-white font-bold mb-4">{{ $t('referral.commissions.deposit_title') }}</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center p-3 rounded-xl bg-slate-800/50">
            <div class="flex items-center gap-2">
              <span class="min-w-[1.75rem] h-7 px-1 rounded-md bg-indigo-500/20 text-indigo-400 text-[10px] sm:text-xs flex items-center justify-center font-bold">F1</span>
              <span class="text-slate-300 text-sm">{{ $t('referral.commissions.deposit_row1') }}</span>
            </div>
            <span class="text-green-400 font-bold">{{ $t('referral.commissions.deposit_row1_rate') }}</span>
          </div>
          <div class="flex justify-between items-center p-3 rounded-xl bg-slate-800/50">
            <div class="flex items-center gap-2">
              <span class="min-w-[1.75rem] h-7 px-1 rounded-md bg-purple-500/20 text-purple-400 text-[10px] sm:text-xs flex items-center justify-center font-bold">F2</span>
              <span class="text-slate-300 text-sm">{{ $t('referral.commissions.deposit_row2') }}</span>
            </div>
            <span class="text-green-400 font-bold">{{ $t('referral.commissions.deposit_row2_rate') }}</span>
          </div>
        </div>
        <p class="text-slate-500 text-xs mt-3 leading-relaxed">
          {{ $t('referral.commissions.deposit_hint') }}
        </p>
        <p class="text-slate-500 text-xs mt-2">
          {{ $t('referral.commissions.deposit_total') }}
          <span class="text-white">${{ stats?.total_deposit_commission?.toFixed(2) || '0.00' }}</span>
        </p>
      </div>

      <div class="su-card">
        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0 shrink">
            <h3 class="text-white font-bold">{{ $t('referral.commissions.ai_title') }}</h3>
            <p class="text-slate-500 text-xs mt-1">{{ $t('referral.commissions.ai_context') }}</p>
          </div>
          <div v-if="user?.referral_code" class="flex flex-wrap items-center gap-2 text-sm min-w-0">
            <span class="text-slate-400 whitespace-nowrap">{{ $t('referral.my_code') }}</span>
            <code class="font-mono text-indigo-400 truncate max-w-full">{{ user.referral_code }}</code>
            <UButton size="xs" icon="i-heroicons-clipboard-document" color="neutral" variant="ghost" class="shrink-0" @click="copyCode" />
          </div>
        </div>
        <div class="space-y-3">
          <div class="flex justify-between items-center p-3 rounded-xl bg-slate-800/50">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-md text-xs flex items-center justify-center font-bold bg-indigo-500/20 text-indigo-400">U1</span>
              <span class="text-slate-300 text-sm">{{ $t('referral.commissions.ai_u1_desc') }}</span>
            </div>
            <span class="text-indigo-400 font-bold">{{ $t('referral.commissions.ai_rate_u1') }}</span>
          </div>
          <div class="flex justify-between items-center p-3 rounded-xl bg-slate-800/50">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-md text-xs flex items-center justify-center font-bold bg-purple-500/20 text-purple-400">U2</span>
              <span class="text-slate-300 text-sm">{{ $t('referral.commissions.ai_u2_desc') }}</span>
            </div>
            <span class="text-purple-400 font-bold">{{ $t('referral.commissions.ai_rate_u2') }}</span>
          </div>
          <div class="flex justify-between items-center p-3 rounded-xl bg-slate-800/50">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-md text-xs flex items-center justify-center font-bold bg-pink-500/20 text-pink-400">U3</span>
              <span class="text-slate-300 text-sm">{{ $t('referral.commissions.ai_u3_desc') }}</span>
            </div>
            <span class="text-pink-400 font-bold">{{ $t('referral.commissions.ai_rate_u3') }}</span>
          </div>
        </div>
        <p class="text-slate-500 text-xs mt-3 leading-relaxed">
          {{ $t('referral.commissions.ai_hint') }}
        </p>
        <p class="text-slate-500 text-xs mt-2">
          {{ $t('referral.commissions.ai_total') }}
          <span class="text-white">${{ stats?.total_signal_commission?.toFixed(2) || '0.00' }}</span>
        </p>
      </div>
    </div>

    <p class="text-center text-sm text-slate-400 mb-6">
      {{ $t('referral.commissions.network_profit_tagline') }}
    </p>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { user } = useAuth()
const toast = useToastCustom()
const { t } = useI18n()
const config = useRuntimeConfig()

useHead({ title: () => `${t('referral.title')} - Signal Universe` })

const { data: stats, pending: statsPending } = useFetch('/api/referral/stats', { key: 'referral-stats', lazy: true })
const { data: teamData, pending: teamPending } = useFetch('/api/referral/team', { key: 'referral-team', lazy: true })
const referralLoading = computed(() => statsPending.value || teamPending.value)

const inviteLink = computed(() =>
  `${config.public.siteUrl || (typeof window !== 'undefined' ? window.location.origin : '')}/auth/register?ref=${user.value?.referral_code}`
)

const allMembers = computed(() => teamData.value?.members ?? [])

const teamSearch = ref('')
const levelFilter = ref<number | 'all'>('all')

const uniqueLevels = computed(() => {
  const s = new Set(allMembers.value.map(m => m.level))
  return [...s].sort((a, b) => a - b)
})

const filteredMembers = computed(() => {
  let list = allMembers.value
  if (levelFilter.value !== 'all') {
    list = list.filter(m => m.level === levelFilter.value)
  }
  const q = teamSearch.value.trim().toLowerCase()
  if (q) {
    list = list.filter(m => {
      const name = (m.full_name || '').toLowerCase()
      const email = (m.email || '').toLowerCase()
      return name.includes(q) || email.includes(q)
    })
  }
  return list
})

function displayName(m: { full_name?: string | null; email: string }) {
  const n = (m.full_name || '').trim()
  return n || m.email
}

const teamColumns = computed(() => [
  { accessorKey: 'level', header: t('referral.team.level') },
  { accessorKey: 'full_name', header: t('referral.team.member_name') },
  { accessorKey: 'email', header: t('referral.team.email') },
  { accessorKey: 'total_deposited', header: t('referral.team.total_deposited') }
])

const networkDepositDisplay = computed(() =>
  Number(teamData.value?.stats?.network_total_deposit ?? 0).toFixed(2)
)

const levelCountClass = (level: number) => {
  const c = [
    'text-indigo-400',
    'text-purple-400',
    'text-pink-400',
    'text-cyan-400',
    'text-amber-400',
    'text-emerald-400'
  ]
  return c[(level - 1) % c.length]
}

const levelBadgeColor = (level: number) => {
  const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'neutral'] as const
  return colors[(level - 1) % colors.length]
}

const copyCode = async () => {
  await navigator.clipboard.writeText(user.value?.referral_code || '')
  toast.success(t('referral.toast_code_copied'))
}

const copyLink = async () => {
  await navigator.clipboard.writeText(inviteLink.value)
  toast.success(t('referral.toast_link_copied'))
}
</script>
