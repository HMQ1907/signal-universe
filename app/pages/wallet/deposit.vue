<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-white">{{ $t('wallet.deposit.title') }}</h1>
      <p class="text-slate-400 text-sm mt-1">{{ $t('wallet.deposit.subtitle') }}</p>
    </div>

    <!-- Pending notice -->
    <UAlert v-if="hasPending" :description="$t('wallet.deposit.pending_notice')"
      color="warning" variant="soft" icon="i-heroicons-clock" class="mb-6" />

    <div v-else class="space-y-6">
      <!-- Step 1: Select Package -->
      <div class="su-card">
        <h3 class="text-white font-semibold mb-4 flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold">1</span>
          {{ $t('wallet.deposit.select_package') }}
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            v-for="pkg in packages"
            :key="pkg"
            @click="selectedPackage = pkg"
            class="p-4 rounded-xl border text-center transition-all"
            :class="selectedPackage === pkg
              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
              : 'border-slate-700 text-slate-400 hover:border-slate-600'"
          >
            <span class="text-xl font-black">${{ pkg.toLocaleString() }}</span>
            <p class="text-xs mt-1 opacity-70">Min. ${{ pkg }}</p>
          </button>
        </div>
      </div>

      <!-- Step 2: Wallet Address -->
      <div v-if="selectedPackage && settings" class="su-card">
        <h3 class="text-white font-semibold mb-4 flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold">2</span>
          {{ $t('wallet.deposit.wallet_address') }}
        </h3>

        <div class="text-center mb-6">
          <div class="inline-block p-4 rounded-2xl bg-white mb-4">
            <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${settings.trc20_wallet_address}`"
              alt="QR Code" width="160" height="160" class="rounded-lg" />
          </div>
          <p class="text-slate-400 text-xs mb-2">USDT TRC20</p>
          <div class="flex items-center justify-center gap-2">
            <code class="text-indigo-400 text-sm font-mono bg-slate-800 px-3 py-2 rounded-lg break-all max-w-xs">
              {{ settings.trc20_wallet_address || 'Wallet not configured' }}
            </code>
            <UButton size="xs" icon="i-heroicons-clipboard-document" color="neutral" variant="ghost"
              @click="copyAddress" />
          </div>
          <p class="text-xs text-slate-500 mt-3">
            Send exactly ${{ selectedPackage }}+ in USDT (TRC20)
          </p>
        </div>

        <div class="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <h4 class="text-amber-400 font-semibold text-sm mb-2 flex items-center gap-2">
            <UIcon name="i-heroicons-information-circle" />
            {{ $t('wallet.deposit.instructions.title') }}
          </h4>
          <ol class="space-y-1">
            <li v-for="i in 4" :key="i" class="text-slate-400 text-xs flex items-start gap-2">
              <span class="text-amber-400 font-bold">{{ i }}.</span>
              {{ $t(`wallet.deposit.instructions.step${i}`) }}
            </li>
          </ol>
        </div>
      </div>

      <!-- Step 3: Confirm -->
      <div v-if="selectedPackage" class="su-card">
        <h3 class="text-white font-semibold mb-4 flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold">3</span>
          Confirm Payment
        </h3>

        <p class="text-slate-400 text-sm mb-4">
          After sending the payment, click the button below within 5 minutes.
        </p>

        <UAlert v-if="error" :description="error" color="error" variant="soft" class="mb-4" />

        <UButton block :loading="loading" class="bg-green-600 hover:bg-green-500 text-white font-semibold"
          icon="i-heroicons-check-circle" @click="handleDeposit">
          {{ $t('wallet.deposit.confirm_btn') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Deposit - Signal Universe' })

const toast = useToastCustom()
const { user } = useAuth()

const packages = [200, 300, 500, 1000, 2000, 5000]
const selectedPackage = ref<number | null>(user.value?.investment_package || null)
const loading = ref(false)
const error = ref('')

const { data: settings } = await useFetch('/api/wallet/settings')

const { data: pendingTx } = await useFetch('/api/wallet/history', { query: { type: 'deposit', limit: 5 } })
const hasPending = computed(() => pendingTx.value?.data?.some((t: any) => t.status === 'pending'))

const copyAddress = async () => {
  if (settings.value?.trc20_wallet_address) {
    await navigator.clipboard.writeText(settings.value.trc20_wallet_address)
    toast.success('Address copied!')
  }
}

const handleDeposit = async () => {
  if (!selectedPackage.value) return
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/wallet/deposit', {
      method: 'POST',
      body: { amount: selectedPackage.value, package_selected: selectedPackage.value }
    })
    toast.success('Deposit request submitted. Please wait for confirmation.')
    await navigateTo('/wallet/history')
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to submit deposit'
  } finally {
    loading.value = false
  }
}
</script>
