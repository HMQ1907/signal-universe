/**
 * One fixed "daily" session per calendar day (00:00–14:59 app local time for confirm window).
 * Rows are ensured automatically — admins do not create sessions manually.
 */
export async function ensureDailySignalSessionForDate(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  sessionDate: string
) {
  const { data: existing } = await supabase
    .from('signal_sessions')
    .select('id')
    .eq('session_date', sessionDate)
    .eq('time_window', 'daily')
    .maybeSingle()

  if (existing) return

  const { error } = await supabase.from('signal_sessions').insert({
    session_date: sessionDate,
    time_window: 'daily',
    status: 'open'
  } as Record<string, unknown>)

  if (error && error.code !== '23505') {
    console.error('[signal_sessions] ensure insert:', error.message)
  }
}
