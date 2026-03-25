import { getMondayOfWeek } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const week = query.week as string || getMondayOfWeek()

  const supabase = getSupabaseAdmin()
  const { data, count } = await supabase
    .from('leader_bonus_records')
    .select('*, user:users(email, full_name)', { count: 'exact' })
    .eq('week_start', week)
    .order('leader_level', { ascending: false })

  return { data: data || [], total: count || 0, week }
})
