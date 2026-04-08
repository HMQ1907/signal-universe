<template>
  <div class="overflow-x-hidden">
    <!-- Hero -->
    <section
      id="top"
      class="relative flex min-h-[100svh] w-full flex-col items-center justify-center px-4 pb-24 pt-28 sm:px-6 lg:px-8"
    >
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.35]"
        style="background:radial-gradient(ellipse 80% 50% at 50% -20%,rgba(34,211,238,0.2),transparent),radial-gradient(ellipse 60% 40% at 100% 50%,rgba(139,92,246,0.15),transparent)"
      />

      <UpReveal class="relative z-10 w-full max-w-none">
        <!-- Star-field particle canvas — SSR-safe: animation runs only inside onMounted -->
        <StarField
          class="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-60"
        />

        <div class="relative z-10 mx-auto max-w-5xl text-center">
          <div
            class="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-200/90 sm:text-sm"
          >
            <span
              class="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)]"
            />
            {{ $t("up.hero.badge") }}
          </div>
        </div>

        <!-- Hero: full-bleed row — ảnh trái | video | ảnh phải, sát mép viewport, không max-width / không gap -->
        <div
          class="relative z-[1] mb-10 mt-2 w-[100vw] max-w-[100vw] shrink-0"
          style="margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw)"
          aria-hidden="true"
        >
          <div
            class="grid w-full grid-cols-1 items-stretch gap-0 lg:min-h-[min(56vh,800px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)_minmax(0,1fr)] xl:min-h-[min(60vh,880px)]"
          >
            <div
              class="pointer-events-none relative hidden min-h-[min(48vh,520px)] min-w-0 select-none lg:block"
            >
              <img
                :src="heroBannerLeftSrc"
                alt=""
                class="absolute inset-0 h-full w-full object-cover object-right"
                loading="lazy"
                decoding="async"
                draggable="false"
              />
            </div>

            <div
              class="relative min-h-[min(56vh,800px)] w-full min-w-0 overflow-hidden bg-[#05050a] sm:min-h-[min(60vh,880px)] lg:min-h-0"
            >
              <video
                ref="heroVideoRef"
                class="pointer-events-none absolute inset-0 h-full w-full object-cover object-center select-none"
                :src="heroBannerVideoSrc"
                autoplay
                muted
                loop
                playsinline
                preload="metadata"
              />
            </div>

            <div
              class="pointer-events-none relative hidden min-h-[min(48vh,520px)] min-w-0 select-none lg:block"
            >
              <img
                :src="heroBannerRightSrc"
                alt=""
                class="absolute inset-0 h-full w-full object-cover object-left"
                loading="lazy"
                decoding="async"
                draggable="false"
              />
            </div>
          </div>
        </div>

        <div class="mx-auto max-w-5xl text-center">
          <h1
            class="mx-auto mb-5 max-w-4xl text-4xl font-black leading-[1.08] tracking-tight text-white md:text-6xl md:leading-[1.05]"
          >
            {{ $t("up.hero.title") }}
          </h1>
          <p class="mx-auto mb-10 max-w-2xl text-lg text-slate-400 md:text-xl">
            {{ $t("up.hero.subtitle") }}
          </p>

          <NuxtLink
            v-if="user && !user.is_admin"
            to="/signals"
            class="up-cta-pill mx-auto inline-flex items-center gap-3 rounded-full px-8 py-3.5 text-base font-bold text-slate-900 shadow-xl shadow-cyan-500/25"
          >
            <span>{{ $t("up.hero.cta_ai") }}</span>
            <span
              class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/15 ring-1 ring-slate-900/10"
            >
              <UIcon
                name="i-heroicons-arrow-up-right"
                class="size-5 text-slate-900"
              />
            </span>
          </NuxtLink>
        </div>
      </UpReveal>

      <div
        class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-slate-600"
      >
        <UIcon name="i-heroicons-chevron-down" class="size-6" />
      </div>
    </section>

    <!-- 3 features (Universe-style) -->
    <section
      id="intro"
      class="border-y border-white/[0.06] bg-black/20 py-20 backdrop-blur-sm"
    >
      <div
        class="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-3 lg:gap-8 lg:px-8"
      >
        <UpReveal
          v-for="(card, i) in introCards"
          :key="i"
          class="up-card-3d group rounded-2xl border border-white/[0.08] bg-[#0c0c14] p-8 transition-all duration-500 hover:border-cyan-500/25 hover:shadow-[0_0_40px_rgba(34,211,238,0.08)]"
        >
          <div class="mb-6 overflow-hidden rounded-xl">
            <img
              :src="card.image"
              alt=""
              class="h-44 w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <h3 class="mb-3 text-xl font-bold text-white">
            {{ $t(card.title) }}
          </h3>
          <p class="text-sm leading-relaxed text-slate-400">
            {{ $t(card.desc) }}
          </p>
        </UpReveal>
      </div>
    </section>

    <!-- Big statement -->
    <section class="py-24 md:py-32">
      <div class="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <UpReveal>
          <h2
            class="text-3xl font-black leading-tight text-white md:text-5xl md:leading-tight"
          >
            {{ $t("up.statement.title") }}
          </h2>
          <p
            class="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-slate-400"
          >
            {{ $t("up.statement.body") }}
          </p>
        </UpReveal>
      </div>
    </section>

    <!-- Bento -->
    <section
      id="features"
      class="border-y border-white/[0.06] bg-black/25 py-20"
    >
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          class="grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4"
        >
          <UpReveal
            v-for="(cell, idx) in bentoCells"
            :key="idx"
            class="up-bento-cell group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c14] transition-all duration-500 hover:border-violet-500/40 hover:shadow-[0_0_60px_rgba(139,92,246,0.15)]"
            :class="cell.span"
          >
            <!-- Image fills full card -->
            <div class="relative w-full" :class="cell.imgH">
              <img
                v-if="cell.image"
                :src="cell.image"
                alt=""
                class="absolute inset-0 h-full w-full object-cover opacity-75 transition-transform duration-700 group-hover:scale-[1.06]"
              />
              <!-- Fallback gradient background when no image -->
              <div
                v-else
                class="absolute inset-0 opacity-30"
                :style="{ background: cell.glow }"
              />
              <!-- Color glow overlay -->
              <div
                class="pointer-events-none absolute inset-0 opacity-20 transition-opacity duration-500 group-hover:opacity-35"
                :style="{ background: cell.glow }"
              />
              <!-- Bottom gradient for text legibility -->
              <div class="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-[#0c0c14]/40 to-transparent" />
            </div>

            <!-- Text below image -->
            <div class="px-5 pb-5 pt-4">
              <p class="font-bold text-white">
                {{ $t(cell.title) }}
              </p>
              <p class="mt-1 text-xs leading-relaxed text-slate-500">
                {{ $t(cell.sub) }}
              </p>
            </div>
          </UpReveal>
        </div>
      </div>
    </section>

    <!-- Ecosystem -->
    <section id="ecosystem" class="py-24 md:py-28">
      <div
        class="mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 sm:px-6 lg:flex-row lg:px-8"
      >
        <UpReveal class="flex flex-1 justify-center lg:justify-start">
          <img
            src="/images/home13.png"
            alt=""
            class="w-full max-w-sm animate-[up-float_6s_ease-in-out_infinite] rounded-2xl object-cover opacity-95 drop-shadow-[0_0_40px_rgba(99,102,241,0.35)] sm:max-w-md"
          />
        </UpReveal>
        <UpReveal class="max-w-xl flex-1 text-center lg:text-left">
          <h2 class="text-3xl font-black text-white md:text-4xl">
            {{ $t("up.eco.title") }}
          </h2>
          <p class="mt-6 leading-relaxed text-slate-400">
            {{ $t("up.eco.body") }}
          </p>
        </UpReveal>
      </div>
    </section>

    <!-- Mission -->
    <section
      id="mission"
      class="border-y border-white/[0.06] bg-black/20 py-24"
    >
      <div
        class="mx-auto flex max-w-7xl flex-col-reverse items-center gap-12 px-4 sm:px-6 lg:flex-row lg:px-8"
      >
        <UpReveal class="max-w-xl flex-1 text-center lg:text-left">
          <h2 class="text-3xl font-black text-white md:text-4xl">
            {{ $t("up.mission.title") }}
          </h2>
          <p class="mt-6 leading-relaxed text-slate-400">
            {{ $t("up.mission.body") }}
          </p>
        </UpReveal>
        <UpReveal class="flex flex-1 justify-center">
          <div class="relative">
            <div
              class="absolute inset-0 animate-pulse rounded-full bg-gradient-to-tr from-cyan-500/20 to-violet-500/20 blur-3xl"
            />
            <img
              src="/images/home7.png"
              alt=""
              class="relative z-1 w-full max-w-md rounded-2xl object-cover ring-1 ring-white/10"
            />
          </div>
        </UpReveal>
      </div>
    </section>

    <!-- Advantages -->
    <section id="advantages" class="py-24 md:py-32 lg:py-36">
      <div class="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <UpReveal class="mb-16 text-center md:mb-20">
          <h2 class="text-2xl font-bold leading-snug text-white md:text-3xl md:leading-snug mb-5">
            {{ $t("up.adv.title") }}
          </h2>
        </UpReveal>
        <div class="grid gap-6 md:grid-cols-3 md:gap-8 lg:gap-10">
          <UpReveal
            v-for="(a, i) in advKeys"
            :key="i"
            class="rounded-2xl border border-white/[0.08] bg-[#0c0c14] p-9 text-center transition-all hover:border-cyan-500/20 md:p-10 lg:p-12"
          >
            <h3 class="text-lg font-bold text-cyan-200 md:text-xl">
              {{ $t(`up.adv.${a}t`) }}
            </h3>
            <p class="mt-4 text-sm leading-relaxed text-slate-400 md:mt-5 md:text-base">
              {{ $t(`up.adv.${a}d`) }}
            </p>
          </UpReveal>
        </div>
      </div>
    </section>

    <!-- Roadmap -->
    <section
      id="roadmap"
      class="border-y border-white/[0.06] bg-black/25 py-24 md:py-28"
    >
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <UpReveal class="mb-10 text-center md:mb-14">
          <h2 class="text-3xl font-black text-white md:text-4xl">
            {{ $t("up.roadmap.title") }}
          </h2>
          <p class="mt-3 text-slate-400">{{ $t("up.roadmap.subtitle") }}</p>
        </UpReveal>

        <div class="relative">
          <div
            class="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-cyan-500/0 via-cyan-400/60 to-violet-500/0 lg:left-1/2 lg:-translate-x-px"
          />

          <div class="space-y-10 md:space-y-12">
            <UpReveal
              v-for="(phase, i) in roadmapPhases"
              :key="phase.label"
              class="relative grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_5rem_minmax(0,1fr)] lg:gap-0"
            >
              <div
                class="absolute left-4 top-8 flex h-3.5 w-3.5 -translate-x-1/2 items-center justify-center rounded-full bg-[#030308] ring-4 ring-[#030308] lg:left-1/2"
              >
                <span class="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.9)]" />
              </div>

              <div
                v-if="i % 2 === 0"
                class="ml-8 lg:ml-0 lg:col-start-1 lg:row-start-1 lg:pr-10"
              >
                <article
                  class="group relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#0c0c14] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition-all duration-500 hover:border-cyan-500/20 hover:shadow-[0_20px_80px_rgba(34,211,238,0.08)] sm:p-5"
                >
                  <div class="relative overflow-hidden rounded-[1.35rem] bg-[#05050a]">
                    <img
                      :src="phase.image"
                      :alt="phase.alt"
                      class="h-56 w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04] sm:h-64"
                      loading="lazy"
                      decoding="async"
                    />
                    <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05050a]/90 via-transparent to-transparent" />
                  </div>

                  <div class="mt-5 flex items-start justify-between gap-4">
                    <div class="min-w-0">
                      <span class="text-xs font-bold uppercase tracking-[0.32em] text-cyan-400/80">{{ phase.label }}</span>
                      <h3 class="mt-2 text-xl font-black text-white sm:text-2xl">
                        {{ phase.titleText }}
                      </h3>
                    </div>
                    <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg font-black text-violet-200">
                      {{ phase.label }}
                    </div>
                  </div>

                  <p class="mt-4 text-sm leading-relaxed text-slate-400 sm:text-[0.98rem]">
                    {{ phase.bodyText }}
                  </p>

                  <div class="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-300/80">
                      {{ $t("up.roadmap.goal") }}
                    </p>
                    <p class="mt-2 text-sm leading-relaxed text-slate-300">
                      {{ phase.goalText }}
                    </p>
                  </div>
                </article>
              </div>

              <div class="hidden lg:block" />

              <div
                v-if="i % 2 === 1"
                class="ml-8 lg:ml-0 lg:col-start-3 lg:row-start-1 lg:pl-10"
              >
                <article
                  class="group relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#0c0c14] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition-all duration-500 hover:border-violet-500/20 hover:shadow-[0_20px_80px_rgba(139,92,246,0.08)] sm:p-5"
                >
                  <div class="relative overflow-hidden rounded-[1.35rem] bg-[#05050a]">
                    <img
                      :src="phase.image"
                      :alt="phase.alt"
                      class="h-56 w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04] sm:h-64"
                      loading="lazy"
                      decoding="async"
                    />
                    <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05050a]/90 via-transparent to-transparent" />
                  </div>

                  <div class="mt-5 flex items-start justify-between gap-4">
                    <div class="min-w-0">
                      <span class="text-xs font-bold uppercase tracking-[0.32em] text-cyan-400/80">{{ phase.label }}</span>
                      <h3 class="mt-2 text-xl font-black text-white sm:text-2xl">
                        {{ phase.titleText }}
                      </h3>
                    </div>
                    <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg font-black text-cyan-200">
                      {{ phase.label }}
                    </div>
                  </div>

                  <p class="mt-4 text-sm leading-relaxed text-slate-400 sm:text-[0.98rem]">
                    {{ phase.bodyText }}
                  </p>

                  <div class="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-300/80">
                      {{ $t("up.roadmap.goal") }}
                    </p>
                    <p class="mt-2 text-sm leading-relaxed text-slate-300">
                      {{ phase.goalText }}
                    </p>
                  </div>
                </article>
              </div>

              <div
                v-if="i % 2 === 0"
                class="hidden lg:block"
              />
            </UpReveal>
          </div>
        </div>
      </div>
    </section>

    <!-- Whitepaper -->
    <section id="whitepaper" class="scroll-mt-24 py-24 md:py-32">
      <div class="mx-auto max-w-3xl px-5 text-center sm:px-8 lg:px-10">
        <UpReveal class="w-full">
          <article
            class="relative isolate mx-auto rounded-2xl border border-white/10 bg-[#0c0c14] px-8 py-12 shadow-[0_24px_64px_-20px_rgba(0,0,0,0.55)] md:px-12 md:py-16"
          >
            <h2 class="text-2xl font-bold leading-snug text-white md:text-3xl md:leading-snug">
              {{ $t("up.wp.title") }}
            </h2>
            <p
              class="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-slate-400 md:mt-8 md:text-lg"
            >
              {{ $t("up.wp.body") }}
            </p>
            <div class="mt-10 flex justify-center md:mt-12">
              <NuxtLink to="/support/legal" class="inline-flex">
                <UButton
                  color="neutral"
                  variant="outline"
                  size="lg"
                  class="border-white/20 px-6 text-slate-100"
                  trailing-icon="i-heroicons-arrow-right"
                >
                  {{ $t("up.wp.link") }}
                </UButton>
              </NuxtLink>
            </div>
          </article>
        </UpReveal>
      </div>
    </section>

    <!-- Investment packages (unchanged product block) -->
    <section id="packages" class="scroll-mt-24 py-24">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-16 text-center">
          <h2 class="text-3xl font-bold text-white md:text-4xl">
            {{ $t("home.packages.title") }}
          </h2>
          <p class="mt-2 text-slate-400">{{ $t("home.packages.subtitle") }}</p>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="pkg in packages"
            :key="pkg.amount"
            class="package-card relative flex min-w-0 flex-col p-8"
            :class="pkg.amount === 500 ? 'package-card-popular pt-12' : ''"
          >
            <div
              v-if="pkg.amount === 500"
              class="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2"
            >
              <span
                class="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20"
                style="background: linear-gradient(135deg, #6366f1, #8b5cf6)"
              >
                {{ $t("home.packages.popular") }}
              </span>
            </div>

            <div class="mb-6 flex items-start justify-between gap-4">
              <div class="min-w-0 text-left">
                <p class="text-sm text-slate-400">
                  {{ $t("home.packages.defi_badge") }}
                </p>
                <h3 class="text-2xl font-black text-white">
                  ${{ pkg.amount.toLocaleString() }}
                </h3>
              </div>
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style="background:linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.2))"
              >
                <UIcon
                  name="i-heroicons-arrow-trending-up"
                  class="text-xl text-indigo-400"
                />
              </div>
            </div>

            <div class="mb-6 flex flex-1 flex-col gap-3">
              <div class="flex items-center justify-between gap-3">
                <span class="text-sm text-slate-400">{{
                  $t("home.packages.min_deposit")
                }}</span>
                <span class="font-semibold text-white">${{ pkg.amount }}</span>
              </div>
              <div class="flex items-center justify-between gap-3">
                <span class="text-sm text-slate-400">{{
                  $t("home.packages.daily_profit")
                }}</span>
                <span class="font-bold text-green-400">{{
                  $t("home.packages.max_profit")
                }}</span>
              </div>
              <div class="h-px bg-slate-800" />
              <div class="flex items-start gap-3">
                <UIcon
                  name="i-heroicons-check-circle"
                  class="mt-0.5 size-5 shrink-0 text-indigo-400"
                />
                <span class="text-left text-sm leading-snug text-slate-300">{{
                  $t("home.packages.feature_signals")
                }}</span>
              </div>
              <div class="flex items-start gap-3">
                <UIcon
                  name="i-heroicons-check-circle"
                  class="mt-0.5 size-5 shrink-0 text-indigo-400"
                />
                <span class="text-left text-sm leading-snug text-slate-300">{{
                  $t("home.packages.feature_referral")
                }}</span>
              </div>
            </div>

            <NuxtLink to="/auth/register" class="mt-auto">
              <UButton
                block
                class="min-h-11"
                :color="pkg.amount === 500 ? 'primary' : 'neutral'"
                :variant="pkg.amount === 500 ? 'solid' : 'outline'"
              >
                {{ $t("home.packages.join") }}
              </UButton>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Referral -->
    <section
      id="referral"
      class="border-t border-white/[0.06] bg-black/25 py-24 backdrop-blur-sm"
    >
      <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center md:mb-16">
          <h2 class="mb-3 text-3xl font-bold text-white md:text-4xl">
            {{ $t("home.referral_section.title") }}
          </h2>
          <p class="text-slate-400">
            {{ $t("home.referral_section.subtitle") }}
          </p>
        </div>

        <div
          class="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 md:gap-8"
        >
          <div
            class="su-card su-card-hover flex min-h-0 min-w-0 flex-col p-6 sm:p-8"
          >
            <div class="mb-6 flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10"
              >
                <UIcon
                  name="i-heroicons-arrow-down-tray"
                  class="text-lg text-green-400"
                />
              </div>
              <h3 class="text-lg font-bold text-white">
                {{ $t("home.referral_section.deposit_title") }}
              </h3>
            </div>
            <div class="flex flex-1 flex-col justify-center gap-4">
              <div
                class="flex items-center justify-between gap-3 rounded-xl bg-slate-800/50 p-3"
              >
                <div class="flex min-w-0 items-center gap-3">
                  <span
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-xs font-bold text-indigo-400"
                    >{{ $t("home.referral_section.f1_label") }}</span
                  >
                  <span class="text-left text-sm text-slate-300">{{
                    $t("home.referral_section.direct_referral")
                  }}</span>
                </div>
                <span class="shrink-0 text-xl font-bold text-green-400">{{
                  $t("home.referral_section.rate_deposit_f1")
                }}</span>
              </div>
              <div
                class="flex items-center justify-between gap-3 rounded-xl bg-slate-800/50 p-3"
              >
                <div class="flex min-w-0 items-center gap-3">
                  <span
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-xs font-bold text-purple-400"
                    >{{ $t("home.referral_section.f2_label") }}</span
                  >
                  <span class="text-left text-sm text-slate-300">{{
                    $t("home.referral_section.second_level")
                  }}</span>
                </div>
                <span class="shrink-0 text-xl font-bold text-green-400">{{
                  $t("home.referral_section.rate_deposit_f2")
                }}</span>
              </div>
            </div>
          </div>

          <div
            class="su-card su-card-hover flex min-h-0 min-w-0 flex-col p-6 sm:p-8"
          >
            <div class="mb-6 flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10"
              >
                <UIcon
                  name="i-heroicons-arrow-path"
                  class="text-lg text-indigo-400"
                />
              </div>
              <h3 class="text-lg font-bold text-white">
                {{ $t("home.referral_section.profit_title") }}
              </h3>
            </div>
            <div class="flex flex-1 flex-col gap-4">
              <div
                v-for="level in profitLevels"
                :key="level.key"
                class="flex items-center justify-between gap-3 rounded-xl bg-slate-800/50 p-3"
              >
                <div class="flex min-w-0 items-center gap-3">
                  <span
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                    :class="level.badgeCls"
                    >{{ level.label }}</span
                  >
                  <span class="text-left text-sm text-slate-300">{{
                    level.desc
                  }}</span>
                </div>
                <span
                  class="max-w-[44%] shrink-0 text-right text-base font-bold sm:text-xl"
                  :class="level.color"
                  >{{ level.rate }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "landing" });

