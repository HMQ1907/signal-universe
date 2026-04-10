<template>
  <div class="mb-6 sm:mb-8">
    <div class="flex gap-1.5 rounded-xl border border-white/10 bg-slate-900/60 p-1.5">
      <NuxtLink
        to="/wallet/deposit"
        class="flex-1 text-center py-2.5 sm:py-3 rounded-lg text-sm font-semibold transition-all"
        :class="isDeposit ? 'bg-indigo-500/25 text-white border border-indigo-500/35 shadow-sm' : 'text-slate-400 hover:text-slate-200'"
      >
        {{ $t('wallet.deposit.title') }}
      </NuxtLink>
      <NuxtLink
        to="/wallet/withdraw"
        class="flex-1 text-center py-2.5 sm:py-3 rounded-lg text-sm font-semibold transition-all"
        :class="isWithdraw ? 'bg-indigo-500/25 text-white border border-indigo-500/35 shadow-sm' : 'text-slate-400 hover:text-slate-200'"
      >
        {{ $t('wallet.withdraw.title') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const isDeposit = computed(() => route.path === '/wallet/deposit')
const isWithdraw = computed(() => route.path === '/wallet/withdraw')
</script>
