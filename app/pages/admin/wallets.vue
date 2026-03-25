<template>
  <div class="max-w-2xl">
    <h1 class="text-2xl font-bold text-white mb-8">{{ $t('admin.wallets.title') }}</h1>

    <div class="su-card">
      <h2 class="text-white font-semibold mb-6 flex items-center gap-2">
        <UIcon name="i-heroicons-wallet" class="text-indigo-400" />
        {{ $t('admin.wallets.trc20_address') }}
      </h2>

      <div class="space-y-4">
        <UFormGroup label="USDT TRC20 Wallet Address">
          <UInput v-model="walletAddress" placeholder="TRC20 address..." icon="i-heroicons-wallet"
            class="font-mono" />
        </UFormGroup>

        <div v-if="walletAddress" class="text-center p-4 rounded-xl bg-white inline-block">
          <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${walletAddress}`"
            alt="QR Code" width="120" height="120" />
        </div>

        <UAlert description="This wallet address is shown to users for deposits. Update carefully." color="amber" variant="soft" />

        <UButton :loading="saving" class="bg-indigo-600 hover:bg-indigo-500 text-white"
          icon="i-heroicons-check" @click="saveWallet">
          {{ $t('admin.wallets.save') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Wallets - Admin' })

const toast = useToastCustom()
const { data: settings, refresh } = await useFetch('/api/wallet/settings')
const walletAddress = ref(settings.value?.trc20_wallet_address || '')
const saving = ref(false)

const saveWallet = async () => {
  saving.value = true
  try {
    await $fetch('/api/admin/settings', {
      method: 'PATCH',
      body: { updates: [{ key: 'trc20_wallet_address', value: walletAddress.value }] }
    })
    toast.success('Wallet address saved')
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Failed to save')
  } finally {
    saving.value = false
  }
}
</script>
