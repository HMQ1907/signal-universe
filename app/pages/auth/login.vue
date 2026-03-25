<template>
  <div>
    <div class="su-card">
      <h1 class="text-2xl font-bold text-white mb-1">{{ $t('auth.login.title') }}</h1>
      <p class="text-slate-400 text-sm mb-8">{{ $t('auth.login.subtitle') }}</p>

      <UForm :schema="schema" :state="state" @submit="handleLogin" class="space-y-4">
        <UFormGroup :label="$t('auth.login.email')" name="email">
          <UInput v-model="state.email" type="email" placeholder="you@example.com"
            icon="i-heroicons-envelope" autocomplete="email" />
        </UFormGroup>

        <UFormGroup :label="$t('auth.login.password')" name="password">
          <UInput v-model="state.password" :type="showPassword ? 'text' : 'password'"
            icon="i-heroicons-lock-closed" autocomplete="current-password"
            :ui="{ trailing: { padding: { sm: 'pr-10' } } }">
            <template #trailing>
              <UButton color="gray" variant="ghost" size="xs" class="mr-1"
                :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                @click="showPassword = !showPassword" />
            </template>
          </UInput>
        </UFormGroup>

        <div class="flex justify-end">
          <NuxtLink to="/auth/forgot-password" class="text-sm text-indigo-400 hover:text-indigo-300">
            {{ $t('auth.login.forgot_password') }}
          </NuxtLink>
        </div>

        <UAlert v-if="error" :description="error" color="red" variant="soft" icon="i-heroicons-exclamation-circle" />

        <UButton type="submit" block :loading="loading"
          class="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
          {{ $t('auth.login.submit') }}
        </UButton>
      </UForm>

      <p class="text-center text-slate-400 text-sm mt-6">
        {{ $t('auth.login.no_account') }}
        <NuxtLink to="/auth/register" class="text-indigo-400 hover:text-indigo-300 font-medium ml-1">
          {{ $t('auth.login.register_link') }}
        </NuxtLink>
      </p>
    </div>
  </div>
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
