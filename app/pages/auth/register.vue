<template>
  <UCard
    class="auth-form-card relative z-10"
    :ui="authCardUi"
  >
    <template #header>
      <div class="space-y-2 text-center">
        <h1 class="text-3xl font-extrabold text-white tracking-tight">{{ $t('auth.register.title') }}</h1>
        <p class="text-base text-slate-400 max-w-sm mx-auto">{{ $t('auth.register.subtitle') }}</p>
      </div>
    </template>

    <UForm :schema="schema" :state="state" :validate-on="[]" @submit="handleRegister" class="flex flex-col gap-6">
      <UFormField :label="$t('auth.register.full_name')" name="full_name" size="lg">
        <UInput
          v-model="state.full_name"
          leading-icon="i-heroicons-user"
          autocomplete="name"
          size="lg"
          variant="outline"
          color="neutral"
          class="auth-input"
          :ui="authInputUiLeading"
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
          :ui="authInputUiLeading"
        />
      </UFormField>

      <UFormField :label="$t('auth.register.password')" name="password" size="lg">
        <UInput
          v-model="state.password"
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

      <UFormField :label="$t('auth.register.confirm_password')" name="confirm_password" size="lg">
        <UInput
          v-model="state.confirm_password"
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

      <UFormField :label="$t('auth.register.referral_code')" name="referral_code" size="lg">
        <UInput
          v-model="state.referral_code"
          leading-icon="i-heroicons-gift"
          size="lg"
          variant="outline"
          color="neutral"
          class="auth-input"
          :ui="authInputUiLeading"
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

      <UButton
        type="submit"
        block
        size="lg"
        variant="solid"
        :loading="loading"
        class="web3-cta-glow mt-2 min-h-12 text-base font-bold tracking-wide relative overflow-hidden group border-0 rounded-xl"
      >
        <div class="absolute inset-0 bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-size-[200%_auto] animate-[su-gradient-flow_3s_linear_infinite] group-hover:bg-size-[150%_auto] transition-all duration-300" />
        <span class="relative z-10 text-white shadow-sm">{{ $t('auth.register.submit') }}</span>
      </UButton>

      <p class="text-center text-xs leading-relaxed text-slate-500">{{ $t('auth.register.terms') }}</p>
    </UForm>

    <template #footer>
      <p class="text-center text-sm text-slate-400">
        {{ $t('auth.register.have_account') }}
        <NuxtLink
          to="/auth/login"
          prefetch
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
import { authCardUi, authInputUiLeading, authInputUiPassword } from '~/utils/auth-form-ui'

definePageMeta({ layout: 'auth', middleware: 'guest', pageTransition: false })
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
