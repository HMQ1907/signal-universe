<template>
  <div>
    <div class="su-card">
      <h1 class="text-2xl font-bold text-white mb-1">{{ $t('auth.register.title') }}</h1>
      <p class="text-slate-400 text-sm mb-8">{{ $t('auth.register.subtitle') }}</p>

      <UForm :schema="schema" :state="state" @submit="handleRegister" class="space-y-4">
        <UFormGroup :label="$t('auth.register.full_name')" name="full_name">
          <UInput v-model="state.full_name" icon="i-heroicons-user" autocomplete="name" />
        </UFormGroup>

        <UFormGroup :label="$t('auth.register.email')" name="email">
          <UInput v-model="state.email" type="email" icon="i-heroicons-envelope" autocomplete="email" />
        </UFormGroup>

        <UFormGroup :label="$t('auth.register.password')" name="password">
          <UInput v-model="state.password" :type="showPassword ? 'text' : 'password'"
            icon="i-heroicons-lock-closed">
            <template #trailing>
              <UButton color="gray" variant="ghost" size="xs" class="mr-1"
                :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                @click="showPassword = !showPassword" />
            </template>
          </UInput>
        </UFormGroup>

        <UFormGroup :label="$t('auth.register.confirm_password')" name="confirm_password">
          <UInput v-model="state.confirm_password" :type="showPassword ? 'text' : 'password'"
            icon="i-heroicons-lock-closed" />
        </UFormGroup>

        <UFormGroup :label="$t('auth.register.referral_code')" name="referral_code">
          <UInput v-model="state.referral_code" icon="i-heroicons-gift" :placeholder="referralFromUrl || ''" />
        </UFormGroup>

        <UAlert v-if="error" :description="error" color="red" variant="soft" icon="i-heroicons-exclamation-circle" />

        <UButton type="submit" block :loading="loading"
          class="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
          {{ $t('auth.register.submit') }}
        </UButton>

        <p class="text-slate-500 text-xs text-center">{{ $t('auth.register.terms') }}</p>
      </UForm>

      <p class="text-center text-slate-400 text-sm mt-6">
        {{ $t('auth.register.have_account') }}
        <NuxtLink to="/auth/login" class="text-indigo-400 hover:text-indigo-300 font-medium ml-1">
          {{ $t('auth.register.login_link') }}
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

definePageMeta({ layout: 'auth', middleware: 'guest' })
useHead({ title: 'Register - Signal Universe' })

const route = useRoute()
const toast = useToastCustom()
const { t } = useI18n()

const referralFromUrl = route.query.ref as string || ''

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

const schema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, t('auth.register.error.password_weak')),
  confirm_password: z.string(),
  referral_code: z.string().optional()
}).refine(d => d.password === d.confirm_password, {
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
