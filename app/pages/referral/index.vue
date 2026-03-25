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
            <UButton size="sm" icon="i-heroicons-clipboard-document" color="gray" variant="ghost" @click="copyCode" />
          </div>
        </div>
        <div>
          <p class="text-slate-400 text-sm mb-2">{{ $t('referral.invite_link') }}</p>
          <div class="flex items-center gap-2">
            <code class="text-indigo-400 text-xs bg-slate-800 px-3 py-2 rounded-lg">
              {{ inviteLink }}
            </code>
            <UButton size="sm" icon="i-heroicons-clipboard-document" color="gray" variant="ghost" @click="copyLink" />
          </div>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="su-card text-center">
        <p class="text-3xl font-black text-indigo-400">{{ stats?.direct_f1 || 0 }}</p>
        <p class="text-slate-400 text-sm mt-1">{{ $t('referral.team.f1_members') }}</p>
      </div>
      <div class="su-card text-center">
        <p class="text-3xl font-black text-purple-400">{{ teamData?.stats?.f2_count || 0 }}</p>
        <p class="text-slate-400 text-sm mt-1">{{ $t('referral.team.f2_members') }}</p>
      </div>
      <div class="su-card text-center">
        <p class="text-3xl font-black text-pink-400">{{ teamData?.stats?.f3_count || 0 }}</p>
        <p class="text-slate-400 text-sm mt-1">{{ $t('referral.team.f3_members') }}</p>
      </div>
      <div class="su-card text-center">
        <p class="text-3xl font-black text-white">{{ teamData?.stats?.total || 0 }}</p>
        <p class="text-slate-400 text-sm mt-1">{{ $t('referral.team.total_members') }}</p>
      </div>
    </div>

    <!-- Leader Bonus -->
    <div class="su-card mb-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <UIcon name="i-heroicons-trophy" class="text-amber-400 text-lg" />
        </div>
        <h2 class="text-white font-bold text-lg">{{ $t('referral.leader_bonus.title') }}</h2>
      </div>

      <div class="grid md:grid-cols-2 gap-4 mb-4">
        <div class="p-4 rounded-xl bg-slate-800/50">
          <p class="text-slate-400 text-sm">{{ $t('referral.leader_bonus.current_level') }}</p>
          <p class="text-2xl font-black mt-1">
            <span v-if="stats?.leader_level" class="text-amber-400">Leader {{ stats.leader_level }}</span>
            <span v-else class="text-slate-500">-</span>
          </p>
          <p v-if="stats?.leader_level" class="text-green-400 text-sm font-semibold">
            ${{ stats.leader_bonus_weekly }}/week
          </p>
        </div>
        <div v-if="stats?.next_level" class="p-4 rounded-xl bg-slate-800/50">
          <p class="text-slate-400 text-sm">{{ $t('referral.leader_bonus.next_level') }}</p>
          <p class="text-2xl font-black mt-1 text-indigo-400">Leader {{ stats.next_level }}</p>
          <p class="text-slate-400 text-sm">Need {{ stats.next_level_f1_needed }} more F1</p>
        </div>
      </div>

      <div class="space-y-2">
        <div v-for="level in leaderLevels" :key="level.level"
          class="flex items-center justify-between p-3 rounded-xl transition-all"
          :class="stats?.leader_level === level.level ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-slate-800/30'">
          <div class="flex items-center gap-3">
            <UIcon v-if="stats?.leader_level === level.level" name="i-heroicons-check-circle" class="text-amber-400" />
            <UIcon v-else name="i-heroicons-lock-closed" class="text-slate-600" />
            <span class="text-slate-300 text-sm">Leader {{ level.level }} (≥{{ level.f1 }} F1)</span>
          </div>
          <span class="font-bold" :class="stats?.leader_level === level.level ? 'text-amber-400' : 'text-slate-500'">
            ${{ level.bonus }}/week
          </span>
        </div>
      </div>
    </div>

    <!-- Commission Structure -->
    <div class="grid md:grid-cols-2 gap-6 mb-6">
      <div class="su-card">
        <h3 class="text-white font-bold mb-4">Deposit Commission</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center p-3 rounded-xl bg-slate-800/50">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-bold">F1</span>
              <span class="text-slate-300 text-sm">Direct</span>
            </div>
            <span class="text-green-400 font-bold">5%</span>
          </div>
          <div class="flex justify-between items-center p-3 rounded-xl bg-slate-800/50">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-md bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center font-bold">F2</span>
              <span class="text-slate-300 text-sm">2nd level</span>
            </div>
            <span class="text-green-400 font-bold">3%</span>
          </div>
        </div>
        <p class="text-slate-500 text-xs mt-3">Total deposit commission earned: <span class="text-white">${{ stats?.total_deposit_commission?.toFixed(2) || '0.00' }}</span></p>
      </div>

      <div class="su-card">
        <h3 class="text-white font-bold mb-4">Compound Interest</h3>
        <div class="space-y-3">
          <div v-for="cl in compoundLevels" :key="cl.label"
            class="flex justify-between items-center p-3 rounded-xl bg-slate-800/50">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-md text-xs flex items-center justify-center font-bold" :class="cl.badgeCls">{{ cl.label }}</span>
              <span class="text-slate-300 text-sm">{{ cl.desc }}</span>
            </div>
            <span class="font-bold" :class="cl.color">{{ cl.rate }}</span>
          </div>
        </div>
        <p class="text-slate-500 text-xs mt-3">Total profit commission: <span class="text-white">${{ stats?.total_signal_commission?.toFixed(2) || '0.00' }}</span></p>
      </div>
    </div>

    <!-- Team Members -->
    <div class="su-card">
      <h2 class="text-white font-bold text-lg mb-6">{{ $t('referral.team.title') }}</h2>

      <div v-if="allMembers.length">
        <UTable :rows="allMembers" :columns="columns">
          <template #level-data="{ row }">
            <UBadge :label="`F${row.level}`" :color="row.level === 1 ? 'indigo' : row.level === 2 ? 'purple' : 'pink'" variant="soft" />
          </template>
          <template #investment_package-data="{ row }">
            <span class="text-slate-300">${{ row.investment_package || '-' }}</span>
          </template>
          <template #total_deposited-data="{ row }">
            <span class="text-green-400">${{ row.total_deposited?.toFixed(2) || '0.00' }}</span>
          </template>
          <template #created_at-data="{ row }">
            <span class="text-slate-400 text-sm">{{ new Date(row.created_at).toLocaleDateString() }}</span>
          </template>
        </UTable>
      </div>

      <div v-else class="text-center py-12 text-slate-500">
        <UIcon name="i-heroicons-users" class="text-4xl mb-3 text-slate-600" />
        <p>No team members yet. Share your referral code!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Referral - Signal Universe' })

