export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const supabase = getSupabaseAdmin()

  const { count: f1Count } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('referred_by', user.id)

  const directF1 = f1Count || 0

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
    total_deposit_commission: totalDepositCommission,
    total_signal_commission: totalSignalCommission,
    referral_code: user.referral_code
  }
})
