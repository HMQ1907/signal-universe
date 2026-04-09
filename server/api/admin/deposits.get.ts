export default defineEventHandler(async (event) => {
  await requireAdminOrSubAdmin(event)
  const query = getQuery(event)
  const status = query.status as string || 'pending'
  const page = Number(query.page || 1)
  const limit = Number(query.limit || 20)
  const offset = (page - 1) * limit

  const supabase = getSupabaseAdmin()
  const { data, count } = await supabase
    .from('transactions')
    .select('*, user:users(email, full_name, referral_code)', { count: 'exact' })
    .eq('type', 'deposit')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return { data: data || [], total: count || 0 }
})
