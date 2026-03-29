<template>
  <div>
    <!-- Hero Section -->
    <section class="relative overflow-hidden hero-bg grid-bg min-h-screen flex items-center">
      <!-- Decorative orbs -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
        style="background: radial-gradient(circle, #6366f1, transparent);" />
      <div class="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
        style="background: radial-gradient(circle, #8b5cf6, transparent);" />

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div class="text-center">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-8">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            {{ $t('home.hero.badge') }}
          </div>

          <!-- Title -->
          <h1 class="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span class="gradient-text">Signal Universe</span>
          </h1>
          <p class="text-xl md:text-2xl text-slate-300 font-medium mb-4">{{ $t('home.hero.subtitle') }}</p>
          <p class="text-slate-400 max-w-2xl mx-auto mb-10 text-lg leading-relaxed">
            {{ $t('home.hero.description') }}
          </p>

          <!-- CTAs -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <NuxtLink to="/auth/register">
              <UButton
                size="xl"
                color="primary"
                class="px-8 py-4 font-semibold shadow-xl shadow-primary-500/25"
                trailing-icon="i-heroicons-arrow-right"
              >
                {{ $t('home.hero.cta_primary') }}
              </UButton>
            </NuxtLink>
            <UButton size="xl" color="neutral" variant="ghost" class="px-8 py-4 text-slate-300"
              @click="scrollTo('#how-it-works')">
              {{ $t('home.hero.cta_secondary') }}
            </UButton>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
            <div v-for="stat in stats" :key="stat.label" class="text-center">
              <div class="text-3xl font-black gradient-text">{{ stat.value }}</div>
              <div class="text-slate-500 text-sm mt-1">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <UIcon name="i-heroicons-chevron-down" class="text-slate-600 text-2xl" />
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">{{ $t('home.features.title') }}</h2>
        <p class="text-slate-400 text-lg">{{ $t('home.features.subtitle') }}</p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="feature in features" :key="feature.key"
          class="su-card su-card-hover p-6 group">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
            :style="`background: ${feature.bgColor};`">
            <UIcon :name="feature.icon" class="text-2xl" :class="feature.iconColor" />
          </div>
          <h3 class="text-white font-bold text-lg mb-2">{{ $t(`home.features.${feature.key}.title`) }}</h3>
          <p class="text-slate-400 text-sm leading-relaxed">{{ $t(`home.features.${feature.key}.description`) }}</p>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section id="how-it-works" class="py-24" style="background: #0d1224;">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">{{ $t('home.how_it_works.title') }}</h2>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="(step, idx) in steps" :key="idx" class="relative">
            <div class="su-card text-center p-8">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style="background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2)); border: 1px solid rgba(99,102,241,0.3);">
                <span class="text-2xl font-black text-indigo-400">{{ idx + 1 }}</span>
              </div>
              <h3 class="text-white font-bold mb-3">{{ $t(`home.how_it_works.step${idx + 1}.title`) }}</h3>
              <p class="text-slate-400 text-sm leading-relaxed">{{ $t(`home.how_it_works.step${idx + 1}.description`) }}</p>
            </div>
            <!-- Arrow connector -->
            <div v-if="idx < 3" class="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 text-slate-700 z-10">
              <UIcon name="i-heroicons-arrow-right" class="text-xl" />
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

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="pkg in packages" :key="pkg.amount"
          class="package-card p-8"
          :class="pkg.amount === 500 ? 'package-card-popular' : ''">
          <!-- Popular badge -->
          <div v-if="pkg.amount === 500" class="absolute -top-3 left-1/2 -translate-x-1/2">
            <span class="px-4 py-1 rounded-full text-xs font-bold text-white"
              style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
              {{ $t('home.packages.popular') }}
            </span>
          </div>

          <div class="flex items-center justify-between mb-6">
            <div>
              <p class="text-slate-400 text-sm">{{ $t('home.packages.defi_badge') }}</p>
              <h3 class="text-2xl font-black text-white">${{ pkg.amount.toLocaleString() }}</h3>
            </div>
            <div class="w-12 h-12 rounded-xl flex items-center justify-center"
              style="background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2));">
              <UIcon name="i-heroicons-arrow-trending-up" class="text-indigo-400 text-xl" />
            </div>
          </div>

          <div class="space-y-3 mb-6">
            <div class="flex justify-between items-center">
              <span class="text-slate-400 text-sm">{{ $t('home.packages.min_deposit') }}</span>
              <span class="text-white font-semibold">${{ pkg.amount }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-400 text-sm">{{ $t('home.packages.daily_profit') }}</span>
              <span class="text-green-400 font-bold">{{ $t('home.packages.max_profit') }}</span>
            </div>
            <div class="h-px bg-slate-800" />
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-check-circle" class="text-indigo-400 text-sm flex-shrink-0" />
              <span class="text-slate-300 text-sm">2 signals / day</span>
            </div>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-check-circle" class="text-indigo-400 text-sm flex-shrink-0" />
              <span class="text-slate-300 text-sm">Referral commissions</span>
            </div>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-check-circle" class="text-indigo-400 text-sm flex-shrink-0" />
              <span class="text-slate-300 text-sm">Leader bonus eligible</span>
            </div>
          </div>

          <NuxtLink to="/auth/register">
            <UButton
              block
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
    <section class="py-24" style="background: #0d1224;">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Referral Program</h2>
          <p class="text-slate-400">Earn commissions on multiple levels</p>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          <!-- Deposit Commission -->
          <div class="su-card p-8">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <UIcon name="i-heroicons-arrow-down-tray" class="text-green-400 text-lg" />
              </div>
              <h3 class="text-white font-bold text-lg">Deposit Commission</h3>
            </div>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
                <div class="flex items-center gap-3">
                  <span class="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center">F1</span>
                  <span class="text-slate-300">Direct referral</span>
                </div>
                <span class="text-green-400 font-bold text-xl">5%</span>
              </div>
              <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
                <div class="flex items-center gap-3">
                  <span class="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center">F2</span>
                  <span class="text-slate-300">2nd level</span>
                </div>
                <span class="text-green-400 font-bold text-xl">3%</span>
              </div>
            </div>
          </div>

          <!-- Profit Commission -->
          <div class="su-card p-8">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <UIcon name="i-heroicons-arrow-path" class="text-indigo-400 text-lg" />
              </div>
              <h3 class="text-white font-bold text-lg">Compound Interest</h3>
            </div>
            <div class="space-y-4">
              <div v-for="level in profitLevels" :key="level.label"
                class="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
                <div class="flex items-center gap-3">
                  <span class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    :class="level.badgeCls">{{ level.label }}</span>
                  <span class="text-slate-300">{{ level.desc }}</span>
                </div>
                <span class="font-bold text-xl" :class="level.color">{{ level.rate }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div class="su-card p-12 relative overflow-hidden">
        <div class="absolute inset-0 opacity-5"
          style="background: linear-gradient(135deg, #6366f1, #8b5cf6);" />
        <div class="relative z-10">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">{{ $t('home.cta.title') }}</h2>
          <p class="text-slate-400 mb-8 text-lg">{{ $t('home.cta.description') }}</p>
          <NuxtLink to="/auth/register">
            <UButton
              size="xl"
              color="primary"
              class="px-12 py-4 font-semibold shadow-xl shadow-primary-500/25"
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

const profitLevels = [
  { label: 'U1', desc: '1st upline (of confirmer)', rate: '15% of profit', color: 'text-indigo-400', badgeCls: 'bg-indigo-500/20 text-indigo-400' },
  { label: 'U2', desc: '2nd upline', rate: '10% of profit', color: 'text-purple-400', badgeCls: 'bg-purple-500/20 text-purple-400' },
  { label: 'U3', desc: '3rd upline', rate: '5% of profit', color: 'text-pink-400', badgeCls: 'bg-pink-500/20 text-pink-400' }
]

const scrollTo = (selector: string) => {
  document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' })
}
</script>
