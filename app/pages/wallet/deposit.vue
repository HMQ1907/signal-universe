<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-white">{{ $t('wallet.deposit.title') }}</h1>
      <p class="text-slate-400 text-sm mt-1">{{ $t('wallet.deposit.subtitle') }}</p>
    </div>

    <div class="space-y-5">
      <!-- Step 1: Amount -->
      <div class="su-card">
        <h3 class="text-white font-semibold mb-4 flex items-center gap-2">
          <span class="step-badge">1</span>
          {{ $t('wallet.deposit.select_package') }}
        </h3>
        <div class="grid grid-cols-3 gap-2 sm:grid-cols-6 mb-3">
          <button
            v-for="pkg in packages"
            :key="pkg"
            @click="form.amount = pkg"
            class="py-2.5 rounded-xl border text-center text-sm font-bold transition-all"
            :class="form.amount === pkg
              ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300'
              : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'"
          >
            ${{ pkg.toLocaleString() }}
          </button>
        </div>
        <div class="relative mt-2">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm">$</span>
          <input
            v-model.number="form.amount"
            type="number"
            min="200"
            placeholder="200"
            class="su-input pl-7"
          />
        </div>
        <p class="text-xs text-slate-500 mt-2">Tối thiểu $200</p>
      </div>

      <!-- Step 2: Network -->
      <div class="su-card">
        <h3 class="text-white font-semibold mb-4 flex items-center gap-2">
          <span class="step-badge">2</span>
          Chọn mạng chuyển tiền
        </h3>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="net in networks"
            :key="net.id"
            @click="form.network = net.id"
            class="flex items-center gap-3 p-4 rounded-xl border transition-all"
            :class="form.network === net.id
              ? 'border-indigo-500 bg-indigo-500/10 text-white'
              : 'border-white/10 text-slate-400 hover:border-white/20'"
          >
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
              :class="net.id === 'TRC20' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'">
              {{ net.id === 'TRC20' ? 'T' : 'B' }}
            </div>
            <div class="text-left">
              <p class="font-semibold text-sm">{{ net.label }}</p>
              <p class="text-xs text-slate-500">{{ net.coin }}</p>
            </div>
            <UIcon v-if="form.network === net.id" name="i-heroicons-check-circle" class="ml-auto text-indigo-400" />
          </button>
        </div>
      </div>

      <!-- Step 3: QR & Wallet Address -->
      <div v-if="walletAddr" class="su-card">
        <h3 class="text-white font-semibold mb-4 flex items-center gap-2">
          <span class="step-badge">3</span>
          Quét QR hoặc sao chép địa chỉ ví
        </h3>

        <div class="flex flex-col items-center gap-4 mb-5">
          <div class="p-3 rounded-2xl bg-white">
            <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${walletAddr}`"
              alt="QR" width="180" height="180" class="rounded-lg block" />
          </div>
          <div class="w-full">
            <p class="text-xs text-slate-500 mb-1.5">{{ form.network }} USDT — Địa chỉ ví hệ thống</p>
            <div class="flex items-center gap-2 p-3 rounded-xl bg-slate-800/60 border border-white/8">
              <code class="text-indigo-300 text-xs font-mono flex-1 break-all select-all">{{ walletAddr }}</code>
              <button @click="copyAddress" class="shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <UIcon :name="copied ? 'i-heroicons-check' : 'i-heroicons-clipboard-document'"
                  :class="copied ? 'text-green-400' : 'text-slate-400'" class="text-base" />
              </button>
            </div>
          </div>
        </div>

        <div class="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <p class="text-amber-400 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
            <UIcon name="i-heroicons-information-circle" />
            Lưu ý quan trọng
          </p>
          <ul class="space-y-1 text-slate-400 text-xs list-disc list-inside">
            <li>Chuyển đúng số tiền <span class="text-white font-semibold">${{ form.amount || '---' }}</span> USDT</li>
            <li>Chỉ gửi qua mạng <span class="text-white font-semibold">{{ form.network }}</span></li>
            <li>Sau khi chuyển xong, lấy TX ID từ ví của bạn và nhập vào bước tiếp theo</li>
            <li>Tiền sẽ được cộng ngay vào tài khoản sau khi xác nhận</li>
          </ul>
        </div>
      </div>

      <!-- Step 4: TX ID -->
      <div class="su-card">
        <h3 class="text-white font-semibold mb-4 flex items-center gap-2">
          <span class="step-badge">4</span>
          Nhập Transaction ID
        </h3>
        <p class="text-slate-400 text-xs mb-3">
          Sau khi chuyển USDT, mở ứng dụng ví của bạn (Binance, Trust Wallet...) → xem lịch sử giao dịch → sao chép Transaction Hash/ID
        </p>
        <input
          v-model="form.tx_hash"
          type="text"
          placeholder="Ví dụ: 0xabc123... hoặc TxID..."
          class="su-input font-mono text-xs"
        />
        <p v-if="form.tx_hash && form.tx_hash.length < 10" class="text-red-400 text-xs mt-1.5">
          TX ID quá ngắn, vui lòng kiểm tra lại
        </p>
      </div>

      <!-- Error -->
      <UAlert v-if="error" :description="error" color="error" variant="soft" icon="i-heroicons-x-circle" />

      <!-- Submit -->
      <button
        :disabled="!canSubmit || loading"
        @click="handleDeposit"
        class="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        :class="canSubmit && !loading ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/30' : 'bg-slate-800 text-slate-500'"
      >
        <UIcon v-if="loading" name="i-heroicons-arrow-path" class="animate-spin" />
        <UIcon v-else name="i-heroicons-check-circle" />
        {{ loading ? 'Đang xử lý...' : `Xác nhận nạp $${form.amount || 0}` }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Nạp tiền - Signal Universe' })

const toast = useToastCustom()
const copied = ref(false)
const loading = ref(false)
const error = ref('')

const packages = [200, 300, 500, 1000, 2000, 5000]
const networks = [
  { id: 'TRC20', label: 'TRC20 (Tron)', coin: 'USDT · TRC20' },
  { id: 'BEP20', label: 'BEP20 (BSC)', coin: 'USDT · BEP20' }
] as const

const form = reactive({
  amount: 0,
  network: 'TRC20' as 'TRC20' | 'BEP20',
  tx_hash: ''
})

const { data: settings } = await useFetch('/api/wallet/settings')

const walletAddr = computed(() =>
  form.network === 'TRC20'
    ? settings.value?.trc20_wallet_address || ''
    : settings.value?.bep20_wallet_address || ''
)

const canSubmit = computed(() =>
  form.amount >= 200 && form.tx_hash.trim().length >= 10
)

const copyAddress = async () => {
  if (!walletAddr.value) return
  await navigator.clipboard.writeText(walletAddr.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

const handleDeposit = async () => {
  if (!canSubmit.value) return
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/wallet/deposit', {
      method: 'POST',
      body: { amount: form.amount, network: form.network, tx_hash: form.tx_hash.trim() }
    })
    toast.success(`Đã ghi nhận nạp $${form.amount}. Tiền đã được cộng vào tài khoản!`)
    await navigateTo('/wallet/history')
  } catch (e: any) {
    error.value = e?.data?.message || 'Nạp tiền thất bại, vui lòng thử lại'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@reference "tailwindcss";

.step-badge {
  @apply w-6 h-6 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold shrink-0;
}

.su-input {
  @apply w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors;
}
</style>
