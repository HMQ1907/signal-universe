<template>
  <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800"
    style="background: rgba(10, 15, 30, 0.98); backdrop-filter: blur(20px);">
    <div class="safe-area-bottom flex items-stretch justify-between gap-0.5 px-1 py-1.5">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 transition-all active:scale-[0.97]"
        :class="isActive(item.to) ? 'text-primary-400' : 'text-slate-500'"
      >
        <UIcon :name="item.icon" class="text-lg sm:text-xl" />
        <span class="max-w-[4.25rem] truncate text-center text-[10px] font-medium leading-tight sm:text-xs">{{
          $t(item.label)
        }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()

const navItems = [
  { to: '/dashboard', icon: 'i-heroicons-squares-2x2', label: 'nav.dashboard' },
  { to: '/signals', icon: 'i-heroicons-signal', label: 'nav.signals' },
  { to: '/tokens', icon: 'i-heroicons-chart-bar', label: 'nav.tokens' },
  { to: '/referral', icon: 'i-heroicons-users', label: 'nav.referral' },
  { to: '/wallet/deposit', icon: 'i-heroicons-wallet', label: 'nav.wallet' },
  { to: '/settings', icon: 'i-heroicons-cog-6-tooth', label: 'nav.settings' }
]

const isActive = (to: string) =>
  to === '/wallet/deposit' ? route.path.startsWith('/wallet') : route.path.startsWith(to)
</script>
