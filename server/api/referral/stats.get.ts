import { getLeaderLevel, getLeaderBonus } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const supabase = getSupabaseAdmin()

  const { count: f1Count } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('referred_by', user.id)

  const directF1 = f1Count || 0
  const leaderLevel = getLeaderLevel(directF1)
  const leaderBonus = getLeaderBonus(leaderLevel)
  const nextLevel = leaderLevel < 5 ? leaderLevel + 1 : null
  const nextLevelThresholds = [10, 20, 50, 100, 200]
  const nextLevelF1Needed = nextLevel ? nextLevelThresholds[nextLevel - 1] - directF1 : 0

  const { data: depositReferral } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', user.id)
    .eq('type', 'deposit_referral')
    .eq('status', 'completed')

  const { data: signalReferral } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', user.id)
    .eq('type', 'signal_referral')
    .eq('status', 'completed')

  const totalDepositCommission = depositReferral?.reduce((s, t) => s + t.amount, 0) || 0
  const totalSignalCommission = signalReferral?.reduce((s, t) => s + t.amount, 0) || 0

  return {
    direct_f1: directF1,
    leader_level: leaderLevel,
    leader_bonus_weekly: leaderBonus,
    next_level: nextLevel,
    next_level_f1_needed: Math.max(0, nextLevelF1Needed),
    total_deposit_commission: totalDepositCommission,
    total_signal_commission: totalSignalCommission,
    referral_code: user.referral_code
  }
})
