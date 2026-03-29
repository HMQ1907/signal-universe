<template>
  <div>
    <h1 class="text-2xl font-bold text-white mb-8">{{ $t('admin.withdrawals.title') }}</h1>

    <div class="flex flex-wrap gap-3 mb-6">
      <div class="flex gap-2">
        <UButton :color="typeFilter === 'profit' ? 'indigo' : 'gray'" :variant="typeFilter === 'profit' ? 'solid' : 'ghost'"
          @click="typeFilter = 'profit'">{{ $t('admin.withdrawals.profit_tab') }}</UButton>
        <UButton :color="typeFilter === 'capital' ? 'amber' : 'gray'" :variant="typeFilter === 'capital' ? 'solid' : 'ghost'"
          @click="typeFilter = 'capital'">{{ $t('admin.withdrawals.capital_tab') }}</UButton>
      </div>
      <div class="flex gap-2">
        <UButton :color="statusFilter === 'pending' ? 'yellow' : 'gray'" size="sm" :variant="statusFilter === 'pending' ? 'solid' : 'ghost'"
          @click="statusFilter = 'pending'">Pending</UButton>
        <UButton :color="statusFilter === 'completed' ? 'green' : 'gray'" size="sm" :variant="statusFilter === 'completed' ? 'solid' : 'ghost'"
          @click="statusFilter = 'completed'">Completed</UButton>
      </div>
    </div>

    <div v-if="typeFilter === 'capital'" class="su-card mb-4 border border-amber-500/20">
      <div class="flex items-center gap-2 text-amber-400 text-sm">
        <UIcon name="i-heroicons-exclamation-triangle" />
        <p>These are <strong>capital withdrawal</strong> requests (28-day lock period). Review carefully before approving.</p>
      </div>
    </div>

    <div class="su-card overflow-x-auto">
      <table class="su-table">
        <thead>
          <tr>
            <th>#ID</th>
            <th>{{ $t('admin.withdrawals.columns.user') }}</th>
            <th>{{ $t('admin.withdrawals.columns.amount') }}</th>
            <th>{{ $t('admin.withdrawals.columns.fee') }}</th>
            <th>{{ $t('admin.withdrawals.columns.net') }}</th>
            <th>{{ $t('admin.withdrawals.columns.wallet') }}</th>
            <th>{{ $t('admin.withdrawals.columns.date') }}</th>
            <th>{{ $t('admin.withdrawals.columns.status') }}</th>
            <th v-if="statusFilter === 'pending'">{{ $t('common.action') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tx in withdrawals" :key="tx.id">
            <td class="text-slate-400 text-xs">#{{ tx.id }}</td>
            <td>
              <p class="text-white text-sm">{{ tx.user?.full_name || '-' }}</p>
              <p class="text-slate-400 text-xs">{{ tx.user?.email }}</p>
            </td>
            <td class="text-red-400 font-bold">${{ tx.amount?.toFixed(2) }}</td>
            <td class="text-slate-400">${{ tx.withdraw_fee?.toFixed(2) || '0.00' }}</td>
            <td class="text-white font-semibold">${{ (tx.amount - (tx.withdraw_fee || 0)).toFixed(2) }}</td>
            <td>
              <code class="text-indigo-400 text-xs bg-slate-800 px-2 py-1 rounded">
                {{ tx.withdraw_address || '-' }}
              </code>
            </td>
            <td class="text-slate-400 text-sm">{{ new Date(tx.created_at).toLocaleString() }}</td>
            <td>
              <UBadge :label="tx.status" :color="tx.status === 'completed' ? 'green' : tx.status === 'pending' ? 'yellow' : 'red'" variant="soft" />
            </td>
            <td v-if="statusFilter === 'pending'">
              <div class="flex gap-2">
                <UButton size="xs" :loading="processingId === tx.id"
                  class="bg-green-600/80 hover:bg-green-600 text-white"
                  @click="approve(tx.id)">{{ $t('admin.withdrawals.approve') }}</UButton>
                <UButton size="xs" color="error" variant="soft"
                  @click="openReject(tx.id)">{{ $t('admin.withdrawals.reject') }}</UButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!withdrawals?.length" class="text-center py-12 text-slate-500">
        <UIcon name="i-heroicons-arrow-up-tray" class="text-4xl mb-3 text-slate-600" />
        <p>No {{ statusFilter }} withdrawals</p>
      </div>
    </div>

    <UModal v-model="showReject">
      <UCard>
        <template #header>
          <h3 class="text-white font-bold">Reject Withdrawal</h3>
        </template>
        <UFormField label="Reason (optional)">
          <UInput v-model="rejectReason" placeholder="Reason for rejection..." />
        </UFormField>
        <template #footer>
          <div class="flex gap-3 justify-end">
            <UButton color="neutral" @click="showReject = false">Cancel</UButton>
            <UButton :loading="rejectLoading" color="error" @click="submitReject">Reject</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Withdrawals - Admin' })

const toast = useToastCustom()
const typeFilter = ref('profit')
const statusFilter = ref('pending')
const processingId = ref<number | null>(null)
const showReject = ref(false)
const rejectId = ref<number | null>(null)
const rejectReason = ref('')
const rejectLoading = ref(false)

const { data: wData, refresh } = await useFetch('/api/admin/withdrawals', {
  query: computed(() => ({ type: typeFilter.value, status: statusFilter.value, limit: 50 })),
  watch: [typeFilter, statusFilter]
})

const withdrawals = computed(() => wData.value?.data || [])

const approve = async (id: number) => {
  processingId.value = id
  try {
    await $fetch(`/api/admin/withdrawals/${id}/approve`, { method: 'POST' })
    toast.success('Withdrawal approved')
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Failed to approve')
  } finally {
    processingId.value = null
  }
}

const openReject = (id: number) => { rejectId.value = id; rejectReason.value = ''; showReject.value = true }

const submitReject = async () => {
  if (!rejectId.value) return
  rejectLoading.value = true
  try {
    await $fetch(`/api/admin/withdrawals/${rejectId.value}/reject`, { method: 'POST', body: { reason: rejectReason.value } })
    toast.success('Withdrawal rejected')
    showReject.value = false
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Failed')
  } finally {
    rejectLoading.value = false
  }
}
</script>
