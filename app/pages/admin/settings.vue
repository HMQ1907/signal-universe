<template>
  <div class="max-w-3xl">
    <h1 class="text-2xl font-bold text-white mb-8">{{ $t('admin.settings.title') }}</h1>

    <div class="space-y-6">
      <!-- Trading Settings -->
      <div class="su-card">
        <h2 class="text-white font-bold mb-6 flex items-center gap-2">
          <UIcon name="i-heroicons-signal" class="text-indigo-400" />
          {{ $t('admin.settings.trading') }}
        </h2>
        <div class="grid md:grid-cols-2 gap-4">
          <UFormField v-for="key in tradingKeys" :key="key" :label="getLabel(key)">
            <UInput v-model="settingsMap[key]" :type="key.includes('percent') || key.includes('days') || key.includes('window') || key.includes('min') || key.includes('max') ? 'number' : 'text'" />
          </UFormField>
        </div>
      </div>

      <!-- Referral Settings -->
      <div class="su-card">
        <h2 class="text-white font-bold mb-6 flex items-center gap-2">
          <UIcon name="i-heroicons-users" class="text-purple-400" />
          {{ $t('admin.settings.referral') }}
        </h2>
        <div class="grid md:grid-cols-2 gap-4">
          <UFormField v-for="key in referralKeys" :key="key" :label="getLabel(key)">
            <UInput v-model="settingsMap[key]" type="number" step="0.1" />
          </UFormField>
        </div>
      </div>

      <!-- Withdrawal Settings -->
      <div class="su-card">
        <h2 class="text-white font-bold mb-6 flex items-center gap-2">
          <UIcon name="i-heroicons-arrow-up-tray" class="text-red-400" />
          {{ $t('admin.settings.withdrawal') }}
        </h2>
        <div class="grid md:grid-cols-2 gap-4">
          <UFormField v-for="key in withdrawalKeys" :key="key" :label="getLabel(key)">
            <UInput v-model="settingsMap[key]" />
          </UFormField>
        </div>
      </div>

      <UButton :loading="saving" color="primary" class="font-semibold"
        icon="i-heroicons-check" @click="saveSettings">
        Save All Settings
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Settings - Admin' })

const toast = useToastCustom()
const { data: rawSettings } = await useFetch<any[]>('/api/admin/settings')

const settingsMap = reactive<Record<string, string>>({})
for (const s of rawSettings.value || []) {
  settingsMap[s.key] = s.value || ''
}

const tradingKeys = ['signal_profit_percent', 'max_daily_profit_percent', 'capital_lock_days', 'min_deposit']
const referralKeys = ['deposit_referral_f1', 'deposit_referral_f2', 'signal_referral_f1', 'signal_referral_f2', 'signal_referral_f3']
const withdrawalKeys = ['min_withdraw', 'withdraw_fee_percent', 'withdraw_time_start', 'withdraw_time_end']

const labelMap: Record<string, string> = {
  signal_profit_percent: 'Signal Uses (% of balance)',
  max_daily_profit_percent: 'AI approve: % of package tier credited to user',
  capital_lock_days: 'Capital Lock Days',
  min_deposit: 'Min Deposit ($)',
  deposit_referral_f1: 'Deposit: direct referral → parent (%)',
  deposit_referral_f2: 'Deposit: 2nd level → grandparent (%)',
  signal_referral_f1: 'AI confirm: 1st upline (% of user credit / profit)',
  signal_referral_f2: 'AI confirm: 2nd upline (% of user credit)',
  signal_referral_f3: 'AI confirm: 3rd upline (% of user credit)',
  min_withdraw: 'Min Withdrawal ($)',
  withdraw_fee_percent: 'Withdrawal Fee (%)',
  withdraw_time_start: 'Withdrawal Window Start',
  withdraw_time_end: 'Withdrawal Window End'
}

const getLabel = (key: string) => labelMap[key] || key

const saving = ref(false)
const saveSettings = async () => {
  saving.value = true
  try {
    const updates = Object.entries(settingsMap).map(([key, value]) => ({ key, value }))
    await $fetch('/api/admin/settings', { method: 'PATCH', body: { updates } })
    toast.success('Settings saved')
  } catch (e: any) {
    toast.error(e?.data?.message || 'Failed to save')
  } finally {
    saving.value = false
  }
}
</script>
