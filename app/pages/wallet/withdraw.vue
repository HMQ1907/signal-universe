<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-white">{{ $t('wallet.withdraw.title') }}</h1>
    </div>

    <UTabs :items="tabs" v-model="activeTab" class="mb-6" />

    <!-- Profit Withdrawal -->
    <div v-if="activeTab === 0" class="su-card">
      <div class="mb-6 p-4 rounded-xl bg-slate-800/50">
        <div class="flex justify-between items-center">
          <span class="text-slate-400 text-sm">{{ $t('wallet.withdraw.available') }}</span>
          <span class="text-white font-bold text-xl">${{ (user?.balance || 0).toFixed(2) }}</span>
        </div>
      </div>

      <div class="space-y-4">
        <UFormGroup :label="$t('wallet.withdraw.amount')" name="amount">
          <UInput v-model.number="profitForm.amount" type="number" :min="10" :max="user?.balance"
            placeholder="10.00" icon="i-heroicons-currency-dollar" />
          <template #hint>
            <span class="text-slate-500 text-xs">{{ $t('wallet.withdraw.min_amount') }}</span>
          </template>
        </UFormGroup>

        <UFormGroup :label="$t('wallet.withdraw.wallet_address')" name="address">
          <UInput v-model="profitForm.address" :placeholder="$t('wallet.withdraw.wallet_placeholder')"
            icon="i-heroicons-wallet" />
        </UFormGroup>

        <div v-if="profitForm.amount > 0" class="p-4 rounded-xl bg-slate-800/50 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-slate-400">Amount</span>
            <span class="text-white">${{ profitForm.amount.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-400">{{ $t('wallet.withdraw.fee') }}</span>
            <span class="text-red-400">-${{ (profitForm.amount * 0.03).toFixed(2) }}</span>
          </div>
          <div class="h-px bg-slate-700" />
          <div class="flex justify-between font-bold">
            <span class="text-slate-300">{{ $t('wallet.withdraw.you_receive') }}</span>
            <span class="text-green-400">${{ (profitForm.amount * 0.97).toFixed(2) }}</span>
          </div>
        </div>

        <UAlert :description="$t('wallet.withdraw.time_notice')" color="blue" variant="soft"
          icon="i-heroicons-clock" />

        <UAlert v-if="profitError" :description="profitError" color="red" variant="soft" />

        <UButton block :loading="loading" class="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
          @click="submitWithdraw('withdraw_profit')">
          {{ $t('wallet.withdraw.submit') }}
        </UButton>
      </div>
    </div>

    <!-- Capital Withdrawal -->
    <div v-if="activeTab === 1" class="su-card">
      <div class="mb-6 p-4 rounded-xl" :class="isCapitalUnlocked ? 'bg-green-500/5 border border-green-500/20' : 'bg-amber-500/5 border border-amber-500/20'">
        <div class="flex items-center gap-3">
          <UIcon :name="isCapitalUnlocked ? 'i-heroicons-lock-open' : 'i-heroicons-lock-closed'"
            :class="isCapitalUnlocked ? 'text-green-400' : 'text-amber-400'" class="text-xl" />
          <div>
            <p class="font-semibold" :class="isCapitalUnlocked ? 'text-green-400' : 'text-amber-400'">
              {{ isCapitalUnlocked ? $t('wallet.withdraw.capital_unlocked') : $t('wallet.withdraw.capital_locked') }}
            </p>
            <p class="text-slate-400 text-sm">Capital: ${{ (user?.locked_capital || 0).toFixed(2) }}</p>
            <p v-if="!isCapitalUnlocked" class="text-amber-400 text-xs">{{ daysRemaining }} days remaining</p>
          </div>
        </div>
      </div>

      <UAlert :description="$t('wallet.withdraw.capital_warning')" color="amber" variant="soft"
        icon="i-heroicons-exclamation-triangle" class="mb-6" />

      <div v-if="isCapitalUnlocked" class="space-y-4">
        <UFormGroup :label="$t('wallet.withdraw.amount')">
          <UInput v-model.number="capitalForm.amount" type="number" :min="10" :max="user?.locked_capital"
            placeholder="10.00" icon="i-heroicons-currency-dollar" />
        </UFormGroup>

        <UFormGroup :label="$t('wallet.withdraw.wallet_address')">
          <UInput v-model="capitalForm.address" :placeholder="$t('wallet.withdraw.wallet_placeholder')"
            icon="i-heroicons-wallet" />
        </UFormGroup>

        <UAlert v-if="capitalError" :description="capitalError" color="red" variant="soft" />

        <UButton block :loading="loading" class="bg-red-600/80 hover:bg-red-600 text-white font-semibold"
          @click="submitWithdraw('withdraw_capital')">
          {{ $t('wallet.withdraw.submit') }} (Capital)
        </UButton>
      </div>

      <div v-else class="text-center py-8 text-slate-500">
        <UIcon name="i-heroicons-lock-closed" class="text-4xl mb-3 text-slate-600" />
        <p>Capital is locked. {{ daysRemaining }} days remaining.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Withdraw - Signal Universe' })

const { t } = useI18n()
const { user, refreshUser } = useAuth()
const toast = useToastCustom()
await refreshUser()

const activeTab = ref(0)
const loading = ref(false)
const profitError = ref('')
const capitalError = ref('')

const tabs = [
  { label: t('wallet.withdraw.profit_tab') },
  { label: t('wallet.withdraw.capital_tab') }
]

const profitForm = reactive({ amount: 0, address: '' })
const capitalForm = reactive({ amount: 0, address: '' })

const isCapitalUnlocked = computed(() => {
  if (!user.value?.first_deposit_at) return false
  const first = new Date(user.value.first_deposit_at)
  const unlock = new Date(first.getTime() + 28 * 24 * 60 * 60 * 1000)
  return new Date() >= unlock
})

const daysRemaining = computed(() => {
  if (!user.value?.first_deposit_at) return 28
  const first = new Date(user.value.first_deposit_at)
  const unlock = new Date(first.getTime() + 28 * 24 * 60 * 60 * 1000)
  return Math.max(0, Math.ceil((unlock.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
})

const submitWithdraw = async (type: 'withdraw_profit' | 'withdraw_capital') => {
  const form = type === 'withdraw_profit' ? profitForm : capitalForm
  const errorRef = type === 'withdraw_profit' ? profitError : capitalError
  errorRef.value = ''

  if (!form.amount || form.amount < 10) {
    errorRef.value = 'Minimum withdrawal is $10'
    return
  }
  if (!form.address) {
    errorRef.value = t('wallet.withdraw.error.no_address')
    return
  }

  loading.value = true
  try {
    await $fetch('/api/wallet/withdraw', {
      method: 'POST',
      body: { amount: form.amount, withdraw_address: form.address, type }
    })
    toast.success(t('wallet.withdraw.success'))
    await navigateTo('/wallet/history')
  } catch (e: any) {
    errorRef.value = e?.data?.message || 'Withdrawal failed'
  } finally {
    loading.value = false
  }
}
</script>
