<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-bold text-white">{{ $t('admin.users.title') }}</h1>
    </div>

    <div class="su-card mb-4">
      <UInput v-model="search" :placeholder="$t('admin.users.search')" icon="i-heroicons-magnifying-glass"
        class="max-w-sm" @input="onSearch" />
    </div>

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
            <td class="text-slate-400 text-xs">#{{ u.id }}</td>
            <td class="text-white font-medium">{{ u.full_name || '-' }}</td>
            <td class="text-slate-300">{{ u.email }}</td>
            <td>
              <UBadge v-if="u.investment_package" :label="`$${u.investment_package}`" color="primary" variant="soft" />
              <span v-else class="text-slate-600">-</span>
            </td>
            <td class="text-green-400 font-semibold">${{ (u.balance || 0).toFixed(2) }}</td>
            <td class="text-amber-400">${{ (u.locked_capital || 0).toFixed(2) }}</td>
            <td class="text-indigo-400">{{ u.f1_count || 0 }}</td>
            <td class="text-slate-400 text-sm">{{ new Date(u.created_at).toLocaleDateString() }}</td>
            <td>
              <UBadge :label="u.is_active ? 'Active' : 'Disabled'"
                :color="u.is_active ? 'green' : 'red'" variant="soft" />
            </td>
            <td>
              <div class="flex items-center gap-1">
                <UButton size="xs" icon="i-heroicons-eye" color="neutral" variant="ghost"
                  @click="viewTree(u)" />
                <UButton size="xs" icon="i-heroicons-plus-circle" color="success" variant="ghost"
                  @click="openAdjust(u, 'add')" />
                <UButton size="xs" icon="i-heroicons-minus-circle" color="error" variant="ghost"
                  @click="openAdjust(u, 'subtract')" />
                <UButton size="xs" :icon="u.is_active ? 'i-heroicons-x-circle' : 'i-heroicons-check-circle'"
                  :color="u.is_active ? 'red' : 'green'" variant="ghost"
                  @click="toggleStatus(u)" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!users?.length" class="text-center py-12 text-slate-500">
        <UIcon name="i-heroicons-users" class="text-4xl mb-3 text-slate-600" />
        <p>No users found</p>
      </div>
    </div>

    <!-- Adjust Balance Modal -->
    <UModal v-model="showAdjust">
      <UCard>
        <template #header>
          <h3 class="text-white font-bold">{{ $t('admin.users.adjust_balance') }} — {{ selectedUser?.email }}</h3>
        </template>
        <div class="space-y-4">
          <div class="p-3 rounded-xl bg-slate-800/50 text-sm">
            Current balance: <span class="text-green-400 font-bold">${{ selectedUser?.balance?.toFixed(2) }}</span>
          </div>
          <UFormField label="Amount (USD)">
            <UInput v-model.number="adjustForm.amount" type="number" :min="0.01" step="0.01" />
          </UFormField>
          <UFormField :label="$t('admin.users.adjust_reason')">
            <UInput v-model="adjustForm.reason" :placeholder="$t('admin.users.adjust_reason')" />
          </UFormField>
          <div class="flex gap-2">
            <UButton block :loading="adjustLoading"
              :class="adjustForm.operation === 'add' ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-red-600/80 hover:bg-red-600 text-white'"
              @click="submitAdjust">
              {{ adjustForm.operation === 'add' ? '+' : '-' }} ${{ adjustForm.amount }}
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>

    <!-- Tree Modal -->
    <UModal v-model="showTree" :ui="{ width: 'sm:max-w-2xl' }">
      <UCard v-if="treeData">
        <template #header>
          <h3 class="text-white font-bold">{{ $t('admin.users.referral_tree') }} — {{ selectedUser?.email }}</h3>
        </template>
        <div class="space-y-4">
          <div v-if="treeData.parent" class="p-3 rounded-xl bg-slate-800/50 text-sm">
            <span class="text-slate-400">Parent: </span>
            <span class="text-white">{{ treeData.parent.full_name || treeData.parent.email }}</span>
          </div>
          <div v-for="(members, level) in { 'F1': treeData.f1, 'F2': treeData.f2, 'F3': treeData.f3 }" :key="level">
            <p class="text-slate-400 text-xs font-semibold mb-2">{{ level }} ({{ members.length }})</p>
            <div class="grid grid-cols-2 gap-2">
              <div v-for="m in members" :key="m.id" class="p-2 rounded-lg bg-slate-800/50 text-xs">
                <p class="text-white">{{ m.full_name || m.email }}</p>
                <p class="text-slate-500">{{ new Date(m.created_at).toLocaleDateString() }}</p>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Users - Admin' })

const toast = useToastCustom()
const { t } = useI18n()
const search = ref('')

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

const adjustForm = reactive({ amount: 0, reason: '', operation: 'add' as 'add' | 'subtract' })

const openAdjust = (user: any, operation: 'add' | 'subtract') => {
  selectedUser.value = user
  adjustForm.operation = operation
  adjustForm.amount = 0
  adjustForm.reason = ''
  showAdjust.value = true
}

const submitAdjust = async () => {
  if (!adjustForm.amount || !adjustForm.reason) {
    toast.error('Please fill in all fields')
    return
  }
  adjustLoading.value = true
  try {
    await $fetch(`/api/admin/users/${selectedUser.value.id}/adjust-balance`, {
      method: 'POST',
      body: { amount: adjustForm.amount, operation: adjustForm.operation, reason: adjustForm.reason }
    })
    toast.success('Balance adjusted successfully')
    showAdjust.value = false
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Failed to adjust balance')
  } finally {
    adjustLoading.value = false
  }
}

const viewTree = async (user: any) => {
  selectedUser.value = user
  const data = await $fetch(`/api/admin/users/${user.id}/tree`)
  treeData.value = data
  showTree.value = true
}

const toggleStatus = async (user: any) => {
  try {
    await $fetch(`/api/admin/users/${user.id}/toggle-status`, { method: 'POST' })
    toast.success('Status updated')
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || 'Failed to update status')
  }
}
</script>
