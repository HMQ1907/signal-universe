<template>
  <div class="min-h-screen bg-[#030308] text-slate-100">
    <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        class="absolute left-1/4 top-0 h-[min(80vh,600px)] w-[min(90vw,900px)] -translate-x-1/2 rounded-full opacity-[0.12] blur-[120px]"
        style="background: radial-gradient(ellipse at center, rgba(34, 211, 238, 0.35), transparent 65%)"
      />
      <div
        class="absolute bottom-0 right-0 h-[50vh] w-[50vw] translate-x-1/4 rounded-full opacity-[0.1] blur-[100px]"
        style="background: radial-gradient(circle, rgba(139, 92, 246, 0.45), transparent 70%)"
      />
      <div
        class="absolute inset-0 opacity-[0.04]"
        style="background-image:linear-gradient(rgba(148,163,184,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,0.08) 1px,transparent 1px);background-size:72px 72px"
      />
    </div>
    <LayoutHeader class="relative z-10" />
    <main
      class="relative z-10 min-w-0"
      :class="isLoggedIn ? 'pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0' : ''"
    >
      <slot />
    </main>
    <LandingFooter />
    <LayoutMobileNav v-if="isLoggedIn" />
  </div>
</template>

<script setup lang="ts">
const { init, user } = useAuth()
const isLoggedIn = computed(() => !!user.value)
// Plugin auth.server.ts handles SSR init with cookies.
// This ensures auth state is populated on client-side navigation too.
if (import.meta.client) {
  onMounted(() => init())
}
</script>
