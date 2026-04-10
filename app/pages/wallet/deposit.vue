<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
    <WalletSubnav />
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
            ${{ pkg.toLocaleString('en-US') }}
          </button>
        </div>
        <input
          v-model.number="form.amount"
          type="number"
          :min="minDeposit"
          :placeholder="String(minDeposit)"
          class="su-input mt-2 tabular-nums"
        />
        <p class="text-xs text-slate-500 mt-2">{{ $t('wallet.deposit.min_amount', { min: `$${minDeposit}` }) }}</p>
      </div>

      <!-- Step 2: Network -->
      <div class="su-card">
        <h3 class="text-white font-semibold mb-4 flex items-center gap-2">
          <span class="step-badge">2</span>
          {{ $t('wallet.deposit.step_network') }}
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
          {{ $t('wallet.deposit.step_qr') }}
        </h3>

        <div class="flex flex-col items-center gap-4 mb-5">
          <div class="relative p-3 rounded-2xl bg-white">
            <Transition
              enter-active-class="transition-opacity duration-200"
              leave-active-class="transition-opacity duration-200"
              enter-from-class="opacity-0"
              leave-to-class="opacity-0"
            >
              <div
                v-if="qrBlockLoading"
                class="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/85 backdrop-blur-[2px]"
                aria-hidden="true"
              >
                <span class="inline-flex flex-col items-center gap-2">
                  <UIcon name="i-heroicons-arrow-path" class="size-9 text-indigo-500 animate-spin" />
                  <span class="text-[10px] font-medium uppercase tracking-wide text-slate-500">{{ $t('wallet.deposit.qr_loading') }}</span>
                </span>
              </div>
            </Transition>
            <img
              v-if="qrSrc"
              :key="`${form.network}-${walletAddr}`"
              :src="qrSrc"
              alt="QR"
              width="180"
              height="180"
              class="rounded-lg block max-w-[180px] max-h-[180px] object-contain"
              @error="onImgError"
              @load="onQrImageLoad"
            />
          </div>
          <div class="w-full">
            <p class="text-xs text-slate-500 mb-1.5">{{ form.network }} USDT — {{ $t('wallet.deposit.system_address') }}</p>
            <div
              class="relative flex items-center gap-2 p-3 rounded-xl bg-slate-800/60 border border-white/8 overflow-hidden transition-opacity duration-200"
              :class="qrBlockLoading ? 'opacity-70' : 'opacity-100'"
            >
              <div
                v-if="qrBlockLoading"
                class="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-indigo-400/70 to-transparent animate-pulse"
                aria-hidden="true"
              />
              <code class="text-indigo-300 text-xs font-mono flex-1 break-all select-all">{{ walletAddr }}</code>
              <button type="button" class="shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors" @click="copyAddress">
                <UIcon :name="copied ? 'i-heroicons-check' : 'i-heroicons-clipboard-document'"
                  :class="copied ? 'text-green-400' : 'text-slate-400'" class="text-base" />
              </button>
            </div>
          </div>
        </div>

        <div class="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <p class="text-amber-400 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
            <UIcon name="i-heroicons-information-circle" />
            {{ $t('wallet.deposit.notice_title') }}
          </p>
          <ul class="space-y-1 text-slate-400 text-xs list-disc list-inside">
            <li>{{ $t('wallet.deposit.notice_amount', { amount: form.amount ? `$${form.amount}` : '---' }) }}</li>
            <li>{{ $t('wallet.deposit.notice_network', { network: form.network }) }}</li>
            <li>{{ $t('wallet.deposit.notice_tx') }}</li>
            <li>{{ $t('wallet.deposit.notice_credit') }}</li>
          </ul>
        </div>
      </div>

      <!-- Step 4: TX ID -->
      <div class="su-card">
        <h3 class="text-white font-semibold mb-4 flex items-center gap-2">
          <span class="step-badge">4</span>
          {{ $t('wallet.deposit.step_tx') }}
        </h3>
        <p class="text-slate-400 text-xs mb-3">
          {{ $t('wallet.deposit.tx_hint') }}
        </p>
        <input
          v-model="form.tx_hash"
          type="text"
          :placeholder="$t('wallet.deposit.tx_placeholder')"
          class="su-input font-mono text-xs"
          :disabled="!walletAddr"
        />
        <p v-if="form.tx_hash && form.tx_hash.length < 10" class="text-red-400 text-xs mt-1.5">
          {{ $t('wallet.deposit.tx_too_short') }}
        </p>
      </div>

      <UAlert v-if="error" :description="error" color="error" variant="soft" icon="i-heroicons-x-circle" />

      <button
        type="button"
        :disabled="!canSubmit || loading"
        class="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        :class="canSubmit && !loading ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/30' : 'bg-slate-800 text-slate-500'"
        @click="handleDeposit"
      >
        <UIcon v-if="loading" name="i-heroicons-arrow-path" class="animate-spin" />
        <UIcon v-else name="i-heroicons-check-circle" />
        {{ loading ? $t('wallet.deposit.processing') : $t('wallet.deposit.confirm_submit', { amount: `$${form.amount || 0}` }) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWalletQrImage } from '~~/composables/useWalletQrImage'

definePageMeta({ middleware: 'auth', pageTransition: false })
useHead({ title: 'Nạp tiền - Signal Universe' })

const toast = useToastCustom()
const { t } = useI18n()
const copied = ref(false)
const loading = ref(false)
const error = ref('')

const packages = [200, 300, 500, 1000, 2000, 5000]
const networks = [
  { id: 'TRC20' as const, label: 'TRC20 (Tron)', coin: 'USDT · TRC20' },
  { id: 'BEP20' as const, label: 'BEP20 (BSC)', coin: 'USDT · BEP20' }
]

const form = reactive({
  /** Default to minimum package so the field never shows confusing $0 */
  amount: 200,
  network: 'TRC20' as 'TRC20' | 'BEP20',
  tx_hash: ''
})

/** Non-blocking: full-page loading overlay tracks `page:finish`; awaiting here delayed Rút→Nạp. Data fills in right after mount. */
const { data: settings } = useFetch('/api/wallet/settings', { lazy: true })

const minDeposit = computed(() => settings.value?.min_deposit ?? 200)

const walletAddr = computed(() =>
  form.network === 'TRC20'
    ? settings.value?.trc20_wallet_address || ''
    : settings.value?.bep20_wallet_address || ''
)

const networkRef = toRef(form, 'network')
const addressRef = computed(() => walletAddr.value || '')
const { qrSrc, onImgError } = useWalletQrImage(networkRef, addressRef, { size: 180 })

/** Shown when switching TRC20 ↔ BEP20 while the new QR image loads (not on internal ext retries). */
const qrBlockLoading = ref(false)
let qrLoadFailsafe: ReturnType<typeof setTimeout> | null = null

function clearQrLoadFailsafe() {
  if (qrLoadFailsafe) {
    clearTimeout(qrLoadFailsafe)
    qrLoadFailsafe = null
  }
}

function startQrBlockLoading() {
  if (!walletAddr.value) return
  qrBlockLoading.value = true
  clearQrLoadFailsafe()
  qrLoadFailsafe = setTimeout(() => {
    qrBlockLoading.value = false
    qrLoadFailsafe = null
  }, 8000)
}

function onQrImageLoad() {
  qrBlockLoading.value = false
  clearQrLoadFailsafe()
}

watch(
  [() => form.network, walletAddr],
  ([, addr], prev) => {
    if (!prev) return
    if (!addr) {
      qrBlockLoading.value = false
      clearQrLoadFailsafe()
      return
    }
    startQrBlockLoading()
  }
)

onUnmounted(() => clearQrLoadFailsafe())

const canSubmit = computed(() =>
  form.amount >= minDeposit.value &&
  form.tx_hash.trim().length >= 10 &&
  !!walletAddr.value
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
    toast.success(t('wallet.deposit.success_immediate'))
    await navigateTo('/wallet/history')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err?.data?.message || t('wallet.deposit.error_generic')
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
