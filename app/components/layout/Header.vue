<template>
  <header
    class="sticky top-0 z-50 overflow-x-visible border-b border-white/10 bg-[color:var(--su-bg-header)] backdrop-blur-2xl supports-backdrop-filter:bg-[color:var(--su-bg-header)]"
  >
    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      <div class="flex min-h-16 items-center justify-between gap-2 py-2 sm:gap-3 sm:py-0 lg:h-16 lg:py-0">
        <!-- Logo -->
        <NuxtLink to="/" class="flex min-w-0 shrink-0 items-center gap-2.5">
          <div
            class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style="background: linear-gradient(135deg, #6366f1, #8b5cf6);"
          >
            <UIcon name="i-heroicons-signal" class="text-white text-sm" />
          </div>
          <span class="text-lg font-bold gradient-text hidden sm:block">Signal Universe</span>
        </NuxtLink>

        <!-- Center nav (desktop lg+) -->
        <nav v-if="!user" class="hidden lg:flex flex-1 min-w-0 justify-center px-2">
          <div class="flex flex-wrap items-center justify-center gap-1">
            <NuxtLink
              v-for="item in guestNav"
              :key="item.to"
              :to="item.to"
              :class="[
                'nav-link-web3 rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-800/50 hover:text-white',
                guestNavActive(item.to) ? 'bg-primary-500/10 text-primary-400' : ''
              ]"
            >
              {{ $t(item.label) }}
            </NuxtLink>
          </div>
        </nav>

        <nav v-else-if="user && !user.is_admin && !user.is_sub_admin" class="hidden lg:flex flex-1 min-w-0 justify-center px-2">
          <div class="flex flex-wrap items-center justify-center gap-1">
            <NuxtLink
              v-for="item in userNav"
              :key="item.to"
              :to="item.to"
              class="px-3 py-2 text-sm transition-colors rounded-lg flex items-center gap-1.5"
              :class="
                navActive(item.to)
                  ? 'bg-primary-500/10 text-primary-400'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              "
            >
              <UIcon :name="item.icon" class="text-sm" />
              {{ $t(item.label) }}
            </NuxtLink>
          </div>
        </nav>

        <!-- Spacer when admin (no center links) -->
        <div v-else class="hidden lg:block flex-1 min-w-0" aria-hidden="true" />

        <!-- Right: hamburger (<lg) + language + auth -->
        <div class="relative z-20 flex shrink-0 items-center gap-1 sm:gap-2">
          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            size="sm"
            class="shrink-0 p-2 lg:hidden"
            :aria-label="$t('nav.menu')"
            :aria-expanded="mobileMenuOpen"
            aria-controls="su-mobile-nav-panel"
            @click="mobileMenuOpen = true"
          >
            <UIcon name="i-heroicons-bars-3" class="size-6 text-slate-200" />
          </UButton>

          <div class="shrink-0">
            <LayoutLanguageSwitcher />
          </div>

          <template v-if="user">
            <LayoutNotificationBell v-if="!user.is_admin && !user.is_sub_admin" />

            <UDropdownMenu
              :items="profileMenuItems"
              :ui="profileDropdownUi"
            >
              <template #default>
                <button
                  type="button"
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
                <UIcon
                  :name="item.icon"
                  class="size-4 shrink-0"
                  :class="(item as any).class?.includes('red') ? 'text-red-400' : 'text-slate-400'"
                />
              </template>
            </UDropdownMenu>
          </template>

          <template v-else>
            <UButton
              to="/auth/login"
              color="neutral"
              variant="ghost"
              size="sm"
              class="px-2 sm:px-3"
            >
              {{ $t('nav.login') }}
            </UButton>
            <UButton
              to="/auth/register"
              size="sm"
              color="primary"
              class="px-3 font-semibold shadow-lg shadow-primary-500/20 sm:px-4"
            >
              {{ $t('nav.register') }}
            </UButton>
          </template>
        </div>
      </div>
    </div>

    <!-- Mobile / tablet drawer (< lg) -->
    <Teleport to="body">
      <Transition name="su-mobile-drawer">
        <div
          v-if="mobileMenuOpen"
          id="su-mobile-nav-panel"
          class="fixed inset-0 z-[100] lg:hidden"
          role="dialog"
          aria-modal="true"
          :aria-label="$t('nav.menu')"
        >
          <div
            class="su-mobile-drawer__backdrop absolute inset-0 bg-black/60 backdrop-blur-sm"
            @click="closeMobileMenu"
          />
          <aside
            class="su-mobile-drawer__panel absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-white/10 bg-[#0a0f1a] shadow-2xl shadow-black/50"
          >
              <div class="flex items-center justify-between border-b border-white/10 px-4 py-4">
                <span class="text-lg font-bold text-white">{{ $t('nav.menu') }}</span>
                <UButton
                  type="button"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  class="p-2"
                  :aria-label="$t('nav.close_menu')"
                  @click="closeMobileMenu"
                >
                  <UIcon name="i-heroicons-x-mark" class="size-6 text-slate-300" />
                </UButton>
              </div>

              <nav class="flex-1 overflow-y-auto overscroll-y-contain px-3 py-4">
                <!-- Guest -->
                <template v-if="!user">
                  <NuxtLink
                    v-for="item in guestNav"
                    :key="item.to"
                    :to="item.to"
                    class="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors"
                    :class="
                      guestNavActive(item.to)
                        ? 'bg-primary-500/15 text-primary-300'
                        : 'text-slate-200 hover:bg-white/[0.06]'
                    "
                    @click="closeMobileMenu"
                  >
                    <UIcon :name="item.icon" class="size-5 shrink-0 text-slate-400" />
                    {{ $t(item.label) }}
                  </NuxtLink>
                </template>

                <!-- Admin / sub-admin -->
                <template v-else-if="user.is_admin || user.is_sub_admin">
                  <NuxtLink
                    to="/admin"
                    class="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-slate-200 transition-colors hover:bg-white/[0.06]"
                    :class="route.path.startsWith('/admin') ? 'bg-primary-500/15 text-primary-300' : ''"
                    @click="closeMobileMenu"
                  >
                    <UIcon name="i-heroicons-shield-check" class="size-5 shrink-0 text-slate-400" />
                    {{ $t('nav.admin') }}
                  </NuxtLink>
                </template>

                <!-- Logged-in user -->
                <template v-else>
                  <NuxtLink
                    v-for="item in userNav"
                    :key="item.to"
                    :to="item.to"
                    class="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors"
                    :class="
                      navActive(item.to)
                        ? 'bg-primary-500/15 text-primary-300'
                        : 'text-slate-200 hover:bg-white/[0.06]'
                    "
                    @click="closeMobileMenu"
                  >
                    <UIcon :name="item.icon" class="size-5 shrink-0 text-slate-400" />
                    {{ $t(item.label) }}
                  </NuxtLink>
                  <NuxtLink
                    to="/notifications"
                    class="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors"
                    :class="
                      route.path.startsWith('/notifications')
                        ? 'bg-primary-500/15 text-primary-300'
                        : 'text-slate-200 hover:bg-white/[0.06]'
                    "
                    @click="closeMobileMenu"
                  >
                    <UIcon name="i-heroicons-bell" class="size-5 shrink-0 text-slate-400" />
                    {{ $t('nav.notifications') }}
                  </NuxtLink>
                  <NuxtLink
                    to="/settings"
                    class="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors"
                    :class="
                      route.path.startsWith('/settings')
                        ? 'bg-primary-500/15 text-primary-300'
                        : 'text-slate-200 hover:bg-white/[0.06]'
                    "
                    @click="closeMobileMenu"
                  >
                    <UIcon name="i-heroicons-cog-6-tooth" class="size-5 shrink-0 text-slate-400" />
                    {{ $t('nav.settings') }}
                  </NuxtLink>
                </template>
              </nav>

              <div
                class="border-t border-white/10 px-4 pt-3"
                :style="{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }"
              >
                <template v-if="user">
                  <UButton
                    block
                    color="neutral"
                    variant="soft"
                    class="justify-center"
                    @click="logoutFromDrawer"
                  >
                    <UIcon name="i-heroicons-arrow-right-on-rectangle" class="size-4" />
                    {{ $t('common.logout') }}
                  </UButton>
                </template>
                <template v-else>
                  <div class="flex flex-col gap-2">
                    <UButton to="/auth/login" block color="neutral" variant="soft" @click="closeMobileMenu">
                      {{ $t('nav.login') }}
                    </UButton>
                    <UButton to="/auth/register" block color="primary" @click="closeMobileMenu">
                      {{ $t('nav.register') }}
                    </UButton>
                  </div>
                </template>
              </div>
          </aside>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
