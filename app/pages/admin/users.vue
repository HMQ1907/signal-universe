<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-white">{{ $t('admin.users.title') }}</h1>
        <p class="text-slate-500 text-sm mt-0.5">{{ $t('admin.users.subtitle', { total: usersData?.total || 0 }) }}</p>
      </div>
    </div>

    <!-- Search -->
    <div class="su-card mb-4">
      <div class="relative">
        <UIcon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base pointer-events-none" />
        <input
          v-model="search"
          type="text"
          :placeholder="$t('admin.users.search')"
          class="w-full max-w-sm bg-slate-800/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
          @input="onSearch"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="su-card overflow-x-auto">
      <table class="su-table">
        <thead>
          <tr>
            <th>{{ $t('admin.users.columns.id') }}</th>
            <th>{{ $t('admin.users.columns.name') }}</th>
            <th>{{ $t('admin.users.columns.email') }}</th>
            <th>{{ $t('admin.users.columns.package') }}</th>
            <th>{{ $t('admin.users.columns.balance') }}</th>
            <th>{{ $t('admin.users.columns.capital') }}</th>
            <th>{{ $t('admin.users.columns.f1') }}</th>
            <th>{{ $t('admin.users.columns.joined') }}</th>
            <th>{{ $t('admin.users.columns.status') }}</th>
            <th>{{ $t('common.action') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td class="text-slate-500 text-xs font-mono">#{{ u.id }}</td>
            <td class="text-white font-medium">{{ u.full_name || '-' }}</td>
            <td class="text-slate-300 text-sm">{{ u.email }}</td>
            <td>
              <UBadge v-if="u.investment_package" :label="`$${u.investment_package}`" color="primary" variant="soft" size="sm" />
              <span v-else class="text-slate-600 text-xs">—</span>
            </td>
            <td class="text-green-400 font-semibold">${{ (u.balance || 0).toFixed(2) }}</td>
            <td class="text-amber-400">${{ (u.locked_capital || 0).toFixed(2) }}</td>
            <td class="text-indigo-400">{{ u.f1_count || 0 }}</td>
            <td class="text-slate-400 text-xs">{{ new Date(u.created_at).toLocaleDateString() }}</td>
            <td>
              <UBadge
                :label="u.is_active ? $t('common.active') : $t('common.disabled')"
                :color="u.is_active ? 'green' : 'red'"
                variant="soft"
                size="sm"
              />
            </td>
            <td class="min-w-56 align-top">
              <div class="flex flex-col gap-2 py-0.5 sm:flex-row sm:flex-wrap sm:items-end">
                <UButton
                  size="sm"
                  class="inline-flex min-h-9 justify-center font-semibold"
                  leading-icon="i-heroicons-squares-2x2"
                  color="neutral"
                  variant="outline"
                  @click="viewTree(u)"
                >
                  {{ $t('admin.users.action_view_tree') }}
                </UButton>
                <template v-if="isMainAdmin">
                  <UButton
                    size="sm"
                    class="inline-flex min-h-9 justify-center font-semibold"
                    leading-icon="i-heroicons-banknotes"
                    color="success"
                    variant="solid"
                    @click="openAdjust(u)"
                  >
                    {{ $t('admin.users.action_adjust_balance') }}
                  </UButton>
                  <UButton
                    size="sm"
                    class="inline-flex min-h-9 justify-center font-semibold"
                    :leading-icon="u.is_active ? 'i-heroicons-lock-closed' : 'i-heroicons-lock-open'"
                    :color="u.is_active ? 'error' : 'success'"
                    variant="soft"
                    @click="toggleStatus(u)"
                  >
                    {{ u.is_active ? $t('admin.users.action_disable_account') : $t('admin.users.action_enable_account') }}
                  </UButton>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!users?.length" class="text-center py-12 text-slate-500">
        <UIcon name="i-heroicons-users" class="text-4xl mb-3 text-slate-600" />
        <p class="text-sm">{{ $t('common.no_data') }}</p>
      </div>
    </div>

    <!-- ─── Balance Adjust Modal ─── -->
    <UModal v-model:open="showAdjust" :title="$t('admin.users.adjust_balance')" :description="selectedUser?.email">
      <template #body>
        <div v-if="selectedUser" class="space-y-6">
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-xl bg-slate-800 border border-white/10 p-3 text-center">
              <p class="text-slate-400 text-xs mb-1">{{ $t('admin.users.columns.balance') }}</p>
              <p class="text-green-400 font-bold text-lg">${{ (selectedUser.balance || 0).toFixed(2) }}</p>
            </div>
            <div class="rounded-xl bg-slate-800 border border-white/10 p-3 text-center">
              <p class="text-slate-400 text-xs mb-1">{{ $t('admin.users.columns.capital') }}</p>
              <p class="text-amber-400 font-bold text-lg">${{ (selectedUser.locked_capital || 0).toFixed(2) }}</p>
            </div>
          </div>
          <div>
            <p class="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">{{ $t('admin.users.adjust_operation') }}</p>
            <div class="grid grid-cols-2 gap-2">
              <button v-for="op in operations" :key="op.value"
                class="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all"
                :class="adjustForm.operation === op.value ? op.activeClass : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white bg-slate-800'"
                @click="adjustForm.operation = op.value">
                <UIcon :name="op.icon" class="text-base shrink-0" /> {{ op.label }}
              </button>
            </div>
          </div>
          <div>
            <p class="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">{{ $t('admin.users.adjust_target') }}</p>
            <div class="grid grid-cols-2 gap-2">
              <button v-for="tgt in adjustTargets" :key="tgt.value"
                class="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all"
                :class="adjustForm.target === tgt.value ? 'border-indigo-500/50 text-indigo-300 bg-indigo-500/10' : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white bg-slate-800'"
                @click="adjustForm.target = tgt.value">
                <UIcon :name="tgt.icon" class="shrink-0" /> {{ tgt.label }}
              </button>
            </div>
          </div>
          <div>
            <p class="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">{{ $t('common.amount') }} (USD)</p>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">$</span>
              <input v-model.number="adjustForm.amount" type="number" min="0.01" step="0.01" placeholder="0.00"
                class="w-full bg-slate-800 border border-white/10 rounded-xl pl-7 pr-4 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors" />
            </div>
            <div v-if="adjustForm.amount > 0" class="mt-2 flex items-center gap-2 text-xs text-slate-400">
              <UIcon name="i-heroicons-arrow-right" class="text-slate-600" />
              <span>{{ $t('admin.users.new_balance') }}:</span>
              <span :class="previewBalance >= 0 ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'">${{ previewBalance.toFixed(2) }}</span>
            </div>
          </div>
          <div>
            <p class="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">{{ $t('admin.users.adjust_reason') }}</p>
            <input v-model="adjustForm.reason" type="text" :placeholder="$t('admin.users.adjust_reason_placeholder')"
              class="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors" />
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3 w-full">
          <UButton block color="neutral" variant="outline" class="flex-1 ring-1 ring-white/15" @click="showAdjust = false">{{ $t('common.cancel') }}</UButton>
          <UButton block class="flex-1" :loading="adjustLoading"
            :color="adjustForm.operation === 'add' ? 'success' : 'error'"
            :disabled="!adjustForm.amount || !adjustForm.reason" @click="submitAdjust">
            {{ adjustForm.operation === 'add' ? $t('admin.users.confirm_add') : $t('admin.users.confirm_subtract') }}
            ${{ (adjustForm.amount || 0).toFixed(2) }}
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- ─── Tree Modal ─── -->
    <UModal v-model:open="showTree" :title="$t('admin.users.referral_tree')" :description="selectedUser?.email">
      <template #body>
        <div v-if="treeData" class="space-y-4">
          <div v-if="treeData.parent" class="p-3 rounded-xl bg-slate-800/50 border border-white/6 text-sm flex items-center gap-2">
            <UIcon name="i-heroicons-arrow-up" class="text-slate-500" />
            <span class="text-slate-400">{{ $t('admin.users.parent') }}:</span>
            <span class="text-white font-medium">{{ treeData.parent.full_name || treeData.parent.email }}</span>
          </div>
          <div v-for="([level, members]) in levelEntries" :key="level">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">{{ level }}</span>
              <span class="text-slate-500 text-xs">{{ members.length }} {{ $t('admin.users.members') }}</span>
            </div>
            <div v-if="members.length" class="grid grid-cols-2 gap-2">
              <div v-for="m in members" :key="m.id" class="p-2.5 rounded-lg bg-slate-800/40 border border-white/5 text-xs">
                <p class="text-white font-medium truncate">{{ m.full_name || m.email }}</p>
                <div class="flex items-center justify-between mt-0.5">
                  <p class="text-slate-500">{{ new Date(m.created_at).toLocaleDateString() }}</p>
                  <p class="text-green-400">${{ (m.balance || 0).toFixed(0) }}</p>
                </div>
              </div>
            </div>
            <p v-else class="text-slate-600 text-xs italic">{{ $t('admin.users.no_members') }}</p>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Users - Admin' })

const toast = useToastCustom()
const { t } = useI18n()
const { user: authUser } = useAuth()
const search = ref('')

const isMainAdmin = computed(() => authUser.value?.is_admin === true)

const { data: usersData, refresh } = await useFetch('/api/admin/users', {
  query: computed(() => ({ search: search.value || undefined, limit: 50 }))
})

const users = computed(() => usersData.value?.data || [])
const onSearch = useDebounceFn(() => refresh(), 400)

const selectedUser = ref<any>(null)
const showAdjust = ref(false)
const showTree = ref(false)
const adjustLoading = ref(false)
const treeData = ref<any>(null)

const adjustForm = reactive({
  amount: 0 as number,
  reason: '',
  operation: 'add' as 'add' | 'subtract',
  target: 'balance' as 'balance' | 'capital'
})

const operations = computed(() => [
  {
    value: 'add',
    label: t('admin.users.add_balance'),
    icon: 'i-heroicons-plus-circle',
    activeClass: 'border-green-500/50 text-green-300 bg-green-500/10'
  },
  {
    value: 'subtract',
    label: t('admin.users.subtract_balance'),
    icon: 'i-heroicons-minus-circle',
    activeClass: 'border-red-500/50 text-red-300 bg-red-500/10'
  }
])

const adjustTargets = computed(() => [
  { value: 'balance', label: t('admin.users.target_balance'), icon: 'i-heroicons-banknotes' },
  { value: 'capital', label: t('admin.users.target_capital'), icon: 'i-heroicons-lock-closed' }
])

const previewBalance = computed(() => {
  if (!selectedUser.value) return 0
  const current = adjustForm.target === 'capital'
    ? (selectedUser.value.locked_capital || 0)
    : (selectedUser.value.balance || 0)
  return adjustForm.operation === 'add'
    ? current + (adjustForm.amount || 0)
    : current - (adjustForm.amount || 0)
})

const openAdjust = (u: any) => {
  selectedUser.value = u
  adjustForm.operation = 'add'
  adjustForm.target = 'balance'
  adjustForm.amount = 0
  adjustForm.reason = ''
  showAdjust.value = true
}

const submitAdjust = async () => {
  if (!adjustForm.amount || adjustForm.amount <= 0) {
    toast.error(t('admin.users.error_amount'))
    return
  }
  if (!adjustForm.reason.trim()) {
    toast.error(t('admin.users.error_reason'))
    return
  }
  adjustLoading.value = true
  try {
    await $fetch(`/api/admin/users/${selectedUser.value.id}/adjust-balance`, {
      method: 'POST',
      body: {
        amount: adjustForm.amount,
        operation: adjustForm.operation,
        target: adjustForm.target,
        reason: adjustForm.reason
      }
    })
    toast.success(t('admin.users.adjust_success'))
    showAdjust.value = false
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || t('admin.users.adjust_failed'))
  } finally {
    adjustLoading.value = false
  }
}

const viewTree = async (u: any) => {
  selectedUser.value = u
  const data = await $fetch(`/api/admin/users/${u.id}/tree`)
  treeData.value = data
  showTree.value = true
}

const levelEntries = computed(() => {
  if (!treeData.value) return []
  return [
    ['F1', treeData.value.f1 || []],
    ['F2', treeData.value.f2 || []],
    ['F3', treeData.value.f3 || []]
  ] as [string, any[]][]
})

const toggleStatus = async (u: any) => {
  try {
    await $fetch(`/api/admin/users/${u.id}/toggle-status`, { method: 'POST' })
    toast.success(t('admin.users.status_updated'))
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || t('admin.users.status_failed'))
  }
}
</script>
