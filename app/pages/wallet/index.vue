<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', pageTransition: false })
await navigateTo('/wallet/deposit', { replace: true })
</script>
