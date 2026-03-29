<template>
  <footer class="border-t border-slate-800 mt-20" style="background: #0a0f1e;">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center"
            style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
            <UIcon name="i-heroicons-signal" class="text-white text-sm" />
          </div>
          <div>
            <p class="font-bold text-white">Signal Universe</p>
            <p class="text-xs text-slate-500">Smart Trading Signal Platform</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500 md:justify-end">
          <span>© {{ new Date().getFullYear() }} Signal Universe</span>
          <NuxtLink to="/tokens" class="transition-colors duration-200 hover:text-primary-400">{{ $t('nav.tokens') }}</NuxtLink>
          <NuxtLink to="/support/faq" class="transition-colors duration-200 hover:text-slate-300">FAQ</NuxtLink>
          <NuxtLink to="/support/legal" class="transition-colors duration-200 hover:text-slate-300">Legal</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>
