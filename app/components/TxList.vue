<template>
  <div class="su-card">
    <div v-if="items.length" class="divide-y divide-slate-800">
      <div
        v-for="tx in items"
        :key="tx.id"
        class="flex items-start justify-between gap-3 py-4 first:pt-0 last:pb-0"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            :class="iconBg(tx.type)"
          >
            <UIcon
              :name="icon(tx.type)"
              :class="iconColor(tx.type)"
              class="text-base"
            />
          </div>
          <div class="min-w-0">
            <p class="text-white text-sm font-medium">{{ label(tx.type) }}</p>
            <p class="text-slate-500 text-xs mt-0.5">
              {{ fmt(tx.created_at) }}
            </p>
            <p
              v-if="tx.tx_hash"
              class="text-indigo-400 text-xs font-mono truncate max-w-[200px] mt-0.5"
            >
              TX: {{ tx.tx_hash }}
            </p>
            <p
              v-if="tx.withdraw_address"
              class="text-slate-500 text-xs font-mono truncate max-w-[200px] mt-0.5"
            >
              Ví: {{ tx.withdraw_address }}
            </p>
            <p v-if="tx.network" class="text-xs mt-0.5">
              <span
                class="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                :class="
                  tx.network === 'BEP20'
                    ? 'bg-yellow-500/15 text-yellow-400'
                    : 'bg-red-500/15 text-red-400'
                "
              >
                {{ tx.network }}
              </span>
            </p>
          </div>
        </div>
        <div class="text-right shrink-0">
          <p
            class="font-bold text-sm"
            :class="isIncome(tx.type) ? 'text-green-400' : 'text-red-400'"
          >
            {{ isIncome(tx.type) ? "+" : "-" }}${{
              Number(tx.amount).toFixed(2)
            }}
          </p>
          <p v-if="tx.withdraw_fee" class="text-xs text-slate-500">
            phí: ${{ Number(tx.withdraw_fee).toFixed(2) }}
          </p>
          <UBadge
            :label="statusLabel(tx.status)"
            size="xs"
            :color="
              tx.status === 'completed'
                ? 'success'
                : tx.status === 'pending'
                  ? 'warning'
                  : 'error'
            "
            variant="soft"
            class="mt-1"
          />
        </div>
      </div>
    </div>
    <div v-else class="text-center py-14 text-slate-500">
      <UIcon name="i-heroicons-inbox" class="text-5xl mb-3 text-slate-700" />
      <p class="text-sm">Chưa có giao dịch nào</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ items: any[] }>();

const icon = (type: string) =>
  ({
    deposit: "i-heroicons-arrow-down-tray",
    withdraw_profit: "i-heroicons-arrow-up-tray",
    withdraw_capital: "i-heroicons-arrow-up-tray",
    signal_profit: "i-heroicons-signal",
    signal_referral: "i-heroicons-arrow-path",
    deposit_referral: "i-heroicons-users",
    admin_adjust: "i-heroicons-adjustments-horizontal",
  })[type] || "i-heroicons-banknotes";

const isIncome = (type: string) =>
  !["withdraw_profit", "withdraw_capital"].includes(type);

const iconBg = (type: string) =>
  isIncome(type) ? "bg-green-500/10" : "bg-red-500/10";
const iconColor = (type: string) =>
  isIncome(type) ? "text-green-400" : "text-red-400";

const label = (type: string) =>
  ({
    deposit: "Nạp tiền",
    withdraw_profit: "Rút lợi nhuận",
    withdraw_capital: "Rút vốn gốc (28 ngày)",
    signal_profit: "Lợi nhuận AI Signal",
    signal_referral: "Hoa hồng tín hiệu",
    deposit_referral: "Hoa hồng nạp tiền",
    admin_adjust: "Admin điều chỉnh",
  })[type] || type;

const statusLabel = (s: string) =>
  ({ pending: "Chờ duyệt", completed: "Hoàn thành", rejected: "Từ chối" })[s] ||
  s;
const fmt = (d: string) => new Date(d).toLocaleString("vi-VN");
</script>
