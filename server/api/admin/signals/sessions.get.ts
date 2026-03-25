export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const date = query.date as string || new Date().toISOString().split('T')[0]

  const supabase = getSupabaseAdmin()
  const { data: sessions } = await supabase
    .from('signal_sessions')
    .select('*')
    .eq('session_date', date)
    .order('time_window')

  const sessionIds = sessions?.map(s => s.id) || []
  let confirmations: any[] = []

  if (sessionIds.length > 0) {
    const { data } = await supabase
      .from('signal_confirmations')
      .select('*, user:users(email, full_name)')
      .in('session_id', sessionIds)
      .order('confirmed_at', { ascending: true })
    confirmations = data || []
  }

  return { sessions: sessions || [], confirmations }
})
