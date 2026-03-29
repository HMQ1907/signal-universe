<template>
  <div
    class="auth-layout relative flex min-h-screen items-center justify-center overflow-hidden"
    style="background: #0a0f1e"
  >
    <div class="pointer-events-none absolute inset-0 grid-bg opacity-25" />
    <div
      class="su-ambient-orb absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/4 rounded-full opacity-40 blur-[100px]"
      style="background: radial-gradient(circle, rgba(99, 102, 241, 0.5), transparent 65%)"
    />
    <div
      class="su-ambient-orb su-ambient-orb--delay absolute bottom-0 right-0 h-72 w-72 translate-y-1/4 rounded-full opacity-30 blur-[90px]"
      style="background: radial-gradient(circle, rgba(139, 92, 246, 0.45), transparent 65%)"
    />

    <!-- Top bar: home + language (i18n always visible on auth) -->
    <header
      class="absolute left-0 right-0 top-0 z-20 flex items-center justify-between gap-3 px-4 py-4 sm:px-6"
    >
      <NuxtLink
        to="/"
        class="su-link-subtle text-sm text-slate-400 transition-colors duration-200 hover:text-white"
      >
        ← {{ $t('nav.home') }}
      </NuxtLink>
      <div class="flex items-center gap-2">
        <LanguageSwitcher />
      </div>
    </header>

    <div class="auth-card-shell relative z-10 w-full max-w-[440px] px-4 pb-16 pt-20 sm:px-6 sm:pt-24">
      <NuxtLink
        to="/"
        class="mb-8 flex items-center justify-center gap-3 transition-transform duration-300 hover:scale-[1.02] active:scale-[0.99]"
      >
        <div
          class="flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg shadow-primary-500/25 ring-1 ring-white/10"
          style="background: linear-gradient(135deg, #6366f1, #8b5cf6)"
        >
          <UIcon name="i-heroicons-signal" class="text-xl text-white" />
        </div>
        <span class="text-2xl font-bold gradient-text">Signal Universe</span>
      </NuxtLink>

      <slot />
    </div>
  </div>
</template>
