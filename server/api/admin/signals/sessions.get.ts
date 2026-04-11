import { ensureDailySignalSessionForDate } from '~~/server/utils/signalSessions'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const date = query.date as string || new Date().toISOString().split('T')[0]

  const supabase = getSupabaseAdmin()
  await ensureDailySignalSessionForDate(supabase, date)

  const { data: sessions, error: sessionsErr } = await supabase
    .from('signal_sessions')
    .select('*')
    .eq('session_date', date)
    .order('time_window')

  if (sessionsErr) {
    throw createError({ statusCode: 500, message: sessionsErr.message })
  }

  const sessionIds = sessions?.map(s => s.id) || []
  let confirmations: any[] = []

  if (sessionIds.length > 0) {
    const { data, error: confErr } = await supabase
      .from('signal_confirmations')
      .select('*, user:users!signal_confirmations_user_id_fkey(email, full_name)')
      .in('session_id', sessionIds)
      .order('confirmed_at', { ascending: true })

    if (confErr) {
      throw createError({ statusCode: 500, message: confErr.message })
    }
    confirmations = data || []
  }

  return { sessions: sessions || [], confirmations }
})
