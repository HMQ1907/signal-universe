<template>
  <div class="settings-page max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-white">{{ $t('settings.title') }}</h1>
    </div>

    <!-- Profile -->
    <div class="su-card mb-6">
      <h2 class="text-white font-bold mb-6 flex items-center gap-2">
        <UIcon name="i-heroicons-user" class="text-indigo-400" />
        {{ $t('settings.profile.title') }}
      </h2>
      <div class="space-y-4">
        <UFormField :label="$t('settings.profile.full_name')" size="lg">
          <UInput
            v-model="profileForm.full_name"
            leading-icon="i-heroicons-user"
            size="lg"
            variant="outline"
            color="neutral"
            class="auth-input"
            :ui="authInputUiLeading"
          />
        </UFormField>
        <UFormField :label="$t('settings.profile.email')" size="lg">
          <UInput
            :model-value="user?.email"
            disabled
            leading-icon="i-heroicons-envelope"
            size="lg"
            variant="outline"
            color="neutral"
            class="auth-input"
            :ui="authInputUiLeading"
          />
        </UFormField>
        <UButton :loading="profileLoading" color="primary"
          @click="updateProfile">
          {{ $t('settings.profile.update') }}
        </UButton>
      </div>
    </div>

    <!-- Change Password -->
    <div class="su-card mb-6">
      <h2 class="text-white font-bold mb-6 flex items-center gap-2">
        <UIcon name="i-heroicons-lock-closed" class="text-indigo-400" />
        {{ $t('settings.password.title') }}
      </h2>
      <div class="space-y-4">
        <UFormField :label="$t('settings.password.current')" size="lg">
          <UInput
            v-model="passForm.current"
            type="password"
            leading-icon="i-heroicons-lock-closed"
            autocomplete="current-password"
            size="lg"
            variant="outline"
            color="neutral"
            class="auth-input"
            :ui="authInputUiLeading"
          />
        </UFormField>
        <UFormField :label="$t('settings.password.new')" size="lg">
          <UInput
            v-model="passForm.new_password"
            type="password"
            leading-icon="i-heroicons-lock-closed"
            autocomplete="new-password"
            size="lg"
            variant="outline"
            color="neutral"
            class="auth-input"
            :ui="authInputUiLeading"
          />
        </UFormField>
        <UFormField :label="$t('settings.password.confirm')" size="lg">
          <UInput
            v-model="passForm.confirm"
            type="password"
            leading-icon="i-heroicons-lock-closed"
            autocomplete="new-password"
            size="lg"
            variant="outline"
            color="neutral"
            class="auth-input"
            :ui="authInputUiLeading"
          />
        </UFormField>
        <UAlert v-if="passError" :description="passError" color="error" variant="soft" />
        <UButton :loading="passLoading" color="primary"
          @click="changePassword">
          {{ $t('settings.password.submit') }}
        </UButton>
      </div>
    </div>

    <!-- Wallet Address -->
    <div class="su-card mb-6 overflow-visible">
      <h2 class="text-white font-bold mb-2 flex items-center gap-2">
        <UIcon name="i-heroicons-wallet" class="text-indigo-400" />
        {{ $t('settings.wallet.title') }}
      </h2>
      <p class="text-slate-400 text-sm mb-5">{{ $t('settings.wallet.description') }}</p>

      <div v-if="profilePending" class="flex justify-center py-8 text-slate-500">
        <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin" />
      </div>
      <div v-else class="space-y-4">
        <!-- Network selector -->
        <div>
          <p class="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">{{ $t('settings.wallet.network_label') }}</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="net in ['TRC20', 'BEP20']" :key="net"
              @click="walletForm.network = net as 'TRC20' | 'BEP20'"
              class="py-2.5 rounded-xl border text-sm font-semibold transition-all"
              :class="walletForm.network === net
                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                : 'border-white/10 text-slate-400 hover:border-white/20'"
            >
              {{ net }} · USDT
            </button>
          </div>
        </div>

        <!-- Address input -->
        <div>
          <p class="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">{{ $t('settings.wallet.address_label', { network: walletForm.network }) }}</p>
          <input
            v-model="walletForm.address"
            type="text"
            :placeholder="walletForm.network === 'TRC20' ? 'T...' : '0x...'"
            class="w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
          />
        </div>

        <!-- Current wallet display -->
        <div v-if="savedWalletAddr" class="p-3 rounded-xl bg-slate-800/40 border border-white/6">
          <p class="text-xs text-slate-500 mb-1">{{ $t('settings.wallet.saved_label') }}</p>
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
              :class="savedWalletNetwork === 'BEP20' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'">
              {{ savedWalletNetwork }}
            </span>
            <code class="text-indigo-300 text-xs font-mono truncate">{{ savedWalletAddr }}</code>
          </div>
        </div>

        <UAlert v-if="walletError" :description="walletError" color="error" variant="soft" />
        <UButton
          color="primary"
          block
          size="lg"
          :loading="walletLoading"
          :disabled="walletLoading || !walletForm.address?.trim()"
          class="mt-1 shrink-0"
          @click="saveWallet"
        >
          {{ $t('settings.wallet.save') }}
        </UButton>
      </div>
    </div>

    <!-- CCCD Upload -->
    <div class="su-card">
      <h2 class="text-white font-bold mb-2 flex items-center gap-2">
        <UIcon name="i-heroicons-identification" class="text-indigo-400" />
        {{ $t('settings.cccd.title') }}
      </h2>
      <p class="text-slate-400 text-sm mb-6">{{ $t('settings.cccd.note') }}</p>

      <div v-if="user?.cccd_url" class="mb-4">
        <div class="relative inline-block">
          <img :src="user.cccd_url" alt="CCCD" class="w-64 h-40 object-cover rounded-xl border border-slate-700" />
          <UBadge :label="$t('settings.cccd.badge_uploaded')" color="success" variant="soft" class="absolute top-2 right-2" />
        </div>
      </div>

      <div class="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-indigo-500/50 transition-colors cursor-pointer"
        @click="triggerFileInput">
        <UIcon name="i-heroicons-cloud-arrow-up" class="text-4xl text-slate-600 mb-3" />
        <p class="text-slate-400 text-sm">{{ user?.cccd_url ? $t('settings.cccd.change') : $t('settings.cccd.upload') }}</p>
        <p class="text-slate-600 text-xs mt-1">{{ $t('settings.cccd.file_hint') }}</p>
        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileUpload" />
      </div>

      <UAlert v-if="cccdError" :description="cccdError" color="error" variant="soft" class="mt-4" />

      <div v-if="cccdLoading" class="mt-4">
        <UProgress animation="carousel" />
        <p class="text-slate-400 text-sm text-center mt-2">{{ $t('settings.cccd.uploading') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { authInputUiLeading } from '~/utils/auth-form-ui'

definePageMeta({ middleware: 'auth' })

const { user, refreshUser } = useAuth()
const toast = useToastCustom()
const { t } = useI18n()

useHead({ title: () => `${t('settings.title')} - Signal Universe` })

onMounted(() => {
  void refreshUser()
})

const profileForm = reactive({ full_name: user.value?.full_name || '' })
const profileLoading = ref(false)

const passForm = reactive({ current: '', new_password: '', confirm: '' })
const passLoading = ref(false)
const passError = ref('')

// Wallet — profile API must include wallet_*; sync form when fetch completes
const { data: profileData, refresh: refreshProfile, pending: profilePending } = useFetch('/api/user/profile', { lazy: true })
const savedWalletAddr = computed(() => (profileData.value as any)?.wallet_address || '')
const savedWalletNetwork = computed(() => (profileData.value as any)?.wallet_network || 'TRC20')

const walletForm = reactive({
  address: '',
  network: 'TRC20' as 'TRC20' | 'BEP20'
})

watch(
  profileData,
  (p) => {
    if (!p) return
    const row = p as Record<string, unknown>
    walletForm.address = typeof row.wallet_address === 'string' ? row.wallet_address : ''
    const net = row.wallet_network
    walletForm.network = net === 'BEP20' ? 'BEP20' : 'TRC20'
  },
  { immediate: true, deep: true }
)

const walletLoading = ref(false)
const walletError = ref('')

const saveWallet = async () => {
  walletError.value = ''
  if (!walletForm.address?.trim()) {
    walletError.value = t('settings.wallet.error_empty')
    return
  }
  walletLoading.value = true
  try {
    await $fetch('/api/user/wallet', {
      method: 'PATCH',
      body: { wallet_address: walletForm.address.trim(), wallet_network: walletForm.network }
    })
    toast.success(t('settings.wallet.toast_saved'))
    await refreshUser()
    await refreshProfile()
  } catch (e: any) {
    walletError.value = e?.data?.message || 'Lưu ví thất bại'
  } finally {
    walletLoading.value = false
  }
}

const fileInput = ref<HTMLInputElement>()
const cccdLoading = ref(false)
const cccdError = ref('')

const updateProfile = async () => {
  profileLoading.value = true
  try {
    await $fetch('/api/user/profile', { method: 'PATCH', body: { full_name: profileForm.full_name } })
    toast.success(t('settings.profile.success'))
    await refreshUser()
  } catch (e: any) {
    toast.error(e?.data?.message || t('settings.profile.error'))
  } finally {
    profileLoading.value = false
  }
}

const changePassword = async () => {
  passError.value = ''
  if (passForm.new_password !== passForm.confirm) {
    passError.value = t('settings.password.error.mismatch')
    return
  }
  passLoading.value = true
  try {
    await $fetch('/api/user/change-password', {
      method: 'POST',
      body: { current_password: passForm.current, new_password: passForm.new_password }
    })
    toast.success(t('settings.password.success'))
    passForm.current = ''
    passForm.new_password = ''
    passForm.confirm = ''
  } catch (e: any) {
    passError.value = e?.data?.message || t('settings.password.error_generic')
  } finally {
    passLoading.value = false
  }
}

const triggerFileInput = () => fileInput.value?.click()

const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    cccdError.value = t('settings.cccd.error_file_size')
    return
  }

  cccdLoading.value = true
  cccdError.value = ''

  const reader = new FileReader()
  reader.onload = async () => {
    try {
      await $fetch('/api/user/cccd-upload', {
        method: 'POST',
        body: { file_base64: reader.result as string, file_name: file.name }
      })
      toast.success(t('settings.cccd.success'))
      await refreshUser()
    } catch (e: any) {
      cccdError.value = e?.data?.message || t('settings.cccd.upload_failed')
    } finally {
      cccdLoading.value = false
    }
  }
  reader.readAsDataURL(file)
}
</script>
