<template>
  <UPopover v-model:open="open" :content="{ side: 'bottom', align: 'start' }">
    <button
      type="button"
      class="flex min-w-[8.5rem] shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-[#1a1a2e] px-3 py-2.5 text-left text-sm text-white transition-colors hover:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
    >
      <img
        :src="`https://flagcdn.com/w40/${selected.iso}.png`"
        :srcset="`https://flagcdn.com/w80/${selected.iso}.png 2x`"
        width="28"
        height="21"
        class="h-[21px] w-7 shrink-0 rounded object-cover shadow-sm ring-1 ring-white/15"
        alt=""
        loading="lazy"
        decoding="async"
      />
      <span class="font-mono text-xs text-slate-200">{{ selected.code }}</span>
      <UIcon name="i-heroicons-chevron-down" class="ml-auto size-4 text-slate-500" />
    </button>

    <template #content>
      <div
        class="max-h-72 min-w-[min(100vw-2rem,17rem)] overflow-y-auto rounded-xl border border-white/10 bg-[#12121c] p-1.5 shadow-2xl shadow-black/50"
      >
        <button
          v-for="c in countries"
          :key="c.code"
          type="button"
          class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/6"
          :class="modelValue === c.code ? 'bg-indigo-500/15 ring-1 ring-indigo-500/30' : ''"
          @click="pick(c.code)"
        >
          <img
            :src="`https://flagcdn.com/w40/${c.iso}.png`"
            :srcset="`https://flagcdn.com/w80/${c.iso}.png 2x`"
            width="32"
            height="24"
            class="h-6 w-8 shrink-0 rounded object-cover ring-1 ring-white/10"
            alt=""
            loading="lazy"
            decoding="async"
          />
          <span class="min-w-0 flex-1 text-white">{{ t(c.labelKey) }}</span>
          <span class="shrink-0 font-mono text-xs text-slate-400">{{ c.code }}</span>
        </button>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()
const { t } = useI18n()

const open = ref(false)

/** ISO 3166-1 alpha-2 for https://flagcdn.com — works on Windows (unlike emoji flags). */
const countries = [
  { code: '+84', iso: 'vn', labelKey: 'auth.register.phone_country.vn' },
  { code: '+86', iso: 'cn', labelKey: 'auth.register.phone_country.cn' },
  { code: '+60', iso: 'my', labelKey: 'auth.register.phone_country.my' },
  { code: '+81', iso: 'jp', labelKey: 'auth.register.phone_country.jp' },
  { code: '+7', iso: 'ru', labelKey: 'auth.register.phone_country.ru' },
  { code: '+82', iso: 'kr', labelKey: 'auth.register.phone_country.kr' },
  { code: '+66', iso: 'th', labelKey: 'auth.register.phone_country.th' },
  { code: '+1', iso: 'us', labelKey: 'auth.register.phone_country.us' },
] as const

const selected = computed(() => countries.find(c => c.code === props.modelValue) || countries[0])

function pick(code: string) {
  emit('update:modelValue', code)
  open.value = false
}
</script>
