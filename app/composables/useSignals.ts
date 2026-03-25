export const useSignals = () => {
  const toast = useToastCustom()

  const getSessions = () => useFetch('/api/signals/sessions', { key: 'signal-sessions' })

  const confirmSignal = async (sessionId: number) => {
    return await $fetch('/api/signals/confirm', {
      method: 'POST',
      body: { session_id: sessionId }
    })
  }

  const getHistory = (page: number = 1) => {
    return useFetch('/api/signals/history', { query: { page, limit: 20 } })
  }

  const getReferralStats = () => useFetch('/api/referral/stats', { key: 'referral-stats' })
  const getTeam = () => useFetch('/api/referral/team', { key: 'referral-team' })

  return { getSessions, confirmSignal, getHistory, getReferralStats, getTeam }
}
