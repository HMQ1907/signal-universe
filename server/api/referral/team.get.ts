export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const supabase = getSupabaseAdmin()

  const { data: f1Members } = await supabase
    .from('users')
    .select('id, email, full_name, investment_package, created_at')
    .eq('referred_by', user.id)
    .order('created_at', { ascending: false })

  const f1Ids = f1Members?.map(m => m.id) || []

  let f2Members: any[] = []
  let f3Members: any[] = []

  if (f1Ids.length > 0) {
    const { data: f2 } = await supabase
      .from('users')
      .select('id, email, full_name, investment_package, created_at, referred_by')
      .in('referred_by', f1Ids)
      .order('created_at', { ascending: false })

    f2Members = f2 || []
    const f2Ids = f2Members.map(m => m.id)

    if (f2Ids.length > 0) {
      const { data: f3 } = await supabase
        .from('users')
        .select('id, email, full_name, investment_package, created_at, referred_by')
        .in('referred_by', f2Ids)
        .order('created_at', { ascending: false })

      f3Members = f3 || []
    }
  }

  const totalDeposits = async (userIds: number[]) => {
    if (!userIds.length) return {}
    const { data } = await supabase
      .from('transactions')
      .select('user_id, amount')
      .in('user_id', userIds)
      .eq('type', 'deposit')
      .eq('status', 'completed')

    const totals: Record<number, number> = {}
    for (const t of data || []) {
      totals[t.user_id] = (totals[t.user_id] || 0) + t.amount
    }
    return totals
  }

  const allIds = [...f1Ids, ...f2Members.map(m => m.id), ...f3Members.map(m => m.id)]
  const deposits = await totalDeposits(allIds)

  return {
    f1: f1Members?.map(m => ({ ...m, total_deposited: deposits[m.id] || 0, level: 1 })) || [],
    f2: f2Members.map(m => ({ ...m, total_deposited: deposits[m.id] || 0, level: 2 })),
    f3: f3Members.map(m => ({ ...m, total_deposited: deposits[m.id] || 0, level: 3 })),
    stats: {
      f1_count: f1Members?.length || 0,
      f2_count: f2Members.length,
      f3_count: f3Members.length,
      total: (f1Members?.length || 0) + f2Members.length + f3Members.length
    }
  }
})
