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

    <!-- Commission Structure -->
    <div class="grid md:grid-cols-2 gap-6 mb-6">
      <div class="su-card">
        <h3 class="text-white font-bold mb-4">Deposit commission</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center p-3 rounded-xl bg-slate-800/50">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-bold">1</span>
              <span class="text-slate-300 text-sm">Direct referral deposits</span>
            </div>
            <span class="text-green-400 font-bold">5% → parent</span>
          </div>
          <div class="flex justify-between items-center p-3 rounded-xl bg-slate-800/50">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-md bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center font-bold">2</span>
              <span class="text-slate-300 text-sm">2nd-level deposits</span>
            </div>
            <span class="text-green-400 font-bold">3% → grandparent</span>
          </div>
        </div>
        <p class="text-slate-500 text-xs mt-3">Total deposit commission earned: <span class="text-white">${{ stats?.total_deposit_commission?.toFixed(2) || '0.00' }}</span></p>
      </div>

      <div class="su-card">
        <h3 class="text-white font-bold mb-4">AI confirm (package tier)</h3>
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
        <UTable :data="allMembers" :columns="columns">
          <template #level-cell="{ row }">
            <UBadge
              :label="`F${row.original.level}`"
              :color="row.original.level === 1 ? 'primary' : row.original.level === 2 ? 'secondary' : 'info'"
              variant="soft"
            />
          </template>
          <template #investment_package-cell="{ row }">
            <span class="text-slate-300">${{ row.original.investment_package || '-' }}</span>
          </template>
          <template #total_deposited-cell="{ row }">
            <span class="text-success-500">${{ row.original.total_deposited?.toFixed(2) || '0.00' }}</span>
          </template>
          <template #created_at-cell="{ row }">
            <span class="text-sm text-slate-400">{{ new Date(row.original.created_at).toLocaleDateString() }}</span>
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

const columns = computed(() => [
  { accessorKey: 'full_name', header: t('referral.team.member_name') },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'level', header: t('referral.team.level') },
  { accessorKey: 'investment_package', header: 'Package' },
  { accessorKey: 'total_deposited', header: t('referral.team.total_deposited') },
  { accessorKey: 'created_at', header: t('referral.team.joined') }
])

const compoundLevels = [
  { label: 'U1', desc: '1st upline above confirmer', rate: '15% of profit', color: 'text-indigo-400', badgeCls: 'bg-indigo-500/20 text-indigo-400' },
  { label: 'U2', desc: '2nd upline', rate: '10% of profit', color: 'text-purple-400', badgeCls: 'bg-purple-500/20 text-purple-400' },
  { label: 'U3', desc: '3rd upline', rate: '5% of profit', color: 'text-pink-400', badgeCls: 'bg-pink-500/20 text-pink-400' }
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
