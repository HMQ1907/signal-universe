<template>
  <div class="min-h-screen flex" style="background: #0a0f1e;">
    <!-- Sidebar -->
    <aside class="hidden lg:flex flex-col w-64 admin-sidebar fixed top-0 left-0 h-full z-40">
      <!-- Logo -->
      <div class="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center"
          style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
          <UIcon name="i-heroicons-signal" class="text-white text-sm" />
        </div>
        <span class="font-bold text-white">Signal Universe</span>
        <UBadge label="Admin" size="xs" color="primary" variant="soft" class="ml-auto" />
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 overflow-y-auto">
        <div class="space-y-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            :class="isActive(item.to)
              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'"
          >
            <UIcon :name="item.icon" class="text-base flex-shrink-0" />
            {{ $t(item.label) }}
          </NuxtLink>
        </div>
      </nav>

      <!-- User -->
      <div class="px-3 py-4 border-t border-slate-800">
        <div class="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-800/50">
          <div class="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <UIcon name="i-heroicons-user" class="text-indigo-400 text-sm" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">{{ user?.full_name || 'Admin' }}</p>
            <p class="text-xs text-slate-500 truncate">{{ user?.email }}</p>
          </div>
          <UButton icon="i-heroicons-arrow-right-on-rectangle" size="xs" color="neutral" variant="ghost"
            @click="handleLogout" />
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 lg:ml-64 flex flex-col min-h-screen">
      <!-- Top bar (mobile) -->
      <header class="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center"
            style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
            <UIcon name="i-heroicons-signal" class="text-white text-xs" />
          </div>
          <span class="font-bold text-white text-sm">Admin</span>
        </div>
        <UButton icon="i-heroicons-bars-3" color="neutral" variant="ghost" size="sm" @click="mobileMenuOpen = true" />
      </header>

      <!-- Mobile menu -->
      <USlideover v-model="mobileMenuOpen" side="left" class="w-64">
        <div class="flex flex-col h-full bg-slate-900">
          <div class="flex items-center justify-between px-4 py-4 border-b border-slate-800">
            <span class="font-bold text-white">Admin Menu</span>
            <UButton icon="i-heroicons-x-mark" color="neutral" variant="ghost" size="sm" @click="mobileMenuOpen = false" />
          </div>
          <nav class="flex-1 px-3 py-4 overflow-y-auto">
            <div class="space-y-1">
              <NuxtLink
                v-for="item in navItems"
                :key="item.to"
                :to="item.to"
                @click="mobileMenuOpen = false"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                :class="isActive(item.to)
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'"
              >
                <UIcon :name="item.icon" class="text-base" />
                {{ $t(item.label) }}
              </NuxtLink>
            </div>
          </nav>
        </div>
      </USlideover>

      <main class="flex-1 p-4 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { user, logout } = useAuth()
const mobileMenuOpen = ref(false)

const navItems = [
  { to: '/admin', icon: 'i-heroicons-chart-bar', label: 'admin.nav.dashboard' },
  { to: '/admin/pending', icon: 'i-heroicons-clock', label: 'admin.nav.pending' },
  { to: '/admin/users', icon: 'i-heroicons-users', label: 'admin.nav.users' },
  { to: '/admin/signals', icon: 'i-heroicons-signal', label: 'admin.nav.signals' },
  { to: '/admin/deposits', icon: 'i-heroicons-arrow-down-tray', label: 'admin.nav.deposits' },
  { to: '/admin/withdrawals', icon: 'i-heroicons-arrow-up-tray', label: 'admin.nav.withdrawals' },
  { to: '/admin/transactions', icon: 'i-heroicons-banknotes', label: 'admin.nav.transactions' },
  { to: '/admin/compound', icon: 'i-heroicons-arrow-path', label: 'admin.nav.compound' },
  { to: '/admin/cccd', icon: 'i-heroicons-identification', label: 'admin.nav.cccd' },
  { to: '/admin/wallets', icon: 'i-heroicons-wallet', label: 'admin.nav.wallets' },
  { to: '/admin/settings', icon: 'i-heroicons-cog-6-tooth', label: 'admin.nav.settings' }
]

const isActive = (to: string) => {
  if (to === '/admin') return route.path === '/admin'
  return route.path.startsWith(to)
}

const handleLogout = async () => {
  await logout()
  navigateTo('/auth/login')
}
</script>
