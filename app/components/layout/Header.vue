<template>
  <header
    class="sticky top-0 z-50 overflow-x-visible border-b border-white/6 bg-[#030308]/75 backdrop-blur-2xl supports-backdrop-filter:bg-[#030308]/55"
  >
    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      <div class="flex min-h-16 items-center justify-between gap-2 py-2 sm:gap-3 sm:py-0 lg:h-16 lg:py-0">
        <!-- Logo -->
        <NuxtLink to="/" class="flex min-w-0 shrink-0 items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
            <UIcon name="i-heroicons-signal" class="text-white text-sm" />
          </div>
          <span class="text-lg font-bold gradient-text hidden sm:block">Signal Universe</span>
        </NuxtLink>

        <!-- Center nav (desktop) -->
        <nav class="hidden lg:flex items-center gap-1" v-if="!user">
          <NuxtLink
            to="/"
            :class="[
              'nav-link-web3 rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-800/50 hover:text-white',
              $route.path === '/' ? 'bg-primary-500/10 text-primary-400' : ''
            ]"
          >
            {{ $t('nav.home') }}
          </NuxtLink>
          <NuxtLink
            to="/tokens"
            :class="[
              'nav-link-web3 rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-800/50 hover:text-white',
              $route.path.startsWith('/tokens') ? 'bg-primary-500/10 text-primary-400' : ''
            ]"
          >
            {{ $t('nav.tokens') }}
          </NuxtLink>
          <NuxtLink
            to="/platform"
            :class="[
              'nav-link-web3 rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-800/50 hover:text-white',
              $route.path === '/platform' ? 'bg-primary-500/10 text-primary-400' : ''
            ]"
          >
            {{ $t('nav.platform') }}
          </NuxtLink>
        </nav>

        <!-- Desktop Nav (logged in) -->
        <nav class="hidden lg:flex items-center gap-1" v-if="user && !user.is_admin">
          <NuxtLink v-for="item in userNav" :key="item.to" :to="item.to"
            class="px-3 py-2 text-sm transition-colors rounded-lg flex items-center gap-1.5"
            :class="
              $route.path.startsWith(item.to)
                ? 'bg-primary-500/10 text-primary-400'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            ">
            <UIcon :name="item.icon" class="text-sm" />
            {{ $t(item.label) }}
          </NuxtLink>
        </nav>

        <!-- Right: language stays visible; auth buttons compact on small screens -->
        <div class="relative z-20 flex shrink-0 items-center gap-1 sm:gap-2">
          <div class="shrink-0">
            <LayoutLanguageSwitcher />
          </div>

          <template v-if="user">
            <LayoutNotificationBell v-if="!user.is_admin" />

            <UDropdownMenu
              :items="profileMenuItems"
              :ui="profileDropdownUi"
            >
              <template #default>
                <button
                  class="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm transition-all duration-200 hover:bg-white/[0.07] focus:outline-none"
                >
                  <div
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-2 ring-indigo-500/40"
                    style="background:linear-gradient(135deg,#6366f1,#8b5cf6)"
                  >
                    <UIcon name="i-heroicons-user" class="text-xs text-white" />
                  </div>
                  <span class="hidden max-w-[120px] truncate text-sm font-medium text-slate-200 md:block">
                    {{ user.full_name || user.email }}
                  </span>
                  <UIcon name="i-heroicons-chevron-down" class="text-xs text-slate-500" />
                </button>
              </template>

              <template #item-leading="{ item }">
                <UIcon :name="item.icon" class="size-4 shrink-0" :class="(item as any).class?.includes('red') ? 'text-red-400' : 'text-slate-400'" />
              </template>
            </UDropdownMenu>
          </template>

          <template v-else>
            <UButton to="/auth/login" color="neutral" variant="ghost" size="sm" class="px-2 sm:px-3">
              {{ $t('nav.login') }}
            </UButton>
            <UButton to="/auth/register" size="sm" color="primary" class="px-3 font-semibold shadow-lg shadow-primary-500/20 sm:px-4">
              {{ $t('nav.register') }}
            </UButton>
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
  { to: '/tokens', icon: 'i-heroicons-chart-bar', label: 'nav.tokens' },
  { to: '/referral', icon: 'i-heroicons-users', label: 'nav.referral' },
  { to: '/wallet', icon: 'i-heroicons-wallet', label: 'nav.wallet' }
]

/** One menu group only — multiple groups each get a bordered block in Nuxt UI DropdownMenu. */
const profileMenuItems = computed(() => {
  if (!user.value) return []

  const links = (user.value.is_admin || user.value.is_sub_admin)
    ? [{ label: t('nav.admin'), icon: 'i-heroicons-shield-check', to: '/admin' }]
    : [
        { label: t('nav.dashboard'), icon: 'i-heroicons-squares-2x2', to: '/dashboard' },
        { label: t('nav.settings'), icon: 'i-heroicons-cog-6-tooth', to: '/settings' }
      ]

  return [
    [
      ...links,
      { type: 'separator' as const },
      {
        label: t('common.logout'),
        icon: 'i-heroicons-arrow-right-on-rectangle',
        class: 'text-red-400 hover:text-red-300 hover:bg-red-500/10',
        onClick: () => { void logout() }
      }
    ]
  ]
})

const profileDropdownUi = {
  content: 'min-w-[220px] rounded-2xl border border-white/10 bg-[#0d0d16]/95 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.7)] backdrop-blur-2xl overflow-hidden',
  viewport: 'p-1.5',
  group: 'space-y-0.5',
  item: 'rounded-xl px-3 py-2.5 text-sm text-slate-300 cursor-pointer transition-all duration-150 hover:bg-white/[0.07] hover:text-white flex items-center gap-2.5',
  itemLeadingIcon: 'size-4 text-slate-400',
  separator: 'my-1.5 border-white/[0.08]',
} as const
</script>
