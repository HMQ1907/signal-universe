import { roundMoney2 } from '~~/server/utils/helpers'
import { ensureDailySignalSessionForDate } from '~~/server/utils/signalSessions'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const supabase = getSupabaseAdmin()
  const today = new Date().toISOString().split('T')[0]

  await ensureDailySignalSessionForDate(supabase, today)

  const { data: sessions } = await supabase
    .from('signal_sessions')
    .select('*')
    .eq('session_date', today)
    .order('time_window', { ascending: true })

  const sessionIds = sessions?.map(s => s.id) || []
  let userConfirmations: Record<number, any> = {}

  if (sessionIds.length > 0) {
    const { data: confirmations } = await supabase
      .from('signal_confirmations')
      .select('*')
      .eq('user_id', user.id)
      .in('session_id', sessionIds)

    for (const c of confirmations || []) {
      userConfirmations[c.session_id] = c
    }
  }

  const { data: fullUser } = await supabase
    .from('users')
    .select('balance, locked_capital, investment_package')
    .eq('id', user.id)
    .single()

  const bal = fullUser?.balance ?? user.balance
  const locked = fullUser?.locked_capital ?? 0
  const userTotalBalance = roundMoney2(bal + locked)
  /** Fixed package from first deposit; AI eligibility uses this + min total $300 */
  const defiTier = fullUser?.investment_package ?? null

  return {
    sessions: sessions || [],
    user_confirmations: userConfirmations,
    user_balance: bal,
    user_locked_capital: locked,
    user_total_balance: userTotalBalance,
    defi_tier: defiTier,
    user_package: fullUser?.investment_package ?? user.investment_package
  }
})
