<template>
  <div class="auth-layout relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--su-bg-universe)]">
    <div class="su-page-canvas" aria-hidden="true">
      <div class="su-page-canvas__bloom su-page-canvas__bloom--tl" />
      <div class="su-page-canvas__bloom su-page-canvas__bloom--br" />
      <div class="su-page-canvas__bloom su-page-canvas__bloom--accent" />
      <div class="su-page-canvas__grid" />
      <div class="su-page-canvas__streaks" />
      <div class="su-page-canvas__vignette" />
    </div>

    <!-- Language: fixed top-right (ring is on LanguageSwitcher) -->
    <div class="fixed right-4 top-4 z-30 sm:right-8 sm:top-6">
      <LanguageSwitcher />
    </div>

    <!-- Back to home -->
    <header class="absolute left-0 right-0 top-0 z-20 px-6 py-6 sm:px-10">
      <NuxtLink
        to="/"
        class="group inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-all duration-300 hover:text-white"
      >
        <UIcon name="i-heroicons-arrow-left" class="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
        {{ $t('nav.home') }}
      </NuxtLink>
    </header>

    <div class="auth-card-shell relative z-10 w-full max-w-[460px] px-5 pb-16 pt-20 sm:px-8 sm:pt-24 web3-reveal">
      
      <!-- Brand Logo Header -->
      <NuxtLink
        to="/"
        class="group mb-10 flex flex-col items-center justify-center gap-4 transition-transform duration-300 hover:scale-[1.02]"
      >
        <div class="relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.4)] ring-1 ring-white/20 transition-all duration-500 group-hover:shadow-[0_0_60px_rgba(139,92,246,0.6)]">
          <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-80 blur-sm transition-opacity duration-300 group-hover:opacity-100" />
          <div class="relative flex h-full w-full items-center justify-center rounded-2xl bg-slate-900/50 backdrop-blur-xl">
            <UIcon name="i-heroicons-signal" class="text-3xl text-white" />
          </div>
        </div>
        <div class="text-center">
          <h2 class="text-3xl font-extrabold tracking-tight text-white web3-title-shine">Signal Universe</h2>
        </div>
      </NuxtLink>

      <!-- Glassmorphism Form Container -->
      <div class="relative w-full rounded-[2rem] p-[1px] shadow-2xl shadow-indigo-500/10">
        <div class="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-indigo-500/30 via-purple-500/10 to-transparent opacity-50" />
        <div class="relative rounded-[2rem] bg-slate-900/60 backdrop-blur-2xl ring-1 ring-white/10">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
