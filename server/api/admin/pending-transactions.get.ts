import { requireAdmin, getSupabaseAdmin } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const supabase = getSupabaseAdmin()

  // Fetch pending deposits and withdrawals in parallel
  const [depositsResult, withdrawalsResult] = await Promise.all([
    supabase
      .from('transactions')
      .select(`
        *,
        user:users!transactions_user_id_fkey (
          id, email, phone, full_name, balance, referral_code, referred_by
        )
      `)
      .eq('type', 'deposit')
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
    supabase
      .from('transactions')
      .select(`
        *,
        user:users!transactions_user_id_fkey (
          id, email, full_name, balance, locked_capital, referral_code, referred_by, first_deposit_at
        )
      `)
      .in('type', ['withdraw_profit', 'withdraw_capital'])
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
  ])

  if (depositsResult.error) console.error('Deposits error:', depositsResult.error)
  if (withdrawalsResult.error) console.error('Withdrawals error:', withdrawalsResult.error)

  const allTransactions = [
    ...(depositsResult.data || []),
    ...(withdrawalsResult.data || [])
  ]

  // Batch-enrich referral hierarchy (2 queries instead of 2N)
  await batchEnrichHierarchy(supabase, allTransactions)

  return {
    deposits: depositsResult.data || [],
    withdrawals: withdrawalsResult.data || []
  }
})

/**
 * Batch-enrich referral hierarchy for all transactions.
 * Collects all unique referred_by IDs, fetches parents in 1 query,
 * then fetches grandparents in 1 query.
 */
async function batchEnrichHierarchy(supabase: any, transactions: any[]): Promise<void> {
  // Collect unique referred_by values (these are user IDs)
  const referredByIds = new Set<number>()
  for (const tx of transactions) {
    if (tx.user?.referred_by) {
      referredByIds.add(tx.user.referred_by)
    }
  }

  if (referredByIds.size === 0) {
    // No referrals to look up — set empty hierarchy
    for (const tx of transactions) {
      if (tx.user) tx.user.referral_hierarchy = {}
    }
    return
  }

  // Query 1: Fetch all parents by ID
  const { data: parents } = await supabase
    .from('users')
    .select('id, email, phone, referred_by')
    .in('id', Array.from(referredByIds))

  const parentMap = new Map<number, any>()
  const grandparentIds = new Set<number>()
  for (const p of (parents || [])) {
    parentMap.set(p.id, p)
    if (p.referred_by) grandparentIds.add(p.referred_by)
  }

  // Query 2: Fetch all grandparents by ID
  const grandparentMap = new Map<number, any>()
  if (grandparentIds.size > 0) {
    const { data: grandparents } = await supabase
      .from('users')
      .select('id, email, phone')
      .in('id', Array.from(grandparentIds))

    for (const gp of (grandparents || [])) {
      grandparentMap.set(gp.id, gp)
    }
  }

  // Assign hierarchy to each transaction
  for (const tx of transactions) {
    const hierarchy: { parent?: string; grandparent?: string } = {}

    if (tx.user?.referred_by) {
      const parent = parentMap.get(tx.user.referred_by)
      if (parent) {
        hierarchy.parent = parent.email || parent.phone || `User #${parent.id}`
        if (parent.referred_by) {
          const gp = grandparentMap.get(parent.referred_by)
          if (gp) {
            hierarchy.grandparent = gp.email || gp.phone || `User #${gp.id}`
          }
        }
      }
    }

    if (tx.user) tx.user.referral_hierarchy = hierarchy
  }
}
