export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const page = Number(query.page || 1)
  const limit = Number(query.limit || 20)
  const offset = (page - 1) * limit

  const supabase = getSupabaseAdmin()
  const { data, count } = await supabase
    .from('users')
    .select('id, email, full_name, cccd_url, created_at', { count: 'exact' })
    .not('cccd_url', 'is', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return { data: data || [], total: count || 0 }
})
