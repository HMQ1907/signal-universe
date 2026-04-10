<template>
  <div class="w-full max-w-none mx-auto space-y-8 pb-8">
    <!-- Header -->
    <div class="rounded-2xl border border-white/8 bg-slate-900/40 px-5 py-5 sm:px-6 sm:py-6">
      <h1 class="text-xl sm:text-2xl font-bold text-white tracking-tight">{{ $t('admin.wallets.title') }}</h1>
      <!-- <p class="text-slate-400 text-sm mt-2 max-w-3xl leading-relaxed">{{ $t('admin.wallets.pick_intro') }}</p> -->
    </div>

    <div v-if="walletsLoading" class="flex justify-center py-20 text-slate-500">
      <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin" />
    </div>
    <template v-else>
    <!-- TRC20 -->
    <section class="rounded-2xl border border-white/8 bg-slate-900/30 overflow-hidden">
      <div class="px-4 sm:px-6 py-4 border-b border-white/6 flex items-center gap-3 bg-indigo-500/5">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
          <UIcon name="i-heroicons-wallet" class="text-lg" />
        </div>
        <div>
          <h2 class="text-white font-semibold text-base sm:text-lg">{{ $t('admin.wallets.trc20_address') }}</h2>
          <p class="text-xs text-slate-500">TRC20 · Tron</p>
        </div>
      </div>
      <div class="p-4 sm:p-6">
        <UAlert
          v-if="!trcAssets?.length"
          :description="$t('admin.wallets.empty_folder', { folder: 'public/images/wallet/trc/' })"
          color="neutral"
          variant="soft"
        />
        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 w-full min-w-0"
        >
          <div
            v-for="(item, i) in trcAssets"
            :key="item.address"
            class="group flex flex-col min-w-0 rounded-xl border border-white/10 bg-slate-950/50 p-3 sm:p-4 transition-all duration-200 hover:border-indigo-500/25 hover:bg-slate-900/60"
            :class="isSelectedTrc(item.address) ? 'border-indigo-500/50 ring-1 ring-indigo-500/30 shadow-[0_0_0_1px_rgba(99,102,241,0.15)]' : ''"
          >
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="text-[10px] font-semibold uppercase tracking-wider text-indigo-400/90">TRC</span>
              <span class="text-[11px] text-slate-500 tabular-nums">{{ $t('admin.wallets.wallet_n', { n: i + 1 }) }}</span>
            </div>
            <div class="flex justify-center mb-3 rounded-lg bg-white p-1.5 sm:p-2 shadow-inner">
              <img
                :src="item.src"
                alt=""
                width="140"
                height="140"
                class="rounded-md w-full max-w-[120px] max-h-[120px] lg:max-w-[100px] lg:max-h-[100px] h-auto object-contain"
              />
            </div>
            <p class="text-[11px] text-slate-500 mb-1">{{ $t('admin.wallets.address_label') }}</p>
            <p class="text-[11px] sm:text-xs font-mono text-slate-200 break-all leading-snug mb-4 flex-1 min-h-10">
              {{ item.address }}
            </p>
            <UButton
              v-if="isMainAdmin"
              block
              size="sm"
              :loading="savingKey === `trc:${item.address}`"
              :disabled="!!savingKey && savingKey !== `trc:${item.address}`"
              :color="isSelectedTrc(item.address) ? 'success' : 'primary'"
              :variant="isSelectedTrc(item.address) ? 'soft' : 'solid'"
              :icon="isSelectedTrc(item.address) ? 'i-heroicons-check-circle' : 'i-heroicons-check'"
              class="justify-center"
              @click="selectTrc(item.address)"
            >
              {{ isSelectedTrc(item.address) ? $t('admin.wallets.current_selection') : $t('admin.wallets.select_this') }}
            </UButton>
            <UBadge
              v-else-if="isSelectedTrc(item.address)"
              :label="$t('admin.wallets.current_selection')"
              color="success"
              variant="soft"
              class="justify-center w-full"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- BEP20 -->
    <section class="rounded-2xl border border-white/8 bg-slate-900/30 overflow-hidden">
      <div class="px-4 sm:px-6 py-4 border-b border-white/6 flex items-center gap-3 bg-emerald-500/5">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
          <UIcon name="i-heroicons-wallet" class="text-lg" />
        </div>
        <div>
          <h2 class="text-white font-semibold text-base sm:text-lg">{{ $t('admin.wallets.bep20_address') }}</h2>
          <p class="text-xs text-slate-500">BEP20 · BSC</p>
        </div>
      </div>
      <div class="p-4 sm:p-6">
        <UAlert
          v-if="!bepAssets?.length"
          :description="$t('admin.wallets.empty_folder', { folder: 'public/images/wallet/bep/' })"
          color="neutral"
          variant="soft"
        />
        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 w-full min-w-0"
        >
          <div
            v-for="(item, i) in bepAssets"
            :key="item.address"
            class="group flex flex-col min-w-0 rounded-xl border border-white/10 bg-slate-950/50 p-3 sm:p-4 transition-all duration-200 hover:border-emerald-500/25 hover:bg-slate-900/60"
            :class="isSelectedBep(item.address) ? 'border-emerald-500/45 ring-1 ring-emerald-500/25 shadow-[0_0_0_1px_rgba(52,211,153,0.12)]' : ''"
          >
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/90">BEP</span>
              <span class="text-[11px] text-slate-500 tabular-nums">{{ $t('admin.wallets.wallet_n', { n: i + 1 }) }}</span>
            </div>
            <div class="flex justify-center mb-3 rounded-lg bg-white p-1.5 sm:p-2 shadow-inner">
              <img
                :src="item.src"
                alt=""
                width="140"
                height="140"
                class="rounded-md w-full max-w-[120px] max-h-[120px] lg:max-w-[100px] lg:max-h-[100px] h-auto object-contain"
              />
            </div>
            <p class="text-[11px] text-slate-500 mb-1">{{ $t('admin.wallets.address_label') }}</p>
            <p class="text-[11px] sm:text-xs font-mono text-slate-200 break-all leading-snug mb-4 flex-1 min-h-10">
              {{ item.address }}
            </p>
            <UButton
              v-if="isMainAdmin"
              block
              size="sm"
              :loading="savingKey === `bep:${item.address}`"
              :disabled="!!savingKey && savingKey !== `bep:${item.address}`"
              :color="isSelectedBep(item.address) ? 'success' : 'primary'"
              :variant="isSelectedBep(item.address) ? 'soft' : 'solid'"
              :icon="isSelectedBep(item.address) ? 'i-heroicons-check-circle' : 'i-heroicons-check'"
              class="justify-center"
              @click="selectBep(item.address)"
            >
              {{ isSelectedBep(item.address) ? $t('admin.wallets.current_selection') : $t('admin.wallets.select_this') }}
            </UButton>
            <UBadge
              v-else-if="isSelectedBep(item.address)"
              :label="$t('admin.wallets.current_selection')"
              color="success"
              variant="soft"
              class="justify-center w-full"
            />
          </div>
        </div>
      </div>
    </section>

    <div class="space-y-3">
      <!-- <UAlert :description="$t('admin.wallets.deposit_hint')" color="neutral" variant="soft" /> -->
      <UAlert v-if="!isMainAdmin" :description="$t('admin.wallets.sub_admin_readonly')" color="info" variant="soft" />
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Wallets - Admin' })

