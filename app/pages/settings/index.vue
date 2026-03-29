<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
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
        <UFormField :label="$t('settings.profile.full_name')">
          <UInput v-model="profileForm.full_name" icon="i-heroicons-user" />
        </UFormField>
        <UFormField :label="$t('settings.profile.email')">
          <UInput :model-value="user?.email" disabled icon="i-heroicons-envelope" />
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
        <UFormField :label="$t('settings.password.current')">
          <UInput v-model="passForm.current" type="password" icon="i-heroicons-lock-closed" />
        </UFormField>
        <UFormField :label="$t('settings.password.new')">
          <UInput v-model="passForm.new_password" type="password" icon="i-heroicons-lock-closed" />
        </UFormField>
        <UFormField :label="$t('settings.password.confirm')">
          <UInput v-model="passForm.confirm" type="password" icon="i-heroicons-lock-closed" />
        </UFormField>
        <UAlert v-if="passError" :description="passError" color="error" variant="soft" />
        <UButton :loading="passLoading" color="primary"
          @click="changePassword">
          {{ $t('settings.password.submit') }}
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
          <UBadge label="Uploaded" color="success" variant="soft" class="absolute top-2 right-2" />
        </div>
      </div>

      <div class="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-indigo-500/50 transition-colors cursor-pointer"
        @click="triggerFileInput">
        <UIcon name="i-heroicons-cloud-arrow-up" class="text-4xl text-slate-600 mb-3" />
        <p class="text-slate-400 text-sm">{{ user?.cccd_url ? $t('settings.cccd.change') : $t('settings.cccd.upload') }}</p>
        <p class="text-slate-600 text-xs mt-1">JPG, PNG • Max 5MB</p>
        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileUpload" />
      </div>

      <UAlert v-if="cccdError" :description="cccdError" color="error" variant="soft" class="mt-4" />

      <div v-if="cccdLoading" class="mt-4">
        <UProgress animation="carousel" />
        <p class="text-slate-400 text-sm text-center mt-2">Uploading...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Settings - Signal Universe' })

const { user, refreshUser } = useAuth()
const toast = useToastCustom()
const { t } = useI18n()

await refreshUser()

const profileForm = reactive({ full_name: user.value?.full_name || '' })
const profileLoading = ref(false)

const passForm = reactive({ current: '', new_password: '', confirm: '' })
const passLoading = ref(false)
const passError = ref('')

const fileInput = ref<HTMLInputElement>()
const cccdLoading = ref(false)
const cccdError = ref('')

const updateProfile = async () => {
  profileLoading.value = true
  try {
    await $fetch('/api/user/profile', { method: 'PATCH', body: { full_name: profileForm.full_name } })
    toast.success('Profile updated')
    await refreshUser()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Update failed')
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
    passError.value = e?.data?.message || 'Password change failed'
  } finally {
    passLoading.value = false
  }
}

const triggerFileInput = () => fileInput.value?.click()

const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    cccdError.value = 'File size must be less than 5MB'
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
      cccdError.value = e?.data?.message || 'Upload failed'
    } finally {
      cccdLoading.value = false
    }
  }
  reader.readAsDataURL(file)
}
</script>
