<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden" style="background: #0a0f1e;">
    <!-- Background effects -->
    <div class="absolute inset-0 grid-bg opacity-30" />
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20"
      style="background: radial-gradient(circle, #6366f1, transparent);" />
    <div class="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10"
      style="background: radial-gradient(circle, #8b5cf6, transparent);" />

    <div class="relative z-10 w-full max-w-md px-4 py-12">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center justify-center gap-3 mb-8">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center"
          style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
          <UIcon name="i-heroicons-signal" class="text-white text-xl" />
        </div>
        <span class="text-2xl font-bold gradient-text">Signal Universe</span>
      </NuxtLink>

      <slot />
    </div>
  </div>
</template>