const { t } = useI18n();
const { user } = useAuth();

useHead({ title: "Signal Universe — Smart Trading Signal Platform" });

/** Universe Pro hero banner (same asset as reference site). */
const heroBannerVideoSrc =
  "https://www.universepro.co/wp-content/uploads/2025/10/Banner-1.mp4";

/** Public/ paths as runtime strings so Vite does not try to bundle missing .webp files. */
const heroBannerLeftSrc = "/images/banner-left.png";
const heroBannerRightSrc = "/images/banner-right.png";

const heroVideoRef = ref<HTMLVideoElement | null>(null);


const introCards = [
  { title: "up.intro.f1_title", desc: "up.intro.f1_desc", image: "/images/home10_phantichthitruong.png" },
  { title: "up.intro.f2_title", desc: "up.intro.f2_desc", image: "/images/home11_giaodichthongminh.png" },
  { title: "up.intro.f3_title", desc: "up.intro.f3_desc", image: "/images/home12_baomattoida.png" },
];

const bentoCells = [
  {
    title: "up.bento.b1",
    sub: "up.bento.b1_sub",
    span: "col-span-2 md:col-span-4",
    glow: "radial-gradient(circle, rgba(34,211,238,0.5), transparent)",
    image: "/images/home9.png",
    imgH: "h-52 sm:h-56 md:h-64",
  },
  {
    title: "up.bento.b2",
    sub: "up.bento.b2_sub",
    span: "col-span-2 md:col-span-2",
    glow: "radial-gradient(circle, rgba(139,92,246,0.45), transparent)",
    image: "/images/home14.png",
    imgH: "h-52 sm:h-56 md:h-64",
  },
  {
    title: "up.bento.b3",
    sub: "up.bento.b3_sub",
    span: "col-span-2 md:col-span-2",
    glow: "radial-gradient(circle, rgba(244,114,182,0.35), transparent)",
    image: "/images/home15.png",
    imgH: "h-48 sm:h-52 md:h-60",
  },
  {
    title: "up.bento.b4",
    sub: "up.bento.b4_sub",
    span: "col-span-2 md:col-span-4",
    glow: "radial-gradient(circle, rgba(34,211,238,0.35), transparent)",
    image: "/images/home16.png",
    imgH: "h-48 sm:h-52 md:h-60",
  },
  {
    title: "up.bento.b5",
    sub: "up.bento.b5_sub",
    span: "col-span-2 md:col-span-3",
    glow: "radial-gradient(circle, rgba(99,102,241,0.4), transparent)",
    image: "/images/home17.png",
    imgH: "h-48 sm:h-52 md:h-56",
  },
  {
    title: "up.bento.b6",
    sub: "up.bento.b6_sub",
    span: "col-span-2 md:col-span-3",
    glow: "radial-gradient(circle, rgba(167,139,250,0.4), transparent)",
    image: "/images/home18.png",
    imgH: "h-48 sm:h-52 md:h-56",
  },
];

