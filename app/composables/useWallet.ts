export const useWallet = () => {
  const toast = useToastCustom()

  const getSettings = () => useFetch('/api/wallet/settings')

  const deposit = async (amount: number, packageSelected: number) => {
    return await $fetch('/api/wallet/deposit', {
      method: 'POST',
      body: { amount, package_selected: packageSelected }
    })
  }

  const withdraw = async (amount: number, withdrawAddress: string, type: 'withdraw_profit' | 'withdraw_capital') => {
    return await $fetch('/api/wallet/withdraw', {
      method: 'POST',
      body: { amount, withdraw_address: withdrawAddress, type }
    })
  }

  const getHistory = (type?: string, page: number = 1) => {
    return useFetch('/api/wallet/history', { query: { type, page, limit: 20 } })
  }

  return { getSettings, deposit, withdraw, getHistory }
}
