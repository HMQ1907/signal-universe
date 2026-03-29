<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-white">{{ $t('investment.title') }}</h1>
      <p class="text-slate-400 text-sm mt-1">{{ $t('investment.subtitle') }}</p>
    </div>

    <!-- Current Package -->
    <div v-if="user?.investment_package" class="su-card mb-8 border border-indigo-500/30">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-slate-400 text-sm">{{ $t('investment.current_package') }}</p>
          <p class="text-3xl font-black text-indigo-400">${{ user.investment_package }}</p>
          <p class="text-green-400 text-sm mt-1">✓ DeFi Active</p>
        </div>
        <div class="text-right">
          <p class="text-slate-400 text-sm">Locked Capital</p>
          <p class="text-2xl font-bold text-white">${{ (user.locked_capital || 0).toFixed(2) }}</p>
        </div>
      </div>
    </div>

    <!-- Package Grid -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div v-for="pkg in packages" :key="pkg.amount" class="package-card p-8 relative"
        :class="pkg.amount === 500 ? 'package-card-popular' : ''">
        <div v-if="pkg.amount === 500" class="absolute -top-3 left-1/2 -translate-x-1/2">
          <span class="px-4 py-1 rounded-full text-xs font-bold text-white"
            style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">Popular</span>
        </div>

        <div class="flex items-center justify-between mb-6">
          <div>
            <p class="text-slate-400 text-xs">{{ $t('investment.packages.' + pkg.amount + '.name') }}</p>
            <p class="text-3xl font-black text-white">${{ pkg.amount.toLocaleString() }}</p>
          </div>
          <div v-if="user?.investment_package === pkg.amount"
            class="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <UIcon name="i-heroicons-check" class="text-green-400" />
          </div>
        </div>

        <div class="space-y-2 mb-6 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-400">Min. Deposit</span>
            <span class="text-white font-semibold">${{ pkg.amount }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Daily Profit</span>
            <span class="text-green-400 font-bold">Up to 2%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Signals/day</span>
            <span class="text-white">2</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Lock Period</span>
            <span class="text-amber-400">28 days</span>
          </div>
        </div>

        <NuxtLink :to="`/wallet/deposit?pkg=${pkg.amount}`">
          <UButton
            block
            :disabled="user?.investment_package === pkg.amount"
            :color="
              user?.investment_package === pkg.amount
                ? 'success'
                : pkg.amount === 500
                  ? 'primary'
                  : 'neutral'
            "
            :variant="
              user?.investment_package === pkg.amount ? 'soft' : pkg.amount === 500 ? 'solid' : 'outline'
            "
            :class="user?.investment_package === pkg.amount ? 'cursor-default opacity-90' : ''"
          >
            {{ user?.investment_package === pkg.amount ? 'Active Package' : $t('investment.select_package') }}
          </UButton>
        </NuxtLink>
      </div>
    </div>

    <!-- Rules -->
    <div class="su-card">
      <h2 class="text-white font-bold mb-6 flex items-center gap-2">
        <UIcon name="i-heroicons-information-circle" class="text-indigo-400" />
        {{ $t('investment.rules.title') }}
      </h2>
      <div class="space-y-3">
        <div v-for="i in 6" :key="i" class="flex items-start gap-3">
          <UIcon name="i-heroicons-check-circle" class="text-indigo-400 flex-shrink-0 mt-0.5" />
          <p class="text-slate-300 text-sm">{{ $t(`investment.rules.rule${i}`) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Investment Packages - Signal Universe' })

const { user, refreshUser } = useAuth()
await refreshUser()

const packages = [
  { amount: 200 }, { amount: 300 }, { amount: 500 },
  { amount: 1000 }, { amount: 2000 }, { amount: 5000 }
]
</script>
