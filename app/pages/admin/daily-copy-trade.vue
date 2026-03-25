<template>
  <div class="p-3 sm:p-6">
    <div class="mb-4 sm:mb-8">
      <h1 class="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Copy Trade theo ngày</h1>
      <p class="text-gray-300 text-sm sm:text-base">Quản lý yêu cầu Copy Trade hàng ngày</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4">
        <div class="flex items-center gap-2 sm:gap-3">
          <div class="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="i-heroicons-users" class="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          </div>
          <div>
            <p class="text-gray-400 text-xs sm:text-sm">Tổng</p>
            <p class="text-lg sm:text-xl font-bold text-white">{{ stats.total }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4">
        <div class="flex items-center gap-2 sm:gap-3">
          <div class="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="i-heroicons-clock" class="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
          </div>
          <div>
            <p class="text-gray-400 text-xs sm:text-sm">Chờ duyệt</p>
            <p class="text-lg sm:text-xl font-bold text-yellow-500">{{ stats.pending }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4">
        <div class="flex items-center gap-2 sm:gap-3">
          <div class="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="i-heroicons-check-circle" class="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
          </div>
          <div>
            <p class="text-gray-400 text-xs sm:text-sm">Đã duyệt</p>
            <p class="text-lg sm:text-xl font-bold text-green-500">{{ stats.approved }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4">
        <div class="flex items-center gap-2 sm:gap-3">
          <div class="w-8 h-8 sm:w-10 sm:h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="i-heroicons-x-circle" class="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
          </div>
          <div>
            <p class="text-gray-400 text-xs sm:text-sm">Từ chối</p>
            <p class="text-lg sm:text-xl font-bold text-red-500">{{ stats.rejected }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
      <div class="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-4">
        <div class="flex items-center gap-2">
          <span class="text-gray-400 text-sm">Ngày:</span>
          <input
            v-model="selectedDate"
            type="date"
            class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        
        <div class="flex items-center gap-2">
          <span class="text-gray-400 text-sm">Trạng thái:</span>
          <select
            v-model="selectedStatus"
            class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
        
        <div class="hidden sm:block flex-1"></div>
        
        <div v-if="stats.pending > 0" class="flex items-center gap-2 w-full sm:w-auto">
          <UButton
            color="error"
            variant="outline"
            class="flex-1 sm:flex-initial"
            :loading="bulkRejecting"
            @click="bulkReject"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4 mr-1" />
            Từ chối ({{ stats.pending }})
          </UButton>
          <UButton
            color="primary"
            class="flex-1 sm:flex-initial"
            :loading="bulkApproving"
            @click="bulkApprove"
          >
            <UIcon name="i-heroicons-check" class="w-4 h-4 mr-1" />
            Duyệt ({{ stats.pending }})
          </UButton>
        </div>
      </div>
    </div>

    <!-- Requests -->
    <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">

      <!-- Mobile Card View -->
      <div class="lg:hidden">
        <div v-if="loading" class="p-8 text-center">
          <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
          <p class="text-gray-400 text-sm">Đang tải...</p>
        </div>
        <div v-else-if="requests.length === 0" class="p-8 text-center text-gray-400 text-sm">
          Không có yêu cầu nào
        </div>
        <div v-else class="divide-y divide-gray-800">
          <div v-for="(request, index) in requests" :key="'m-' + request.id" class="p-3 hover:bg-gray-800/50 transition-colors">
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="min-w-0">
                <p class="text-white font-medium text-sm truncate">{{ request.users?.full_name || 'N/A' }}</p>
                <p class="text-gray-400 text-xs truncate">{{ request.users?.email }}</p>
              </div>
              <span :class="getStatusClass(request.status)" class="px-2 py-0.5 rounded text-xs shrink-0">
                {{ getStatusText(request.status) }}
              </span>
            </div>
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mb-2">
              <span class="text-green-400">Số dư: ${{ formatNumber(request.users?.balance || 0) }}</span>
              <span class="bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">{{ request.time_window }}</span>
              <span class="text-amber-400 font-bold">+1%</span>
              <span class="text-gray-500">{{ formatDateTime(request.created_at) }}</span>
            </div>
            <div v-if="request.status === 'pending'" class="flex gap-2">
              <UButton size="xs" color="success" class="flex-1" :loading="processing === request.id" @click="processRequest(request.id, 'approve')">
                <UIcon name="i-heroicons-check" class="w-4 h-4 mr-1" /> Duyệt
              </UButton>
              <UButton size="xs" color="error" variant="outline" class="flex-1" :loading="processing === request.id" @click="processRequest(request.id, 'reject')">
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4 mr-1" /> Từ chối
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop Table View -->
      <div class="hidden lg:block overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-800">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">#</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Số dư</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Khung giờ</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Số tiền</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Trạng thái</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Thời gian</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800">
            <tr v-if="loading">
              <td colspan="8" class="px-4 py-8 text-center text-gray-400">
                <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin mx-auto mb-2" />
                Đang tải...
              </td>
            </tr>
            <tr v-else-if="requests.length === 0">
              <td colspan="8" class="px-4 py-8 text-center text-gray-400">
                Không có yêu cầu nào
              </td>
            </tr>
            <tr v-else v-for="(request, index) in requests" :key="request.id" class="hover:bg-gray-800/50">
              <td class="px-4 py-3 text-gray-400">{{ index + 1 }}</td>
              <td class="px-4 py-3">
                <div>
                  <p class="text-white font-medium">{{ request.users?.full_name || 'N/A' }}</p>
                  <p class="text-gray-400 text-sm">{{ request.users?.email }}</p>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="text-green-400 font-medium">${{ formatNumber(request.users?.balance || 0) }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-sm">
                  {{ request.time_window }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="text-amber-400 font-bold">+1%</span>
              </td>
              <td class="px-4 py-3">
                <span :class="getStatusClass(request.status)" class="px-2 py-1 rounded text-sm">
                  {{ getStatusText(request.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-400 text-sm">
                {{ formatDateTime(request.created_at) }}
              </td>
              <td class="px-4 py-3">
                <div v-if="request.status === 'pending'" class="flex items-center gap-2">
                  <UButton
                    size="xs"
                    color="success"
                    :loading="processing === request.id"
                    @click="processRequest(request.id, 'approve')"
                  >
                    <UIcon name="i-heroicons-check" class="w-4 h-4" />
                  </UButton>
                  <UButton
                    size="xs"
                    color="error"
                    variant="outline"
                    :loading="processing === request.id"
                    @click="processRequest(request.id, 'reject')"
                  >
                    <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
                  </UButton>
                </div>
                <span v-else class="text-gray-500 text-sm">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { user } = useAuth()
const toast = useToast()

// State
const loading = ref(false)
const requests = ref<any[]>([])
const stats = ref({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0
})
const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedStatus = ref('all')
const processing = ref<number | null>(null)
const bulkApproving = ref(false)
const bulkRejecting = ref(false)

// Fetch data
async function fetchData() {
  loading.value = true
  try {
    const data = await $fetch('/api/admin/daily-copy-trade', {
      params: {
        date: selectedDate.value,
        status: selectedStatus.value
      }
    })
    requests.value = data.requests
    stats.value = data.stats
  } catch (error) {
    console.error('Error fetching data:', error)
    toast.add({
      title: 'Lỗi',
      description: 'Không thể tải dữ liệu',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Process single request
async function processRequest(requestId: number, action: 'approve' | 'reject') {
  processing.value = requestId
  try {
    const response = await $fetch('/api/admin/daily-copy-trade', {
      method: 'POST',
      body: {
        requestId,
        action,
        adminId: user.value?.id
      }
    })
    
    toast.add({
      title: 'Thành công',
      description: response.message,
      color: 'success'
    })
    
    // Refresh data
    await fetchData()
  } catch (error: any) {
    toast.add({
      title: 'Lỗi',
      description: error.message || 'Không thể xử lý yêu cầu',
      color: 'error'
    })
  } finally {
    processing.value = null
  }
}

// Bulk approve
async function bulkApprove() {
  if (!confirm(`Bạn có chắc muốn duyệt tất cả ${stats.value.pending} yêu cầu? Tổng cộng sẽ cộng 1% số dư hiện tại của từng user.`)) {
    return
  }
  
  bulkApproving.value = true
  try {
    const response = await $fetch('/api/admin/daily-copy-trade-bulk', {
      method: 'POST',
      body: {
        adminId: user.value?.id,
        date: selectedDate.value
      }
    })
    
    toast.add({
      title: 'Thành công',
      description: response.message,
      color: 'success'
    })
    
    // Refresh data
    await fetchData()
  } catch (error: any) {
    toast.add({
      title: 'Lỗi',
      description: error.message || 'Không thể duyệt hàng loạt',
      color: 'error'
    })
  } finally {
    bulkApproving.value = false
  }
}

// Bulk reject
async function bulkReject() {
  if (!confirm(`Bạn có chắc muốn TỪ CHỐI tất cả ${stats.value.pending} yêu cầu?`)) {
    return
  }

  bulkRejecting.value = true
  try {
    const response = await $fetch('/api/admin/daily-copy-trade-bulk-reject', {
      method: 'POST',
      body: {
        adminId: user.value?.id,
        date: selectedDate.value
      }
    })

    toast.add({
      title: 'Thành công',
      description: response.message,
      color: 'success'
    })

    await fetchData()
  } catch (error: any) {
    toast.add({
      title: 'Lỗi',
      description: error.message || 'Không thể từ chối hàng loạt',
      color: 'error'
    })
  } finally {
    bulkRejecting.value = false
  }
}

// Helpers
function formatNumber(num: number): string {
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400'
    case 'approved':
      return 'bg-green-500/20 text-green-400'
    case 'rejected':
      return 'bg-red-500/20 text-red-400'
    default:
      return 'bg-gray-500/20 text-gray-400'
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'pending':
      return 'Chờ duyệt'
    case 'approved':
      return 'Đã duyệt'
    case 'rejected':
      return 'Từ chối'
    default:
      return status
  }
}

// Watch filters
watch([selectedDate, selectedStatus], () => {
  fetchData()
})

// Initial fetch
onMounted(() => {
  fetchData()
})
</script>
