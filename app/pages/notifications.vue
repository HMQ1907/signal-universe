<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
    <div class="mb-8 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-white">{{ $t('notifications.title') }}</h1>
      <UButton v-if="unreadCount > 0" size="sm" color="neutral" variant="ghost" @click="markAllRead">
        {{ $t('notifications.mark_all_read') }}
      </UButton>
    </div>

    <div class="su-card">
      <div v-if="notifications?.length" class="space-y-0">
        <div v-for="n in notifications" :key="n.id"
          class="flex items-start gap-4 py-4 border-b border-slate-800 last:border-0 cursor-pointer"
          :class="!n.is_read ? 'bg-primary-500/5' : ''"
        >
          <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            :class="notifBg(n.type)">
            <UIcon :name="notifIcon(n.type)" :class="notifColor(n.type)" class="text-sm" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-white font-medium text-sm">{{ n.title }}</p>
              <span v-if="!n.is_read" class="h-2 w-2 rounded-full bg-primary-400" />
            </div>
            <p class="text-slate-400 text-sm mt-0.5">{{ n.message }}</p>
            <p class="text-slate-600 text-xs mt-1">{{ new Date(n.created_at).toLocaleString() }}</p>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16 text-slate-500">
        <UIcon name="i-heroicons-bell" class="text-5xl mb-4 text-slate-700" />
        <p>{{ $t('notifications.no_notifications') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Notifications - Signal Universe' })

const toast = useToastCustom()
const { data: notifications, refresh } = await useFetch<any[]>('/api/user/notifications', { key: 'notifications-page' })
const unreadCount = computed(() => notifications.value?.filter(n => !n.is_read).length || 0)

const markAllRead = async () => {
  await $fetch('/api/user/notifications', { method: 'PATCH' })
  await refresh()
}

const notifIcon = (type: string) => {
  const icons: Record<string, string> = {
    deposit: 'i-heroicons-arrow-down-tray', withdrawal: 'i-heroicons-arrow-up-tray',
    signal: 'i-heroicons-signal', referral: 'i-heroicons-users',
    leader: 'i-heroicons-trophy', admin: 'i-heroicons-shield-check', system: 'i-heroicons-cog-6-tooth'
  }
  return icons[type] || 'i-heroicons-bell'
}

const notifBg = (type: string) => {
  const map: Record<string, string> = {
    deposit: 'bg-success-500/10',
    withdrawal: 'bg-error-500/10',
    signal: 'bg-primary-500/10',
    referral: 'bg-secondary-500/10',
    leader: 'bg-warning-500/10',
    admin: 'bg-info-500/10'
  }
  return map[type] || 'bg-slate-800'
}

const notifColor = (type: string) => {
  const map: Record<string, string> = {
    deposit: 'text-success-500',
    withdrawal: 'text-error-500',
    signal: 'text-primary-400',
    referral: 'text-secondary-400',
    leader: 'text-warning-500',
    admin: 'text-info-500'
  }
  return map[type] || 'text-slate-400'
}
</script>
