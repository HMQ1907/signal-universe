<template>
  <div class="min-h-screen flex flex-col" style="background: #0a0f1e;">
    <Header />
    <main class="flex-1">
      <slot />
    </main>
    <Footer />
    <MobileNav v-if="isLoggedIn" />
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth()
const isLoggedIn = computed(() => !!user.value)
</script>
