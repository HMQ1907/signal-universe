<template>
  <div class="relative">
    <UButton
      icon="i-heroicons-bell"
      color="gray"
      variant="ghost"
      size="sm"
      @click="navigateTo('/notifications')"
    >
      <template #trailing>
        <span
          v-if="unreadCount > 0"
          class="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center font-bold"
          style="background: #ef4444; font-size: 10px;"
        >
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </template>
    </UButton>
  </div>
</template>

<script setup lang="ts">
const { data: notifications } = await useFetch('/api/user/notifications', { key: 'notifications' })
const unreadCount = computed(() => notifications.value?.filter((n: any) => !n.is_read).length || 0)
</script>
