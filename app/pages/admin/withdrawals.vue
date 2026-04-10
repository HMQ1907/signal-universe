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
          @click="statusFilter = 'pending'">Chờ duyệt</UButton>
        <UButton :color="statusFilter === 'completed' ? 'green' : 'gray'" size="sm" :variant="statusFilter === 'completed' ? 'solid' : 'ghost'"
          @click="statusFilter = 'completed'">Đã duyệt</UButton>
      </div>
    </div>

    <div v-if="typeFilter === 'capital'" class="su-card mb-4 border border-amber-500/20">
      <div class="flex items-center gap-2 text-amber-400 text-sm">
        <UIcon name="i-heroicons-exclamation-triangle" />
        <p>Đây là yêu cầu <strong>rút vốn gốc</strong> (khoá 28 ngày). Kiểm tra kỹ trước khi duyệt.</p>
      </div>
    </div>

    <div class="su-card overflow-x-auto">
      <div v-if="pending" class="flex justify-center py-16 text-slate-500">
        <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin" />
      </div>
      <template v-else>
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
            <td v-if="statusFilter === 'pending'" class="min-w-44 align-top">
              <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <UButton
                  size="sm"
                  class="min-h-9 font-semibold"
                  leading-icon="i-heroicons-check-circle"
                  :loading="processingId === tx.id"
                  color="success"
                  @click="approve(tx.id)"
                >
                  {{ $t('admin.withdrawals.approve') }}
                </UButton>
                <UButton
                  v-if="isMainAdmin"
                  size="sm"
                  class="min-h-9 font-semibold"
                  leading-icon="i-heroicons-x-circle"
                  color="error"
                  variant="soft"
                  @click="openReject(tx.id)"
                >
                  {{ $t('admin.withdrawals.reject') }}
                </UButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!withdrawals?.length" class="text-center py-12 text-slate-500">
        <UIcon name="i-heroicons-arrow-up-tray" class="text-4xl mb-3 text-slate-600" />
        <p>Không có yêu cầu rút {{ statusFilter === 'pending' ? 'chờ duyệt' : 'đã duyệt' }}</p>
      </div>
      </template>
    </div>

    <UModal v-model:open="showReject" title="Từ chối rút tiền">
      <template #body>
        <UFormField label="Lý do (không bắt buộc)">
          <UInput v-model="rejectReason" placeholder="Nhập lý do từ chối..." />
        </UFormField>
      </template>
      <template #footer>
        <div class="flex gap-3 justify-end w-full">
          <UButton color="neutral" variant="ghost" @click="showReject = false">{{ $t('common.cancel') }}</UButton>
          <UButton :loading="rejectLoading" color="error" @click="submitReject">Từ chối</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Withdrawals - Admin' })

const toast = useToastCustom()
const { user: authUser } = useAuth()
const isMainAdmin = computed(() => authUser.value?.is_admin === true)
const typeFilter = ref('profit')
const statusFilter = ref('pending')
const processingId = ref<number | null>(null)
const showReject = ref(false)
const rejectId = ref<number | null>(null)
const rejectReason = ref('')
const rejectLoading = ref(false)

const { data: wData, refresh, pending } = useFetch('/api/admin/withdrawals', {
  query: computed(() => ({ type: typeFilter.value, status: statusFilter.value, limit: 50 })),
  watch: [typeFilter, statusFilter],
  lazy: true
})

const withdrawals = computed(() => wData.value?.data || [])

const approve = async (id: number) => {
  processingId.value = id
  try {
    await $fetch(`/api/admin/withdrawals/${id}/approve`, { method: 'POST' })
    toast.success('Đã duyệt rút tiền')
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Duyệt thất bại')
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
    toast.success('Đã từ chối rút tiền')
    showReject.value = false
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Từ chối thất bại')
  } finally {
    rejectLoading.value = false
  }
}
</script>
