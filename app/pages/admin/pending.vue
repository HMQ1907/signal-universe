<template>
  <div class="p-3 sm:p-6">
    <div class="mb-4 sm:mb-8">
      <h1 class="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">{{ $t('admin.nav.pending') || 'Pending Transactions' }}</h1>
      <p class="text-slate-400 text-sm">Approve or reject pending deposit and withdrawal requests</p>
    </div>

    <!-- Tab Navigation -->
    <div class="flex gap-2 mb-6 overflow-x-auto">
      <button v-for="tab in tabs" :key="tab.key"
        @click="activeTab = tab.key"
        class="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
        :class="activeTab === tab.key
          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
          : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'">
        {{ tab.label }}
        <span v-if="tab.count > 0" class="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
          :class="activeTab === tab.key ? 'bg-indigo-500/20' : 'bg-slate-700'">
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- Deposits Tab -->
    <div v-show="activeTab === 'deposits'" class="su-card">
      <div class="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div class="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
          <UIcon name="i-heroicons-arrow-down-tray" class="text-green-400 text-lg" />
        </div>
        <div>
          <h3 class="text-white font-semibold">Pending Deposits</h3>
          <p class="text-slate-400 text-sm">{{ pendingDeposits.length }} requests waiting</p>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="text-4xl text-slate-500 animate-spin" />
      </div>
      <div v-else-if="!pendingDeposits.length" class="text-center py-12 text-slate-500">
        <UIcon name="i-heroicons-inbox" class="text-4xl mb-3 text-slate-600" />
        <p>No pending deposits</p>
      </div>
      <div v-else class="space-y-4">
        <div v-for="tx in pendingDeposits" :key="tx.id"
          class="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-slate-600 transition-colors">
          <div class="flex items-start justify-between gap-4 mb-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-white font-bold text-lg">${{ tx.amount?.toLocaleString() }}</span>
                <UBadge label="Pending" color="warning" variant="soft" size="xs" />
                <UBadge v-if="tx.package_selected" :label="`$${tx.package_selected} Package`" color="primary" variant="soft" size="xs" />
              </div>
              <p class="text-slate-300 text-sm">{{ tx.user?.full_name || '-' }} — {{ tx.user?.email }}</p>
            </div>
            <p class="text-slate-500 text-xs whitespace-nowrap">{{ formatDate(tx.created_at) }}</p>
          </div>
          <!-- Referral chain -->
          <ReferralChain v-if="tx.user?.referral_hierarchy" :hierarchy="tx.user.referral_hierarchy" :email="tx.user?.email" />
          <div class="flex gap-2 mt-3">
            <UButton color="success" class="flex-1" :loading="processingId === tx.id && processingAction === 'approve'"
              :disabled="processingId === tx.id" @click="processTransaction(tx.id, 'approve')" icon="i-heroicons-check">
              Approve
            </UButton>
            <UButton color="error" variant="outline" class="flex-1"
              :loading="processingId === tx.id && processingAction === 'reject'" :disabled="processingId === tx.id"
              @click="processTransaction(tx.id, 'reject')" icon="i-heroicons-x-mark">
              Reject
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Profit Withdrawals Tab -->
    <div v-show="activeTab === 'profit'" class="su-card">
      <div class="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div class="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
          <UIcon name="i-heroicons-arrow-up-tray" class="text-indigo-400 text-lg" />
        </div>
        <div>
          <h3 class="text-white font-semibold">Profit Withdrawals</h3>
          <p class="text-slate-400 text-sm">{{ profitWithdrawals.length }} requests waiting</p>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="text-4xl text-slate-500 animate-spin" />
      </div>
      <div v-else-if="!profitWithdrawals.length" class="text-center py-12 text-slate-500">
        <UIcon name="i-heroicons-inbox" class="text-4xl mb-3 text-slate-600" />
        <p>No pending profit withdrawals</p>
      </div>
      <div v-else class="space-y-4">
        <WithdrawalCard v-for="tx in profitWithdrawals" :key="tx.id" :tx="tx" type="profit"
          :processing-id="processingId" :processing-action="processingAction"
          @process="processTransaction" @copy="copyAddress" />
      </div>
    </div>

    <!-- Capital Withdrawals Tab (28-day lock) -->
    <div v-show="activeTab === 'capital'" class="su-card">
      <div class="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div class="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
          <UIcon name="i-heroicons-lock-open" class="text-amber-400 text-lg" />
        </div>
        <div>
          <h3 class="text-white font-semibold">Capital Withdrawals (28-day unlock)</h3>
          <p class="text-slate-400 text-sm">{{ capitalWithdrawals.length }} requests waiting</p>
        </div>
      </div>

      <UAlert description="These are requests to withdraw initial capital after the 28-day lock period."
        color="warning" variant="soft" icon="i-heroicons-exclamation-triangle" class="mb-4" />

      <div v-if="loading" class="text-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="text-4xl text-slate-500 animate-spin" />
      </div>
      <div v-else-if="!capitalWithdrawals.length" class="text-center py-12 text-slate-500">
        <UIcon name="i-heroicons-inbox" class="text-4xl mb-3 text-slate-600" />
        <p>No pending capital withdrawals</p>
      </div>
      <div v-else class="space-y-4">
        <WithdrawalCard v-for="tx in capitalWithdrawals" :key="tx.id" :tx="tx" type="capital"
          :processing-id="processingId" :processing-action="processingAction"
          @process="processTransaction" @copy="copyAddress" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Pending Transactions - Admin' })

const toast = useToastCustom()
const loading = ref(true)
const pendingDeposits = ref<any[]>([])
const allWithdrawals = ref<any[]>([])
const processingId = ref<number | null>(null)
const processingAction = ref<string | null>(null)
const activeTab = ref('deposits')

const profitWithdrawals = computed(() => allWithdrawals.value.filter(tx => tx.type === 'withdraw_profit'))
const capitalWithdrawals = computed(() => allWithdrawals.value.filter(tx => tx.type === 'withdraw_capital'))

const tabs = computed(() => [
  { key: 'deposits', label: 'Deposits', count: pendingDeposits.value.length },
  { key: 'profit', label: 'Profit Withdrawals', count: profitWithdrawals.value.length },
  { key: 'capital', label: 'Capital Withdrawals (28d)', count: capitalWithdrawals.value.length }
])

async function fetchPendingTransactions() {
  loading.value = true
  try {
    const data = await $fetch<any>('/api/admin/pending-transactions')
    if (data) {
      pendingDeposits.value = data.deposits || []
      allWithdrawals.value = data.withdrawals || []
    }
  } catch (error) {
    console.error('Failed to fetch pending transactions:', error)
  } finally {
    loading.value = false
  }
}

async function processTransaction(txId: number, action: 'approve' | 'reject') {
  processingId.value = txId
  processingAction.value = action

  try {
    await $fetch('/api/admin/approve-transaction', {
      method: 'POST',
      body: { transactionId: txId, action }
    })
    toast.success(action === 'approve' ? 'Transaction approved' : 'Transaction rejected')
    pendingDeposits.value = pendingDeposits.value.filter(tx => tx.id !== txId)
    allWithdrawals.value = allWithdrawals.value.filter(tx => tx.id !== txId)
  } catch (err: any) {
    toast.error(err?.data?.message || 'Failed to process transaction')
  } finally {
    processingId.value = null
    processingAction.value = null
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(date))
}

async function copyAddress(address: string) {
  try {
    await navigator.clipboard.writeText(address)
    toast.success('Address copied!')
  } catch {
    toast.error('Failed to copy address')
  }
}

onMounted(fetchPendingTransactions)
</script>
