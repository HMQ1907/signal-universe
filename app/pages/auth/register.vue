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
        <h1 class="text-2xl font-bold text-white">{{ $t('auth.register.title') }}</h1>
        <p class="mt-1 text-sm text-slate-400">{{ $t('auth.register.subtitle') }}</p>
      </div>
    </template>

    <UForm :schema="schema" :state="state" @submit="handleRegister" class="space-y-6">
      <UFormField :label="$t('auth.register.full_name')" name="full_name" size="lg">
        <UInput
          v-model="state.full_name"
          leading-icon="i-heroicons-user"
          autocomplete="name"
          size="lg"
          variant="outline"
          color="neutral"
          class="auth-input"
        />
      </UFormField>

      <UFormField :label="$t('auth.register.email')" name="email" size="lg">
        <UInput
          v-model="state.email"
          type="email"
          leading-icon="i-heroicons-envelope"
          autocomplete="email"
          size="lg"
          variant="outline"
          color="neutral"
          class="auth-input"
        />
      </UFormField>

      <UFormField :label="$t('auth.register.password')" name="password" size="lg">
        <UInput
          v-model="state.password"
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

      <UFormField :label="$t('auth.register.confirm_password')" name="confirm_password" size="lg">
        <UInput
          v-model="state.confirm_password"
          :type="showPassword ? 'text' : 'password'"
          leading-icon="i-heroicons-lock-closed"
          size="lg"
          variant="outline"
          color="neutral"
          class="auth-input"
        />
      </UFormField>

      <UFormField :label="$t('auth.register.referral_code')" name="referral_code" size="lg">
        <UInput
          v-model="state.referral_code"
          leading-icon="i-heroicons-gift"
          size="lg"
          variant="outline"
          color="neutral"
          class="auth-input"
          :placeholder="referralFromUrl || ''"
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
        {{ $t('auth.register.submit') }}
      </UButton>

      <p class="text-center text-xs text-slate-500">{{ $t('auth.register.terms') }}</p>
    </UForm>

    <template #footer>
      <p class="px-6 pb-6 text-center text-sm text-slate-400 sm:px-8">
        {{ $t('auth.register.have_account') }}
        <NuxtLink
          to="/auth/login"
          class="ml-1 font-medium text-primary-400 transition-colors duration-200 hover:text-primary-300"
        >
          {{ $t('auth.register.login_link') }}
        </NuxtLink>
      </p>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { z } from 'zod'

definePageMeta({ layout: 'auth', middleware: 'guest' })
useHead({ title: 'Register - Signal Universe' })

const route = useRoute()
const toast = useToastCustom()
const { t } = useI18n()

const referralFromUrl = (route.query.ref as string) || ''

const state = reactive({
  full_name: '',
  email: '',
  password: '',
  confirm_password: '',
  referral_code: referralFromUrl
})

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const schema = z
  .object({
    full_name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8, t('auth.register.error.password_weak')),
    confirm_password: z.string(),
    referral_code: z.string().optional()
  })
  .refine(d => d.password === d.confirm_password, {
    message: t('auth.register.error.password_mismatch'),
    path: ['confirm_password']
  })

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        email: state.email,
        password: state.password,
        full_name: state.full_name,
        referral_code: state.referral_code || undefined
      }
    })
    toast.success('Registration successful! Please login.')
    await navigateTo('/auth/login')
  } catch (e: any) {
    error.value = e?.data?.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>