const advKeys = ["a1", "a2", "a3"];

/** Exactly 5 roadmap phases matching Universe Pro cadence */
const roadmapPhases = computed(() => [
  {
    label: "01",
    image: "/images/home1.png",
    titleText: t("up.roadmap.p1t"),
    bodyText: t("up.roadmap.p1b"),
    goalText: t("up.roadmap.p1g"),
  },
  {
    label: "02",
    image: "/images/home2.png",
    titleText: t("up.roadmap.p2t"),
    bodyText: t("up.roadmap.p2b"),
    goalText: t("up.roadmap.p2g"),
  },
  {
    label: "03",
    image: "/images/home3.png",
    titleText: t("up.roadmap.p3t"),
    bodyText: t("up.roadmap.p3b"),
    goalText: t("up.roadmap.p3g"),
  },
  {
    label: "04",
    image: "/images/home4.png",
    titleText: t("up.roadmap.p4t"),
    bodyText: t("up.roadmap.p4b"),
    goalText: t("up.roadmap.p4g"),
  },
  {
    label: "05",
    image: "/images/home5.png",
    titleText: t("up.roadmap.p5t"),
    bodyText: t("up.roadmap.p5b"),
    goalText: t("up.roadmap.p5g"),
  },
]);

const packages = [
  { amount: 200 },
  { amount: 300 },
  { amount: 500 },
  { amount: 1000 },
  { amount: 2000 },
  { amount: 5000 },
];

const profitLevels = computed(() => [
  {
    key: "u1",
    label: t("home.referral_section.u1_label"),
    desc: t("home.referral_section.u1_desc"),
    rate: t("home.referral_section.rate_profit_u1"),
    color: "text-indigo-400",
    badgeCls: "bg-indigo-500/20 text-indigo-400",
  },
  {
    key: "u2",
    label: t("home.referral_section.u2_label"),
    desc: t("home.referral_section.u2_desc"),
    rate: t("home.referral_section.rate_profit_u2"),
    color: "text-purple-400",
    badgeCls: "bg-purple-500/20 text-purple-400",
  },
  {
    key: "u3",
    label: t("home.referral_section.u3_label"),
    desc: t("home.referral_section.u3_desc"),
    rate: t("home.referral_section.rate_profit_u3"),
    color: "text-pink-400",
    badgeCls: "bg-pink-500/20 text-pink-400",
  },
]);

onMounted(() => {
  const el = heroVideoRef.value;
  if (!el || typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.pause();
  }
});
</script>

<style scoped>
.up-cta-pill {
  background: linear-gradient(90deg, #5eead4, #c4b5fd);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}
.up-cta-pill:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 16px 48px rgba(94, 234, 212, 0.35);
}
</style>
