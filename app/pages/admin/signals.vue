<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-bold text-white">{{ $t('admin.signals.title') }}</h1>
      <div class="flex gap-2">
        <UInput v-model="selectedDate" type="date" />
        <UButton icon="i-heroicons-plus" color="primary" @click="showCreateSession = true">
          {{ $t('admin.signals.create_session') }}
        </UButton>
      </div>
    </div>

    <!-- Sessions -->
    <div class="grid md:grid-cols-1 gap-6 mb-8 max-w-xl">
      <div v-for="session in sessions" :key="session.id" class="su-card">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <UIcon name="i-heroicons-signal" class="text-indigo-400" />
            </div>
            <div>
              <p class="text-white font-bold">{{ session.time_window }}</p>
              <p class="text-slate-400 text-sm">{{ session.session_date }}</p>
            </div>
          </div>
          <UBadge :label="session.status" :color="session.status === 'open' ? 'green' : session.status === 'processed' ? 'blue' : 'gray'" variant="soft" />
        </div>

        <p class="text-slate-400 text-sm mb-3">
          Each pending user receives <span class="text-white font-semibold">{{ packageProfitPercent }}%</span> of their package tier; uplines earn % of that profit (see Referral settings).
        </p>
        <UButton :loading="processingSession === session.id"
          class="bg-green-600 hover:bg-green-500 text-white"
          @click="bulkApprove(session)">
          {{ $t('admin.signals.bulk_approve') }}
        </UButton>

        <p class="text-slate-400 text-sm">
          Confirmations: <span class="text-white font-semibold">{{ sessionConfirmCount(session.id) }}</span>
        </p>
      </div>
    </div>

    <!-- Confirmations List -->
    <div class="su-card overflow-x-auto">
      <h2 class="text-white font-bold text-lg mb-6">{{ $t('admin.signals.confirmations') }}</h2>

      <table class="su-table">
        <thead>
          <tr>
            <th>{{ $t('admin.signals.columns.user') }}</th>
            <th>Session</th>
            <th>{{ $t('admin.signals.columns.balance') }}</th>
            <th>Package tier</th>
            <th>{{ $t('admin.signals.columns.amount') }}</th>
            <th>Est. credit</th>
            <th>{{ $t('admin.signals.columns.profit') }}</th>
            <th>{{ $t('admin.signals.columns.status') }}</th>
            <th>{{ $t('admin.signals.columns.time') }}</th>
            <th>{{ $t('common.action') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in confirmations" :key="c.id">
            <td>
              <p class="text-white text-sm">{{ c.user?.full_name || '-' }}</p>
              <p class="text-slate-400 text-xs">{{ c.user?.email }}</p>
            </td>
            <td class="text-slate-300 text-sm">{{ getSession(c.session_id)?.time_window }}</td>
            <td class="text-slate-300">${{ c.balance_snapshot?.toFixed(2) }}</td>
            <td class="text-slate-300">${{ c.package_tier ?? '-' }}</td>
            <td class="text-indigo-400">${{ c.amount?.toFixed(2) }}</td>
            <td class="text-slate-300">{{ c.status === 'pending' ? `$${estCredit(c).toFixed(2)}` : '—' }}</td>
            <td class="text-green-400">{{ c.profit_amount != null ? `$${c.profit_amount.toFixed(2)}` : '-' }}</td>
            <td>
              <UBadge :label="c.status" :color="c.status === 'approved' ? 'green' : c.status === 'pending' ? 'yellow' : 'red'" variant="soft" />
            </td>
            <td class="text-slate-400 text-xs">{{ new Date(c.confirmed_at).toLocaleString() }}</td>
            <td>
              <UButton v-if="c.status === 'pending'" size="xs"
                class="bg-green-600/80 hover:bg-green-600 text-white"
                @click="approveOne(c)">
                Approve
              </UButton>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!confirmations?.length" class="text-center py-12 text-slate-500">
        <UIcon name="i-heroicons-signal" class="text-4xl mb-3 text-slate-600" />
        <p>No confirmations for this date</p>
      </div>
    </div>

    <!-- Create Session Modal -->
    <UModal v-model="showCreateSession">
      <UCard>
        <template #header>
          <h3 class="text-white font-bold">{{ $t('admin.signals.create_session') }}</h3>
        </template>
        <div class="space-y-4">
          <UFormField label="Date">
            <UInput v-model="createForm.date" type="date" />
          </UFormField>
          <UFormField label="Time Window">
            <USelectMenu v-model="createForm.timeWindow" :options="timeOptions" />
          </UFormField>
        </div>
        <template #footer>
          <div class="flex gap-3 justify-end">
            <UButton color="neutral" @click="showCreateSession = false">Cancel</UButton>
            <UButton :loading="createLoading" color="primary"
              @click="createSession">Create</UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Approve One Modal -->
    <UModal v-model="showApproveOne">
      <UCard>
        <template #header>
          <h3 class="text-white font-bold">Approve Profit</h3>
        </template>
        <div class="space-y-4">
          <p class="text-slate-400 text-sm">User: {{ selectedConfirmation?.user?.email }}</p>
          <p class="text-slate-400 text-sm">Package tier: ${{ selectedConfirmation?.package_tier ?? '—' }}</p>
          <p class="text-slate-400 text-sm">Profit balance at confirm: ${{ selectedConfirmation?.balance_snapshot?.toFixed(2) }}</p>
          <p class="text-green-400 text-sm font-semibold">
            Credit to user: ${{ selectedConfirmation ? estCredit(selectedConfirmation).toFixed(2) : '0.00' }}
            <span class="text-slate-500 font-normal"> ({{ packageProfitPercent }}% × package)</span>
          </p>
          <p class="text-slate-500 text-xs">Referral: 15% / 10% / 5% of this credit for the first three uplines (rates in Settings).</p>
        </div>
        <template #footer>
          <div class="flex gap-3 justify-end">
            <UButton color="neutral" @click="showApproveOne = false">Cancel</UButton>
            <UButton :loading="approveLoading" class="bg-green-600 hover:bg-green-500 text-white"
              @click="submitApproveOne">Approve</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Signals - Admin' })

const toast = useToastCustom()
const selectedDate = ref(new Date().toISOString().split('T')[0])

const { data: signalData, refresh } = await useFetch('/api/admin/signals/sessions', {
  query: computed(() => ({ date: selectedDate.value })),
  watch: [selectedDate]
})

const { data: allSettings } = await useFetch<any[]>('/api/admin/settings', { key: 'admin-settings-signals' })

const packageProfitPercent = computed(() => {
  const row = allSettings.value?.find((s: any) => s.key === 'max_daily_profit_percent')
  return Number(row?.value ?? 2)
})

const sessions = computed(() => signalData.value?.sessions || [])
const confirmations = computed(() => signalData.value?.confirmations || [])

const estCredit = (c: { package_tier?: number | null }) => {
  const tier = c.package_tier || 0
  return parseFloat((tier * (packageProfitPercent.value / 100)).toFixed(2))
}

const processingSession = ref<number | null>(null)
const showCreateSession = ref(false)
const createLoading = ref(false)
const approveLoading = ref(false)
const showApproveOne = ref(false)
const selectedConfirmation = ref<any>(null)

const createForm = reactive({
  date: new Date().toISOString().split('T')[0],
  timeWindow: 'daily'
})
const timeOptions = ['daily']

const getSession = (id: number) => sessions.value.find((s: any) => s.id === id)
const sessionConfirmCount = (sessionId: number) => confirmations.value.filter((c: any) => c.session_id === sessionId).length

const bulkApprove = async (session: any) => {
  processingSession.value = session.id
  try {
    const result = await $fetch<{ processed: number }>('/api/admin/signals/bulk-approve', {
      method: 'POST',
      body: { session_id: session.id }
    })
    toast.success(`Approved ${result.processed} confirmations`)
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Bulk approve failed')
  } finally {
    processingSession.value = null
  }
}

const approveOne = (confirmation: any) => {
  selectedConfirmation.value = confirmation
  showApproveOne.value = true
}

const submitApproveOne = async () => {
  approveLoading.value = true
  try {
    await $fetch(`/api/admin/signals/${selectedConfirmation.value.id}/approve`, {
      method: 'POST',
      body: {}
    })
    toast.success('Profit approved')
    showApproveOne.value = false
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Approval failed')
  } finally {
    approveLoading.value = false
  }
}

const createSession = async () => {
  createLoading.value = true
  try {
    await $fetch('/api/admin/signals/sessions', {
      method: 'POST',
      body: { session_date: createForm.date, time_window: createForm.timeWindow }
    })
    toast.success('Session created')
    showCreateSession.value = false
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Failed to create session')
  } finally {
    createLoading.value = false
  }
}
</script>
