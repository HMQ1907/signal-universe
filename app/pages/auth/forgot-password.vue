<template>
  <div>
    <div class="su-card">
      <template v-if="step === 'email'">
        <h1 class="text-2xl font-bold text-white mb-1">{{ $t('auth.forgot_password.title') }}</h1>
        <p class="text-slate-400 text-sm mb-8">{{ $t('auth.forgot_password.subtitle') }}</p>

        <UForm :state="emailState" @submit="sendCode" class="space-y-4">
          <UFormGroup :label="$t('auth.forgot_password.email')" name="email">
            <UInput v-model="emailState.email" type="email" icon="i-heroicons-envelope" />
          </UFormGroup>

          <UAlert v-if="error" :description="error" color="red" variant="soft" icon="i-heroicons-exclamation-circle" />

          <UButton type="submit" block :loading="loading" class="bg-indigo-600 hover:bg-indigo-500 text-white">
            {{ $t('auth.forgot_password.submit') }}
          </UButton>
        </UForm>
      </template>

      <template v-else-if="step === 'code'">
        <h1 class="text-2xl font-bold text-white mb-1">Enter Reset Code</h1>
        <p class="text-slate-400 text-sm mb-2">{{ $t('auth.forgot_password.enter_code') }}</p>
        <p class="text-indigo-400 font-medium text-sm mb-8">{{ emailState.email }}</p>

        <UForm :state="resetState" @submit="resetPassword" class="space-y-4">
          <UFormGroup label="Verification Code" name="code">
            <UInput v-model="resetState.code" placeholder="000000" maxlength="6" class="text-center text-2xl font-mono tracking-widest" />
          </UFormGroup>

          <UFormGroup :label="$t('auth.forgot_password.new_password')" name="new_password">
            <UInput v-model="resetState.new_password" :type="showPassword ? 'text' : 'password'" icon="i-heroicons-lock-closed">
              <template #trailing>
                <UButton color="gray" variant="ghost" size="xs" class="mr-1"
                  :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                  @click="showPassword = !showPassword" />
              </template>
            </UInput>
          </UFormGroup>

          <UFormGroup :label="$t('auth.forgot_password.confirm_new_password')" name="confirm">
            <UInput v-model="resetState.confirm" :type="showPassword ? 'text' : 'password'" icon="i-heroicons-lock-closed" />
          </UFormGroup>

          <UAlert v-if="error" :description="error" color="red" variant="soft" />

          <UButton type="submit" block :loading="loading" class="bg-indigo-600 hover:bg-indigo-500 text-white">
            {{ $t('auth.forgot_password.reset_submit') }}
          </UButton>
        </UForm>
      </template>

      <NuxtLink to="/auth/login" class="flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm mt-6 transition-colors">
        <UIcon name="i-heroicons-arrow-left" />
        {{ $t('auth.forgot_password.back_to_login') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' })
useHead({ title: 'Reset Password - Signal Universe' })

const toast = useToastCustom()
const step = ref<'email' | 'code'>('email')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const emailState = reactive({ email: '' })
const resetState = reactive({ code: '', new_password: '', confirm: '' })

const sendCode = async () => {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/forgot-password', { method: 'POST', body: { email: emailState.email } })
    toast.success('Reset code sent to your email')
    step.value = 'code'
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to send reset code'
  } finally {
    loading.value = false
  }
}

const resetPassword = async () => {
  if (resetState.new_password !== resetState.confirm) {
    error.value = 'Passwords do not match'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: { email: emailState.email, code: resetState.code, new_password: resetState.new_password }
    })
    toast.success('Password reset successfully')
    await navigateTo('/auth/login')
  } catch (e: any) {
    error.value = e?.data?.message || 'Reset failed'
  } finally {
    loading.value = false
  }
}
</script>
