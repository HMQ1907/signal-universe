<template>
  <footer class="relative overflow-hidden border-t border-white/[0.06] bg-[#030308]">
    <div
      class="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full opacity-20 blur-3xl"
      style="background: radial-gradient(circle, rgba(139, 92, 246, 0.5), transparent 70%)"
    />
    <div class="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div class="flex flex-col items-center gap-8 md:flex-row md:justify-between">
        <div class="flex flex-col items-center gap-4 md:items-start">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl"
              style="background: linear-gradient(135deg, #22d3ee, #a78bfa)"
            >
              <UIcon name="i-heroicons-signal" class="text-lg text-slate-950" />
            </div>
            <div>
              <p class="font-bold text-white">Signal Universe</p>
              <p class="text-xs text-slate-500">{{ $t('up.footer.tagline') }}</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <a
              v-for="s in socials"
              :key="s.name"
              :href="s.href"
              target="_blank"
              rel="noopener noreferrer"
              class="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition-all hover:border-cyan-500/40 hover:text-cyan-300"
            >
              <UIcon :name="s.icon" class="size-5" />
            </a>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
          <NuxtLink to="/support/legal" class="hover:text-slate-300">{{ $t('up.footer.terms') }}</NuxtLink>
          <NuxtLink to="/support/faq" class="hover:text-slate-300">{{ $t('up.footer.faq') }}</NuxtLink>
          <span>© {{ year }} Signal Universe</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const year = new Date().getFullYear()

const tg = computed(() => (config.public.telegramSupportLink as string) || '#')

const socials = computed(() => [
  { name: 'Telegram', icon: 'i-heroicons-paper-airplane', href: tg.value },
  { name: 'X', icon: 'i-heroicons-at-symbol', href: 'https://x.com' }
])
</script>
