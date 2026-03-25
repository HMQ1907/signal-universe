<template>
  <div>
    <h1 class="text-2xl font-bold text-white mb-2">{{ $t('admin.cccd.title') }}</h1>
    <p class="text-slate-400 text-sm mb-8">{{ $t('admin.cccd.subtitle') }}</p>

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
          <UButton size="xs" icon="i-heroicons-arrow-top-right-on-square" color="gray" variant="ghost"
            :to="user.cccd_url" target="_blank">
            {{ $t('admin.cccd.view') }}
          </UButton>
        </div>
      </div>
    </div>

    <div v-if="!users?.length" class="su-card text-center py-16 text-slate-500">
      <UIcon name="i-heroicons-identification" class="text-5xl mb-4 text-slate-700" />
      <p>No users have uploaded their ID yet</p>
    </div>

    <!-- Image Viewer -->
    <UModal v-model="showImage" :ui="{ width: 'sm:max-w-3xl' }">
      <UCard>
        <img :src="viewingImage" alt="CCCD" class="w-full rounded-xl" />
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'CCCD Verification - Admin' })

const { data: cccdData } = await useFetch('/api/admin/cccd', { query: { limit: 100 } })
const users = computed(() => cccdData.value?.data || [])

const showImage = ref(false)
const viewingImage = ref('')

const viewImage = (url: string) => {
  viewingImage.value = url
  showImage.value = true
}
</script>
