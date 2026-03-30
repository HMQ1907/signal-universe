<template>
  <div>
    <!-- Hero Section -->
    <section class="relative flex w-full min-h-screen flex-col items-center justify-center overflow-hidden">
      <div class="pointer-events-none absolute inset-0 web3-hero-mesh" />
      <div class="pointer-events-none absolute inset-0 web3-hero-grid" />
      <div
        class="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full blur-3xl"
        style="background: radial-gradient(circle, rgba(99, 102, 241, 0.25), transparent 65%)"
      />
      <div
        class="su-ambient-orb pointer-events-none absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full blur-3xl opacity-40"
        style="background: radial-gradient(circle, rgba(139, 92, 246, 0.35), transparent 65%)"
      />
      <div
        class="pointer-events-none absolute left-1/2 top-[6%] h-[min(48vw,26rem)] w-[min(92vw,52rem)] -translate-x-1/2 rounded-full opacity-25 blur-[110px] mix-blend-screen"
        style="background: radial-gradient(ellipse at center, rgba(99, 102, 241, 0.35), rgba(6, 182, 212, 0.12), transparent 68%)"
      />

      <div class="relative z-10 w-full max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div class="w-full text-center">
          <div
            class="web3-badge-pulse mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/35 bg-indigo-500/10 px-5 py-2 text-sm font-semibold text-indigo-200"
          >
            <span class="h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
            {{ $t('home.hero.badge') }}
          </div>

          <h1 class="mb-6 w-full break-words text-5xl font-black leading-[1.05] md:text-7xl md:leading-tight">
            <span class="gradient-text">Signal Universe</span>
          </h1>
          <p class="mb-4 text-xl font-medium text-slate-200 md:text-2xl">{{ $t('home.hero.subtitle') }}</p>
          <p class="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-400">
            {{ $t('home.hero.description') }}
          </p>

          <div class="flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
            <NuxtLink to="/auth/register">
              <UButton
                size="xl"
                color="primary"
                class="web3-cta-glow px-8 py-4 font-semibold shadow-xl shadow-primary-500/30"
                trailing-icon="i-heroicons-arrow-right"
              >
                {{ $t('home.hero.cta_primary') }}
              </UButton>
            </NuxtLink>
            <NuxtLink to="/platform">
              <UButton
                size="xl"
                color="neutral"
                variant="outline"
                class="border-slate-600/80 px-8 py-4 font-medium text-slate-200 hover:border-indigo-500/50 hover:bg-slate-800/50"
              >
                {{ $t('nav.platform') }}
              </UButton>
            </NuxtLink>
            <UButton
              size="xl"
              color="neutral"
              variant="ghost"
              class="px-8 py-4 text-slate-400 hover:text-white"
              @click="scrollTo('#how-it-works')"
            >
              {{ $t('home.hero.cta_secondary') }}
            </UButton>
          </div>

          <div class="mx-auto mt-16 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div
              v-for="stat in stats"
              :key="stat.label"
              class="su-card su-card-hover home-stat-tile min-w-0 w-full text-center"
            >
              <div class="text-2xl font-black text-white md:text-3xl">
                <span class="gradient-text">{{ stat.value }}</span>
              </div>
              <div class="mt-1 text-xs text-slate-500 md:text-sm">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-slate-500">
        <UIcon name="i-heroicons-chevron-down" class="text-2xl" />
      </div>
    </section>

    <!-- Features Section -->
    <section class="min-w-0 overflow-x-hidden py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">{{ $t('home.features.title') }}</h2>
        <p class="text-slate-400 text-lg">{{ $t('home.features.subtitle') }}</p>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <div v-for="feature in features" :key="feature.key" class="min-w-0">
          <div class="su-card su-card-hover group flex h-full min-h-0 w-full min-w-0 flex-col !p-6">
            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
              :style="`background: ${feature.bgColor};`">
              <UIcon :name="feature.icon" class="text-2xl" :class="feature.iconColor" />
            </div>
            <h3 class="mb-2 text-lg font-bold text-white">{{ $t(`home.features.${feature.key}.title`) }}</h3>
            <p class="flex-1 text-sm leading-relaxed text-slate-400">{{ $t(`home.features.${feature.key}.description`) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section id="how-it-works" class="border-y border-white/[0.04] bg-black/25 py-24 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">{{ $t('home.how_it_works.title') }}</h2>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div v-for="(step, idx) in steps" :key="idx" class="min-w-0">
            <div class="su-card su-card-hover flex h-full min-h-0 w-full min-w-0 flex-col p-6 text-center sm:p-8">
              <div class="mx-auto mb-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl sm:mb-6"
                style="background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2)); border: 1px solid rgba(99,102,241,0.3);">
                <span class="text-2xl font-black text-indigo-400">{{ idx + 1 }}</span>
              </div>
              <h3 class="mb-2 text-base font-bold text-white sm:mb-3 sm:text-lg">{{ $t(`home.how_it_works.step${idx + 1}.title`) }}</h3>
              <p class="flex-1 text-sm leading-relaxed text-slate-400">{{ $t(`home.how_it_works.step${idx + 1}.description`) }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Investment Packages -->
    <section class="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">{{ $t('home.packages.title') }}</h2>
        <p class="text-slate-400">{{ $t('home.packages.subtitle') }}</p>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="pkg in packages" :key="pkg.amount"
          class="package-card flex min-w-0 flex-col p-8"
          :class="pkg.amount === 500 ? 'package-card-popular pt-11' : ''">
          <!-- Popular badge -->
          <div v-if="pkg.amount === 500" class="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
            <span class="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20"
              style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
              {{ $t('home.packages.popular') }}
            </span>
          </div>

          <div class="mb-6 flex items-start justify-between gap-4">
            <div class="min-w-0 text-left">
              <p class="text-sm text-slate-400">{{ $t('home.packages.defi_badge') }}</p>
              <h3 class="text-2xl font-black text-white">${{ pkg.amount.toLocaleString() }}</h3>
            </div>
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style="background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2));">
              <UIcon name="i-heroicons-arrow-trending-up" class="text-xl text-indigo-400" />
            </div>
          </div>

          <div class="mb-6 flex flex-1 flex-col gap-3">
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm text-slate-400">{{ $t('home.packages.min_deposit') }}</span>
              <span class="font-semibold text-white">${{ pkg.amount }}</span>
            </div>
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm text-slate-400">{{ $t('home.packages.daily_profit') }}</span>
              <span class="font-bold text-green-400">{{ $t('home.packages.max_profit') }}</span>
            </div>
            <div class="h-px bg-slate-800" />
            <div class="flex items-start gap-3">
              <UIcon name="i-heroicons-check-circle" class="mt-0.5 size-5 shrink-0 text-indigo-400" />
              <span class="text-left text-sm leading-snug text-slate-300">{{ $t('home.packages.feature_signals') }}</span>
            </div>
            <div class="flex items-start gap-3">
              <UIcon name="i-heroicons-check-circle" class="mt-0.5 size-5 shrink-0 text-indigo-400" />
              <span class="text-left text-sm leading-snug text-slate-300">{{ $t('home.packages.feature_referral') }}</span>
            </div>
          </div>

          <NuxtLink to="/auth/register" class="mt-auto">
            <UButton
              block
              class="min-h-11"
              :color="pkg.amount === 500 ? 'primary' : 'neutral'"
              :variant="pkg.amount === 500 ? 'solid' : 'outline'"
            >
              {{ $t('home.packages.join') }}
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Referral Structure -->
    <section class="border-y border-white/[0.04] bg-black/25 py-24 backdrop-blur-sm">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center md:mb-16">
          <h2 class="mb-3 text-3xl font-bold text-white md:text-4xl">{{ $t('home.referral_section.title') }}</h2>
          <p class="text-slate-400">{{ $t('home.referral_section.subtitle') }}</p>
        </div>

        <div class="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 md:gap-8">
          <!-- Deposit commission -->
          <div class="su-card su-card-hover flex min-h-0 min-w-0 flex-col p-6 sm:p-8">
            <div class="mb-6 flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                <UIcon name="i-heroicons-arrow-down-tray" class="text-lg text-green-400" />
              </div>
              <h3 class="text-lg font-bold text-white">{{ $t('home.referral_section.deposit_title') }}</h3>
            </div>
            <div class="flex flex-1 flex-col justify-center gap-4">
              <div class="flex items-center justify-between gap-3 rounded-xl bg-slate-800/50 p-3">
                <div class="flex min-w-0 items-center gap-3">
                  <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-xs font-bold text-indigo-400">{{ $t('home.referral_section.f1_label') }}</span>
                  <span class="text-left text-sm text-slate-300">{{ $t('home.referral_section.direct_referral') }}</span>
                </div>
                <span class="shrink-0 text-xl font-bold text-green-400">{{ $t('home.referral_section.rate_deposit_f1') }}</span>
              </div>
              <div class="flex items-center justify-between gap-3 rounded-xl bg-slate-800/50 p-3">
                <div class="flex min-w-0 items-center gap-3">
                  <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-xs font-bold text-purple-400">{{ $t('home.referral_section.f2_label') }}</span>
                  <span class="text-left text-sm text-slate-300">{{ $t('home.referral_section.second_level') }}</span>
                </div>
                <span class="shrink-0 text-xl font-bold text-green-400">{{ $t('home.referral_section.rate_deposit_f2') }}</span>
              </div>
            </div>
          </div>

          <!-- Profit sharing (uplines) -->
          <div class="su-card su-card-hover flex min-h-0 min-w-0 flex-col p-6 sm:p-8">
            <div class="mb-6 flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                <UIcon name="i-heroicons-arrow-path" class="text-lg text-indigo-400" />
              </div>
              <h3 class="text-lg font-bold text-white">{{ $t('home.referral_section.profit_title') }}</h3>
            </div>
            <div class="flex flex-1 flex-col gap-4">
              <div v-for="level in profitLevels" :key="level.key"
                class="flex items-center justify-between gap-3 rounded-xl bg-slate-800/50 p-3">
                <div class="flex min-w-0 items-center gap-3">
                  <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                    :class="level.badgeCls">{{ level.label }}</span>
                  <span class="text-left text-sm text-slate-300">{{ level.desc }}</span>
                </div>
                <span class="max-w-[44%] shrink-0 text-right text-base font-bold sm:text-xl" :class="level.color">{{ level.rate }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div class="su-card su-card-hover relative overflow-hidden p-10 md:p-12">
        <div class="absolute inset-0 opacity-[0.07]"
          style="background: linear-gradient(135deg, #6366f1, #8b5cf6, #22d3ee);" />
        <div class="relative z-10">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">{{ $t('home.cta.title') }}</h2>
          <p class="text-slate-400 mb-8 text-lg">{{ $t('home.cta.description') }}</p>
          <NuxtLink to="/auth/register" class="web3-interactive inline-flex">
            <UButton
              size="xl"
              color="primary"
              class="web3-cta-glow px-12 py-4 font-semibold shadow-xl shadow-primary-500/25"
              trailing-icon="i-heroicons-arrow-right"
            >
              {{ $t('home.cta.button') }}
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

useHead({ title: 'Signal Universe - Smart Trading Signal Platform' })

const stats = computed(() => [
  { value: '10,000+', label: t('home.hero.stats.users') },
  { value: '1', label: t('home.hero.stats.daily_signals') },
  { value: '2%', label: t('home.hero.stats.max_profit') },
  { value: '5', label: t('home.hero.stats.languages') }
])

const features = [
  { key: 'signal', icon: 'i-heroicons-signal', bgColor: 'rgba(99,102,241,0.1)', iconColor: 'text-indigo-400' },
  { key: 'referral', icon: 'i-heroicons-users', bgColor: 'rgba(139,92,246,0.1)', iconColor: 'text-purple-400' },
  { key: 'ai_commission', icon: 'i-heroicons-sparkles', bgColor: 'rgba(245,158,11,0.1)', iconColor: 'text-amber-400' },
  { key: 'secure', icon: 'i-heroicons-shield-check', bgColor: 'rgba(16,185,129,0.1)', iconColor: 'text-green-400' }
]

const steps = [1, 2, 3, 4]

const packages = [
  { amount: 200 }, { amount: 300 }, { amount: 500 },
  { amount: 1000 }, { amount: 2000 }, { amount: 5000 }
]

const profitLevels = computed(() => [
    {
      key: 'u1',
      label: t('home.referral_section.u1_label'),
      desc: t('home.referral_section.u1_desc'),
      rate: t('home.referral_section.rate_profit_u1'),
      color: 'text-indigo-400',
      badgeCls: 'bg-indigo-500/20 text-indigo-400'
    },
    {
      key: 'u2',
      label: t('home.referral_section.u2_label'),
      desc: t('home.referral_section.u2_desc'),
      rate: t('home.referral_section.rate_profit_u2'),
      color: 'text-purple-400',
      badgeCls: 'bg-purple-500/20 text-purple-400'
    },
    {
      key: 'u3',
      label: t('home.referral_section.u3_label'),
      desc: t('home.referral_section.u3_desc'),
      rate: t('home.referral_section.rate_profit_u3'),
      color: 'text-pink-400',
      badgeCls: 'bg-pink-500/20 text-pink-400'
    }
])

const scrollTo = (selector: string) => {
  document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' })
}
</script>
