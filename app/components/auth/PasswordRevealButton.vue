<script setup lang="ts">
defineProps<{ visible: boolean }>()
const emit = defineEmits<{ click: [] }>()
const { t } = useI18n()
</script>

<template>
  <button
    type="button"
    class="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    :aria-label="visible ? t('auth.a11y.hide_password') : t('auth.a11y.show_password')"
    :aria-pressed="visible"
    @click.prevent="emit('click')"
  >
    <UIcon
      :name="visible ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
      class="size-5 shrink-0"
    />
  </button>
</template>
