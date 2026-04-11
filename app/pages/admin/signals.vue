<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-bold text-white">{{ $t('admin.signals.title') }}</h1>
      <div class="flex gap-2">
        <UInput v-model="selectedDate" type="date" />
      </div>
    </div>

    <div v-if="signalsLoading" class="flex justify-center py-20 text-slate-500">
      <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin" />
    </div>
    <template v-else>
    <!-- Confirmations List -->
    <div class="su-card overflow-x-auto">
      <h2 class="text-white font-bold text-lg mb-6">{{ $t('admin.signals.confirmations') }}</h2>

      <table class="su-table">
        <thead>
          <tr>
            <th>{{ $t('admin.signals.columns.user') }}</th>
            <th>Phiên</th>
            <th>{{ $t('admin.signals.columns.profit_balance') }}</th>
            <th>{{ $t('admin.signals.columns.total_at_confirm') }}</th>
            <th>Gói đầu tư</th>
            <th>{{ $t('admin.signals.columns.amount') }}</th>
            <th>Ước tính cộng</th>
            <th>{{ $t('admin.signals.columns.profit') }}</th>
            <th>{{ $t('admin.signals.columns.status') }}</th>
            <th>{{ $t('admin.signals.columns.time') }}</th>
            <th>{{ $t('common.action') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in confirmations" :key="c.id">
            <td>
              <p class="text-white text-sm">{{ c.user?.full_name || '-' }}</p>
              <p class="text-slate-400 text-xs">{{ c.user?.email }}</p>
            </td>
            <td class="text-slate-300 text-sm">{{ getSession(c.session_id)?.time_window }}</td>
            <td class="text-slate-300 tabular-nums">${{ (c.balance_snapshot ?? 0).toFixed(2) }}</td>
            <td class="text-white font-medium tabular-nums">${{ (c.total_balance_snapshot ?? 0).toFixed(2) }}</td>
            <td class="text-slate-300">${{ c.package_tier ?? '-' }}</td>
            <td class="text-indigo-400">${{ c.amount?.toFixed(2) }}</td>
            <td class="text-slate-300">{{ c.status === 'pending' ? `$${estCredit(c).toFixed(2)}` : '—' }}</td>
            <td class="text-green-400">{{ c.profit_amount != null ? `$${c.profit_amount.toFixed(2)}` : '-' }}</td>
            <td>
              <UBadge :label="c.status" :color="c.status === 'approved' ? 'green' : c.status === 'pending' ? 'yellow' : 'red'" variant="soft" />
            </td>
            <td class="text-slate-400 text-xs">{{ new Date(c.confirmed_at).toLocaleString() }}</td>
            <td class="min-w-32">
              <UButton
                v-if="c.status === 'pending'"
                size="sm"
                class="min-h-9 font-semibold"
                leading-icon="i-heroicons-check-circle"
                color="success"
                @click="approveOne(c)"
              >
                {{ $t('admin.signals.approve_row') }}
              </UButton>
              <span v-else class="text-slate-500 text-xs">—</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!confirmations?.length" class="text-center py-12 text-slate-500">
        <UIcon name="i-heroicons-signal" class="text-4xl mb-3 text-slate-600" />
        <p>Chưa có xác nhận nào cho ngày này</p>
      </div>
    </div>
    </template>

    <!-- Approve One Modal -->
    <UModal v-model:open="showApproveOne" title="Duyệt lợi nhuận">
      <template #body>
        <div class="space-y-3">
          <p class="text-slate-400 text-sm">User: {{ selectedConfirmation?.user?.email }}</p>
          <p class="text-slate-400 text-sm">Gói: ${{ selectedConfirmation?.package_tier ?? '—' }}</p>
          <p class="text-slate-400 text-sm">
            {{ $t('admin.signals.columns.profit_balance') }}: ${{ (selectedConfirmation?.balance_snapshot ?? 0).toFixed(2) }}
          </p>
          <p class="text-slate-400 text-sm">
            {{ $t('admin.signals.columns.total_at_confirm') }}: ${{ (selectedConfirmation?.total_balance_snapshot ?? 0).toFixed(2) }}
          </p>
          <p class="text-green-400 text-sm font-semibold">
            Cộng cho user: ${{ selectedConfirmation ? estCredit(selectedConfirmation).toFixed(2) : '0.00' }}
            <span class="text-slate-500 font-normal"> ({{ packageProfitPercent }}% × gói)</span>
          </p>
          <p class="text-slate-500 text-xs">Hoa hồng: 15% / 10% / 5% cho 3 upline (xem Cài đặt).</p>
        </div>
      </template>
      <template #footer>
        <div class="flex gap-3 justify-end w-full">
          <UButton color="neutral" variant="ghost" @click="showApproveOne = false">Huỷ</UButton>
          <UButton :loading="approveLoading" color="success" @click="submitApproveOne">Duyệt</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin', 'main-admin'] })
useHead({ title: 'Signals - Admin' })

const toast = useToastCustom()

/** YYYY-MM-DD in local calendar (not UTC) — matches session_date user sees when confirming AI. */
function localDateInputValue(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const selectedDate = ref(localDateInputValue())

const { data: signalData, refresh, pending: pendingSessions } = useFetch('/api/admin/signals/sessions', {
  query: computed(() => ({ date: selectedDate.value })),
  watch: [selectedDate],
  lazy: true
})

const { data: allSettings, pending: pendingSettings } = useFetch<any[]>('/api/admin/settings', { key: 'admin-settings-signals', lazy: true })

const signalsLoading = computed(() => pendingSessions.value || pendingSettings.value)

const packageProfitPercent = computed(() => {
  const row = allSettings.value?.find((s: any) => s.key === 'max_daily_profit_percent')
  return Number(row?.value ?? 2)
})

const sessions = computed(() => signalData.value?.sessions || [])
const confirmations = computed(() => signalData.value?.confirmations || [])

const estCredit = (c: { package_tier?: number | null }) => {
  const tier = c.package_tier || 0
  return parseFloat((tier * (packageProfitPercent.value / 100)).toFixed(2))
}

const approveLoading = ref(false)
const showApproveOne = ref(false)
const selectedConfirmation = ref<any>(null)

const getSession = (id: number) => sessions.value.find((s: any) => s.id === id)

const approveOne = (confirmation: any) => {
  selectedConfirmation.value = confirmation
  showApproveOne.value = true
}

const submitApproveOne = async () => {
  approveLoading.value = true
  try {
    await $fetch(`/api/admin/signals/${selectedConfirmation.value.id}/approve`, {
      method: 'POST',
      body: {}
    })
    toast.success('Đã duyệt lợi nhuận')
    showApproveOne.value = false
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Duyệt thất bại')
  } finally {
    approveLoading.value = false
  }
}

</script>
