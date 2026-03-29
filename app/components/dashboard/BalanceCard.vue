<template>
  <div
    class="rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-violet-800 p-6 text-white shadow-xl shadow-primary-500/20"
  >
    <div class="mb-4 flex items-start justify-between">
      <div>
        <p class="mb-1 text-sm text-white/80">Total Balance</p>
        <h2 class="text-3xl font-bold">${{ formatNumber(balance) }}</h2>
      </div>
      <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
        <UIcon name="i-heroicons-wallet" class="h-6 w-6" />
      </div>
    </div>

    <div class="mt-6 flex gap-3">
      <UButton
        to="/wallet/deposit"
        color="neutral"
        variant="solid"
        class="flex-1 !bg-white/95 !text-slate-900 hover:!bg-white"
      >
        <UIcon name="i-heroicons-plus" class="mr-1 h-4 w-4" />
        Deposit
      </UButton>
      <UButton
        to="/wallet/withdraw"
        color="neutral"
        variant="outline"
        class="flex-1 !border-white/45 !text-white hover:!bg-white/10"
      >
        <UIcon name="i-heroicons-minus" class="mr-1 h-4 w-4" />
        Withdraw
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ balance: number }>()

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
}
</script>
