<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-white">{{ $t('wallet.withdraw.title') }}</h1>
      <p class="text-slate-400 text-sm mt-1">Vui lòng đọc kỹ hướng dẫn trước khi rút tiền</p>
    </div>

    <!-- No wallet warning -->
    <div v-if="!hasWallet" class="su-card border-amber-500/30 bg-amber-500/5 mb-6">
      <div class="flex items-start gap-3">
        <UIcon name="i-heroicons-exclamation-triangle" class="text-amber-400 text-xl shrink-0 mt-0.5" />
        <div>
          <p class="text-amber-300 font-semibold">Chưa cấu hình ví rút tiền</p>
          <p class="text-slate-400 text-sm mt-1">Bạn cần thêm địa chỉ ví nhận tiền trước khi rút. Vào Cài đặt → Ví của tôi.</p>
          <NuxtLink to="/settings" class="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 hover:text-amber-300">
            <UIcon name="i-heroicons-cog-6-tooth" class="text-base" />
            Cài đặt ví ngay
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Wallet display -->
    <div v-if="hasWallet" class="su-card mb-5">
      <p class="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Ví nhận tiền của bạn</p>
      <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-white/8">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
          :class="userWalletNetwork === 'BEP20' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'">
          {{ userWalletNetwork === 'BEP20' ? 'B' : 'T' }}
        </div>
        <div class="min-w-0">
          <p class="text-xs text-slate-500">{{ userWalletNetwork }} · USDT</p>
          <code class="text-indigo-300 text-xs font-mono truncate block">{{ userWalletAddr }}</code>
        </div>
        <NuxtLink to="/settings" class="ml-auto shrink-0 text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1">
          <UIcon name="i-heroicons-pencil-square" />
          Sửa
        </NuxtLink>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-5">
      <button
        v-for="(tab, i) in tabs" :key="i"
        @click="activeTab = i"
        class="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all"
        :class="activeTab === i
          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
          : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Tab 0: Profit Withdrawal -->
    <div v-if="activeTab === 0" class="space-y-4">
      <div class="su-card">
        <div class="flex justify-between items-center mb-4 p-3 rounded-xl bg-slate-800/50">
          <span class="text-slate-400 text-sm">Số dư lợi nhuận</span>
          <span class="text-white font-bold text-xl">${{ (user?.balance || 0).toFixed(2) }}</span>
        </div>

        <div class="space-y-4">
          <div>
            <p class="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Số tiền rút (USD)</p>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">$</span>
              <input v-model.number="profitForm.amount" type="number" :min="10" :max="user?.balance"
                placeholder="10.00" class="su-input pl-7" />
            </div>
          </div>

          <!-- Fee breakdown -->
          <div v-if="profitForm.amount > 0" class="p-4 rounded-xl bg-slate-800/50 border border-white/6 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">Số tiền rút</span>
              <span class="text-white">${{ profitForm.amount.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">Phí rút (3%)</span>
              <span class="text-red-400">-${{ (profitForm.amount * 0.03).toFixed(2) }}</span>
            </div>
            <div class="h-px bg-slate-700" />
            <div class="flex justify-between font-bold">
              <span class="text-slate-300">Bạn nhận được</span>
              <span class="text-green-400 text-lg">${{ (profitForm.amount * 0.97).toFixed(2) }}</span>
            </div>
          </div>

          <UAlert :description="$t('wallet.withdraw.time_notice')" color="info" variant="soft" icon="i-heroicons-clock" />
          <UAlert v-if="profitError" :description="profitError" color="error" variant="soft" />

          <button
            :disabled="!hasWallet || !profitForm.amount || profitForm.amount < 10 || loading"
            @click="submitWithdraw('withdraw_profit')"
            class="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <span v-if="loading">Đang gửi yêu cầu...</span>
            <span v-else>Rút lợi nhuận{{ profitForm.amount > 0 ? ` · Nhận $${(profitForm.amount * 0.97).toFixed(2)}` : '' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Tab 1: Capital Withdrawal (28 days) -->
    <div v-if="activeTab === 1" class="space-y-4">
      <div class="su-card">
        <div class="p-4 rounded-xl mb-4" :class="isCapitalUnlocked ? 'bg-green-500/5 border border-green-500/20' : 'bg-amber-500/5 border border-amber-500/20'">
          <div class="flex items-center gap-3">
            <UIcon :name="isCapitalUnlocked ? 'i-heroicons-lock-open' : 'i-heroicons-lock-closed'"
              :class="isCapitalUnlocked ? 'text-green-400' : 'text-amber-400'" class="text-xl shrink-0" />
            <div>
              <p class="font-semibold text-sm" :class="isCapitalUnlocked ? 'text-green-400' : 'text-amber-400'">
                {{ isCapitalUnlocked ? 'Vốn đã mở khóa' : 'Vốn đang bị khóa' }}
              </p>
              <p class="text-slate-400 text-sm">Vốn gốc: <span class="text-white font-bold">${{ (user?.locked_capital || 0).toFixed(2) }}</span></p>
              <p v-if="!isCapitalUnlocked" class="text-amber-400 text-xs mt-0.5">Còn {{ daysRemaining }} ngày nữa mở khóa (28 ngày kể từ lần nạp đầu)</p>
            </div>
          </div>
        </div>

        <UAlert description="Rút vốn gốc sẽ đóng gói đầu tư hiện tại. Chỉ áp dụng sau 28 ngày kể từ lần nạp đầu tiên."
          color="warning" variant="soft" icon="i-heroicons-exclamation-triangle" class="mb-4" />

        <div v-if="isCapitalUnlocked" class="space-y-4">
          <div>
            <p class="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Số tiền rút (USD)</p>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">$</span>
              <input v-model.number="capitalForm.amount" type="number" :min="10" :max="user?.locked_capital"
                placeholder="10.00" class="su-input pl-7" />
            </div>
          </div>

          <div v-if="capitalForm.amount > 0" class="p-4 rounded-xl bg-slate-800/50 border border-white/6 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">Số vốn rút</span>
              <span class="text-white">${{ capitalForm.amount.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">Phí rút (3%)</span>
              <span class="text-red-400">-${{ (capitalForm.amount * 0.03).toFixed(2) }}</span>
            </div>
            <div class="h-px bg-slate-700" />
            <div class="flex justify-between font-bold">
              <span class="text-slate-300">Bạn nhận được</span>
              <span class="text-green-400 text-lg">${{ (capitalForm.amount * 0.97).toFixed(2) }}</span>
            </div>
          </div>

          <UAlert v-if="capitalError" :description="capitalError" color="error" variant="soft" />

          <button
            :disabled="!hasWallet || !capitalForm.amount || capitalForm.amount < 10 || loading"
            @click="submitWithdraw('withdraw_capital')"
            class="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-red-600/90 hover:bg-red-600 text-white"
          >
            <span v-if="loading">Đang gửi yêu cầu...</span>
            <span v-else>Rút vốn gốc{{ capitalForm.amount > 0 ? ` · Nhận $${(capitalForm.amount * 0.97).toFixed(2)}` : '' }}</span>
          </button>
        </div>

        <div v-else class="text-center py-8 text-slate-500">
          <UIcon name="i-heroicons-lock-closed" class="text-4xl mb-3 text-slate-600" />
          <p class="text-sm">Vốn sẽ mở khóa sau <span class="text-amber-400 font-bold">{{ daysRemaining }} ngày</span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Rút tiền - Signal Universe' })

const { t } = useI18n()
const { user, refreshUser } = useAuth()
const toast = useToastCustom()
await refreshUser()

const activeTab = ref(0)
const loading = ref(false)
const profitError = ref('')
const capitalError = ref('')

const tabs = ['Rút lợi nhuận', 'Rút vốn gốc (28 ngày)']

const profitForm = reactive({ amount: 0 })
const capitalForm = reactive({ amount: 0 })

// User wallet
const { data: profile } = await useFetch('/api/user/profile')
const userWalletAddr = computed(() => (profile.value as any)?.wallet_address || '')
const userWalletNetwork = computed(() => (profile.value as any)?.wallet_network || 'TRC20')
const hasWallet = computed(() => !!userWalletAddr.value)

const isCapitalUnlocked = computed(() => {
  if (!user.value?.first_deposit_at) return false
  const first = new Date(user.value.first_deposit_at)
  return new Date() >= new Date(first.getTime() + 28 * 24 * 60 * 60 * 1000)
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

  if (form.amount < 10) { errorRef.value = 'Tối thiểu $10'; return }

  loading.value = true
  try {
    const res = await $fetch<{ message: string }>('/api/wallet/withdraw', {
      method: 'POST',
      body: { amount: form.amount, type }
    })
    toast.success(res.message || 'Yêu cầu đã gửi thành công')
    await navigateTo('/wallet/history')
  } catch (e: any) {
    errorRef.value = e?.data?.message || 'Rút tiền thất bại'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@reference "tailwindcss";

.su-input {
  @apply w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors;
}
</style>
