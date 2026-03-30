<template>
  <UCard
    class="auth-form-card border border-white/10 bg-slate-900/80 backdrop-blur-xl"
    :ui="authCardUi"
  >
    <template #header>
      <div v-if="step === 'email'" class="space-y-1">
        <h1 class="text-2xl font-bold text-white">{{ $t('auth.forgot_password.title') }}</h1>
        <p class="text-sm text-slate-400">{{ $t('auth.forgot_password.subtitle') }}</p>
      </div>
      <div v-else class="space-y-1">
        <h1 class="text-2xl font-bold text-white">Enter Reset Code</h1>
        <p class="text-sm text-slate-400">{{ $t('auth.forgot_password.enter_code') }}</p>
        <p class="pt-1 text-sm font-medium text-primary-400">{{ emailState.email }}</p>
      </div>
    </template>

    <UForm v-if="step === 'email'" :state="emailState" @submit="sendCode" class="flex flex-col gap-5">
      <UFormField :label="$t('auth.forgot_password.email')" name="email" size="lg">
        <UInput
          v-model="emailState.email"
          type="email"
          leading-icon="i-heroicons-envelope"
          size="lg"
          variant="outline"
          color="neutral"
          class="auth-input"
          :ui="authInputUiLeading"
        />
      </UFormField>

      <UAlert
        v-if="error"
        :description="error"
        color="error"
        variant="soft"
        icon="i-heroicons-exclamation-circle"
      />

      <UButton
        type="submit"
        block
        size="lg"
        color="primary"
        variant="solid"
        :loading="loading"
        class="auth-submit-primary mt-1 min-h-12 text-base font-semibold"
      >
        {{ $t('auth.forgot_password.submit') }}
      </UButton>
    </UForm>

    <UForm v-else :state="resetState" @submit="resetPassword" class="flex flex-col gap-5">
      <UFormField label="Verification Code" name="code" size="lg">
        <UInput
          v-model="resetState.code"
          placeholder="000000"
          maxlength="6"
          size="lg"
          variant="outline"
          color="neutral"
          class="auth-input auth-input-code font-mono text-2xl tracking-widest"
        />
      </UFormField>

      <UFormField :label="$t('auth.forgot_password.new_password')" name="new_password" size="lg">
        <UInput
          v-model="resetState.new_password"
          :type="showPassword ? 'text' : 'password'"
          size="lg"
          variant="outline"
          color="neutral"
          class="auth-input"
          :ui="authInputUiPassword"
        >
          <template #leading>
            <UIcon name="i-heroicons-lock-closed" class="size-5 shrink-0 text-slate-400" />
          </template>
          <template #trailing>
            <AuthPasswordRevealButton :visible="showPassword" @click="showPassword = !showPassword" />
          </template>
        </UInput>
      </UFormField>

      <UFormField :label="$t('auth.forgot_password.confirm_new_password')" name="confirm" size="lg">
        <UInput
          v-model="resetState.confirm"
          :type="showPassword ? 'text' : 'password'"
          size="lg"
          variant="outline"
          color="neutral"
          class="auth-input"
          :ui="authInputUiLeading"
        >
          <template #leading>
            <UIcon name="i-heroicons-lock-closed" class="size-5 shrink-0 text-slate-400" />
          </template>
        </UInput>
      </UFormField>

      <UAlert v-if="error" :description="error" color="error" variant="soft" />

      <UButton
        type="submit"
        block
        size="lg"
        color="primary"
        variant="solid"
        :loading="loading"
        class="auth-submit-primary mt-1 min-h-12 text-base font-semibold"
      >
        {{ $t('auth.forgot_password.reset_submit') }}
      </UButton>
    </UForm>

    <template #footer>
      <NuxtLink
        to="/auth/login"
        class="flex items-center justify-center gap-2 text-sm text-slate-400 transition-colors duration-200 hover:text-white"
      >
        <UIcon name="i-heroicons-arrow-left" />
        {{ $t('auth.forgot_password.back_to_login') }}
      </NuxtLink>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { authCardUi, authInputUiLeading, authInputUiPassword } from '~/utils/auth-form-ui'

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
