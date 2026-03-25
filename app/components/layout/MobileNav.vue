<template>
  <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800"
    style="background: rgba(10, 15, 30, 0.98); backdrop-filter: blur(20px);">
    <div class="flex items-center justify-around py-2 px-2 safe-area-bottom">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all"
        :class="isActive(item.to) ? 'text-indigo-400' : 'text-slate-500'"
      >
        <UIcon :name="item.icon" class="text-xl" />
        <span class="text-xs font-medium">{{ $t(item.label) }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()

const navItems = [
  { to: '/dashboard', icon: 'i-heroicons-squares-2x2', label: 'nav.dashboard' },
  { to: '/signals', icon: 'i-heroicons-signal', label: 'nav.signals' },
  { to: '/referral', icon: 'i-heroicons-users', label: 'nav.referral' },
  { to: '/wallet', icon: 'i-heroicons-wallet', label: 'nav.wallet' },
  { to: '/settings', icon: 'i-heroicons-cog-6-tooth', label: 'nav.settings' }
]

const isActive = (to: string) => route.path.startsWith(to)
</script>
