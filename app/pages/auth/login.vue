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
      <div class="px-6 pb-2 pt-6 sm:px-8 sm:pt-8">
        <h1 class="text-2xl font-bold text-white">{{ $t('auth.login.title') }}</h1>
        <p class="mt-1 text-sm text-slate-400">{{ $t('auth.login.subtitle') }}</p>
      </div>
    </template>

    <UForm :schema="schema" :state="state" @submit="handleLogin" class="space-y-6">
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
        />
      </UFormField>

      <UFormField :label="$t('auth.login.password')" name="password" size="lg">
        <UInput
          v-model="state.password"
          :type="showPassword ? 'text' : 'password'"
          leading-icon="i-heroicons-lock-closed"
          autocomplete="current-password"
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

      <div class="flex justify-end pt-0.5">
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

      <UButton type="submit" block size="lg" color="primary" :loading="loading" class="font-semibold">
        {{ $t('auth.login.submit') }}
      </UButton>
    </UForm>

    <template #footer>
      <p class="px-6 pb-6 text-center text-sm text-slate-400 sm:px-8">
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
