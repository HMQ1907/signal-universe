<template>
  <div class="container mx-auto px-4 py-6 sm:py-8">
    <div class="mb-6 sm:mb-8 flex items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-white mb-2">{{ t('referral.depositHistory.title') }}</h1>
        <p class="text-gray-400 text-sm sm:text-base">{{ t('referral.depositHistory.subtitle') }}</p>
      </div>
      <UButton to="/referral" color="neutral" variant="outline" size="sm">
        {{ t('common.back') }}
      </UButton>
    </div>

    <div v-if="pending" class="bg-gray-900 border border-gray-800 rounded-xl p-12 flex justify-center text-gray-500 mb-6">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
    </div>

    <div v-else-if="error" class="bg-gray-900 border border-red-800 rounded-xl p-6 text-red-300 mb-6">
      {{ t('referral.depositHistory.loadError') }}
    </div>

    <template v-else-if="data">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p class="text-gray-400 text-xs mb-1">{{ t('referral.depositHistory.yourTotal') }}</p>
          <p class="text-white text-xl font-bold">${{ formatCurrency(data.own.totalDeposited || 0) }}</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p class="text-gray-400 text-xs mb-1">{{ t('referral.depositHistory.f1Total') }}</p>
          <p class="text-white text-xl font-bold">${{ formatCurrency(data.summary.f1Total || 0) }}</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p class="text-gray-400 text-xs mb-1">{{ t('referral.depositHistory.f2Total') }}</p>
          <p class="text-white text-xl font-bold">${{ formatCurrency(data.summary.f2Total || 0) }}</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p class="text-gray-400 text-xs mb-1">{{ t('referral.depositHistory.networkTotal') }}</p>
          <p class="text-amber-400 text-xl font-bold">${{ formatCurrency(data.summary.networkTotal || 0) }}</p>
        </div>
      </div>

      <section class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-6">
        <div class="px-4 py-3 border-b border-gray-800">
          <h2 class="text-white font-semibold">{{ t('referral.depositHistory.yourHistory') }}</h2>
          <p class="text-xs text-gray-400 mt-1">{{ displayUser(data.own) }}</p>
        </div>

        <div v-if="!data.own.deposits.length" class="p-4 text-sm text-gray-500">{{ t('referral.depositHistory.noCompletedDeposits') }}</div>

        <div v-else class="divide-y divide-gray-800">
          <div v-for="item in data.own.deposits" :key="`own-${item.id}`" class="p-4 flex items-center justify-between gap-3">
            <div>
              <p class="text-white font-medium">${{ formatCurrency(item.amount) }}</p>
              <p class="text-xs text-gray-500">{{ formatDate(item.createdAt) }}</p>
            </div>
            <p class="text-xs text-gray-500 truncate max-w-55" v-if="item.txHash">{{ t('referral.depositHistory.txLabel') }}: {{ item.txHash }}</p>
          </div>
        </div>
      </section>

      <section class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-6">
        <div class="px-4 py-3 border-b border-gray-800">
          <h2 class="text-white font-semibold">{{ t('referral.depositHistory.f1History') }}</h2>
          <p class="text-xs text-gray-400 mt-1">{{ t('referral.depositHistory.f1Accounts', { count: data.summary.f1Count }) }}</p>
        </div>

        <div v-if="!data.f1.length" class="p-4 text-sm text-gray-500">{{ t('referral.depositHistory.noF1Users') }}</div>

        <div v-else class="divide-y divide-gray-800">
          <details v-for="userItem in data.f1" :key="`f1-${userItem.userId}`" class="group" open>
            <summary class="list-none cursor-pointer p-4 hover:bg-gray-800/40 transition-colors">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-white font-medium">{{ displayUser(userItem) }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ t('referral.depositHistory.successfulDeposits', { count: userItem.deposits.length }) }}</p>
                </div>
                <p class="text-green-400 font-semibold">${{ formatCurrency(userItem.totalDeposited) }}</p>
              </div>
            </summary>
            <div class="px-4 pb-4">
              <div v-if="!userItem.deposits.length" class="text-xs text-gray-500">{{ t('referral.depositHistory.userNoCompletedDeposits') }}</div>
              <div v-else class="space-y-2">
                <div v-for="item in userItem.deposits" :key="`f1-${userItem.userId}-${item.id}`" class="bg-gray-800/60 rounded-lg p-3 flex items-center justify-between gap-3">
                  <div>
                    <p class="text-white text-sm">${{ formatCurrency(item.amount) }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(item.createdAt) }}</p>
                  </div>
                  <p class="text-xs text-gray-500 truncate max-w-55" v-if="item.txHash">{{ t('referral.depositHistory.txLabel') }}: {{ item.txHash }}</p>
                </div>
              </div>
            </div>
          </details>
        </div>
      </section>

      <section class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-800">
          <h2 class="text-white font-semibold">{{ t('referral.depositHistory.f2History') }}</h2>
          <p class="text-xs text-gray-400 mt-1">{{ t('referral.depositHistory.f2Accounts', { count: data.summary.f2Count }) }}</p>
        </div>

        <div v-if="!data.f2.length" class="p-4 text-sm text-gray-500">{{ t('referral.depositHistory.noF2Users') }}</div>

        <div v-else class="divide-y divide-gray-800">
          <details v-for="userItem in data.f2" :key="`f2-${userItem.userId}-${userItem.parentUserId}`" class="group">
            <summary class="list-none cursor-pointer p-4 hover:bg-gray-800/40 transition-colors">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-white font-medium">{{ displayUser(userItem) }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ t('referral.depositHistory.belongsToF1', { name: parentName(userItem.parentUserId) }) }}</p>
                </div>
                <p class="text-amber-400 font-semibold">${{ formatCurrency(userItem.totalDeposited) }}</p>
              </div>
            </summary>
            <div class="px-4 pb-4">
              <div v-if="!userItem.deposits.length" class="text-xs text-gray-500">{{ t('referral.depositHistory.userNoCompletedDeposits') }}</div>
              <div v-else class="space-y-2">
                <div v-for="item in userItem.deposits" :key="`f2-${userItem.userId}-${item.id}`" class="bg-gray-800/60 rounded-lg p-3 flex items-center justify-between gap-3">
                  <div>
                    <p class="text-white text-sm">${{ formatCurrency(item.amount) }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(item.createdAt) }}</p>
                  </div>
                  <p class="text-xs text-gray-500 truncate max-w-55" v-if="item.txHash">{{ t('referral.depositHistory.txLabel') }}: {{ item.txHash }}</p>
                </div>
              </div>
            </div>
          </details>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()

