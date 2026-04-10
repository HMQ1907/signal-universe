<template>
  <div ref="rootRef" class="lang-switcher-ring relative max-w-full">
    <button
      type="button"
      class="lang-switcher-inner flex min-w-0 max-w-[min(100%,14rem)] items-center justify-between gap-2 rounded-full border border-indigo-400/70 bg-[#060816]/90 px-3 py-2 text-white shadow-[0_0_24px_rgba(99,102,241,0.15)] backdrop-blur-xl transition-all hover:border-indigo-300 hover:bg-[#0b1022] sm:max-w-[16rem]"
      :aria-label="t('nav.language')"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      @click="isOpen = !isOpen"
    >
      <span class="select-none text-base leading-none sm:text-lg" aria-hidden="true">{{ flag(locale) }}</span>
      <span class="min-w-0 truncate text-left text-xs font-semibold tracking-tight sm:text-sm">
        {{ currentLocaleName }}
      </span>
      <UIcon name="i-heroicons-chevron-down" class="size-4 shrink-0 text-white/75" aria-hidden="true" />
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 top-full z-100 mt-2 min-w-52 overflow-hidden rounded-2xl border border-slate-700/80 bg-[#060816]/98 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl"
      role="menu"
    >
      <button
        v-for="l in localeList"
        :key="l.code"
        type="button"
        class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-200 transition-colors hover:bg-white/5 hover:text-white"
        :class="locale === l.code ? 'bg-indigo-500/15 text-white' : ''"
        role="menuitem"
        @click="selectLocale(l.code)"
      >
        <span class="text-base leading-none">{{ flag(l.code) }}</span>
        <span class="min-w-0 truncate">{{ l.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale, locales, setLocale, t } = useI18n()
const rootRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

const flags: Record<string, string> = {
  en: '🇺🇸',
  vi: '🇻🇳',
  zh: '🇨🇳',
  ms: '🇲🇾',
  ru: '🇷🇺',
  ja: '🇯🇵',
  ko: '🇰🇷'
}

const localeList = computed(() => locales.value as { code: string; name: string }[])

const currentLocaleName = computed(() => localeList.value.find(l => l.code === locale.value)?.name || locale.value)

const flag = (code: string) => flags[code] || '🌐'

const selectLocale = async (code: string) => {
  isOpen.value = false
  await setLocale(code as 'en' | 'vi' | 'zh' | 'ms' | 'ru' | 'ja' | 'ko')
}

onClickOutside(rootRef, () => {
  isOpen.value = false
})
</script>
