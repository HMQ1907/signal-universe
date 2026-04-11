<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <h1 class="text-3xl font-bold text-white mb-8">Frequently Asked Questions</h1>

    <div class="space-y-4">
      <div v-for="(faq, i) in faqs" :key="i" class="su-card">
        <button class="w-full flex items-center justify-between text-left" @click="toggleFaq(i)">
          <h3 class="text-white font-semibold">{{ faq.q }}</h3>
          <UIcon :name="openFaq === i ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="text-slate-400 flex-shrink-0 ml-4" />
        </button>
        <div v-if="openFaq === i" class="mt-4 text-slate-400 text-sm leading-relaxed">{{ faq.a }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'FAQ - Signal Universe' })

const openFaq = ref<number | null>(null)
const toggleFaq = (i: number) => { openFaq.value = openFaq.value === i ? null : i }

const faqs = [
  { q: 'What is Signal Universe?', a: 'Signal Universe is a smart trading signal platform with one daily AI confirmation window (00:00–14:00), transparent DeFi tiers, and referral rewards—built for clear, disciplined participation.' },
  { q: 'How do I get started?', a: 'Register an account, make a first deposit of at least $300 (your DeFi package tier is set from that first deposit and stays fixed), then confirm the daily AI signal once during the open window.' },
  { q: 'When can I withdraw my capital?', a: 'Your initial deposit (capital) is locked for 28 days from the first deposit date. After 28 days, you can submit a capital withdrawal request for admin review.' },
  { q: 'How are trading profits calculated?', a: 'When you confirm the daily AI signal, the pending session profit is 2% of your total balance (available profit plus locked capital), rounded to two decimals. After admin approval, that amount is credited to your profit balance. Up to three uplines earn 15%, 10%, and 5% of that credited profit.' },
  { q: 'How does the referral program work?', a: 'On each referral’s deposit: you earn 5% as the direct referrer (F1) and 3% as the grand-referrer (F2) of that deposit amount (rates from site settings). Applies to every deposit, not only the first.' },
  { q: 'What is the Leader Bonus?', a: 'Based on your direct F1 member count, you can earn weekly bonuses from $50 (10+ F1) up to $1,000 (200+ F1). Bonuses are calculated every Monday.' },
  { q: 'When can I withdraw profits?', a: 'Profit withdrawals are processed between 22:00-24:00 daily, with a minimum of $10 and a 3% processing fee.' }
]
</script>
