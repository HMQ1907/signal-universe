import { getSupabaseAdmin, requireAuth } from '~~/server/utils/supabase'

interface DepositItem {
  id: number
  amount: number
  createdAt: string
  txHash: string | null
}

interface UserDepositHistory {
  userId: number
  parentUserId?: number
  email: string | null
  phone: string | null
  fullName: string | null
  deposits: DepositItem[]
  totalDeposited: number
}

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const supabase = getSupabaseAdmin()

  const { data: directReferrals, error: f1Error } = await supabase
    .from('referrals')
    .select(
      `
      referred_id,
      referred:referred_id (
        id,
        email,
        phone,
        full_name
      )
    `
    )
    .eq('referrer_id', user.id)

  if (f1Error) {
    throw createError({ statusCode: 500, message: 'Failed to load F1 referrals' })
  }

  const f1Rows = (directReferrals || []) as any[]
  const f1UserIds = Array.from(
    new Set(
      f1Rows
        .map((row) => Number(row.referred_id))
        .filter((id) => Number.isFinite(id))
    )
  )

  let f2Rows: any[] = []
  if (f1UserIds.length > 0) {
    const { data: secondLevelReferrals, error: f2Error } = await supabase
      .from('referrals')
      .select(
        `
        referrer_id,
        referred_id,
        referred:referred_id (
          id,
          email,
          phone,
          full_name
        )
      `
      )
      .in('referrer_id', f1UserIds as any)

    if (f2Error) {
      throw createError({ statusCode: 500, message: 'Failed to load F2 referrals' })
    }

    f2Rows = (secondLevelReferrals || []) as any[]
  }

  const allUserIds = Array.from(
    new Set([
      Number(user.id),
      ...f1UserIds,
      ...f2Rows.map((row) => Number(row.referred_id)).filter((id) => Number.isFinite(id)),
    ])
  )

  const depositsByUser = new Map<number, DepositItem[]>()
  if (allUserIds.length > 0) {
    const { data: deposits, error: depositError } = await supabase
      .from('transactions')
      .select('id, user_id, amount, created_at, tx_hash')
      .eq('type', 'deposit')
      .eq('status', 'completed')
      .in('user_id', allUserIds as any)
      .order('created_at', { ascending: false })

    if (depositError) {
      throw createError({ statusCode: 500, message: 'Failed to load deposit history' })
    }

    for (const row of (deposits || []) as any[]) {
      const uid = Number(row.user_id)
      if (!depositsByUser.has(uid)) depositsByUser.set(uid, [])
      depositsByUser.get(uid)!.push({
        id: Number(row.id),
        amount: Number(row.amount || 0),
        createdAt: row.created_at,
        txHash: row.tx_hash || null,
      })
    }
  }

  const sumDeposits = (items: DepositItem[]) => items.reduce((sum, item) => sum + Number(item.amount || 0), 0)

  const ownDeposits = depositsByUser.get(Number(user.id)) || []

  const f1: UserDepositHistory[] = f1Rows.map((row) => {
    const uid = Number(row.referred_id)
    const deposits = depositsByUser.get(uid) || []
    const referred = row.referred as any
    return {
      userId: uid,
      email: referred?.email || null,
      phone: referred?.phone || null,
      fullName: referred?.full_name || null,
      deposits,
      totalDeposited: sumDeposits(deposits),
    }
  })

  const f2: UserDepositHistory[] = f2Rows.map((row) => {
    const uid = Number(row.referred_id)
    const deposits = depositsByUser.get(uid) || []
    const referred = row.referred as any
    return {
      userId: uid,
      parentUserId: Number(row.referrer_id),
      email: referred?.email || null,
      phone: referred?.phone || null,
      fullName: referred?.full_name || null,
      deposits,
      totalDeposited: sumDeposits(deposits),
    }
  })

  const f1Total = f1.reduce((sum, item) => sum + item.totalDeposited, 0)
  const f2Total = f2.reduce((sum, item) => sum + item.totalDeposited, 0)

  return {
    own: {
      userId: Number(user.id),
      email: user.email || null,
      phone: user.phone || null,
      fullName: user.full_name || null,
      deposits: ownDeposits,
      totalDeposited: sumDeposits(ownDeposits),
    },
    f1,
    f2,
    summary: {
      f1Count: f1.length,
      f2Count: f2.length,
      f1Total,
      f2Total,
      networkTotal: f1Total + f2Total,
    },
  }
})
