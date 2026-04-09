<template>
  <div class="min-h-screen flex bg-[var(--su-bg-dark)]">
    <!-- Sidebar -->
    <aside
      class="admin-surface hidden lg:flex flex-col w-64 fixed top-0 left-0 h-full z-40 border-r border-white/6"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-5 py-4 border-b border-white/6">
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style="background: linear-gradient(135deg, #6366f1, #8b5cf6);"
        >
          <UIcon name="i-heroicons-signal" class="text-white text-sm" />
        </div>
        <span class="font-bold text-white text-sm">Signal Universe</span>
        <UBadge
          :label="user?.is_admin ? $t('admin.ui.badge_admin') : $t('admin.ui.badge_sub_admin')"
          size="xs"
          :color="user?.is_admin ? 'primary' : 'amber'"
          variant="soft"
          class="ml-auto shrink-0"
        />
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-3 overflow-y-auto">
        <div class="space-y-0.5">
          <NuxtLink
            v-for="item in visibleNavItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
            :class="isActive(item.to)
              ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
              : 'text-slate-400 hover:text-white hover:bg-white/6'"
          >
            <UIcon :name="item.icon" class="text-base shrink-0" />
            <span>{{ $t(item.label) }}</span>
            <UBadge
              v-if="item.adminOnly"
              :label="$t('admin.ui.badge_admin')"
              size="xs"
              color="error"
              variant="soft"
              class="ml-auto"
            />
          </NuxtLink>
        </div>
      </nav>

      <!-- User footer -->
      <div class="px-3 py-3 border-t border-white/6">
        <div class="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/4">
          <div class="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
            <UIcon name="i-heroicons-user" class="text-indigo-400 text-sm" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">{{ user?.full_name || (user?.is_admin ? $t('admin.ui.badge_admin') : $t('admin.ui.badge_sub_admin')) }}</p>
            <p class="text-xs text-slate-500 truncate">{{ user?.email }}</p>
          </div>
          <UButton
            icon="i-heroicons-arrow-right-on-rectangle"
            size="xs"
            color="neutral"
            variant="ghost"
            class="text-slate-500 hover:text-white"
            @click="handleLogout"
          />
        </div>
      </div>
    </aside>

    <!-- Mobile top bar -->
    <div class="admin-surface lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 h-14 border-b border-white/6">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg flex items-center justify-center"
          style="background: linear-gradient(135deg,#6366f1,#8b5cf6);">
          <UIcon name="i-heroicons-signal" class="text-white text-xs" />
        </div>
        <span class="font-bold text-white text-sm">Signal Universe</span>
      </div>
      <UButton icon="i-heroicons-bars-3" color="neutral" variant="ghost" size="sm" @click="mobileOpen = !mobileOpen" />
    </div>

    <!-- Mobile drawer overlay -->
    <Transition name="fade">
      <div v-if="mobileOpen" class="lg:hidden fixed inset-0 z-50 flex">
        <div class="absolute inset-0 bg-black/60" @click="mobileOpen = false" />
        <div class="admin-surface-solid relative w-64 h-full flex flex-col border-r border-white/6">
          <div class="flex items-center justify-between px-5 py-4 border-b border-white/6">
            <span class="font-bold text-white text-sm">{{ $t('admin.ui.mobile_menu') }}</span>
            <UButton icon="i-heroicons-x-mark" color="neutral" variant="ghost" size="xs" @click="mobileOpen = false" />
          </div>
          <nav class="flex-1 px-3 py-3 overflow-y-auto">
            <div class="space-y-0.5">
              <NuxtLink
                v-for="item in visibleNavItems"
                :key="item.to"
                :to="item.to"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                :class="isActive(item.to)
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/6'"
                @click="mobileOpen = false"
              >
                <UIcon :name="item.icon" class="text-base shrink-0" />
                {{ $t(item.label) }}
              </NuxtLink>
            </div>
          </nav>
        </div>
      </div>
    </Transition>

    <!-- Main content -->
    <div class="flex-1 lg:ml-64 flex flex-col min-h-screen pt-14 lg:pt-0">
      <main class="flex-1 p-4 lg:p-6 xl:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { user, logout } = useAuth()
const mobileOpen = ref(false)

/** Admin area is Vietnamese-only for operators; restore user locale when leaving. */
const { locale, setLocale } = useI18n()
const previousLocale = ref<string>('')

onMounted(() => {
  previousLocale.value = String(locale.value)
  setLocale('vi')
})

onBeforeUnmount(() => {
  const p = previousLocale.value
  const allowed = ['en', 'vi', 'zh', 'ms', 'ru'] as const
  if (allowed.includes(p as (typeof allowed)[number])) {
    setLocale(p as (typeof allowed)[number])
  }
})

const allNavItems = [
  { to: '/admin', icon: 'i-heroicons-chart-bar', label: 'admin.nav.dashboard', subAdminAllowed: true },
  { to: '/admin/pending', icon: 'i-heroicons-clock', label: 'admin.nav.pending', subAdminAllowed: true },
  { to: '/admin/users', icon: 'i-heroicons-users', label: 'admin.nav.users', subAdminAllowed: true },
  { to: '/admin/signals', icon: 'i-heroicons-signal', label: 'admin.nav.signals', subAdminAllowed: false, adminOnly: true },
  { to: '/admin/deposits', icon: 'i-heroicons-arrow-down-tray', label: 'admin.nav.deposits', subAdminAllowed: true },
  { to: '/admin/withdrawals', icon: 'i-heroicons-arrow-up-tray', label: 'admin.nav.withdrawals', subAdminAllowed: true },
  { to: '/admin/transactions', icon: 'i-heroicons-banknotes', label: 'admin.nav.transactions', subAdminAllowed: true },
  { to: '/admin/compound', icon: 'i-heroicons-arrow-path', label: 'admin.nav.compound', subAdminAllowed: true },
  { to: '/admin/cccd', icon: 'i-heroicons-identification', label: 'admin.nav.cccd', subAdminAllowed: true },
  { to: '/admin/wallets', icon: 'i-heroicons-wallet', label: 'admin.nav.wallets', subAdminAllowed: true },
  { to: '/admin/sub-admins', icon: 'i-heroicons-shield-check', label: 'admin.nav.sub_admins', subAdminAllowed: false, adminOnly: true },
  { to: '/admin/settings', icon: 'i-heroicons-cog-6-tooth', label: 'admin.nav.settings', subAdminAllowed: false, adminOnly: true }
]

const visibleNavItems = computed(() => {
  if (user.value?.is_admin) return allNavItems
  return allNavItems.filter(item => item.subAdminAllowed)
})

const isActive = (to: string) => {
  if (to === '/admin') return route.path === '/admin'
  return route.path.startsWith(to)
}

const handleLogout = async () => {
  await logout()
  navigateTo('/auth/login')
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
