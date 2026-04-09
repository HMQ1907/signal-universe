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
            <td class="font-semibold" :class="isCredit(tx.type) ? 'text-green-400' : 'text-red-400'">
              {{ isCredit(tx.type) ? '+' : '-' }}${{ tx.amount?.toFixed(2) }}
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
            <td class="text-slate-400 text-xs max-w-32 truncate">{{ tx.admin_note || tx.adjust_reason || '—' }}</td>
            <td v-if="isMainAdmin">
              <UTooltip :text="$t('admin.transactions.delete')">
                <UButton
                  size="xs"
                  icon="i-heroicons-trash"
                  color="error"
                  variant="ghost"
                  @click="confirmDelete(tx)"
                />
              </UTooltip>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!transactions?.length" class="text-center py-12 text-slate-500">
        <UIcon name="i-heroicons-banknotes" class="text-4xl mb-3 text-slate-600" />
        <p class="text-sm">{{ $t('common.no_data') }}</p>
      </div>
    </div>

    <!-- Delete confirm modal -->
    <UModal v-model="showDeleteModal" :ui="{ width: 'sm:max-w-sm' }">
      <div class="p-6 space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
            <UIcon name="i-heroicons-exclamation-triangle" class="text-red-400 text-lg" />
          </div>
          <div>
            <h3 class="text-white font-bold">{{ $t('admin.transactions.delete_title') }}</h3>
            <p class="text-slate-400 text-xs mt-0.5">{{ $t('admin.transactions.delete_warning') }}</p>
          </div>
        </div>

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
            <span class="font-semibold" :class="isCredit(deletingTx.type) ? 'text-green-400' : 'text-red-400'">
              ${{ deletingTx.amount?.toFixed(2) }}
            </span>
          </div>
        </div>

        <div class="flex gap-3">
          <UButton block color="neutral" variant="ghost" @click="showDeleteModal = false">
            {{ $t('common.cancel') }}
          </UButton>
          <UButton block color="error" :loading="deleteLoading" @click="doDelete">
            {{ $t('admin.transactions.delete_confirm') }}
          </UButton>
        </div>
      </div>
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

const { data: txData, refresh } = await useFetch('/api/admin/transactions', {
  query: computed(() => ({ tab: tab.value, limit: 100 })),
  watch: [tab]
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

const isCredit = (type: string) => !['withdraw_profit', 'withdraw_capital'].includes(type)

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
