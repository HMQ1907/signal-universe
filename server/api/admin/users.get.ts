export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const search = query.search as string | undefined
  const page = Number(query.page || 1)
  const limit = Number(query.limit || 20)
  const offset = (page - 1) * limit

  const supabase = getSupabaseAdmin()
  let q = supabase
    .from('users')
    .select('id, email, full_name, balance, locked_capital, investment_package, first_deposit_at, referral_code, referred_by, is_active, is_admin, cccd_url, created_at', { count: 'exact' })
    .eq('is_admin', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    q = q.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
  }

  const { data, count } = await q
  return { data: data || [], total: count || 0, page, limit }
})