const { user } = useAuth()
const toast = useToastCustom()
const { t } = useI18n()
const config = useRuntimeConfig()

const { data: stats } = await useFetch('/api/referral/stats', { key: 'referral-stats' })
const { data: teamData } = await useFetch('/api/referral/team', { key: 'referral-team' })

const inviteLink = computed(() =>
  `${config.public.siteUrl || (typeof window !== 'undefined' ? window.location.origin : '')}/auth/register?ref=${user.value?.referral_code}`
)

const allMembers = computed(() => [
  ...(teamData.value?.f1 || []),
  ...(teamData.value?.f2 || []),
  ...(teamData.value?.f3 || [])
])

const columns = [
  { key: 'full_name', label: t('referral.team.member_name') },
  { key: 'email', label: 'Email' },
  { key: 'level', label: t('referral.team.level') },
  { key: 'investment_package', label: 'Package' },
  { key: 'total_deposited', label: t('referral.team.total_deposited') },
  { key: 'created_at', label: t('referral.team.joined') }
]

const leaderLevels = [
  { level: 1, f1: 10, bonus: 50 },
  { level: 2, f1: 20, bonus: 100 },
  { level: 3, f1: 50, bonus: 200 },
  { level: 4, f1: 100, bonus: 500 },
  { level: 5, f1: 200, bonus: 1000 }
]

const compoundLevels = [
  { label: 'F1', desc: 'Direct referral', rate: '15%', color: 'text-indigo-400', badgeCls: 'bg-indigo-500/20 text-indigo-400' },
  { label: 'F2', desc: '2nd level', rate: '10%', color: 'text-purple-400', badgeCls: 'bg-purple-500/20 text-purple-400' },
  { label: 'F3', desc: '3rd level', rate: '5%', color: 'text-pink-400', badgeCls: 'bg-pink-500/20 text-pink-400' }
]

const copyCode = async () => {
  await navigator.clipboard.writeText(user.value?.referral_code || '')
  toast.success('Code copied!')
}

const copyLink = async () => {
  await navigator.clipboard.writeText(inviteLink.value)
  toast.success('Link copied!')
}
</script>
