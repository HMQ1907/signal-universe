/** Max referral depth per request (safety). */
const MAX_REFERRAL_DEPTH = 100
/** PostgREST `in` list size guard */
const DEPOSIT_QUERY_CHUNK = 120

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const supabase = getSupabaseAdmin()
  const rootId = Number(user.id)

  /** Sum of completed `deposit` transactions only (excludes profit, referral bonus, admin_adjust). */
  const totalDepositsByUserIds = async (userIds: number[]) => {
    if (!userIds.length) return {} as Record<number, number>
    const totals: Record<number, number> = {}
    for (let i = 0; i < userIds.length; i += DEPOSIT_QUERY_CHUNK) {
      const chunk = userIds.slice(i, i + DEPOSIT_QUERY_CHUNK)
      const { data } = await supabase
        .from('transactions')
        .select('user_id, amount')
        .in('user_id', chunk)
        .eq('type', 'deposit')
        .eq('status', 'completed')

      for (const t of data || []) {
        const uid = Number(t.user_id)
        totals[uid] = (totals[uid] || 0) + Number(t.amount)
      }
    }
    return totals
  }

  type Row = {
    id: number
    email: string
    full_name: string | null
    investment_package: string | null
    created_at: string
    referred_by: number | null
  }

  let frontier: number[] = [rootId]
  const membersFlat: Array<Row & { level: number }> = []

  for (let depth = 0; depth < MAX_REFERRAL_DEPTH; depth++) {
    const { data: children, error } = await supabase
      .from('users')
      .select('id, email, full_name, investment_package, created_at, referred_by')
      .in('referred_by', frontier)
      .order('created_at', { ascending: false })

    if (error) throw createError({ statusCode: 500, message: error.message })
    if (!children?.length) break

    const level = depth + 1
    for (const m of children as Row[]) {
      membersFlat.push({ ...m, level })
    }
    frontier = children.map(c => Number(c.id))
  }

  const allIds = membersFlat.map(m => Number(m.id))
  const deposits = await totalDepositsByUserIds(allIds)

  let networkTotalDeposit = 0
  for (const id of allIds) {
    networkTotalDeposit += deposits[id] || 0
  }

  const countByLevel: Record<number, number> = {}
  for (const m of membersFlat) {
    countByLevel[m.level] = (countByLevel[m.level] || 0) + 1
  }

  const by_level = Object.entries(countByLevel)
    .map(([level, count]) => ({ level: Number(level), count }))
    .sort((a, b) => a.level - b.level)

  const membersWithTotals = membersFlat.map(m => ({
    ...m,
    total_deposited: deposits[Number(m.id)] || 0
  }))

  membersWithTotals.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level
    const an = (a.full_name || '').trim().toLowerCase() || a.email.toLowerCase()
    const bn = (b.full_name || '').trim().toLowerCase() || b.email.toLowerCase()
    return an.localeCompare(bn)
  })

  return {
    members: membersWithTotals,
    stats: {
      by_level,
      total: membersFlat.length,
      network_total_deposit: networkTotalDeposit
    }
  }
})
