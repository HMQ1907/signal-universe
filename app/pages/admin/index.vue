<template>
  <div>
    <h1 class="text-2xl font-bold text-white mb-8">{{ $t('admin.dashboard.title') }}</h1>

    <div v-if="pending" class="flex justify-center py-20 text-slate-500">
      <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin" />
    </div>
    <template v-else>
    <!-- Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="su-card" v-for="stat in statsCards" :key="stat.label">
        <div class="flex items-center justify-between mb-3">
          <p class="text-slate-400 text-sm">{{ stat.label }}</p>
          <div class="w-9 h-9 rounded-xl flex items-center justify-center" :class="stat.bgColor">
            <UIcon :name="stat.icon" :class="stat.color" />
          </div>
        </div>
        <p class="text-2xl font-black text-white">{{ stat.value }}</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid md:grid-cols-3 gap-4">
      <NuxtLink to="/admin/deposits">
        <div class="su-card su-card-hover cursor-pointer">
          <div class="flex items-center gap-3 mb-2">
            <UIcon name="i-heroicons-arrow-down-tray" class="text-green-400 text-xl" />
            <span class="text-white font-semibold">{{ $t('admin.dashboard.pending_deposits') }}</span>
          </div>
          <p class="text-3xl font-black text-green-400">{{ stats?.pending_deposits || 0 }}</p>
        </div>
      </NuxtLink>
      <NuxtLink to="/admin/withdrawals">
        <div class="su-card su-card-hover cursor-pointer">
          <div class="flex items-center gap-3 mb-2">
            <UIcon name="i-heroicons-arrow-up-tray" class="text-red-400 text-xl" />
            <span class="text-white font-semibold">{{ $t('admin.dashboard.pending_withdrawals') }}</span>
          </div>
          <p class="text-3xl font-black text-red-400">{{ stats?.pending_withdrawals || 0 }}</p>
        </div>
      </NuxtLink>
      <NuxtLink to="/admin/signals">
        <div class="su-card su-card-hover cursor-pointer">
          <div class="flex items-center gap-3 mb-2">
            <UIcon name="i-heroicons-signal" class="text-indigo-400 text-xl" />
            <span class="text-white font-semibold">{{ $t('admin.signals.title') }}</span>
          </div>
          <p class="text-slate-400 text-sm">{{ $t('admin.dashboard.manage_sessions_hint') }}</p>
        </div>
      </NuxtLink>
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { t } = useI18n()
useHead({ title: () => `${t('admin.dashboard.title')} - Signal Universe` })
const { data: stats, pending } = useFetch('/api/admin/stats', { key: 'admin-stats', lazy: true })

const statsCards = computed(() => [
  { label: t('admin.dashboard.total_users'), value: stats.value?.total_users || 0, icon: 'i-heroicons-users', color: 'text-indigo-400', bgColor: 'bg-indigo-500/10' },
  { label: t('admin.dashboard.active_users'), value: stats.value?.active_users || 0, icon: 'i-heroicons-user-check', color: 'text-green-400', bgColor: 'bg-green-500/10' },
  { label: t('admin.dashboard.total_deposited'), value: `$${(stats.value?.total_deposited || 0).toFixed(2)}`, icon: 'i-heroicons-arrow-down-tray', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  { label: t('admin.dashboard.total_balance'), value: `$${(stats.value?.total_user_balance || 0).toFixed(2)}`, icon: 'i-heroicons-banknotes', color: 'text-purple-400', bgColor: 'bg-purple-500/10' }
])
</script>
