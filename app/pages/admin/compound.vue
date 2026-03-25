<template>
  <div>
    <h1 class="text-2xl font-bold text-white mb-2">{{ $t('admin.compound.title') }}</h1>
    <p class="text-slate-400 text-sm mb-8">{{ $t('admin.compound.subtitle') }}</p>

    <div class="su-card overflow-x-auto">
      <table class="su-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{{ $t('admin.compound.beneficiary') }}</th>
            <th>{{ $t('admin.compound.source_user') }}</th>
            <th>{{ $t('admin.compound.level') }}</th>
            <th>Source Profit</th>
            <th>{{ $t('admin.compound.commission') }}</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tx in transactions" :key="tx.id">
            <td class="text-slate-400 text-xs">#{{ tx.id }}</td>
            <td>
              <p class="text-white text-sm">{{ tx.user?.full_name || '-' }}</p>
              <p class="text-slate-400 text-xs">{{ tx.user?.email }}</p>
            </td>
            <td>
              <p class="text-slate-300 text-sm">{{ tx.from_user?.full_name || '-' }}</p>
              <p class="text-slate-500 text-xs">{{ tx.from_user?.email }}</p>
            </td>
            <td>
              <UBadge v-if="tx.referral_level" :label="`F${tx.referral_level}`"
                :color="tx.referral_level === 1 ? 'indigo' : tx.referral_level === 2 ? 'purple' : 'pink'"
                variant="soft" />
            </td>
            <td class="text-slate-400 text-sm">-</td>
            <td class="text-green-400 font-bold">+${{ tx.amount?.toFixed(2) }}</td>
            <td class="text-slate-400 text-xs">{{ new Date(tx.created_at).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="!transactions?.length" class="text-center py-12 text-slate-500">
        <UIcon name="i-heroicons-arrow-path" class="text-4xl mb-3 text-slate-600" />
        <p>No compound interest records yet</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Compound Interest - Admin' })

const { data: txData } = await useFetch('/api/admin/transactions', {
  query: { tab: 'signal_compound', limit: 100 }
})

const transactions = computed(() => (txData.value?.data || []).filter((t: any) => t.type === 'signal_referral'))
</script>
