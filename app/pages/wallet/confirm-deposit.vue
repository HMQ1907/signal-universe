<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-lg mx-auto">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-gray-500 animate-spin" />
      </div>

      <!-- Already confirmed -->
      <div v-else-if="status === 'confirmed'" class="text-center space-y-6">
        <div class="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
          <UIcon name="i-heroicons-check-circle" class="w-12 h-12 text-green-500" />
        </div>
        <div>
          <h2 class="text-2xl font-bold text-white mb-2">{{ $t('wallet.depositConfirmedTitle') }}</h2>
          <p class="text-gray-400">{{ $t('wallet.depositConfirmedDesc') }}</p>
        </div>
        <NuxtLink to="/dashboard" class="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors">
          <UIcon name="i-heroicons-document-text" class="w-5 h-5" />
          {{ $t('wallet.viewTransactions') }}
        </NuxtLink>
      </div>

      <!-- Expired -->
      <div v-else-if="status === 'expired'" class="text-center space-y-6">
        <div class="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
          <UIcon name="i-heroicons-clock" class="w-12 h-12 text-red-500" />
        </div>
        <div>
          <h2 class="text-2xl font-bold text-white mb-2">{{ $t('wallet.depositExpiredTitle') }}</h2>
          <p class="text-gray-400">{{ $t('wallet.depositExpiredDesc') }}</p>
        </div>
        <NuxtLink to="/wallet/deposit" class="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors">
          <UIcon name="i-heroicons-arrow-path" class="w-5 h-5" />
          {{ $t('wallet.depositAgain') }}
        </NuxtLink>
      </div>

      <!-- Error / not found -->
      <div v-else-if="status === 'error'" class="text-center space-y-6">
        <div class="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-red-500" />
        </div>
        <div>
          <h2 class="text-2xl font-bold text-white mb-2">{{ $t('wallet.depositErrorTitle') }}</h2>
          <p class="text-gray-400">{{ errorMsg }}</p>
        </div>
        <NuxtLink to="/wallet/deposit" class="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors">
          <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
          {{ $t('wallet.backToDeposit') }}
        </NuxtLink>
      </div>

      <!-- Pending confirmation — main state -->
      <div v-else class="space-y-6">
        <div class="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-800 bg-gray-800/50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                <UIcon name="i-heroicons-clock" class="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 class="text-white font-semibold text-lg">{{ $t('wallet.confirmDepositTitle') }}</h2>
                <p class="text-gray-500 text-sm">{{ $t('wallet.confirmDepositDesc') }}</p>
              </div>
            </div>
          </div>

          <div class="p-6 space-y-6">
            <!-- Transaction info -->
            <div class="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-400 text-sm">{{ $t('wallet.depositAmountLabel') }}</span>
                <span class="text-white font-semibold">${{ transaction?.amount?.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400 text-sm">Email</span>
                <span class="text-white text-sm">{{ transaction?.tx_hash }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400 text-sm">{{ $t('wallet.network') }}</span>
                <span class="text-amber-500 font-medium">TRC20</span>
              </div>
            </div>

            <!-- Countdown -->
            <div class="text-center">
              <p class="text-gray-400 text-sm mb-2">{{ $t('wallet.confirmTimeRemaining') }}</p>
              <div class="text-4xl font-bold font-mono" :class="remainingSeconds <= 60 ? 'text-red-500' : 'text-amber-500'">
                {{ formattedTime }}
              </div>
              <div class="mt-2 w-full bg-gray-800 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-1000"
                  :class="remainingSeconds <= 60 ? 'bg-red-500' : 'bg-amber-500'"
                  :style="{ width: `${(remainingSeconds / 300) * 100}%` }"
                />
              </div>
            </div>

            <!-- Warning -->
            <div class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <div class="flex gap-3">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p class="text-gray-300 text-sm">{{ $t('wallet.confirmWarning') }}</p>
              </div>
            </div>

            <!-- Confirm button -->
            <button
              @click="onConfirm"
              :disabled="confirming || remainingSeconds <= 0"
              class="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer text-lg"
            >
              <UIcon v-if="confirming" name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin" />
              <UIcon v-else name="i-heroicons-check-circle" class="w-6 h-6" />
              {{ $t('wallet.confirmDepositBtn') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { t } = useI18n()
const route = useRoute()
const { confirmDeposit } = useWallet()

const loading = ref(true)
const confirming = ref(false)
const status = ref<'pending' | 'confirmed' | 'expired' | 'error'>('pending')
const errorMsg = ref('')
const transaction = ref<any>(null)
const remainingSeconds = ref(300)
let timer: ReturnType<typeof setInterval> | null = null

const formattedTime = computed(() => {
  const m = Math.floor(remainingSeconds.value / 60)
  const s = remainingSeconds.value % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

onMounted(async () => {
  const txId = route.query.id as string
  if (!txId) {
    status.value = 'error'
    errorMsg.value = 'Missing transaction ID'
    loading.value = false
    return
  }

  try {
    const { data, error } = await useFetch<{ transaction: any }>('/api/wallet/transaction-detail', {
      params: { id: txId }
    })

    if (error.value || !data.value?.transaction) {
      status.value = 'error'
      errorMsg.value = t('wallet.depositNotFound')
      loading.value = false
      return
    }

    const tx = data.value.transaction
    transaction.value = tx

    if (tx.status === 'pending' || tx.status === 'completed') {
      status.value = 'confirmed'
      loading.value = false
      return
    }

    if (tx.status === 'cancelled') {
      status.value = 'expired'
      loading.value = false
      return
    }

    if (tx.status !== 'pending_confirmation') {
      status.value = 'error'
      errorMsg.value = t('wallet.depositAlreadyProcessed')
      loading.value = false
      return
    }

    const createdAt = new Date(tx.created_at).getTime()
    const elapsed = Math.floor((Date.now() - createdAt) / 1000)
    remainingSeconds.value = Math.max(0, 300 - elapsed)

    if (remainingSeconds.value <= 0) {
      status.value = 'expired'
      loading.value = false
      return
    }

    loading.value = false
    startTimer()
  } catch {
    status.value = 'error'
    errorMsg.value = 'Failed to load transaction'
    loading.value = false
  }
})

function startTimer() {
  timer = setInterval(() => {
    remainingSeconds.value--
    if (remainingSeconds.value <= 0) {
      clearInterval(timer!)
      status.value = 'expired'
    }
  }, 1000)
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

async function onConfirm() {
  if (!transaction.value?.id || remainingSeconds.value <= 0) return
  confirming.value = true
  try {
    await confirmDeposit(transaction.value.id)
    if (timer) clearInterval(timer)
    status.value = 'confirmed'
  } catch {
    // error already handled by composable
  } finally {
    confirming.value = false
  }
}
</script>