const { user, logout } = useAuth()
const { t } = useI18n()
const route = useRoute()

const mobileMenuOpen = ref(false)

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const guestNav = [
  { to: '/', icon: 'i-heroicons-home', label: 'nav.home' },
  { to: '/tokens', icon: 'i-heroicons-chart-bar', label: 'nav.tokens' },
  { to: '/platform', icon: 'i-heroicons-squares-2x2', label: 'nav.platform' }
] as const

function guestNavActive(to: string) {
  if (to === '/') return route.path === '/'
  if (to === '/tokens') return route.path.startsWith('/tokens')
  return route.path === to || route.path.startsWith(`${to}/`)
}

const userNav = [
  { to: '/dashboard', icon: 'i-heroicons-squares-2x2', label: 'nav.dashboard' },
  { to: '/signals', icon: 'i-heroicons-signal', label: 'nav.signals' },
  { to: '/tokens', icon: 'i-heroicons-chart-bar', label: 'nav.tokens' },
  { to: '/referral', icon: 'i-heroicons-users', label: 'nav.referral' },
  { to: '/wallet/deposit', icon: 'i-heroicons-wallet', label: 'nav.wallet' }
]

function navActive(to: string) {
  if (to === '/wallet/deposit') return route.path.startsWith('/wallet')
  return route.path.startsWith(to)
}

