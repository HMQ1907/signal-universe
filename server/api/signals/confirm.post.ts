import { z } from 'zod'
import { isDailyAiConfirmWindowOpen, packageTierFromFirstDepositAmount, roundMoney2 } from '~~/server/utils/helpers'

const schema = z.object({
  session_id: z.number()
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' })
  }

  const supabase = getSupabaseAdmin()
  const { data: session } = await supabase
    .from('signal_sessions')
    .select('*')
    .eq('id', parsed.data.session_id)
    .single()

  if (!session) throw createError({ statusCode: 404, message: 'Session not found' })
  if (session.status !== 'open') throw createError({ statusCode: 400, message: 'Session is not open' })

  const today = new Date().toISOString().split('T')[0]
  if (session.session_date !== today) {
    throw createError({ statusCode: 400, message: 'Session is not for today' })
  }

  if (!isDailyAiConfirmWindowOpen()) {
    const test = process.env.TEST_AI === 'true'
    throw createError({
      statusCode: 400,
      message: test
        ? 'AI confirm window is closed (open 00:00–22:50)'
        : 'AI confirm window is closed (open 00:00–14:00)'
    })
  }

  const { data: fullUser } = await supabase
    .from('users')
    .select('balance, locked_capital, investment_package')
    .eq('id', user.id)
    .single()

  if (!fullUser) {
    throw createError({ statusCode: 400, message: 'User not found' })
  }

  const totalBalance = roundMoney2((fullUser.balance || 0) + (fullUser.locked_capital || 0))
  if (totalBalance < 300) {
    throw createError({ statusCode: 400, message: 'Minimum $300 total balance required for AI confirm' })
  }

  const testAi = process.env.TEST_AI === 'true'
  let packageTier = fullUser.investment_package as number | null
  if (!packageTier) {
    if (testAi) {
      const derived = packageTierFromFirstDepositAmount(totalBalance)
      if (derived == null) {
        throw createError({ statusCode: 400, message: 'Minimum $300 total balance required for AI confirm' })
      }
      packageTier = derived
    } else {
      throw createError({ statusCode: 400, message: 'Investment package not set (complete first deposit first)' })
    }
  }

  const { data: existing } = await supabase
    .from('signal_confirmations')
    .select('id')
    .eq('user_id', user.id)
    .eq('session_id', session.id)
    .single()

  if (existing) throw createError({ statusCode: 400, message: 'Already confirmed this session' })

  /** Session profit credited on admin approval = 2% of total balance (profit + locked) at confirm time. */
  const sessionProfitAmount = roundMoney2(totalBalance * 0.02)

  const { error } = await supabase.from('signal_confirmations').insert({
    user_id: user.id,
    session_id: session.id,
    amount: sessionProfitAmount,
    package_tier: packageTier,
    balance_snapshot: fullUser.balance,
    total_balance_snapshot: totalBalance,
    status: 'pending'
  })

  if (error) throw createError({ statusCode: 500, message: 'Failed to confirm signal' })

  return { success: true, amount: sessionProfitAmount, package_tier: packageTier }
})
