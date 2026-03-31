<template>
  <div class="platform-page pb-24">
    <!-- Hero -->
    <section class="relative overflow-hidden pt-28 pb-20 md:pt-32 md:pb-28">
      <div class="pointer-events-none absolute inset-0 web3-hero-mesh" />
      <div class="pointer-events-none absolute inset-0 web3-hero-grid opacity-60" />
      <div
        class="su-ambient-orb pointer-events-none absolute left-1/4 top-0 h-96 w-96 -translate-y-1/2 rounded-full opacity-30 blur-[100px]"
        style="background: radial-gradient(circle, rgba(99, 102, 241, 0.6), transparent 70%)"
      />
      <div class="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
        <p
          class="web3-reveal mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-300"
        >
          Introduction
        </p>
        <h1 class="web3-reveal web3-reveal-delay-1 mb-6 text-4xl font-black leading-tight text-white md:text-6xl">
          <span class="web3-title-shine">Infrastructure for the next era of onchain markets</span>
        </h1>
        <p
          class="web3-reveal web3-reveal-delay-2 mx-auto max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl"
        >
          Onchain trading has moved beyond experimentation. Structure, coordination, and execution quality now
          separate long-term winners from the rest.
        </p>
        <div class="web3-reveal web3-reveal-delay-3 mt-10 flex flex-wrap items-center justify-center gap-4">
          <NuxtLink to="/auth/register">
            <UButton size="xl" color="primary" class="web3-cta-glow px-8 font-semibold" trailing-icon="i-heroicons-arrow-right">
              Get started
            </UButton>
          </NuxtLink>
          <NuxtLink to="/">
            <UButton size="xl" color="neutral" variant="outline" class="border-slate-600 px-8 font-medium text-slate-200">
              Back to home
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Thesis -->
    <section class="mx-auto max-w-3xl px-4 sm:px-6">
      <article class="web3-glass-panel space-y-8 p-8 md:p-10">
        <p class="text-lg leading-relaxed text-slate-300">
          As capital migrates onchain—across spot, perpetuals, and emerging real-world asset (RWA) markets—the
          limits of first-generation DeFi are obvious. Most systems were built to
          <em class="text-indigo-300 not-italic">host</em> liquidity, not to
          <em class="text-cyan-300 not-italic">route</em> it intelligently. Traders still face fragmented venues,
          uneven execution, externalized MEV, and risk tooling that is not yet institutional-grade.
        </p>
        <p class="text-lg leading-relaxed text-slate-300">
          Centralized venues have a mirror image of constraints: custodial risk, opaque flow, regulatory friction,
          and uneven global access. Sophisticated participants are pushed toward non-custodial rails—without giving
          up the performance they expect.
        </p>
        <p class="text-xl font-semibold leading-relaxed text-white">
          The next chapter is not “pick DeFi or CeFi.” It is infrastructure that can coordinate both—routing
          liquidity, managing execution paths, and operating transparently at scale.
        </p>
      </article>
    </section>

    <!-- What changes -->
    <section class="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
      <h2 class="mb-4 text-center text-3xl font-bold text-white md:text-4xl">What this architectural shift enables</h2>
      <p class="mx-auto mb-12 max-w-2xl text-center text-slate-400">
        Inspired by the same thesis as leading onchain trading infrastructure—see
        <a
          href="https://universe-pro-gitbook.gitbook.io/universe-pro-gitbook-docs"
          target="_blank"
          rel="noopener noreferrer"
          class="text-indigo-400 underline decoration-indigo-500/40 underline-offset-4 transition-colors hover:text-cyan-300"
        >Universe Pro documentation</a>
        —Signal Universe aligns product design with these principles for members and operators.
      </p>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 *:min-w-0">
        <div
          v-for="(item, i) in pillars"
          :key="item.title"
          class="web3-glass-panel web3-reveal p-6 md:p-8"
          :class="pillarDelays[i] ? pillarDelays[i] : 'web3-reveal-delay-4'"
        >
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-500/25">
            <UIcon :name="item.icon" class="text-2xl text-indigo-400" />
          </div>
          <h3 class="mb-2 text-lg font-bold text-white">{{ item.title }}</h3>
          <p class="text-sm leading-relaxed text-slate-400">{{ item.body }}</p>
        </div>
      </div>
    </section>

    <!-- Signal Universe bridge -->
    <section class="mx-auto mt-20 max-w-3xl px-4 sm:px-6">
      <div
        class="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-linear-to-br from-slate-900/90 via-slate-900/80 to-indigo-950/50 p-8 md:p-12"
      >
        <div
          class="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"
        />
        <h2 class="relative mb-4 text-2xl font-bold text-white md:text-3xl">How Signal Universe fits in</h2>
        <p class="relative mb-6 text-slate-300 leading-relaxed">
          We combine disciplined distribution—<strong class="text-white">one daily AI confirmation window</strong>,
          transparent tiers, and referral economics—with the expectation that members deserve the same clarity
          demanded of modern onchain systems.
        </p>
        <ul class="relative space-y-3 text-slate-400">
          <li class="flex gap-3">
            <UIcon name="i-heroicons-check-circle" class="mt-0.5 shrink-0 text-indigo-400" />
            <span>Single daily signal window (11:00–23:59) — simple, predictable participation.</span>
          </li>
          <li class="flex gap-3">
            <UIcon name="i-heroicons-check-circle" class="mt-0.5 shrink-0 text-indigo-400" />
            <span>DeFi tiers from total balance; rewards and confirms tracked with admin oversight.</span>
          </li>
          <li class="flex gap-3">
            <UIcon name="i-heroicons-check-circle" class="mt-0.5 shrink-0 text-indigo-400" />
            <span>Referral structure for deposits and credited profit — aligned with multi-level coordination.</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- Closing -->
    <section class="mx-auto mt-20 max-w-2xl px-4 text-center sm:px-6">
      <p class="text-lg italic leading-relaxed text-slate-500">
        “As markets mature, infrastructure—not interfaces alone—defines outcomes. Signal Universe is built for
        what comes next.”
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

useHead({
  title: 'Platform — Signal Universe',
  meta: [
    {
      name: 'description',
      content:
        'Introduction to onchain trading infrastructure thinking and how Signal Universe applies it to daily AI signals and member rewards.'
    }
  ]
})

const pillarDelays = [
  'web3-reveal-delay-1',
  'web3-reveal-delay-2',
  'web3-reveal-delay-3',
  'web3-reveal-delay-4'
]

const pillars = [
  {
    icon: 'i-heroicons-arrow-path-rounded-square',
    title: 'Capital-efficient execution',
    body: 'Smarter routing across fragmented liquidity instead of single-pool thinking.'
  },
  {
    icon: 'i-heroicons-cpu-chip',
    title: 'Rules-based deployment',
    body: 'Deterministic logic for when and how strategies and participation layers activate.'
  },
  {
    icon: 'i-heroicons-shield-check',
    title: 'Controlled flow & transparency',
    body: 'Reduced naive exposure to externalized MEV and clearer paths for members and operators.'
  },
  {
    icon: 'i-heroicons-globe-alt',
    title: 'Ready for the next asset classes',
    body: 'A foundation that scales toward RWAs, structured products, and institutional-grade participation.'
  }
]
</script>
