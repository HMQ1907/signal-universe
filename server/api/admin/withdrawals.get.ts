export default defineEventHandler(async (event) => {
  await requireAdminOrSubAdmin(event)
  const query = getQuery(event)
  const type = query.type as string || 'all'
  const status = query.status as string || 'pending'
  const page = Number(query.page || 1)
  const limit = Number(query.limit || 20)
  const offset = (page - 1) * limit

  const supabase = getSupabaseAdmin()

  let q = supabase
    .from('transactions')
    .select('*, user:users!transactions_user_id_fkey(email, full_name)', { count: 'exact' })
    .eq('status', status)

  if (type === 'all') {
    q = q.in('type', ['withdraw_profit', 'withdraw_capital'])
  } else {
    const txType = type === 'capital' ? 'withdraw_capital' : 'withdraw_profit'
    q = q.eq('type', txType)
  }

  const { data, count, error } = await q
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return { data: data || [], total: count || 0 }
})