watch(() => route.fullPath, () => {
  closeMobileMenu()
})

watch(mobileMenuOpen, (open) => {
  if (!import.meta.client) return
  document.body.style.overflow = open ? 'hidden' : ''
})

onUnmounted(() => {
  if (import.meta.client) document.body.style.overflow = ''
})

function onEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') closeMobileMenu()
}

onMounted(() => {
  if (import.meta.client) window.addEventListener('keydown', onEscape)
})

onUnmounted(() => {
  if (import.meta.client) window.removeEventListener('keydown', onEscape)
})

async function logoutFromDrawer() {
  closeMobileMenu()
  await logout()
}

/** One menu group only — multiple groups each get a bordered block in Nuxt UI DropdownMenu. */
const profileMenuItems = computed(() => {
  if (!user.value) return []

  const links =
    user.value.is_admin || user.value.is_sub_admin
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
        onClick: () => {
          void logout()
        }
      }
    ]
  ]
})

const profileDropdownUi = {
  content:
    'min-w-[220px] rounded-2xl border border-white/10 bg-[#0f172a]/95 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.45)] backdrop-blur-2xl overflow-hidden',
  viewport: 'p-1.5',
  group: 'space-y-0.5',
  item: 'rounded-xl px-3 py-2.5 text-sm text-slate-300 cursor-pointer transition-all duration-150 hover:bg-white/[0.07] hover:text-white flex items-center gap-2.5',
  itemLeadingIcon: 'size-4 text-slate-400',
  separator: 'my-1.5 border-white/[0.08]'
} as const
</script>

<style scoped>
.su-mobile-drawer-enter-active,
.su-mobile-drawer-leave-active {
  transition: opacity 0.2s ease;
}
.su-mobile-drawer-enter-active .su-mobile-drawer__panel,
.su-mobile-drawer-leave-active .su-mobile-drawer__panel {
  transition: transform 0.22s cubic-bezier(0.32, 0.72, 0, 1);
}
.su-mobile-drawer-enter-from,
.su-mobile-drawer-leave-to {
  opacity: 0;
}
.su-mobile-drawer-enter-from .su-mobile-drawer__panel,
.su-mobile-drawer-leave-to .su-mobile-drawer__panel {
  transform: translateX(100%);
}
</style>
