export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const supabase = getSupabaseAdmin()
  const today = new Date().toISOString().split('T')[0]

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
    .eq('user.id', user.id)
    .single()

  return {
    sessions: sessions || [],
    user_confirmations: userConfirmations,
    user_balance: user.balance,
    user_package: user.investment_package
  }
})
