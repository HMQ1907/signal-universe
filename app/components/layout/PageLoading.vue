<template>
  <div v-if="loading" class="fixed inset-0 z-50 flex items-center justify-center"
    style="background: rgba(10, 15, 30, 0.8); backdrop-filter: blur(4px);">
    <div class="flex flex-col items-center gap-4">
      <div class="w-12 h-12 rounded-2xl flex items-center justify-center"
        style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
        <UIcon name="i-heroicons-signal" class="text-white text-2xl" />
      </div>
      <div class="flex gap-1">
        <div v-for="i in 3" :key="i" class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
          :style="{ animationDelay: `${(i - 1) * 0.15}s` }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const loading = ref(false)
const nuxtApp = useNuxtApp()
nuxtApp.hook('page:start', () => { loading.value = true })
nuxtApp.hook('page:finish', () => { loading.value = false })
</script>
