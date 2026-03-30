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
  { q: 'What is Signal Universe?', a: 'Signal Universe is a smart trading signal platform with one daily AI confirmation window (11:00–23:59), transparent DeFi tiers, and referral rewards—built for clear, disciplined participation.' },
  { q: 'How do I get started?', a: 'Register an account, reach at least $200 total balance to activate your DeFi tier, then confirm the daily AI signal once during the open window.' },
  { q: 'When can I withdraw my capital?', a: 'Your initial deposit (capital) is locked for 28 days from the first deposit date. After 28 days, you can submit a capital withdrawal request for admin review.' },
  { q: 'How are trading profits calculated?', a: 'Each signal uses 1% of your account balance. Admin approves profits, with a maximum of 2% daily profit on your total balance.' },
  { q: 'How does the referral program work?', a: 'You earn 5% commission when your F1 referrals deposit, and 3% from F2 deposits. For trading profits, you earn 15% from F1, 10% from F2, and 5% from F3 members.' },
  { q: 'What is the Leader Bonus?', a: 'Based on your direct F1 member count, you can earn weekly bonuses from $50 (10+ F1) up to $1,000 (200+ F1). Bonuses are calculated every Monday.' },
  { q: 'When can I withdraw profits?', a: 'Profit withdrawals are processed between 22:00-24:00 daily, with a minimum of $10 and a 3% processing fee.' }
]
</script>
