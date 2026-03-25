<template>
  <div>
    <h1 class="text-2xl font-bold text-white mb-8">{{ $t('admin.transactions.title') }}</h1>

    <div class="flex gap-2 mb-6">
      <UButton :color="tab === 'deposit_referral' ? 'indigo' : 'gray'" :variant="tab === 'deposit_referral' ? 'solid' : 'ghost'"
        @click="tab = 'deposit_referral'">{{ $t('admin.transactions.deposit_referral_tab') }}</UButton>
      <UButton :color="tab === 'signal_compound' ? 'purple' : 'gray'" :variant="tab === 'signal_compound' ? 'solid' : 'ghost'"
        @click="tab = 'signal_compound'">{{ $t('admin.transactions.signal_compound_tab') }}</UButton>
    </div>

    <div class="su-card overflow-x-auto">
      <table class="su-table">
        <thead>
          <tr>
            <th>#</th>
            <th>User</th>
            <th>Type</th>
            <th>Amount</th>
            <th v-if="tab === 'signal_compound'">From</th>
            <th v-if="tab === 'signal_compound'">Level</th>
            <th>Status</th>
            <th>Date</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tx in transactions" :key="tx.id">
            <td class="text-slate-400 text-xs">#{{ tx.id }}</td>
            <td>
              <p class="text-white text-sm">{{ tx.user?.full_name || '-' }}</p>
              <p class="text-slate-400 text-xs">{{ tx.user?.email }}</p>
            </td>
            <td>
              <UBadge :label="tx.type.replace('_', ' ')" :color="typeColor(tx.type)" variant="soft" size="sm" />
            </td>
            <td class="font-semibold" :class="isCredit(tx.type) ? 'text-green-400' : 'text-red-400'">
              {{ isCredit(tx.type) ? '+' : '-' }}${{ tx.amount?.toFixed(2) }}
            </td>
            <td v-if="tab === 'signal_compound'" class="text-slate-400 text-xs">
              {{ tx.from_user?.email || '-' }}
            </td>
            <td v-if="tab === 'signal_compound'">
              <UBadge v-if="tx.referral_level" :label="`F${tx.referral_level}`"
                :color="tx.referral_level === 1 ? 'indigo' : tx.referral_level === 2 ? 'purple' : 'pink'"
                variant="soft" />
            </td>
            <td>
              <UBadge :label="tx.status" :color="tx.status === 'completed' ? 'green' : tx.status === 'pending' ? 'yellow' : 'red'" variant="soft" />
            </td>
            <td class="text-slate-400 text-xs">{{ new Date(tx.created_at).toLocaleString() }}</td>
            <td class="text-slate-400 text-xs max-w-32 truncate">{{ tx.admin_note || tx.adjust_reason || '-' }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="!transactions?.length" class="text-center py-12 text-slate-500">
        <UIcon name="i-heroicons-banknotes" class="text-4xl mb-3 text-slate-600" />
        <p>No transactions</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Transactions - Admin' })

const tab = ref('deposit_referral')

const { data: txData } = await useFetch('/api/admin/transactions', {
  query: computed(() => ({ tab: tab.value, limit: 100 })),
  watch: [tab]
})

const transactions = computed(() => txData.value?.data || [])

const typeColor = (type: string) => {
  const map: Record<string, string> = {
    deposit: 'green', withdraw_profit: 'red', withdraw_capital: 'orange',
    signal_profit: 'indigo', signal_referral: 'purple', deposit_referral: 'cyan',
    leader_bonus: 'amber', admin_adjust: 'gray'
  }
  return map[type] || 'gray'
}

const isCredit = (type: string) => !['withdraw_profit', 'withdraw_capital'].includes(type)
</script>
