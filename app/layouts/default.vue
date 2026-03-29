<template>
  <div class="min-h-screen flex flex-col" style="background: #0a0f1e;">
    <LayoutHeader />
    <main class="flex-1">
      <slot />
    </main>
    <LayoutFooter />
    <LayoutMobileNav v-if="isLoggedIn" />
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth()
const isLoggedIn = computed(() => !!user.value)
</script>
