<template>
  <div class="relative flex min-h-screen flex-col text-slate-100">
    <div class="su-page-canvas" aria-hidden="true">
      <div class="su-page-canvas__bloom su-page-canvas__bloom--tl" />
      <div class="su-page-canvas__bloom su-page-canvas__bloom--br" />
      <div class="su-page-canvas__bloom su-page-canvas__bloom--accent" />
      <div class="su-page-canvas__grid" />
      <div class="su-page-canvas__streaks" />
      <div class="su-page-canvas__vignette" />
    </div>
    <LayoutHeader class="relative z-10" />
    <main class="relative z-10 min-w-0 flex-1">
      <slot />
    </main>
    <LayoutFooter class="relative z-10" />
    <LayoutMobileNav v-if="isLoggedIn" />
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth()
const isLoggedIn = computed(() => !!user.value)
</script>
