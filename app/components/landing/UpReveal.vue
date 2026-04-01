<template>
  <div ref="root" :class="['up-reveal', shown && 'up-reveal--in']">
    <slot />
  </div>
</template>

<script setup lang="ts">
const root = ref<HTMLElement | null>(null)
const shown = ref(false)

onMounted(() => {
  const el = root.value
  if (!el) return
  const io = new IntersectionObserver(
    entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          shown.value = true
          io.disconnect()
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  )
  io.observe(el)
  onUnmounted(() => io.disconnect())
})
</script>

<style scoped>
.up-reveal {
  opacity: 0;
  transform: translate3d(0, 32px, 0);
  transition:
    opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.85s cubic-bezier(0.22, 1, 0.36, 1);
}
.up-reveal--in {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}
</style>
