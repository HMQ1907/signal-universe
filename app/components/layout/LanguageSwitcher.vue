<template>
  <div class="lang-switcher-ring max-w-full">
    <label class="lang-switcher-inner relative min-w-0 max-w-[min(100%,14rem)] cursor-pointer sm:max-w-[16rem]">
      <span class="select-none text-base leading-none sm:text-lg" aria-hidden="true">{{ flag(locale) }}</span>
      <select
        class="scheme-dark min-w-0 flex-1 cursor-pointer appearance-none border-0 bg-transparent py-0.5 text-xs font-semibold tracking-tight text-white focus:outline-none focus:ring-0 sm:text-sm"
        :value="locale"
        :aria-label="t('nav.language')"
        @change="onSelect"
      >
        <option v-for="l in localeList" :key="l.code" :value="l.code">
          {{ flag(l.code) }} {{ l.name }}
        </option>
      </select>
      <UIcon
        name="i-heroicons-chevron-down"
        class="pointer-events-none size-4 shrink-0 text-white/75"
        aria-hidden="true"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
const { locale, locales, setLocale, t } = useI18n()

const flags: Record<string, string> = {
  en: '🇺🇸',
  vi: '🇻🇳',
  zh: '🇨🇳',
  ms: '🇲🇾',
  ru: '🇷🇺'
}

const localeList = computed(() => locales.value as { code: string; name: string }[])

const flag = (code: string) => flags[code] || '🌐'

const onSelect = (e: Event) => {
  const code = (e.target as HTMLSelectElement).value
  setLocale(code as 'en' | 'vi' | 'zh' | 'ms' | 'ru')
}
</script>
