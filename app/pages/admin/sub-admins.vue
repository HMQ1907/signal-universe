<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-white">{{ $t('admin.sub_admins.title') }}</h1>
        <p class="text-slate-500 text-sm mt-0.5">{{ $t('admin.sub_admins.subtitle') }}</p>
      </div>
      <UButton
        icon="i-heroicons-plus"
        color="primary"
        @click="showAdd = true"
      >
        {{ $t('admin.sub_admins.add') }}
      </UButton>
    </div>

    <!-- Permission info card -->
    <div class="su-card mb-5 border border-indigo-500/20 bg-indigo-500/4">
      <div class="flex items-start gap-3">
        <UIcon name="i-heroicons-information-circle" class="text-indigo-400 text-xl shrink-0 mt-0.5" />
        <div class="space-y-1 text-sm">
          <p class="text-white font-semibold">{{ $t('admin.sub_admins.permissions_title') }}</p>
          <ul class="text-slate-400 space-y-0.5 list-none">
            <li v-for="p in permissions" :key="p" class="flex items-center gap-1.5">
              <UIcon :name="p.icon" class="text-xs shrink-0" :class="p.allowed ? 'text-green-400' : 'text-red-400'" />
              <span>{{ p.label }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="su-card overflow-x-auto">
      <table class="su-table">
        <thead>
          <tr>
            <th>{{ $t('admin.sub_admins.columns.id') }}</th>
            <th>{{ $t('admin.sub_admins.columns.name') }}</th>
            <th>{{ $t('admin.sub_admins.columns.email') }}</th>
            <th>{{ $t('admin.sub_admins.columns.status') }}</th>
            <th>{{ $t('admin.sub_admins.columns.last_login') }}</th>
            <th>{{ $t('admin.sub_admins.columns.added') }}</th>
            <th>{{ $t('common.action') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sa in subAdmins" :key="sa.id">
            <td class="text-slate-500 text-xs font-mono">#{{ sa.id }}</td>
            <td class="text-white font-medium">{{ sa.full_name || '—' }}</td>
            <td class="text-slate-300 text-sm">{{ sa.email }}</td>
            <td>
              <UBadge
                :label="sa.is_active ? $t('common.active') : $t('common.disabled')"
                :color="sa.is_active ? 'green' : 'red'"
                variant="soft"
                size="sm"
              />
            </td>
            <td class="text-slate-400 text-xs">
              {{ sa.last_login_at ? new Date(sa.last_login_at).toLocaleString() : '—' }}
            </td>
            <td class="text-slate-400 text-xs">{{ new Date(sa.created_at).toLocaleDateString() }}</td>
            <td>
              <UTooltip :text="$t('admin.sub_admins.revoke')">
                <UButton
                  size="xs"
                  icon="i-heroicons-shield-exclamation"
                  color="error"
                  variant="ghost"
                  :loading="removingId === sa.id"
                  @click="confirmRevoke(sa)"
                />
              </UTooltip>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!subAdmins.length" class="text-center py-12 text-slate-500">
        <UIcon name="i-heroicons-shield-check" class="text-4xl mb-3 text-slate-600" />
        <p class="text-sm">{{ $t('admin.sub_admins.empty') }}</p>
      </div>
    </div>

    <!-- Add Sub Admin Modal -->
    <UModal v-model:open="showAdd" :title="$t('admin.sub_admins.add')" :description="$t('admin.sub_admins.add_hint')">
      <template #body>
        <div>
          <p class="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Email</p>
          <input v-model="addEmail" type="email" placeholder="user@example.com"
            class="w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
            @keydown.enter="submitAdd" />
        </div>
      </template>
      <template #footer>
        <div class="flex gap-3 w-full">
          <UButton block color="neutral" variant="ghost" @click="showAdd = false">{{ $t('common.cancel') }}</UButton>
          <UButton block color="primary" :loading="addLoading" @click="submitAdd">{{ $t('admin.sub_admins.grant') }}</UButton>
        </div>
      </template>
    </UModal>

    <!-- Revoke confirm modal -->
    <UModal v-model:open="showRevoke" :title="$t('admin.sub_admins.revoke_title')" :description="revokingUser?.email">
      <template #body>
        <p class="text-slate-400 text-sm">{{ $t('admin.sub_admins.revoke_confirm') }}</p>
      </template>
      <template #footer>
        <div class="flex gap-3 w-full">
          <UButton block color="neutral" variant="ghost" @click="showRevoke = false">{{ $t('common.cancel') }}</UButton>
          <UButton block color="error" :loading="revokeLoading" @click="doRevoke">{{ $t('admin.sub_admins.revoke') }}</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin', 'main-admin'] })
useHead({ title: 'Sub Admins - Admin' })

const toast = useToastCustom()
const { t } = useI18n()

const { data: saData, refresh } = await useFetch('/api/admin/sub-admins')
const subAdmins = computed(() => saData.value?.data || [])

const permissions = computed(() => [
  { icon: 'i-heroicons-check', allowed: true, label: t('admin.sub_admins.perm.view_deposits') },
  { icon: 'i-heroicons-check', allowed: true, label: t('admin.sub_admins.perm.view_withdrawals') },
  { icon: 'i-heroicons-check', allowed: true, label: t('admin.sub_admins.perm.view_transactions') },
  { icon: 'i-heroicons-check', allowed: true, label: t('admin.sub_admins.perm.view_users') },
  { icon: 'i-heroicons-check', allowed: true, label: t('admin.sub_admins.perm.view_tree') },
  { icon: 'i-heroicons-check', allowed: true, label: t('admin.sub_admins.perm.approve_withdraw') },
  { icon: 'i-heroicons-check', allowed: true, label: t('admin.sub_admins.perm.view_wallets') },
  { icon: 'i-heroicons-x-mark', allowed: false, label: t('admin.sub_admins.perm.no_edit_wallets') },
  { icon: 'i-heroicons-x-mark', allowed: false, label: t('admin.sub_admins.perm.no_adjust_balance') },
  { icon: 'i-heroicons-x-mark', allowed: false, label: t('admin.sub_admins.perm.no_delete_tx') },
  { icon: 'i-heroicons-x-mark', allowed: false, label: t('admin.sub_admins.perm.no_signals') },
  { icon: 'i-heroicons-x-mark', allowed: false, label: t('admin.sub_admins.perm.no_settings') }
])

// Add
const showAdd = ref(false)
const addEmail = ref('')
const addLoading = ref(false)

const submitAdd = async () => {
  if (!addEmail.value.trim()) return
  addLoading.value = true
  try {
    await $fetch('/api/admin/sub-admins', {
      method: 'POST',
      body: { email: addEmail.value.trim() }
    })
    toast.success(t('admin.sub_admins.add_success'))
    showAdd.value = false
    addEmail.value = ''
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || t('admin.sub_admins.add_failed'))
  } finally {
    addLoading.value = false
  }
}

// Revoke
const showRevoke = ref(false)
const revokeLoading = ref(false)
const revokingUser = ref<any>(null)
const removingId = ref<number | null>(null)

const confirmRevoke = (sa: any) => {
  revokingUser.value = sa
  showRevoke.value = true
}

const doRevoke = async () => {
  if (!revokingUser.value) return
  revokeLoading.value = true
  removingId.value = revokingUser.value.id
  try {
    await $fetch(`/api/admin/sub-admins/${revokingUser.value.id}`, { method: 'DELETE' })
    toast.success(t('admin.sub_admins.revoke_success'))
    showRevoke.value = false
    revokingUser.value = null
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.message || t('admin.sub_admins.revoke_failed'))
  } finally {
    revokeLoading.value = false
    removingId.value = null
  }
}
</script>
