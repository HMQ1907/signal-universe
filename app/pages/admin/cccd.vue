<template>
  <div>
    <h1 class="text-2xl font-bold text-white mb-2">{{ $t('admin.cccd.title') }}</h1>
    <p class="text-slate-400 text-sm mb-8">{{ $t('admin.cccd.subtitle') }}</p>

    <div v-if="pending" class="flex justify-center py-20 text-slate-500">
      <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin" />
    </div>
    <template v-else>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="user in users" :key="user.id" class="su-card">
        <div class="mb-4">
          <p class="text-white font-semibold">{{ user.full_name || '-' }}</p>
          <p class="text-slate-400 text-sm">{{ user.email }}</p>
          <p class="text-slate-500 text-xs mt-1">ID #{{ user.id }}</p>
        </div>

        <img :src="user.cccd_url" :alt="`CCCD - ${user.email}`"
          class="w-full h-40 object-cover rounded-xl border border-slate-700 mb-4 cursor-pointer"
          @click="viewImage(user.cccd_url)" />

        <div class="flex items-center justify-between text-xs text-slate-400">
          <span>Joined: {{ new Date(user.created_at).toLocaleDateString() }}</span>
          <UButton size="xs" icon="i-heroicons-arrow-top-right-on-square" color="neutral" variant="ghost"
            :to="user.cccd_url" target="_blank">
            {{ $t('admin.cccd.view') }}
          </UButton>
        </div>
      </div>
    </div>

    <div v-if="!users?.length" class="su-card text-center py-16 text-slate-500">
      <UIcon name="i-heroicons-identification" class="text-5xl mb-4 text-slate-700" />
      <p>Chưa có user nào tải CCCD lên</p>
    </div>
    </template>

    <!-- Image Viewer -->
    <UModal v-model:open="showImage" title="Xem CCCD">
      <template #body>
        <img :src="viewingImage" alt="CCCD" class="w-full rounded-xl" />
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'CCCD Verification - Admin' })

const { data: cccdData, pending } = useFetch('/api/admin/cccd', { query: { limit: 100 }, lazy: true })
const users = computed(() => cccdData.value?.data || [])

const showImage = ref(false)
const viewingImage = ref('')

const viewImage = (url: string) => {
  viewingImage.value = url
  showImage.value = true
}
</script>
