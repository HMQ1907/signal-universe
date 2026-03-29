<template>
  <UCard
    class="auth-form-card border-white/10 bg-slate-900/70 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl"
    :ui="{
      root: 'overflow-hidden rounded-2xl',
      header: 'border-b border-white/5 pb-0',
      body: { padding: 'p-6 sm:p-8' }
    }"
  >
    <template #header>
      <div v-if="step === 'email'" class="px-6 pb-2 pt-6 sm:px-8 sm:pt-8">
        <h1 class="text-2xl font-bold text-white">{{ $t('auth.forgot_password.title') }}</h1>
        <p class="mt-1 text-sm text-slate-400">{{ $t('auth.forgot_password.subtitle') }}</p>
      </div>
      <div v-else class="px-6 pb-2 pt-6 sm:px-8 sm:pt-8">
        <h1 class="text-2xl font-bold text-white">Enter Reset Code</h1>
        <p class="mt-1 text-sm text-slate-400">{{ $t('auth.forgot_password.enter_code') }}</p>
        <p class="mt-2 text-sm font-medium text-primary-400">{{ emailState.email }}</p>
      </div>
    </template>

    <UForm v-if="step === 'email'" :state="emailState" @submit="sendCode" class="space-y-6">
      <UFormField :label="$t('auth.forgot_password.email')" name="email" size="lg">
        <UInput
          v-model="emailState.email"
          type="email"
          leading-icon="i-heroicons-envelope"
          size="lg"
          variant="outline"
          color="neutral"
          class="auth-input"
        />
      </UFormField>

      <UAlert
        v-if="error"
        :description="error"
        color="error"
        variant="soft"
        icon="i-heroicons-exclamation-circle"
      />

      <UButton type="submit" block size="lg" color="primary" :loading="loading" class="font-semibold">
        {{ $t('auth.forgot_password.submit') }}
      </UButton>
    </UForm>

    <UForm v-else :state="resetState" @submit="resetPassword" class="space-y-6">
      <UFormField label="Verification Code" name="code" size="lg">
        <UInput
          v-model="resetState.code"
          placeholder="000000"
          maxlength="6"
          size="lg"
          variant="outline"
          color="neutral"
          class="auth-input text-center font-mono text-2xl tracking-widest"
        />
      </UFormField>

      <UFormField :label="$t('auth.forgot_password.new_password')" name="new_password" size="lg">
        <UInput
          v-model="resetState.new_password"
          :type="showPassword ? 'text' : 'password'"
          leading-icon="i-heroicons-lock-closed"
          size="lg"
          variant="outline"
          color="neutral"
          class="auth-input"
        >
          <template #trailing>
            <UButton
              color="neutral"
              variant="ghost"
              size="xs"
              square
              class="shrink-0"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
              @click.prevent="showPassword = !showPassword"
            />
          </template>
        </UInput>
      </UFormField>

      <UFormField :label="$t('auth.forgot_password.confirm_new_password')" name="confirm" size="lg">
        <UInput
          v-model="resetState.confirm"
          :type="showPassword ? 'text' : 'password'"
          leading-icon="i-heroicons-lock-closed"
          size="lg"
          variant="outline"
          color="neutral"
          class="auth-input"
        />
      </UFormField>

      <UAlert v-if="error" :description="error" color="error" variant="soft" />

      <UButton type="submit" block size="lg" color="primary" :loading="loading" class="font-semibold">
        {{ $t('auth.forgot_password.reset_submit') }}
      </UButton>
    </UForm>

    <template #footer>
      <NuxtLink
        to="/auth/login"
        class="flex items-center justify-center gap-2 px-6 pb-6 text-sm text-slate-400 transition-colors duration-200 hover:text-white sm:px-8"
      >
        <UIcon name="i-heroicons-arrow-left" />
        {{ $t('auth.forgot_password.back_to_login') }}
      </NuxtLink>
    </template>
  </UCard>
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
