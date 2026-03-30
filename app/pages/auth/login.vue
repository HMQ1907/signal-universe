<template>
  <UCard
    class="auth-form-card relative z-10"
    :ui="authCardUi"
  >
    <template #header>
      <div class="space-y-2 text-center">
        <h1 class="text-3xl font-extrabold text-white tracking-tight">{{ $t('auth.login.title') }}</h1>
        <p class="text-base text-slate-400 max-w-sm mx-auto">{{ $t('auth.login.subtitle') }}</p>
      </div>
    </template>
    
    <UForm :schema="schema" :state="state" @submit="handleLogin" class="flex flex-col gap-6">
      <UFormField :label="$t('auth.login.email')" name="email" size="lg">
        <UInput
          v-model="state.email"
          type="email"
          placeholder="you@example.com"
          leading-icon="i-heroicons-envelope"
          autocomplete="email"
          size="lg"
          variant="outline"
          color="neutral"
          class="auth-input"
          :ui="authInputUiLeading"
        />
      </UFormField>

      <UFormField :label="$t('auth.login.password')" name="password" size="lg">
        <UInput
          v-model="state.password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
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

      <div class="flex justify-end pr-0.5">
        <NuxtLink
          to="/auth/forgot-password"
          class="text-sm text-primary-400 transition-colors duration-200 hover:text-primary-300"
        >
          {{ $t('auth.login.forgot_password') }}
        </NuxtLink>
      </div>

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
        variant="solid"
        :loading="loading"
        class="web3-cta-glow mt-2 min-h-12 text-base font-bold tracking-wide relative overflow-hidden group border-0 rounded-xl"
      >
        <div class="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] animate-[su-gradient-flow_3s_linear_infinite] group-hover:bg-[length:150%_auto] transition-all duration-300" />
        <span class="relative z-10 text-white shadow-sm">{{ $t('auth.login.submit') }}</span>
      </UButton>
    </UForm>

    <template #footer>
      <p class="text-center text-sm text-slate-400">
        {{ $t('auth.login.no_account') }}
        <NuxtLink
          to="/auth/register"
          class="ml-1 font-medium text-primary-400 transition-colors duration-200 hover:text-primary-300"
        >
          {{ $t('auth.login.register_link') }}
        </NuxtLink>
      </p>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { authCardUi, authInputUiLeading, authInputUiPassword } from '~/utils/auth-form-ui'

definePageMeta({ layout: 'auth', middleware: 'guest' })
useHead({ title: 'Login - Signal Universe' })

const { login } = useAuth()
const { t } = useI18n()

const state = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const schema = z.object({
  email: z.string().email(t('auth.login.error.invalid_credentials')),
  password: z.string().min(1)
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await login(state.email, state.password)
  } catch (e: any) {
    error.value = e?.data?.message || t('auth.login.error.invalid_credentials')
  } finally {
    loading.value = false
  }
}
</script>
