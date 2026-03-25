export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)
  const page = Number(query.page || 1)
  const limit = Number(query.limit || 20)
  const offset = (page - 1) * limit

  const supabase = getSupabaseAdmin()
  const { data, count } = await supabase
    .from('signal_confirmations')
    .select('*, session:signal_sessions(session_date, time_window)', { count: 'exact' })
    .eq('user_id', user.id)
    .order('confirmed_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return { data: data || [], total: count || 0, page, limit }
})
