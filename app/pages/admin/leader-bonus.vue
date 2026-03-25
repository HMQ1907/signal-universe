<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white">{{ $t('admin.leader.title') }}</h1>
        <p class="text-slate-400 text-sm mt-1">Week: {{ selectedWeek }}</p>
      </div>
      <div class="flex items-center gap-3">
        <UInput v-model="selectedWeek" type="date" />
        <UButton :loading="generating" class="bg-indigo-600 hover:bg-indigo-500 text-white"
          icon="i-heroicons-arrow-path" @click="generateBonuses">
          {{ $t('admin.leader.generate') }}
        </UButton>
      </div>
    </div>

    <div class="su-card overflow-x-auto">
      <table class="su-table">
        <thead>
          <tr>
            <th>{{ $t('admin.leader.columns.user') }}</th>
            <th>{{ $t('admin.leader.columns.f1_count') }}</th>
            <th>{{ $t('admin.leader.columns.level') }}</th>
            <th>{{ $t('admin.leader.columns.bonus') }}</th>
            <th>{{ $t('admin.leader.columns.week') }}</th>
            <th>{{ $t('admin.leader.columns.status') }}</th>
            <th>{{ $t('common.action') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in records" :key="record.id">
            <td>
              <p class="text-white text-sm">{{ record.user?.full_name || '-' }}</p>
              <p class="text-slate-400 text-xs">{{ record.user?.email }}</p>
            </td>
            <td class="text-indigo-400 font-semibold">{{ record.f1_count }}</td>
            <td>
              <UBadge :label="`Leader ${record.leader_level}`" color="amber" variant="soft" />
            </td>
            <td class="text-amber-400 font-bold">${{ record.amount }}</td>
            <td class="text-slate-400 text-sm">{{ record.week_start }}</td>
            <td>
              <UBadge :label="record.status" :color="record.status === 'paid' ? 'green' : 'yellow'" variant="soft" />
            </td>
            <td>
              <UButton v-if="record.status === 'pending'" size="xs"
                :loading="payingId === record.id"
                class="bg-green-600/80 hover:bg-green-600 text-white"
                @click="payBonus(record.id)">
                {{ $t('admin.leader.pay') }}
              </UButton>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!records?.length" class="text-center py-12 text-slate-500">
        <UIcon name="i-heroicons-trophy" class="text-4xl mb-3 text-slate-600" />
        <p>No leader bonuses for this week. Click "Generate" to calculate.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Leader Bonus - Admin' })

const toast = useToastCustom()
const today = new Date()
const day = today.getDay()
const monday = new Date(today)
monday.setDate(today.getDate() - day + (day === 0 ? -6 : 1))
const selectedWeek = ref(monday.toISOString().split('T')[0])
const generating = ref(false)
const payingId = ref<number | null>(null)

const { data: bonusData, refresh } = await useFetch('/api/admin/leader-bonus', {
  query: computed(() => ({ week: selectedWeek.value })),
  watch: [selectedWeek]
})

const records = computed(() => bonusData.value?.data || [])

const generateBonuses = async () => {
  generating.value = true
  try {
    const result = await $fetch<{ generated: number }>('/api/admin/leader-bonus/generate', {
      method: 'POST',
      body: { week_start: selectedWeek.value }
    })
    toast.success(`Generated ${result.generated} leader bonuses`)
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Failed to generate')
  } finally {
    generating.value = false
  }
}

const payBonus = async (id: number) => {
  payingId.value = id
  try {
    await $fetch(`/api/admin/leader-bonus/${id}/pay`, { method: 'POST' })
    toast.success('Bonus paid successfully')
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Failed to pay')
  } finally {
    payingId.value = null
  }
}
</script>