const toast = useToastCustom()
const { t } = useI18n()
const { user: authUser } = useAuth()
const isMainAdmin = computed(() => authUser.value?.is_admin === true)

const { data: settings, refresh: refreshSettings, pending: pendingSettings } = useFetch('/api/wallet/settings', { lazy: true })
const { data: assets, pending: pendingAssets } = useFetch<{ trc: { address: string; src: string }[]; bep: { address: string; src: string }[] }>(
  '/api/admin/wallet-assets',
  { lazy: true }
)
const walletsLoading = computed(() => pendingSettings.value || pendingAssets.value)

const trcAssets = computed(() => assets.value?.trc ?? [])
const bepAssets = computed(() => assets.value?.bep ?? [])

const savingKey = ref<string | null>(null)

function isSelectedTrc(addr: string) {
  const s = settings.value?.trc20_wallet_address || ''
  return s.length > 0 && s === addr
}

function isSelectedBep(addr: string) {
  const s = settings.value?.bep20_wallet_address || ''
  return s.length > 0 && s.toLowerCase() === addr.toLowerCase()
}

async function selectTrc(address: string) {
  if (!isMainAdmin.value) return
  savingKey.value = `trc:${address}`
  try {
    await $fetch('/api/admin/settings', {
      method: 'PATCH',
      body: { updates: [{ key: 'trc20_wallet_address', value: address }] }
    })
    toast.success(t('admin.wallets.saved_trc'))
    await refreshSettings()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.error(err?.data?.message || 'Failed')
  } finally {
    savingKey.value = null
  }
}

async function selectBep(address: string) {
  if (!isMainAdmin.value) return
  savingKey.value = `bep:${address}`
  try {
    await $fetch('/api/admin/settings', {
      method: 'PATCH',
      body: { updates: [{ key: 'bep20_wallet_address', value: address }] }
    })
    toast.success(t('admin.wallets.saved_bep'))
    await refreshSettings()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.error(err?.data?.message || 'Failed')
  } finally {
    savingKey.value = null
  }
}
</script>
