<template>
  <UDropdown :items="languageItems">
    <UButton color="gray" variant="ghost" size="sm" class="flex items-center gap-1.5">
      <span class="text-base">{{ currentFlag }}</span>
      <span class="hidden sm:block text-xs text-slate-400">{{ currentLocale?.name }}</span>
      <UIcon name="i-heroicons-chevron-down" class="text-slate-500 text-xs" />
    </UButton>
  </UDropdown>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const flags: Record<string, string> = {
  en: '🇺🇸',
  vi: '🇻🇳',
  zh: '🇨🇳',
  ms: '🇲🇾',
  ru: '🇷🇺'
}

const currentLocale = computed(() => locales.value.find(l => l.code === locale.value))
const currentFlag = computed(() => flags[locale.value] || '🌐')

const languageItems = computed(() => [
  locales.value.map(l => ({
    label: l.name,
    icon: undefined,
    slot: 'item',
    click: () => setLocale(l.code as any),
    class: l.code === locale.value ? 'text-indigo-400' : ''
  }))
])
</script>
