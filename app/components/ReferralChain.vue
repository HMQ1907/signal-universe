<template>
  <div v-if="hierarchy" class="p-2 rounded-lg bg-slate-800/50 text-xs">
    <p class="text-slate-500 mb-1">Referral chain:</p>
    <div class="flex items-center gap-1 flex-wrap">
      <template v-if="hierarchy.grandparent">
        <span class="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
          F3 {{ hierarchy.grandparent }}
        </span>
        <UIcon name="i-heroicons-arrow-right" class="text-slate-600 text-xs" />
      </template>
      <template v-if="hierarchy.parent">
        <span class="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
          F2 {{ hierarchy.parent }}
        </span>
        <UIcon name="i-heroicons-arrow-right" class="text-slate-600 text-xs" />
      </template>
      <span class="px-2 py-1 bg-green-500/20 text-green-400 rounded">
        F1 {{ email }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  hierarchy: { parent?: string; grandparent?: string } | null
  email: string
}>()
</script>
