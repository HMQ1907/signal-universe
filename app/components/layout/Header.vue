<template>
  <header class="sticky top-0 z-50 border-b border-slate-800/80 backdrop-blur-xl"
    style="background: rgba(10, 15, 30, 0.95);">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
            <UIcon name="i-heroicons-signal" class="text-white text-sm" />
          </div>
          <span class="text-lg font-bold gradient-text hidden sm:block">Signal Universe</span>
        </NuxtLink>

        <!-- Center nav (desktop) -->
        <nav class="hidden lg:flex items-center gap-1" v-if="!user">
          <NuxtLink to="/" class="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50">
            {{ $t('nav.home') }}
          </NuxtLink>
        </nav>

        <!-- Desktop Nav (logged in) -->
        <nav class="hidden lg:flex items-center gap-1" v-if="user && !user.is_admin">
          <NuxtLink v-for="item in userNav" :key="item.to" :to="item.to"
            class="px-3 py-2 text-sm transition-colors rounded-lg flex items-center gap-1.5"
            :class="$route.path.startsWith(item.to) ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'">
            <UIcon :name="item.icon" class="text-sm" />
            {{ $t(item.label) }}
          </NuxtLink>
        </nav>

        <!-- Right side -->
        <div class="flex items-center gap-2">
          <LanguageSwitcher />

          <template v-if="user">
            <NotificationBell v-if="!user.is_admin" />

            <UDropdown :items="profileMenuItems" :ui="{ item: { disabled: 'cursor-text select-text' } }">
              <UButton color="gray" variant="ghost" class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
                  <UIcon name="i-heroicons-user" class="text-white text-xs" />
                </div>
                <span class="hidden md:block text-sm text-slate-300">{{ user.full_name || user.email }}</span>
                <UIcon name="i-heroicons-chevron-down" class="text-slate-500 text-xs" />
              </UButton>
            </UDropdown>
          </template>

          <template v-else>
            <NuxtLink to="/auth/login">
              <UButton color="gray" variant="ghost" size="sm">{{ $t('nav.login') }}</UButton>
            </NuxtLink>
            <NuxtLink to="/auth/register">
              <UButton size="sm" class="bg-indigo-600 hover:bg-indigo-500">{{ $t('nav.register') }}</UButton>
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { user, logout } = useAuth()
const { t } = useI18n()

const userNav = [
  { to: '/dashboard', icon: 'i-heroicons-squares-2x2', label: 'nav.dashboard' },
  { to: '/signals', icon: 'i-heroicons-signal', label: 'nav.signals' },
  { to: '/referral', icon: 'i-heroicons-users', label: 'nav.referral' },
  { to: '/wallet', icon: 'i-heroicons-wallet', label: 'nav.wallet' }
]

const profileMenuItems = computed(() => {
  if (!user.value) return []

  const items = []

  if (user.value.is_admin) {
    items.push([{ label: t('nav.admin'), icon: 'i-heroicons-shield-check', to: '/admin' }])
  } else {
    items.push([
      { label: t('nav.dashboard'), icon: 'i-heroicons-squares-2x2', to: '/dashboard' },
      { label: t('nav.settings'), icon: 'i-heroicons-cog-6-tooth', to: '/settings' }
    ])
  }

  items.push([{
    label: t('common.logout'),
    icon: 'i-heroicons-arrow-right-on-rectangle',
    click: () => logout()
  }])

  return items
})
</script>
