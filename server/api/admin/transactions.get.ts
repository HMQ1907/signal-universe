export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const tab = query.tab as string || 'deposit_referral'
  const page = Number(query.page || 1)
  const limit = Number(query.limit || 30)
  const offset = (page - 1) * limit

  const supabase = getSupabaseAdmin()

  const typeMap: Record<string, string[]> = {
    deposit_referral: ['deposit', 'deposit_referral', 'withdraw_profit', 'withdraw_capital', 'admin_adjust'],
    signal_compound: ['signal_profit', 'signal_referral']
  }

  const types = typeMap[tab] || typeMap.deposit_referral

  const { data, count } = await supabase
    .from('transactions')
    .select('*, user:users(email, full_name), from_user:users!transactions_from_user_id_fkey(email, full_name)', { count: 'exact' })
    .in('type', types)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return { data: data || [], total: count || 0 }
})