type DepositItem = {
  id: number
  amount: number
  createdAt: string
  txHash: string | null
}

type UserDepositHistory = {
  userId: number
  parentUserId?: number
  email: string | null
  phone: string | null
  fullName: string | null
  deposits: DepositItem[]
  totalDeposited: number
}

type DepositHistoryResponse = {
  own: UserDepositHistory
  f1: UserDepositHistory[]
  f2: UserDepositHistory[]
  summary: {
    f1Count: number
    f2Count: number
    f1Total: number
    f2Total: number
    networkTotal: number
  }
}

const { data, pending, error } = useFetch<DepositHistoryResponse>('/api/referral/deposit-history', { lazy: true })

const f1ById = computed(() => {
  const map = new Map<number, UserDepositHistory>()
  for (const row of data.value?.f1 || []) {
    map.set(Number(row.userId), row)
  }
  return map
})

function displayUser(user: { fullName: string | null; email: string | null; phone: string | null; userId: number }) {
  if (user.fullName && user.fullName.trim()) return `${user.fullName} (${user.email || user.phone || `#${user.userId}`})`
  return user.email || user.phone || `User #${user.userId}`
}

function parentName(parentUserId?: number) {
  if (!parentUserId) return '-'
  const parent = f1ById.value.get(Number(parentUserId))
  if (!parent) return `User #${parentUserId}`
  return displayUser(parent)
}

function formatCurrency(value: number) {
  const localeName = locale.value === 'vi' ? 'vi-VN' : 'en-US'
  return Number(value || 0).toLocaleString(localeName)
}

function formatDate(value: string) {
  const localeName = locale.value === 'vi' ? 'vi-VN' : 'en-US'
  return new Intl.DateTimeFormat(localeName, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
</script>
