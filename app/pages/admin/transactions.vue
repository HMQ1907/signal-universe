<template>
  <div>
    <h1 class="text-xl font-bold text-white mb-6">{{ $t('admin.transactions.title') }}</h1>

    <!-- Tab selector -->
    <div class="flex gap-2 mb-5 flex-wrap">
      <button
        v-for="tb in tabs"
        :key="tb.value"
        class="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
        :class="tab === tb.value
          ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
          : 'border-white/10 text-slate-400 hover:text-white hover:border-white/20'"
        @click="tab = tb.value"
      >
        {{ tb.label }}
      </button>
    </div>

    <div class="su-card overflow-x-auto">
      <div v-if="pending" class="flex justify-center py-16 text-slate-500">
        <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin" />
      </div>
      <template v-else>
      <table class="su-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{{ $t('admin.transactions.columns.user') }}</th>
            <th>{{ $t('admin.transactions.columns.type') }}</th>
            <th>{{ $t('admin.transactions.columns.amount') }}</th>
            <th v-if="tab === 'signal_compound'">{{ $t('admin.transactions.columns.from') }}</th>
            <th v-if="tab === 'signal_compound'">{{ $t('admin.transactions.columns.level') }}</th>
            <th>{{ $t('admin.transactions.columns.status') }}</th>
            <th>{{ $t('admin.transactions.columns.date') }}</th>
            <th v-if="tab === 'deposit_referral'">{{ $t('admin.transactions.columns.admin_actor') }}</th>
            <th>{{ $t('admin.transactions.columns.note') }}</th>
            <th v-if="isMainAdmin">{{ $t('common.action') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tx in transactions" :key="tx.id">
            <td class="text-slate-500 text-xs font-mono">#{{ tx.id }}</td>
            <td>
              <p class="text-white text-sm font-medium">{{ tx.user?.full_name || '—' }}</p>
              <p class="text-slate-400 text-xs">{{ tx.user?.email }}</p>
            </td>
            <td>
              <UBadge :label="typeLabel(tx.type)" :color="typeColor(tx.type)" variant="soft" size="sm" />
            </td>
            <td class="font-semibold" :class="isCredit(tx.type, tx) ? 'text-green-400' : 'text-red-400'">
              {{ isCredit(tx.type, tx) ? '+' : '-' }}${{ tx.amount?.toFixed(2) }}
            </td>
            <td v-if="tab === 'signal_compound'" class="text-slate-400 text-xs">
              {{ tx.from_user?.email || '—' }}
            </td>
            <td v-if="tab === 'signal_compound'">
              <UBadge
                v-if="tx.referral_level"
                :label="`F${tx.referral_level}`"
                :color="tx.referral_level === 1 ? 'indigo' : tx.referral_level === 2 ? 'purple' : 'pink'"
                variant="soft"
                size="sm"
              />
            </td>
            <td>
              <UBadge
                :label="$t(`common.${tx.status}`)"
                :color="tx.status === 'completed' ? 'green' : tx.status === 'pending' ? 'yellow' : 'red'"
                variant="soft"
                size="sm"
              />
            </td>
            <td class="text-slate-400 text-xs whitespace-nowrap">{{ new Date(tx.created_at).toLocaleString() }}</td>
            <td v-if="tab === 'deposit_referral'" class="text-slate-400 text-xs max-w-[10rem]">
              <template v-if="tx.type === 'admin_adjust'">
                <p class="text-white font-medium truncate">{{ tx.processed_by_admin?.full_name || '—' }}</p>
                <p class="text-slate-500 truncate">{{ tx.processed_by_admin?.email || (tx.processed_by ? `#${tx.processed_by}` : '—') }}</p>
              </template>
              <span v-else class="text-slate-600">—</span>
            </td>
            <td class="text-slate-400 text-xs max-w-[14rem]">
              <span class="line-clamp-2">{{ adminTxNote(tx) }}</span>
            </td>
            <td v-if="isMainAdmin" class="min-w-28">
              <UButton
                v-if="tx.type === 'admin_adjust'"
                size="sm"
                class="min-h-9 font-semibold"
                leading-icon="i-heroicons-trash"
                color="error"
                variant="soft"
                @click="confirmDelete(tx)"
              >
                {{ $t('admin.transactions.btn_delete_row') }}
              </UButton>
              <span v-else class="text-slate-600 text-xs">—</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!transactions?.length" class="text-center py-12 text-slate-500">
        <UIcon name="i-heroicons-banknotes" class="text-4xl mb-3 text-slate-600" />
        <p class="text-sm">{{ $t('common.no_data') }}</p>
      </div>
      </template>
    </div>

    <!-- Delete confirm modal -->
    <UModal v-model:open="showDeleteModal" :title="$t('admin.transactions.delete_title')" :description="$t('admin.transactions.delete_warning')">
      <template #body>
        <div v-if="deletingTx" class="p-3 rounded-xl bg-slate-800/60 border border-white/6 text-sm space-y-1">
          <div class="flex justify-between">
            <span class="text-slate-400">#ID</span>
            <span class="text-white font-mono">{{ deletingTx.id }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">{{ $t('admin.transactions.columns.type') }}</span>
            <UBadge :label="typeLabel(deletingTx.type)" :color="typeColor(deletingTx.type)" variant="soft" size="sm" />
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">{{ $t('common.amount') }}</span>
            <span class="font-semibold" :class="isCredit(deletingTx.type, deletingTx) ? 'text-green-400' : 'text-red-400'">
              {{ isCredit(deletingTx.type, deletingTx) ? '+' : '-' }}${{ deletingTx.amount?.toFixed(2) }}
            </span>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex gap-3 w-full">
          <UButton block color="neutral" variant="ghost" @click="showDeleteModal = false">{{ $t('common.cancel') }}</UButton>
          <UButton block color="error" :loading="deleteLoading" @click="doDelete">{{ $t('admin.transactions.delete_confirm') }}</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Transactions - Admin' })

const { t } = useI18n()
const toast = useToastCustom()
const { user: authUser } = useAuth()

const isMainAdmin = computed(() => authUser.value?.is_admin === true)

const tab = ref('deposit_referral')
const tabs = computed(() => [
  { value: 'deposit_referral', label: t('admin.transactions.deposit_referral_tab') },
  { value: 'signal_compound', label: t('admin.transactions.signal_compound_tab') }
])

const { data: txData, refresh, pending } = useFetch('/api/admin/transactions', {
  query: computed(() => ({ tab: tab.value, limit: 100 })),
  watch: [tab],
  lazy: true
})

const transactions = computed(() => txData.value?.data || [])

const typeLabel = (type: string) => {
  const map: Record<string, string> = {
    deposit: t('wallet.history.type.deposit'),
    withdraw_profit: t('wallet.history.type.withdraw_profit'),
    withdraw_capital: t('wallet.history.type.withdraw_capital'),
    signal_profit: t('wallet.history.type.signal_profit'),
    signal_referral: t('wallet.history.type.signal_referral'),
    deposit_referral: t('wallet.history.type.deposit_referral'),
    admin_adjust: t('wallet.history.type.admin_adjust')
  }
  return map[type] || type.replace(/_/g, ' ')
}

const typeColor = (type: string) => {
  const map: Record<string, string> = {
    deposit: 'green', withdraw_profit: 'red', withdraw_capital: 'orange',
    signal_profit: 'indigo', signal_referral: 'purple', deposit_referral: 'cyan',
    admin_adjust: 'neutral'
  }
  return map[type] || 'neutral'
}

/** Green / plus = credit to user; red / minus = debit (withdrawals + admin subtract). */
const isCredit = (type: string, tx?: any) => {
  if (type === 'admin_adjust') {
    const r = String(tx?.adjust_reason ?? '')
    if (/\]\s*subtract\s*:/.test(r)) return false
    if (/\]\s*add\s*:/.test(r)) return true
    return true
  }
  return !['withdraw_profit', 'withdraw_capital'].includes(type)
}

function adminTxNote(tx: any) {
  if (tx.type !== 'admin_adjust') return tx.admin_note || tx.adjust_reason || '—'
  const parts = [tx.adjust_reason]
  if (tx.admin_note) parts.push(tx.admin_note)
  return parts.filter(Boolean).join(' · ') || '—'
}

// Delete
const showDeleteModal = ref(false)
const deleteLoading = ref(false)
const deletingTx = ref<any>(null)

const confirmDelete = (tx: any) => {
  deletingTx.value = tx
  showDeleteModal.value = true
}

const doDelete = async () => {
  if (!deletingTx.value) return
  deleteLoading.value = true
  try {
    await $fetch(`/api/admin/transactions/${deletingTx.value.id}`, { method: 'DELETE' })
    toast.success(t('admin.transactions.delete_success'))
    showDeleteModal.value = false
    deletingTx.value = null
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || t('admin.transactions.delete_failed'))
  } finally {
    deleteLoading.value = false
  }
}
</script>
