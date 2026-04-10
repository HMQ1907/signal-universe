<template>
  <div class="admin-settings-page max-w-3xl">
    <h1 class="text-2xl font-bold text-white mb-8">{{ $t('admin.settings.title') }}</h1>

    <div v-if="settingsPending" class="flex justify-center py-20 text-slate-500">
      <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin" />
    </div>
    <div v-else class="space-y-8">
      <!-- Trading Settings -->
      <div class="su-card border-white/[0.07] shadow-lg shadow-black/20">
        <h2 class="text-white font-bold mb-6 flex items-center gap-2">
          <UIcon name="i-heroicons-signal" class="text-indigo-400 size-6" />
          {{ $t('admin.settings.trading') }}
        </h2>
        <div class="grid md:grid-cols-2 gap-x-5 gap-y-5">
          <UFormField v-for="key in tradingKeys" :key="key" :label="getLabel(key)" :ui="adminFieldUi">
            <UInput
              v-model="settingsMap[key]"
              :type="tradingInputType(key)"
              variant="outline"
              color="neutral"
              size="lg"
              :ui="adminInputUi"
            />
          </UFormField>
        </div>
      </div>

      <!-- Referral Settings -->
      <div class="su-card border-white/[0.07] shadow-lg shadow-black/20">
        <h2 class="text-white font-bold mb-6 flex items-center gap-2">
          <UIcon name="i-heroicons-users" class="text-purple-400 size-6" />
          {{ $t('admin.settings.referral') }}
        </h2>
        <div class="grid md:grid-cols-2 gap-x-5 gap-y-5">
          <UFormField v-for="key in referralKeys" :key="key" :label="getLabel(key)" :ui="adminFieldUi">
            <UInput
              v-model="settingsMap[key]"
              type="number"
              step="0.1"
              variant="outline"
              color="neutral"
              size="lg"
              :ui="adminInputUi"
            />
          </UFormField>
        </div>
      </div>

      <!-- Withdrawal Settings -->
      <div class="su-card border-white/[0.07] shadow-lg shadow-black/20">
        <h2 class="text-white font-bold mb-6 flex items-center gap-2">
          <UIcon name="i-heroicons-arrow-up-tray" class="text-red-400 size-6" />
          {{ $t('admin.settings.withdrawal') }}
        </h2>
        <div class="grid md:grid-cols-2 gap-x-5 gap-y-5">
          <UFormField v-for="key in withdrawalKeys" :key="key" :label="getLabel(key)" :ui="adminFieldUi">
            <UInput
              v-model="settingsMap[key]"
              variant="outline"
              color="neutral"
              size="lg"
              :ui="adminInputUi"
            />
          </UFormField>
        </div>
      </div>

      <UButton
        :loading="saving"
        color="primary"
        size="lg"
        class="font-semibold min-w-[220px] shadow-lg shadow-indigo-950/40"
        icon="i-heroicons-check"
        @click="saveSettings"
      >
        Lưu tất cả cài đặt
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin', 'main-admin'] })
useHead({ title: 'Settings - Admin' })

const toast = useToastCustom()
const { data: rawSettings, pending: settingsPending } = useFetch<any[]>('/api/admin/settings', { lazy: true })

const settingsMap = reactive<Record<string, string>>({})

watch(
  rawSettings,
  (rows) => {
    if (!rows?.length) return
    for (const s of rows) {
      settingsMap[s.key] = s.value || ''
    }
  },
  { immediate: true }
)

const tradingKeys = ['signal_profit_percent', 'max_daily_profit_percent', 'capital_lock_days', 'min_deposit']
const referralKeys = ['deposit_referral_f1', 'deposit_referral_f2', 'signal_referral_f1', 'signal_referral_f2', 'signal_referral_f3']
const withdrawalKeys = ['min_withdraw', 'withdraw_fee_percent', 'withdraw_time_start', 'withdraw_time_end']

const labelMap: Record<string, string> = {
  signal_profit_percent: 'Tín hiệu sử dụng (% số dư)',
  max_daily_profit_percent: 'AI duyệt: % gói cộng cho user',
  capital_lock_days: 'Thời gian khoá vốn (ngày)',
  min_deposit: 'Nạp tối thiểu ($)',
  deposit_referral_f1: 'Nạp: hoa hồng F1 (%)',
  deposit_referral_f2: 'Nạp: hoa hồng F2 (%)',
  signal_referral_f1: 'AI: upline F1 (% lợi nhuận user)',
  signal_referral_f2: 'AI: upline F2 (% lợi nhuận user)',
  signal_referral_f3: 'AI: upline F3 (% lợi nhuận user)',
  min_withdraw: 'Rút tối thiểu ($)',
  withdraw_fee_percent: 'Phí rút (%)',
  withdraw_time_start: 'Giờ bắt đầu rút',
  withdraw_time_end: 'Giờ kết thúc rút'
}

const getLabel = (key: string) => labelMap[key] || key

/** Nhãn + khoảng cách rõ ràng, bớt “dính” vào ô nhập */
const adminFieldUi = {
  label: 'text-slate-400 text-xs font-semibold uppercase tracking-wider',
  container: 'mt-2.5'
}

/** Ô nhập dark Web3: nền đặc, viền tinh, focus glow — ẩn spinner number mặc định */
const adminInputUi = {
  root: 'w-full',
  base: [
    'rounded-xl min-h-11 px-3.5 py-2.5',
    'bg-slate-900/95 text-white tabular-nums',
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
    'ring-1 ring-inset ring-white/12',
    'transition-[box-shadow,ring-color] duration-200',
    'placeholder:text-slate-500',
    'hover:ring-white/18',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/55 focus-visible:shadow-[0_0_0_1px_rgba(99,102,241,0.25)]',
    '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
  ].join(' ')
}

function tradingInputType(key: string) {
  return key.includes('percent') || key.includes('days') || key.includes('window') || key.includes('min') || key.includes('max')
    ? 'number'
    : 'text'
}

const saving = ref(false)
const saveSettings = async () => {
  saving.value = true
  try {
    const updates = Object.entries(settingsMap).map(([key, value]) => ({ key, value }))
    await $fetch('/api/admin/settings', { method: 'PATCH', body: { updates } })
    toast.success('Đã lưu cài đặt')
  } catch (e: any) {
    toast.error(e?.data?.message || 'Lưu thất bại')
  } finally {
    saving.value = false
  }
}
</script>
