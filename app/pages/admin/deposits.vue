<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-bold text-white">{{ $t('admin.deposits.title') }}</h1>
      <div class="flex gap-2">
        <UButton :color="statusFilter === 'pending' ? 'indigo' : 'gray'" :variant="statusFilter === 'pending' ? 'solid' : 'ghost'"
          @click="statusFilter = 'pending'">Chờ duyệt</UButton>
        <UButton :color="statusFilter === 'completed' ? 'green' : 'gray'" :variant="statusFilter === 'completed' ? 'solid' : 'ghost'"
          @click="statusFilter = 'completed'">Đã duyệt</UButton>
        <UButton :color="statusFilter === 'rejected' ? 'red' : 'gray'" :variant="statusFilter === 'rejected' ? 'solid' : 'ghost'"
          @click="statusFilter = 'rejected'">Đã từ chối</UButton>
      </div>
    </div>

    <div class="su-card overflow-x-auto">
      <table class="su-table">
        <thead>
          <tr>
            <th>#ID</th>
            <th>{{ $t('admin.deposits.columns.user') }}</th>
            <th>{{ $t('admin.deposits.columns.package') }}</th>
            <th>{{ $t('admin.deposits.columns.amount') }}</th>
            <th>{{ $t('admin.deposits.columns.network') }}</th>
            <th>{{ $t('admin.deposits.columns.date') }}</th>
            <th>{{ $t('admin.deposits.columns.status') }}</th>
            <th v-if="statusFilter === 'pending'">{{ $t('common.action') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tx in deposits" :key="tx.id">
            <td class="text-slate-400 text-xs">#{{ tx.id }}</td>
            <td>
              <p class="text-white text-sm">{{ tx.user?.full_name || '-' }}</p>
              <p class="text-slate-400 text-xs">{{ tx.user?.email }}</p>
            </td>
            <td>
              <UBadge v-if="tx.package_selected" :label="`$${tx.package_selected}`" color="primary" variant="soft" />
            </td>
            <td class="text-green-400 font-bold">${{ tx.amount?.toFixed(2) }}</td>
            <td class="text-slate-300">{{ tx.network }}</td>
            <td class="text-slate-400 text-sm">{{ new Date(tx.created_at).toLocaleString() }}</td>
            <td>
              <UBadge :label="tx.status" :color="tx.status === 'completed' ? 'green' : tx.status === 'pending' ? 'yellow' : 'red'" variant="soft" />
            </td>
            <td v-if="statusFilter === 'pending' && isMainAdmin">
              <div class="flex gap-2">
                <UButton size="xs" :loading="processingId === tx.id" color="success"
                  @click="approve(tx.id)">{{ $t('admin.deposits.approve') }}</UButton>
                <UButton size="xs" color="error" variant="soft"
                  @click="openReject(tx.id)">{{ $t('admin.deposits.reject') }}</UButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!deposits?.length" class="text-center py-12 text-slate-500">
        <UIcon name="i-heroicons-arrow-down-tray" class="text-4xl mb-3 text-slate-600" />
        <p>Không có giao dịch nạp {{ statusFilter === 'pending' ? 'chờ duyệt' : statusFilter === 'completed' ? 'đã duyệt' : 'bị từ chối' }}</p>
      </div>
    </div>

    <!-- Reject Modal -->
    <UModal v-model:open="showReject" title="Từ chối nạp tiền">
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
useHead({ title: 'Deposits - Admin' })

const toast = useToastCustom()
const { user: authUser } = useAuth()
const isMainAdmin = computed(() => authUser.value?.is_admin === true)
const statusFilter = ref('pending')
const processingId = ref<number | null>(null)
const showReject = ref(false)
const rejectId = ref<number | null>(null)
const rejectReason = ref('')
const rejectLoading = ref(false)

const { data: depositsData, refresh } = await useFetch('/api/admin/deposits', {
  query: computed(() => ({ status: statusFilter.value, limit: 50 })),
  watch: [statusFilter]
})

const deposits = computed(() => depositsData.value?.data || [])

const approve = async (id: number) => {
  processingId.value = id
  try {
    await $fetch(`/api/admin/deposits/${id}/approve`, { method: 'POST' })
    toast.success('Đã duyệt nạp tiền')
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Duyệt thất bại')
  } finally {
    processingId.value = null
  }
}

const openReject = (id: number) => {
  rejectId.value = id
  rejectReason.value = ''
  showReject.value = true
}

const submitReject = async () => {
  if (!rejectId.value) return
  rejectLoading.value = true
  try {
    await $fetch(`/api/admin/deposits/${rejectId.value}/reject`, {
      method: 'POST',
      body: { reason: rejectReason.value }
    })
    toast.success('Đã từ chối nạp tiền')
    showReject.value = false
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Từ chối thất bại')
  } finally {
    rejectLoading.value = false
  }
}
</script>
