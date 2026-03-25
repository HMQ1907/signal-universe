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

        <div class="flex items-center gap-6 text-sm text-slate-500">
          <span>© {{ new Date().getFullYear() }} Signal Universe</span>
          <NuxtLink to="/support/faq" class="hover:text-slate-300 transition-colors">FAQ</NuxtLink>
          <NuxtLink to="/support/legal" class="hover:text-slate-300 transition-colors">Legal</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>
