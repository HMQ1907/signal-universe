<template>
  <div class="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-slate-600 transition-colors">
    <div class="flex items-start justify-between gap-4 mb-3">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-white font-bold text-lg">${{ tx.amount?.toLocaleString() }}</span>
          <UBadge :label="$t('admin.pending.status_pending')" color="warning" variant="soft" size="xs" />
          <UBadge v-if="type === 'capital'" :label="$t('admin.pending.badge_capital')" color="warning" variant="soft" size="xs" />
        </div>
        <p class="text-slate-300 text-sm">{{ tx.user?.full_name || '-' }} — {{ tx.user?.email }}</p>
        <p class="text-slate-400 text-xs mt-1">
          {{ $t('admin.pending.balance_label') }}: <span class="text-green-400">${{ (tx.user?.balance || 0).toFixed(2) }}</span>
          <template v-if="type === 'capital'">
            | {{ $t('admin.pending.locked_capital_label') }}: <span class="text-amber-400">${{ (tx.user?.locked_capital || 0).toFixed(2) }}</span>
          </template>
        </p>
      </div>
      <p class="text-slate-500 text-xs whitespace-nowrap">{{ formatDate(tx.created_at) }}</p>
    </div>

    <div v-if="tx.withdraw_address" class="mb-3 p-2 rounded-lg bg-slate-800/50">
      <p class="text-slate-500 text-xs mb-1">{{ $t('admin.pending.to_address') }}</p>
      <div class="flex items-center gap-2">
        <code class="text-indigo-400 text-xs break-all flex-1">{{ tx.withdraw_address }}</code>
        <UButton size="xs" icon="i-heroicons-clipboard-document" color="neutral" variant="ghost"
          @click="$emit('copy', tx.withdraw_address)" />
      </div>
    </div>

    <div v-if="tx.withdraw_fee" class="text-xs text-slate-500 mb-3">
      {{ $t('admin.pending.fee_label') }}: ${{ tx.withdraw_fee?.toFixed(2) }} | {{ $t('admin.pending.net_label') }}: ${{ (tx.amount - (tx.withdraw_fee || 0)).toFixed(2) }}
    </div>

    <ReferralChain v-if="tx.user?.referral_hierarchy" :hierarchy="tx.user.referral_hierarchy" :email="tx.user?.email" />

    <div class="flex gap-2 mt-3">
      <UButton color="success" class="flex-1" :loading="processingId === tx.id && processingAction === 'approve'"
        :disabled="processingId === tx.id" @click="$emit('process', tx.id, 'approve')" icon="i-heroicons-check">
        {{ $t('admin.pending.approve') }}
      </UButton>
      <UButton color="error" variant="outline" class="flex-1"
        :loading="processingId === tx.id && processingAction === 'reject'" :disabled="processingId === tx.id"
        @click="$emit('process', tx.id, 'reject')" icon="i-heroicons-x-mark">
        {{ $t('admin.pending.reject') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tx: any
  type: 'profit' | 'capital'
  processingId: number | null
  processingAction: string | null
}>()

defineEmits<{
  process: [id: number, action: 'approve' | 'reject']
  copy: [address: string]
}>()

const { locale } = useI18n()
const dateLocale = computed(() => (locale.value === 'vi' ? 'vi-VN' : 'en-US'))

function formatDate(date: string) {
  return new Intl.DateTimeFormat(dateLocale.value, {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(date))
}
</script>
